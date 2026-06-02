import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
    }

    // AQUI ENTRA A INTELIGÊNCIA ARTIFICIAL REAL (OPENAI)
    // O fluxo real seria:
    // 1. const buffer = await file.arrayBuffer()
    // 2. Extrair o texto do arquivo (se for CSV ou PDF usando libs como pdf-parse)
    // 3. const prompt = `Analise este extrato e me devolva um JSON com os ativos comprados/vendidos... \n\n ${texto}`
    // 4. const response = await openai.chat.completions.create({ ... })
    // 5. Salvar cada item do JSON no banco de dados.

    // ------------------------------------------------------------------------------------------------
    // COMO NÃO TEMOS A CHAVE DA OPENAI AQUI, VAMOS SIMULAR A INTELIGÊNCIA ARTIFICIAL:
    // MOCK: A "IA" lê o arquivo e cadastra 3 ativos fictícios baseados no tamanho do arquivo.
    
    const dbData = cookies().get('app_db')?.value
    let db = { users: [], assets: [], connections: [] }
    if (dbData) {
      try { db = JSON.parse(dbData) } catch (e) {}
    }

    // Pega o usuário logado (teste admin)
    const userId = "user-123" 

    // Simula Ativos Lidos pela IA
    const aiFoundAssets = [
      {
        id: `asset-ai-${Date.now()}-1`,
        userId,
        type: 'stock',
        ticker: 'PETR4',
        name: 'Petrobras',
        quantity: 100,
        averagePrice: 38.50,
        currency: 'BRL',
        purchaseDate: new Date().toISOString()
      },
      {
        id: `asset-ai-${Date.now()}-2`,
        userId,
        type: 'FII',
        ticker: 'MXRF11',
        name: 'Maxi Renda FII',
        quantity: 50,
        averagePrice: 10.35,
        currency: 'BRL',
        purchaseDate: new Date().toISOString()
      },
      {
        id: `asset-ai-${Date.now()}-3`,
        userId,
        type: 'stock',
        ticker: 'NVDA',
        name: 'Nvidia Corp',
        quantity: 2,
        averagePrice: 850.20,
        currency: 'USD',
        purchaseDate: new Date().toISOString()
      }
    ]

    // Salva no banco de dados
    db.assets.push(...aiFoundAssets)

    const response = NextResponse.json({ success: true, count: aiFoundAssets.length })
    response.cookies.set('app_db', JSON.stringify(db), { path: '/' })
    
    return response

  } catch (error: any) {
    console.error('Erro na IA Import:', error)
    return NextResponse.json({ error: 'Falha ao processar arquivo com a Inteligência Artificial.' }, { status: 500 })
  }
}
