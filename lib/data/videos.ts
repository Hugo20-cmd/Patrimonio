export interface VideoLesson {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  module: string;
  thumbnail?: string;
}

export const PREMIUM_VIDEOS: VideoLesson[] = [
  {
    id: "v1",
    title: "1. A Mentalidade do Investidor de Sucesso",
    description: "Nesta aula inaugural, vamos quebrar os maiores mitos sobre dinheiro e construir a mentalidade que separa os amadores dos profissionais.",
    youtubeId: "dQw4w9WgXcQ", 
    duration: "15:20",
    module: "Módulo 1: Fundamentos Inabaláveis"
  },
  {
    id: "v2",
    title: "2. Dominando os Juros Compostos",
    description: "Entenda matematicamente e de forma prática como a oitava maravilha do mundo pode trabalhar a seu favor todos os dias.",
    youtubeId: "jNQXAC9IVRw",
    duration: "22:15",
    module: "Módulo 1: Fundamentos Inabaláveis"
  },
  {
    id: "v3",
    title: "3. Renda Fixa: O Porto Seguro",
    description: "Tudo o que você precisa saber sobre Tesouro Direto, CDBs, LCIs e LCAs. Como proteger seu capital ganhando da inflação.",
    youtubeId: "M7lc1UVf-VE",
    duration: "30:05",
    module: "Módulo 2: O Poder da Renda Fixa"
  },
  {
    id: "v4",
    title: "4. Introdução aos Fundos Imobiliários (FIIs)",
    description: "Receba aluguéis todos os meses sem precisar comprar imóveis físicos. O guia definitivo para quem quer renda passiva.",
    youtubeId: "C0DPdy98e4c",
    duration: "25:40",
    module: "Módulo 3: Imóveis Sem Burocracia"
  },
  {
    id: "v5",
    title: "5. Ações e ETFs na Prática",
    description: "Como se tornar sócio das maiores empresas do Brasil e do mundo com segurança e diversificação através de ETFs.",
    youtubeId: "WhZ0hLhWw5s",
    duration: "35:10",
    module: "Módulo 4: Renda Variável com Inteligência"
  }
];
