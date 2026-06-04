import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import OpenAI from 'openai'
import { syncRetroactiveXp } from '@/app/actions/gamification'

// O Next.js não permite pdf-parse nativamente no Edge, por isso garantimos que rode em Node
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const importMode = formData.get('importMode') as string || 'trades' // 'trades' ou 'dividends_taxes'
    
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

    const { getSubscriptionStatus } = require('@/app/actions/subscription')
    const { status } = await getSubscriptionStatus()
    
    if (status !== 'premium') {
      return NextResponse.json({ error: 'Recurso Premium. Assine o Patrimônio+ PRO para usar o Leitor Mágico com Inteligência Artificial.' }, { status: 403 })
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

      // Constrói o Prompt dinamicamente baseado no importMode
      let operationRules = ""
      if (importMode === 'trades') {
        operationRules = `
        Classifique rigorosamente nas seguintes categorias de "operation":
        - "buy": Compra de ativos.
        - "sell": Venda de ativos.
        (IMPORTANTE: IGNORE COMPLETAMENTE dividendos, taxas, impostos, depósitos e saques neste modo. Extraia APENAS compras e vendas de ativos).`
      } else {
        operationRules = `
        Classifique rigorosamente nas seguintes categorias de "operation":
        - "dividend": Rendimentos, Dividendos ou Juros recebidos.
        - "tax": Impostos retidos (IRRF), Taxas de Corretagem, Taxas B3, etc.
        - "deposit": Depósito, PIX ou Transferência de entrada.
        - "withdrawal": Saque, Resgate ou Transferência de saída.
        (ATENÇÃO MÁXIMA: É ESTRITAMENTE PROIBIDO extrair operações de "buy" ou "sell" neste modo. IGNORE COMPLETAMENTE QUALQUER COMPRA OU VENDA DE ATIVOS que aparecer no documento).`
      }

      const prompt = `
        Você é um Auditor Financeiro Expert. Leia o texto abaixo extraído de um PDF/extrato de corretagem e identifique TODAS as movimentações financeiras permitidas.
        Retorne APENAS um JSON válido contendo um array 'transactions'.
        ${operationRules}

        O JSON deve ter este formato:
        {
          "transactions": [
            {
              "ticker": "VOO", // Se for taxa geral, depósito ou saque, use "CASH" ou "TAX"
              "operation": "buy", // Dependendo da regra acima
              "quantity": 0.07972, // Se não houver quantidade (ex: dividendos/taxas), coloque 1
              "price": 698.32, // O valor total exato da operação ou o preço unitário se aplicável
              "date": "2026-02-13T17:18:00Z",
              "currency": "USD", // 'USD' ou 'BRL'
              "type": "stock" // 'stock', 'ETF', 'FII', 'treasury' ou 'cash'
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
        if (!tx.operation || !tx.price) continue;
        
        // Atribui valores padrão caso a IA não preencha para taxas ou depósitos
        const safeTicker = (tx.ticker || 'CASH').toUpperCase();
        const safeQuantity = tx.quantity || 1;
        const safeType = tx.type || 'cash';
        const isAssetOp = tx.operation === 'buy' || tx.operation === 'sell';

        if (isAssetOp) {
          // 1. Verifica se já existe o asset na carteira consolidada
          const { data: existingAsset } = await supabase
            .from('assets')
            .select('*')
            .eq('ticker', safeTicker)
            .eq('user_id', userData.user.id)
            .maybeSingle()
            
          let finalQuantity = safeQuantity;
          let finalAveragePrice = tx.price;
          
          if (existingAsset) {
            if (tx.operation === 'buy') {
              finalQuantity = existingAsset.quantity + safeQuantity
              finalAveragePrice = ((existingAsset.quantity * existingAsset.average_price) + (safeQuantity * tx.price)) / finalQuantity
            } else if (tx.operation === 'sell') {
              finalQuantity = existingAsset.quantity - safeQuantity
              finalAveragePrice = existingAsset.average_price // Preço médio não muda na venda
            }
          }
          
          // 2. Atualiza ou insere o ativo consolidado
          if (existingAsset) {
            if (finalQuantity <= 0) {
               const { error } = await supabase.from('assets').delete().eq('id', existingAsset.id)
               if (error) throw new Error(`Erro ao deletar ativo: ${error.message}`)
            } else {
               const { error } = await supabase.from('assets').update({
                 quantity: finalQuantity,
                 average_price: finalAveragePrice
               }).eq('id', existingAsset.id)
               if (error) throw new Error(`Erro ao atualizar ativo: ${error.message}`)
            }
          } else if (tx.operation === 'buy') {
            const { error } = await supabase.from('assets').insert({
              user_id: userData.user.id,
              type: safeType,
              ticker: safeTicker,
              name: safeTicker,
              quantity: safeQuantity,
              average_price: tx.price,
              currency: tx.currency || 'USD',
              purchase_date: tx.date || new Date().toISOString()
            })
            if (error) throw new Error(`Erro ao inserir ativo: ${error.message}`)
          }
        }

        // 3. Insere a movimentação no histórico SEMPRE (todas as operações)
        const { error: txError } = await supabase.from('asset_transactions').insert({
          user_id: userData.user.id,
          ticker: safeTicker,
          asset_type: safeType,
          operation: tx.operation,
          quantity: safeQuantity,
          price: tx.price,
          currency: tx.currency || 'USD',
          operation_date: tx.date || new Date().toISOString()
        })
        if (txError) throw new Error(`Erro ao inserir movimentação: ${txError.message}`)
        
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
    
    // Sync XP after successful import
    try { await syncRetroactiveXp() } catch(e) { console.error('[import-ai] XP sync failed:', e) }

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
