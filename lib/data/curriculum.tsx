import { ShieldAlert, TrendingUp, BrainCircuit, Building2, Briefcase, Globe2, BookOpen, Target, Landmark, Coins, LineChart, Wallet, Anchor, BarChart3, Binary, Blocks, Combine, Compass, Rocket, ShieldCheck, Gem, Pickaxe, Umbrella, Scale, Microscope, Plane, AlertOctagon, Crown } from "lucide-react";
import React from "react";

export const CURRICULUM = [
  {
    id: 1,
    title: "Módulo 1: A Fundação do Mindset",
    desc: "Ajuste de mindset. Investir não é loteria, é plantio. Aprenda a regra 50/30/20 e como sair da corrida dos ratos.",
    icon: <BrainCircuit size={28} />,
    status: "in-progress",
    color: "var(--blue-primary)",
    lessons: ["A Ilusão do Cassino", "A Regra 50/30/20", "Pague-se Primeiro"],
    slides: [
      {
        title: "O Mindset Correto",
        content: "Muitas pessoas entram no mercado financeiro achando que é um cassino ou um esquema para ficar rico rápido. O verdadeiro investidor sabe que a bolsa de valores é um lugar para **se tornar sócio das melhores empresas do país**.\n\nInvestir não é sobre 'apostar', é sobre **plantar sementes com paciência hoje para colher uma floresta amanhã**.",
        icon: <BrainCircuit size={48} color="var(--blue-primary)" />
      },
      {
        title: "A Regra 50/30/20",
        content: "Como dividir o seu salário para nunca faltar dinheiro?\n\n• **50% Gastos Essenciais**: Aluguel, supermercado, contas básicas.\n• **30% Estilo de Vida**: Lazer, restaurantes, hobbies (você precisa viver!).\n• **20% O Seu Futuro**: O dinheiro sagrado que vai para seus investimentos todos os meses.",
        icon: <Target size={48} color="var(--purple-primary)" />
      },
      {
        title: "Pague a Si Mesmo Primeiro",
        content: "O maior erro do iniciante é esperar sobrar dinheiro no fim do mês para investir. **Nunca sobra**.\n\nNo dia em que o seu salário cair na conta, você deve pegar aqueles 20% e transferir imediatamente para a corretora. Pagar o seu 'eu do futuro' é a sua conta mais importante do mês.",
        icon: <Wallet size={48} color="var(--green-primary)" />
      }
    ]
  },
  {
    id: 2,
    title: "Módulo 2: O Motor da Riqueza",
    desc: "A mágica dos Juros Compostos. Entenda matematicamente por que o tempo e a constância vencem a genialidade e o timing.",
    icon: <TrendingUp size={28} />,
    status: "locked",
    color: "var(--text-tertiary)",
    lessons: ["Albert Einstein e os Juros", "Tempo vs Dinheiro", "A Bola de Neve"],
    slides: [
      {
        title: "A 8ª Maravilha do Mundo",
        content: "Albert Einstein dizia que 'Os juros compostos são a 8ª maravilha do mundo. Quem entende, ganha. Quem não entende, paga.'\n\nNo juros simples, seu dinheiro cresce em linha reta. Nos **Juros Compostos**, o juro do mês passado rende novos juros neste mês. É o famoso efeito bola de neve.",
        icon: <TrendingUp size={48} color="var(--blue-primary)" />
      },
      {
        title: "O Tempo é Rei",
        content: "Se você investir R$ 500 por mês durante 30 anos a 10% ao ano, você investiu R$ 180.000 do seu bolso. Sabe quanto você terá no final?\n\n**Mais de R$ 1.130.000,00!** Quase 1 milhão de reais vieram apenas do tempo agindo sobre o dinheiro. Começar cedo é mais importante do que ter muito dinheiro.",
        icon: <Compass size={48} color="var(--green-primary)" />
      },
      {
        title: "Consistência > Genialidade",
        content: "Você não precisa acertar a 'ação do momento' para ficar rico. Tentar acertar a hora exata de comprar e vender (Timing) destrói patrimônios.\n\nO segredo é a **constância**. Comprar ativos bons e diversificados todos os meses, chova ou faça sol.",
        icon: <Pickaxe size={48} color="#FFD700" />
      }
    ]
  },
  {
    id: 3,
    title: "Módulo 3: O Fim das Correntes",
    desc: "Nenhum investimento rende mais que os juros do cartão. Como estancar a sangria das dívidas e limpar o seu nome.",
    icon: <ShieldAlert size={28} />,
    status: "locked",
    color: "var(--text-tertiary)",
    lessons: ["A Matemática da Dívida", "Dívida Boa vs Dívida Ruim", "O Plano de Quitação"],
    slides: [
      {
        title: "O Veneno das Dívidas",
        content: "Nenhum investimento seguro do mundo rende mais do que os juros do cartão de crédito (que chegam a absurdos 400% ao ano no Brasil).\n\nSe você tem dívidas rotativas, **pare de investir agora**. O seu primeiro e melhor 'investimento' é quitar todas as suas dívidas ruins. Limpar o terreno é o primeiro passo para construir um castelo.",
        icon: <ShieldAlert size={48} color="#FF4B4B" />
      },
      {
        title: "Dívida Boa vs Dívida Ruim",
        content: "Dívida Ruim: Comprar uma TV em 12x no cartão pagando juros. Ela tira dinheiro do seu bolso.\n\nDívida Boa: Um financiamento de máquina para a sua empresa que vai gerar 3x mais lucro do que os juros que você está pagando. Ela coloca dinheiro no seu bolso.",
        icon: <Scale size={48} color="var(--blue-primary)" />
      },
      {
        title: "O Plano Bola de Neve Reverso",
        content: "Para sair das dívidas: liste todas as suas pendências da menor para a maior. Foque todas as suas energias (e dinheiro extra) em pagar a **menor dívida primeiro**, pagando apenas o mínimo das outras.\n\nA vitória psicológica de zerar a primeira dívida te dará forças para esmagar as maiores.",
        icon: <Target size={48} color="var(--green-primary)" />
      }
    ]
  },
  {
    id: 4,
    title: "Módulo 4: O Colchão de Ouro",
    desc: "A Reserva de Emergência. A blindagem oficial do seu patrimônio contra demissões, acidentes e imprevistos.",
    icon: <Umbrella size={28} />,
    status: "locked",
    color: "var(--text-tertiary)",
    lessons: ["O Que É a Reserva?", "Calculando o Seu Tamanho", "Onde Guardar?"],
    slides: [
      {
        title: "A Paz de Espírito Tem Preço",
        content: "Antes de comprar a primeira ação, você precisa da sua **Reserva de Emergência**.\n\nImprevistos não 'podem' acontecer, eles **vão** acontecer. O carro quebra, o dente dói, a demissão chega. A reserva impede que você tenha que vender suas ações no prejuízo para pagar uma conta médica.",
        icon: <Umbrella size={48} color="var(--blue-primary)" />
      },
      {
        title: "Qual o Tamanho Ideal?",
        content: "A regra de ouro é: **Multiplique seu custo de vida mensal por 6**.\n\nSe você precisa de R$ 3.000 para viver o básico (aluguel, luz, comida), sua Reserva deve ser de R$ 18.000. \nSe você é funcionário público estável, 3 meses podem bastar. Se for autônomo, busque 12 meses.",
        icon: <LineChart size={48} color="var(--purple-primary)" />
      },
      {
        title: "Onde Guardar Esse Dinheiro?",
        content: "A Reserva **NÃO** é para render muito, é para estar disponível quando a emergência bater.\n\nCaracterísticas obrigatórias:\n• Liquidez D+0 (Dá pra sacar no mesmo dia).\n• Risco quase zero.\n• Onde investir: **Tesouro Selic** ou um **CDB de Bancão que pague 100% do CDI**.",
        icon: <Landmark size={48} color="var(--green-primary)" />
      }
    ]
  },
  {
    id: 5,
    title: "Módulo 5: Dissecando a Renda Fixa",
    desc: "Entenda o que é o CDI, a Taxa Selic e a Inflação. Como o cenário macroeconômico dita o rendimento do seu dinheiro.",
    icon: <Landmark size={28} />,
    status: "locked",
    color: "var(--text-tertiary)",
    lessons: ["O Monstro da Inflação", "O Remédio Selic", "O Que é CDI?"],
    slides: [
      {
        title: "A Inflação Corrói o Dinheiro",
        content: "Inflação (IPCA no Brasil) é a perda do poder de compra do dinheiro. Cem reais hoje compram muito menos no mercado do que compravam há 10 anos.\n\nSe o seu dinheiro está na Poupança ou debaixo do colchão rendendo menos que a Inflação, você está **ficando mais pobre todos os dias** sem perceber.",
        icon: <Anchor size={48} color="#FF4B4B" />
      },
      {
        title: "A Taxa Selic",
        content: "A Selic é a Taxa Básica de Juros do Brasil. É o controle remoto que o Banco Central usa para controlar a inflação.\n\nSe a inflação sobe muito, o governo **aumenta a Selic**. Isso faz os investimentos de Renda Fixa pagarem mais, atraindo o dinheiro das pessoas e esfriando o consumo.",
        icon: <LineChart size={48} color="var(--blue-primary)" />
      },
      {
        title: "Afinal, o que é o CDI?",
        content: "Você sempre vê 'CDB que rende 100% do CDI'. Mas o que é isso?\n\nCDI é a taxa que os bancos usam para emprestar dinheiro uns aos outros de um dia para o outro. O CDI anda sempre **colado na Selic** (0,10% abaixo dela). Se a Selic é 10,50%, o CDI é 10,40%. Render 100% do CDI significa receber exatamente essa taxa.",
        icon: <Landmark size={48} color="#FFD700" />
      }
    ]
  },
  {
    id: 6,
    title: "Módulo 6: Tesouro Direto Prático",
    desc: "Emprestando dinheiro para o Governo. Conheça as diferenças entre Tesouro Selic, IPCA+ e Prefixado.",
    icon: <ShieldCheck size={28} />,
    status: "locked",
    color: "var(--text-tertiary)",
    lessons: ["O Investimento Mais Seguro", "Os 3 Tipos de Tesouro", "A Marcação a Mercado"],
    slides: [
      {
        title: "O Que é o Tesouro Direto?",
        content: "Em vez de pegar dinheiro emprestado do banco, você está **emprestando o seu dinheiro para o Governo Federal** financiar saúde, educação e obras.\n\nEm troca, ele te devolve o dinheiro com juros. É o investimento mais seguro do Brasil, pois quem garante o pagamento é a máquina que imprime o próprio dinheiro.",
        icon: <ShieldCheck size={48} color="var(--green-primary)" />
      },
      {
        title: "Os 3 Sabores do Tesouro",
        content: "• **Tesouro Selic:** Rende igual a taxa básica de juros. Perfeito para Reserva de Emergência, nunca fica negativo.\n• **Tesouro Prefixado:** Você sabe exatamente quanto vai receber no vencimento (ex: 12% ao ano). Bom se você acha que a Selic vai cair.\n• **Tesouro IPCA+:** Paga a Inflação + uma taxa fixa. A melhor blindagem do mundo para o longo prazo e aposentadoria.",
        icon: <Blocks size={48} color="var(--purple-primary)" />
      },
      {
        title: "Cuidado: Marcação a Mercado",
        content: "Se você compra um Tesouro IPCA+ para 2035, mas tenta vender ele antes do prazo, o preço dele pode ter oscilado para cima ou para baixo dependendo dos juros atuais. Isso se chama Marcação a Mercado.\n\nRegra de Ouro: Dinheiro no IPCA+ ou Prefixado é para levar **até o vencimento**. Se pode precisar antes, use o Tesouro Selic.",
        icon: <AlertOctagon size={48} color="#FF4B4B" />
      }
    ]
  },
  {
    id: 7,
    title: "Módulo 7: Bancos, CDBs e FGC",
    desc: "Aprenda a investir em Títulos Privados e como o Fundo Garantidor de Crédito protege o seu patrimônio.",
    icon: <Briefcase size={28} />,
    status: "locked",
    color: "var(--text-tertiary)",
    lessons: ["Emprestando para Bancos (CDB)", "LCI e LCA (Isenção de IR)", "A Garantia do FGC"],
    slides: [
      {
        title: "O Que é um CDB?",
        content: "CDB (Certificado de Depósito Bancário). Aqui, você **empresta dinheiro para um banco**.\nO banco pega seus R$ 1.000, empresta para alguém cobrando 40% de juros no cheque especial, e te devolve 10% de juros no final do ano. É assim que eles lucram.",
        icon: <Landmark size={48} color="var(--blue-primary)" />
      },
      {
        title: "LCI e LCA (O Paraíso Fiscal)",
        content: "As Letras de Crédito Imobiliário (LCI) e do Agronegócio (LCA) são muito parecidas com CDBs, mas com uma enorme vantagem mágica: **elas são isentas de Imposto de Renda**.\n\nPorém, elas costumam ter carência (o dinheiro fica preso por 90 dias ou mais). Excelentes para objetivos de médio prazo.",
        icon: <Gem size={48} color="var(--green-primary)" />
      },
      {
        title: "O Escudo Invisível: FGC",
        content: "O que acontece se você emprestar R$ 50 mil num CDB e o banco falir? Você perde tudo?\n\n**NÃO!** O Fundo Garantidor de Crédito (FGC) é um seguro automático que te devolve até R$ 250.000,00 por instituição caso o banco quebre. Investir em CDBs de bancos menores (que pagam mais juros) é seguro até esse limite.",
        icon: <ShieldAlert size={48} color="#FFD700" />
      }
    ]
  },
  {
    id: 8,
    title: "Módulo 8: A Fábrica de Aluguéis (FIIs)",
    desc: "O fascinante mundo dos Fundos Imobiliários. Receba dinheiro limpo na sua conta todos os meses com shoppings e galpões.",
    icon: <Building2 size={28} />,
    status: "locked",
    color: "var(--text-tertiary)",
    lessons: ["Por que não comprar um imóvel?", "O que é um FII?", "A Mágica da Isenção"],
    slides: [
      {
        title: "O Fim do Imóvel Tradicional?",
        content: "Comprar um apartamento de 500 mil reais te rende cerca de R$ 2.000 de aluguel por mês (0,4%), dá dor de cabeça com inquilino, IPTU, reforma, e se você precisar de 10 mil reais urgente, não tem como vender só o 'banheiro' do apartamento.\n\nOs FIIs resolvem todos esses problemas.",
        icon: <Building2 size={48} color="var(--purple-primary)" />
      },
      {
        title: "Como funciona um FII?",
        content: "Um Fundo Imobiliário reúne o dinheiro de milhares de investidores e compra Shoppings Gigantes, Prédios na Faria Lima ou Galpões da Amazon.\n\nEles alugam esses espaços para essas empresas e **distribuem 95% do lucro dos aluguéis** para os cotistas todos os meses. Você vira dono de frações de impérios imobiliários com R$ 10,00.",
        icon: <Combine size={48} color="var(--blue-primary)" />
      },
      {
        title: "A Cereja do Bolo",
        content: "Diferente do aluguel de um apartamento tradicional (onde você paga imposto de renda sobre o ganho), os dividendos dos Fundos Imobiliários caem na sua conta da corretora **100% livres de Imposto de Renda**.\n\nÉ dinheiro líquido e limpo pronto para você reinvestir ou pagar os seus boletos.",
        icon: <Coins size={48} color="var(--green-primary)" />
      }
    ]
  },
  {
    id: 9,
    title: "Módulo 9: Tijolo vs Papel",
    desc: "Descubra as diferentes categorias de FIIs e como montar uma carteira balanceada para todos os cenários.",
    icon: <Blocks size={28} />,
    status: "locked",
    color: "var(--text-tertiary)",
    lessons: ["FIIs de Tijolo (Imóveis Reais)", "FIIs de Papel (Recebíveis)", "Fiagros (O Poder do Agro)"],
    slides: [
      {
        title: "FIIs de Tijolo",
        content: "Eles compram o tijolo real: Shoppings, Galpões Logísticos (onde a Amazon/Mercado Livre guardam estoque) e Prédios Corporativos.\n\nEles protegem muito bem contra a inflação no longo prazo, porque os contratos de aluguel são reajustados pelo IGPM ou IPCA e os imóveis valorizam ao longo dos anos.",
        icon: <Building2 size={48} color="var(--blue-primary)" />
      },
      {
        title: "FIIs de Papel",
        content: "Eles NÃO compram imóveis físicos. Eles compram dívidas do setor imobiliário (CRIs). Eles são como 'bancos' emprestando dinheiro para uma construtora levantar um prédio.\n\nNormalmente pagam **dividendos muito maiores** que os de Tijolo, mas não possuem o imóvel físico para valorizar no longo prazo. Focam em alto rendimento mensal.",
        icon: <Binary size={48} color="var(--purple-primary)" />
      },
      {
        title: "O Equilíbrio Perfeito",
        content: "Se os juros do Brasil (Selic) caírem, os FIIs de Tijolo costumam explodir de valorização.\nSe os juros ou a inflação subirem, os FIIs de Papel brilham e pagam rios de dinheiro.\n\nA estratégia de ouro é ter **ambos na carteira** para lucrar em qualquer cenário econômico.",
        icon: <Scale size={48} color="#FFD700" />
      }
    ]
  },
  {
    id: 10,
    title: "Módulo 10: Analisando FIIs como um Pró",
    desc: "Aprenda a fugir de armadilhas e analisar métricas fundamentais como P/VP, Vacância e Dividend Yield.",
    icon: <Microscope size={28} />,
    status: "locked",
    color: "var(--text-tertiary)",
    lessons: ["A Ilusão do Dividend Yield Alto", "O Preço Justo (P/VP)", "O Risco da Vacância"],
    slides: [
      {
        title: "A Armadilha do Dividend Yield",
        content: "O erro número 1 do iniciante é organizar os fundos pelo maior Dividend Yield (DY) e comprar os primeiros da lista.\n\nUm DY altíssimo (ex: 20% ao ano) quase sempre significa que o fundo teve um lucro não-recorrente vendendo um imóvel, ou o preço da cota desabou por problemas graves. Olhe sempre o **histórico** dos últimos 5 anos, não apenas o último mês.",
        icon: <AlertOctagon size={48} color="#FF4B4B" />
      },
      {
        title: "P/VP: Está caro ou barato?",
        content: "O Preço sobre o Valor Patrimonial (P/VP) é o raio-X do fundo.\n\n• **P/VP = 1,00**: Preço justo. O mercado cobra exatamente o que os imóveis do fundo valem.\n• **P/VP < 1,00**: Desconto! O fundo está sendo vendido mais barato do que a soma dos imóveis.\n• **P/VP > 1,00**: Ágio. Você está pagando mais caro do que os imóveis valem (cuidado com FIIs de Papel acima de 1,05).",
        icon: <LineChart size={48} color="var(--blue-primary)" />
      },
      {
        title: "O Fantasma da Vacância",
        content: "Vacância é o espaço vazio.\nSe um FII tem 10 prédios e 2 estão completamente vazios, sua vacância física é de 20%.\n\nProcure sempre fundos com **baixa vacância** e **multi-imóveis / multi-inquilinos**. Se o fundo só tem 1 imóvel alugado para 1 inquilino (mono-mono), e o inquilino sair, seu dividendo vai a ZERO da noite para o dia.",
        icon: <ShieldAlert size={48} color="#FFD700" />
      }
    ]
  },
  {
    id: 11,
    title: "Módulo 11: Cabeça de Dono (Ações)",
    desc: "Você não compra um ticker piscando na tela. Você compra o modelo de negócios de empresas lucrativas.",
    icon: <Briefcase size={28} />,
    status: "locked",
    color: "var(--text-tertiary)",
    lessons: ["O Que é a Bolsa de Valores?", "Sócio, Não Apostador", "Esqueça as Notícias"],
    slides: [
      {
        title: "A Feira Livre de Empresas",
        content: "A Bolsa de Valores é como o Mercado Livre. Mas em vez de vender celulares, os donos de empresas vendem pedacinhos de suas companhias (as ações) para arrecadar dinheiro e expandir o negócio.\n\nQuando você compra WEGE3, PETR4 ou VALE3, você não está comprando um código num sistema, você comprou uma cadeira minúscula na mesa dos donos.",
        icon: <Combine size={48} color="var(--blue-primary)" />
      },
      {
        title: "Preço vs Valor",
        content: "O preço é o que você paga (o número piscando no app). O Valor é o que a empresa produz (lucro, caixa, patentes, produtos).\n\nNo curto prazo, a bolsa é um concurso de popularidade. Boatos derrubam preços em 10% no dia. No longo prazo, a cotação sempre, **invariavelmente**, segue o LUCRO da empresa. Foque no balanço, não nas manchetes.",
        icon: <Scale size={48} color="var(--green-primary)" />
      },
      {
        title: "A Morte pela Emoção",
        content: "Se você comprar uma padaria por 100 mil e no dia seguinte alguém te oferecer 80 mil por ela, você vende desesperado? Não, pois a padaria continua vendendo pães e lucrando!\n\nNa bolsa é igual. Se você comprou uma empresa excelente e o preço caiu por pânico do mercado (como pandemia), não venda. Pelo contrário, **aproveite a promoção e compre mais**.",
        icon: <ShieldCheck size={48} color="var(--purple-primary)" />
      }
    ]
  },
  {
    id: 12,
    title: "Módulo 12: Análise Fundamentalista",
    desc: "Aprenda a ler o Raio-X de uma empresa. Entenda Margem Líquida, ROE, Dívida e Lucro Consistente.",
    icon: <BarChart3 size={28} />,
    status: "locked",
    color: "var(--text-tertiary)",
    lessons: ["Histórico de Lucros", "Margem e ROE", "A Dívida Saudável"],
    slides: [
      {
        title: "Lucro é Rei",
        content: "A primeira regra da análise fundamentalista é: **A empresa dá lucro há pelo menos 5 anos seguidos?**\n\nFuja de empresas 'promessa' que dão prejuízo todos os trimestres tentando crescer desesperadamente ou de empresas em recuperação judicial. Você quer ser sócio de máquinas comprovadas de fazer dinheiro.",
        icon: <Crown size={48} color="#FFD700" />
      },
      {
        title: "Margem e Vantagem Competitiva",
        content: "A Margem Líquida diz o quanto sobra no bolso após pagar todos os custos.\n\nSe um supermercado tem margem de 2%, qualquer crise pode torná-lo deficitário. Se a WEG ou a B3 têm margens de 30% ou 50%, elas têm um 'fosso' gigantesco de segurança contra a concorrência e contra inflação alta.",
        icon: <ShieldAlert size={48} color="var(--blue-primary)" />
      },
      {
        title: "ROE: O Retorno do Dono",
        content: "O ROE (Return on Equity) mede a eficiência da empresa em gerar lucro com o dinheiro que os acionistas colocaram lá.\n\nEmpresas fantásticas (como os grandes bancos ou seguradoras) costumam apresentar ROE consistentemente acima de 15%. É o selo de qualidade de uma gestão competente.",
        icon: <TrendingUp size={48} color="var(--green-primary)" />
      }
    ]
  },
  {
    id: 13,
    title: "Módulo 13: A Máquina de Dividendos",
    desc: "A estratégia de Barsi. Focando em Bancos, Energia e Saneamento para viver de renda.",
    icon: <Wallet size={28} />,
    status: "locked",
    color: "var(--text-tertiary)",
    lessons: ["O Setor BEST", "Dividend Yield Inteligente", "Bola de Neve com Ações"],
    slides: [
      {
        title: "O Que é o Setor BEST?",
        content: "Os grandes investidores de dividendos focam no setor BEST: **B**ancos, **E**nergia, **S**eguros e **T**elecomunicações (Saneamento também entra aqui).\n\nPor quê? São serviços essenciais. Mesmo nas piores crises econômicas mundiais, as pessoas continuam pagando a conta de luz, usando a internet e precisando de bancos. Eles têm lucro previsível.",
        icon: <Landmark size={48} color="var(--purple-primary)" />
      },
      {
        title: "A Data COM e os Proventos",
        content: "Quando uma ação anuncia que vai pagar dividendos, ela define uma 'Data Com'. Quem dormir com a ação na carteira naquele dia, tem direito a receber o dinheiro.\n\nMas cuidado: no dia seguinte (Data EX), o valor do dividendo é **descontado** do preço da ação na tela. O mercado é inteligente, não existe dinheiro grátis.",
        icon: <Coins size={48} color="var(--green-primary)" />
      },
      {
        title: "O Fator Reinvestimento",
        content: "Se você recebe dividendos e gasta comprando pizza, o juros compostos morre.\n\nA verdadeira mágica da aposentadoria é pegar os dividendos da TAEE11 e usar esse mesmo dinheiro para **comprar mais cotas** da TAEE11. No mês seguinte, as novas cotas geram mais dividendos que compram ainda mais cotas. É um ciclo infinito de enriquecimento.",
        icon: <LineChart size={48} color="var(--blue-primary)" />
      }
    ]
  },
  {
    id: 14,
    title: "Módulo 14: A Fronteira Global",
    desc: "Por que você precisa sair do Brasil. Dolarizando o patrimônio com BDRs, ETFs e REITs.",
    icon: <Plane size={28} />,
    status: "locked",
    color: "var(--text-tertiary)",
    lessons: ["O Risco País", "Sócio da Apple e Google", "O ETF IVVB11"],
    slides: [
      {
        title: "O Real é Fraco",
        content: "O Brasil representa apenas 1% do mercado financeiro mundial. Ficar com 100% do seu patrimônio em Reais é uma aposta altíssima em um país de economia instável.\n\nHistoricamente, o Dólar destrói o Real no longo prazo. Ter uma parte da sua carteira dolarizada não é luxo, é **segurança obrigatória**.",
        icon: <Globe2 size={48} color="#FFD700" />
      },
      {
        title: "Como Investir nos EUA?",
        content: "Antigamente você precisava abrir conta no exterior e fazer remessas complexas. Hoje, pela sua própria corretora brasileira, você consegue investir.\n\nVocê pode comprar **BDRs** (Recibos que representam ações de gigantes como Apple, Microsoft e Amazon) ou **ETFs** diretamente na B3.",
        icon: <Briefcase size={48} color="var(--blue-primary)" />
      },
      {
        title: "IVVB11: A Compra de Uma Vida",
        content: "O IVVB11 é um ETF (um fundo negociado em bolsa) que compra, de uma só vez, as 500 maiores empresas dos Estados Unidos (o famoso S&P 500).\n\nCom uma única cotação no Brasil, você vira sócio de Tesla, Google, Meta, Coca-Cola e Apple, e ainda fica **100% dolarizado**. É o investimento 'feijão com arroz' do bilionário.",
        icon: <Rocket size={48} color="var(--green-primary)" />
      }
    ]
  },
  {
    id: 15,
    title: "Módulo 15: O Ouro Digital (Bitcoin)",
    desc: "A compreensão final sobre o Bitcoin. Desmistificando a cripto e entendendo a escassez matemática.",
    icon: <Coins size={28} />,
    status: "locked",
    color: "var(--text-tertiary)",
    lessons: ["A Impressão de Dinheiro", "O Que Dá Valor ao BTC?", "Ciclos e Halving"],
    slides: [
      {
        title: "O Problema do Dinheiro Estatal",
        content: "Os governos ao redor do mundo imprimem trilhões de dólares e reais do nada para financiar suas dívidas. Toda vez que imprimem novo dinheiro, as notas que você guardou no banco perdem valor (Inflação).\n\nSe o suprimento de dinheiro é infinito, ele fatalmente caminha para valer muito pouco.",
        icon: <AlertOctagon size={48} color="#FF4B4B" />
      },
      {
        title: "A Escassez Perfeita",
        content: "O Bitcoin resolveu esse problema com a matemática pura. Existirão apenas **21 milhões de Bitcoins na história**. Nunca será possível criar mais.\n\nComo ele é escasso, descentralizado (nenhum político controla) e seguro, ele se tornou uma reserva de valor digital fantástica contra a inflação global. O verdadeiro 'Ouro 2.0'.",
        icon: <BrainCircuit size={48} color="#FFD700" />
      },
      {
        title: "Volatilidade vs Risco",
        content: "O Bitcoin é altamente **volátil**: ele pode cair 50% em alguns meses e subir 300% no ano seguinte. Mas não confunda volatilidade com risco de ruína.\n\nA regra de ouro é: compre BTC aos poucos todo mês, coloque em uma carteira própria (Wallet) e segure por no mínimo 4 anos para não sofrer com as quedas do ciclo de curto prazo.",
        icon: <TrendingUp size={48} color="var(--purple-primary)" />
      }
    ]
  }
];
