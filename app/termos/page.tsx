export default function TermosPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", padding: "100px 24px" }}>
      <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "40px", textAlign: "center" }}>Políticas e Termos</h1>
        
        <section style={{ marginBottom: "60px", background: "var(--bg-card)", padding: "40px", borderRadius: "16px", border: "1px solid var(--border-default)" }}>
          <h2 style={{ marginBottom: "20px", color: "var(--green-primary)" }}>1. Termos de Uso</h2>
          <p style={{ lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: "20px" }}>
            Bem-vindo ao Patrimônio+. Ao acessar e usar nossa plataforma, você concorda em cumprir nossos termos de serviço. 
            Nossa plataforma tem fins educacionais e de gestão de portfólio. As informações e análises aqui fornecidas não configuram recomendação de investimento.
          </p>
          <p style={{ lineHeight: 1.8, color: "var(--text-secondary)" }}>
            Todo investimento envolve risco de perdas. Os resultados passados não garantem rentabilidade futura. Você é o único responsável pelas decisões de investimento que toma.
          </p>
        </section>

        <section style={{ marginBottom: "60px", background: "var(--bg-card)", padding: "40px", borderRadius: "16px", border: "1px solid var(--border-default)" }}>
          <h2 style={{ marginBottom: "20px", color: "var(--green-primary)" }}>2. Política de Privacidade</h2>
          <p style={{ lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: "20px" }}>
            Nós levamos sua privacidade muito a sério. Seus dados financeiros e pessoais são armazenados de forma segura e não são comercializados ou compartilhados com terceiros sem sua autorização explícita.
          </p>
          <p style={{ lineHeight: 1.8, color: "var(--text-secondary)" }}>
            Utilizamos as melhores práticas do mercado, como criptografia de ponta a ponta e bancos de dados protegidos, para garantir que apenas você tenha acesso ao histórico do seu patrimônio.
          </p>
        </section>

        <section style={{ marginBottom: "60px", background: "var(--bg-card)", padding: "40px", borderRadius: "16px", border: "1px solid var(--border-default)" }}>
          <h2 style={{ marginBottom: "20px", color: "var(--green-primary)" }}>3. Segurança</h2>
          <p style={{ lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: "20px" }}>
            A segurança da sua conta é protegida através de autenticação por tokens seguros e políticas de RLS (Row Level Security). Nosso banco de dados opera em infraestrutura na nuvem (Supabase), seguindo padrões internacionais de proteção.
          </p>
        </section>

        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <a href="/" className="btn btn-primary" style={{ display: "inline-flex" }}>Voltar para o Início</a>
        </div>
      </div>
    </div>
  );
}
