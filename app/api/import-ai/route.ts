import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import pdfParse from 'pdf-parse'
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

    let totalImported = 0;

    for (const file of files) {
      let textContent = ""
      
      // Se for PDF, usa pdf-parse. Se for CSV/TXT, lê como texto plano.
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const parsed = await pdfParse(buffer)
        textContent = parsed.text
      } else {
        textContent = await file.text()
      }

      // Prompt para a OpenAI interpretar o extrato
      const prompt = `
      Você é um especialista financeiro. Leia o texto abaixo extraído de uma nota de corretagem (ex: Nomad, Inter, B3).
      Identifique TODAS as operações de compra ou venda de ações, FIIs e ETFs.
      
      Devolva EXCLUSIVAMENTE um JSON válido no formato de um array de objetos, onde cada objeto tem:
      - "ticker": (string) Ticker do ativo (ex: VOO, AAPL, PETR4).
      - "type": (string) "stock" para ações/BDRs, "ETF" para ETFs, "FII" para FIIs.
      - "operation": (string) "buy" para compra, "sell" para venda.
      - "quantity": (number) Quantidade operada (pode ser fracionada).
      - "price": (number) Preço unitário exato pago (cotação do dia com spread, sem taxa de corretagem embutida no preço unitário, se possível, ou o valor bruto dividido pela qtd).
      - "currency": (string) "USD" se for mercado americano, "BRL" se for Brasil.
      - "date": (string) Data da operação no formato YYYY-MM-DDTHH:mm:ssZ. Estime a hora se não houver (ex: 12:00:00Z).
      
      Se não houver nenhuma operação, devolva um array vazio [].
      Não escreva mais nada além do JSON puro.
      
      TEXTO DO EXTRATO:
      ${textContent.substring(0, 8000)} // Limite de segurança para não estourar tokens
      `

      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' }
      })

      const aiResponseText = completion.choices[0].message.content || '{"transactions":[]}'
      
      // O gpt-4o-mini com json_object costuma devolver { "transactions": [...] } ou só o array.
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
    }
    
    return NextResponse.json({ 
      success: true, 
      count: totalImported,
      message: `Sucesso! Foram processadas ${totalImported} operação(ões) através do Leitor Mágico.`
    })

  } catch (error: any) {
    console.error('Erro na IA Import:', error)
    return NextResponse.json({ error: error.message || 'Falha ao processar arquivo com a Inteligência Artificial.' }, { status: 500 })
  }
}
