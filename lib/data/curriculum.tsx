import { ShieldAlert, TrendingUp, BrainCircuit, Building2, Briefcase, Globe2, BookOpen, Target, Landmark, Coins, LineChart, Wallet, Anchor, BarChart3, Binary, Blocks, Combine, Compass, Rocket, ShieldCheck, Gem } from "lucide-react";
import React from "react";

export const MODULE_1_SLIDES = [
  {
    title: "O Mindset Correto",
    content: "Muitas pessoas entram no mercado financeiro achando que é um cassino ou um esquema para ficar rico rápido. O verdadeiro investidor sabe que a bolsa de valores é um lugar para **se tornar sócio das melhores empresas do país**.\n\nInvestir não é sobre 'apostar', é sobre **plantar sementes com paciência hoje para colher uma floresta amanhã**.",
    icon: <BrainCircuit size={48} color="var(--blue-primary)" />
  },
  {
    title: "A Regra 50/30/20",
    content: "Como dividir o seu salário para nunca faltar dinheiro?\n\n• **50% Gastos Essenciais**: Aluguel, supermercado, contas básicas.\n• **30% Estilo de Vida**: Lazer, restaurantes, hobbies.\n• **20% O Seu Futuro**: O dinheiro que vai para seus investimentos todos os meses.\n\nA regra de ouro é: **Pague a si mesmo primeiro**."
  }
];

const generateModules = () => {
  const baseCurriculum = [
    { title: "A Fundação", desc: "Ajuste de mindset e eliminação de dívidas ruins.", icon: ShieldAlert, color: "var(--blue-primary)", status: "in-progress" },
    { title: "O Motor da Riqueza", desc: "A mágica dos Juros Compostos e o valor do tempo.", icon: TrendingUp },
    { title: "O Escudo de Ouro", desc: "Renda Fixa, Selic, IPCA e o Tesouro Direto.", icon: BrainCircuit },
    { title: "A Fábrica de Aluguéis", desc: "O mundo dos Fundos Imobiliários (FIIs) e renda passiva.", icon: Building2 },
    { title: "Cabeça de Dono", desc: "Invista em Ações da forma correta focando no longo prazo.", icon: Briefcase },
    { title: "A Fronteira Global", desc: "Proteção internacional contra o Risco Brasil (ETFs e REITs).", icon: Globe2 },
    { title: "O Novo Dinheiro", desc: "Entendendo o Bitcoin como reserva inconfiscável.", icon: Coins },
    { title: "Dominando as Finanças", desc: "Planilhas, controle de gastos e orçamentos eficientes.", icon: Target },
    { title: "Psicologia do Dinheiro", desc: "Como não se sabotar quando o mercado entra em pânico.", icon: BookOpen },
    { title: "Bancos e Corretoras", desc: "Como escolher onde deixar seu dinheiro sem pagar taxas ocultas.", icon: Landmark },
    { title: "O Poder dos Dividendos", desc: "Como viver de renda passiva com consistência.", icon: Wallet },
    { title: "Leitura de Balanços", desc: "Aprenda a analisar o lucro das empresas antes de investir.", icon: BarChart3 },
    { title: "Fugindo da Inflação", desc: "Como proteger seu dinheiro da perda de poder de compra.", icon: Anchor },
    { title: "Diversificação Estratégica", desc: "A regra de nunca colocar todos os ovos na mesma cesta.", icon: Combine },
    { title: "Aposentadoria Antecipada", desc: "Cálculos e projeções para parar de trabalhar mais cedo.", icon: Compass },
    { title: "O Milagre do Reinvestimento", desc: "O Efeito Bola de Neve acelerado com dividendos.", icon: LineChart },
    { title: "Imposto de Renda", desc: "Como declarar seus investimentos sem dor de cabeça.", icon: Binary },
    { title: "Ações de Crescimento", desc: "Encontrando as pequenas empresas que podem explodir.", icon: Rocket },
    { title: "Fundos de Papel vs Tijolo", desc: "Mergulho profundo nos tipos de FIIs.", icon: Blocks },
    { title: "Blindagem Patrimonial", desc: "Como proteger seus ativos jurídicamente.", icon: ShieldCheck }
  ];

  const modules = [];
  
  for (let i = 0; i < 50; i++) {
    const base = baseCurriculum[i % baseCurriculum.length];
    
    // Assign specific icons for variety
    const IconComponent = base.icon || Gem;

    modules.push({
      id: i + 1,
      title: `Módulo ${i + 1}: ${base.title}${i >= 20 ? ` Avançado ${Math.floor(i/20)}` : ""}`,
      desc: base.desc + (i >= 20 ? " Mergulho profundo e estratégias avançadas." : ""),
      icon: <IconComponent size={28} />,
      status: i === 0 ? "in-progress" : "locked",
      lessons: [
        `Aula 1: Introdução ao Módulo ${i + 1}`, 
        `Aula 2: Conceitos Chave`, 
        `Aula 3: Aplicação Prática`
      ],
      color: i === 0 ? "var(--blue-primary)" : "var(--text-tertiary)",
      slides: i === 0 ? MODULE_1_SLIDES : []
    });
  }
  
  return modules;
};

export const CURRICULUM = generateModules();
