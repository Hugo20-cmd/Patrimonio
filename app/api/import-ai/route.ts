import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import OpenAI from 'openai'

// O Next.js não permite pdf-parse nativamente no Edge, por isso garantimos que rode em Node
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
    }

    // Verifica se a chave da OpenAI foi configurada
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'Chave da OpenAI (OPENAI_API_KEY) não encontrada nas variáveis de ambiente. Por favor, adicione sua chave para a IA funcionar.' 
      }, { status: 500 })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    
    if (!userData.user) {
      return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 })
    }

    let totalImported = 0
    let duplicatedFiles = 0
    const crypto = require('crypto')
    
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      
      // Calculate file hash to prevent duplicates
      const fileHash = crypto.createHash('sha256').update(buffer).digest('hex')
      
      // Check if file already imported
      const { data: existingFile } = await supabase
        .from('imported_files')
        .select('id')
        .eq('user_id', userData.user.id)
        .eq('file_hash', fileHash)
        .maybeSingle()
        
      if (existingFile) {
        duplicatedFiles++;
        continue;
      }

      let textContent = ""
      
      // Se for PDF, extrai texto com pdf2json (seguro para Next.js). Se for CSV/TXT, lê direto.
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const PDFParser = require("pdf2json")
        const pdfParser = new PDFParser(null, 1)
        
        textContent = await new Promise<string>((resolve, reject) => {
          pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError))
          pdfParser.on("pdfParser_dataReady", () => {
            resolve(pdfParser.getRawTextContent())
          })
          pdfParser.parseBuffer(buffer)
        })
      } else {
        textContent = buffer.toString('utf-8')
      }

      // Se não tem texto, ignora
      if (!textContent || textContent.trim() === '') continue;

      // Chama a OpenAI com Structured Data/JSON Mode (via Prompt Engineering)
      const prompt = `
        Você é um assistente financeiro especialista em ler notas de corretagem e extratos de investimentos.
        Extraia as operações de compra e venda do texto abaixo e retorne APENAS um JSON válido contendo um array 'transactions'.
        Se houver impostos ou taxas, ignore. Eu quero apenas as ações/ETFs/FIIs/Bonds operados.
        O JSON deve ter este formato:
        {
          "transactions": [
            {
              "ticker": "VOO",
              "operation": "buy", // 'buy' ou 'sell'
              "quantity": 0.07972,
              "price": 698.32, // Preço unitário pago
              "date": "2026-02-13T17:18:00Z",
              "currency": "USD", // 'USD' ou 'BRL'
              "type": "stock" // 'stock', 'ETF', 'FII', 'treasury'
            }
          ]
        }

        Texto do arquivo:
        ${textContent.substring(0, 8000)}
      `

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: "json_object" },
        messages: [
          { role: 'system', content: prompt }
        ],
        temperature: 0.1
      })

      const aiResponseText = completion.choices[0].message.content || '{"transactions":[]}'
      
      let parsedJson: any = {}
      try {
        parsedJson = JSON.parse(aiResponseText)
      } catch(e) {
        console.error("Failed to parse AI response:", aiResponseText)
        continue
      }

      const transactions = Array.isArray(parsedJson) ? parsedJson : (parsedJson.transactions || parsedJson.assets || [])

      for (const tx of transactions) {
        if (!tx.ticker || !tx.quantity || !tx.price) continue;
        
        // 1. Verifica se já existe o asset na carteira consolidada
        const { data: existingAsset } = await supabase
          .from('assets')
          .select('*')
          .eq('ticker', tx.ticker.toUpperCase())
          .eq('user_id', userData.user.id)
          .maybeSingle()
          
        let finalQuantity = tx.quantity;
        let finalAveragePrice = tx.price;
        
        if (existingAsset) {
          if (tx.operation === 'buy') {
            finalQuantity = existingAsset.quantity + tx.quantity
            finalAveragePrice = ((existingAsset.quantity * existingAsset.average_price) + (tx.quantity * tx.price)) / finalQuantity
          } else if (tx.operation === 'sell') {
            finalQuantity = existingAsset.quantity - tx.quantity
            finalAveragePrice = existingAsset.average_price // Preço médio não muda na venda
          }
        }
        
        // 2. Atualiza ou insere o ativo consolidado
        if (existingAsset) {
          if (finalQuantity <= 0) {
             await supabase.from('assets').delete().eq('id', existingAsset.id)
          } else {
             await supabase.from('assets').update({
               quantity: finalQuantity,
               average_price: finalAveragePrice
             }).eq('id', existingAsset.id)
          }
        } else if (tx.operation === 'buy') {
          await supabase.from('assets').insert({
            user_id: userData.user.id,
            type: tx.type || 'stock',
            ticker: tx.ticker.toUpperCase(),
            name: tx.ticker.toUpperCase(),
            quantity: tx.quantity,
            average_price: tx.price,
            currency: tx.currency || 'USD',
            purchase_date: tx.date || new Date().toISOString()
          })
        }

        // 3. Insere a movimentação no histórico
        await supabase.from('asset_transactions').insert({
          user_id: userData.user.id,
          ticker: tx.ticker.toUpperCase(),
          asset_type: tx.type || 'stock',
          operation: tx.operation || 'buy',
          quantity: tx.quantity,
          price: tx.price,
          currency: tx.currency || 'USD',
          operation_date: tx.date || new Date().toISOString()
        })
        
        totalImported++;
      }
      
      // If we successfully processed the file, we save it to imported_files to avoid re-running OpenAI
      const { error: insertError } = await supabase.from('imported_files').insert({
        user_id: userData.user.id,
        file_hash: fileHash,
        file_name: file.name
      });
      if (insertError) {
        console.error("Failed to insert file hash into imported_files:", insertError);
        throw new Error(`Erro ao salvar histórico do arquivo: ${insertError.message}`);
      }
    }
    
    let msg = `Mágica Finalizada! A Inteligência leu os arquivos. Ela encontrou ${totalImported} operação(ões) nova(s).`
    if (duplicatedFiles > 0) {
      msg += ` Além disso, ignoramos ${duplicatedFiles} arquivo(s) que já haviam sido processados antes, protegendo sua conta e saldo!`
    }

    return NextResponse.json({ 
      success: true, 
      count: totalImported,
      message: msg
    })

  } catch (error: any) {
    console.error('Erro na IA Import:', error)
    return NextResponse.json({ error: error.message || 'Falha ao processar arquivo com a Inteligência Artificial.' }, { status: 500 })
  }
}
