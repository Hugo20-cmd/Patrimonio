'use server'

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const data = await resend.emails.send({
      from: 'Patrimônio+ <contato@patrimonioplus.com>',
      to: [email],
      subject: 'Bem-vindo ao Patrimônio+ 🚀',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Olá, ${name}!</h2>
          <p>Obrigado por se juntar ao Patrimônio+.</p>
          <p>Estamos muito felizes em ter você conosco na jornada para a independência financeira.</p>
          <br/>
          <p>Se tiver qualquer dúvida, é só responder este e-mail.</p>
          <p>Abraços,<br/>Equipe Patrimônio+</p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return { error: error.message };
  }
}

export async function sendPremiumConfirmationEmail(email: string, name: string) {
  try {
    const data = await resend.emails.send({
      from: 'Patrimônio+ <contato@patrimonioplus.com>',
      to: [email],
      subject: 'Assinatura Premium Confirmada 💎',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Sua assinatura Premium está ativa, ${name}!</h2>
          <p>A partir de agora você tem acesso a:</p>
          <ul>
            <li>Ativos e metas ilimitadas</li>
            <li>Dashboard completo de dividendos</li>
            <li>Relatórios e projeções avançadas</li>
          </ul>
          <p>Acesse a plataforma agora mesmo para explorar todas as novidades.</p>
          <br/>
          <p>Abraços,<br/>Equipe Patrimônio+</p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending premium email:', error);
    return { error: error.message };
  }
}

export async function sendNewFeedbackEmail(userName: string, category: string, content: string) {
  try {
    const data = await resend.emails.send({
      from: 'Patrimônio+ Admin <contato@patrimonioplus.com>',
      to: ['suporte@patrimoniomais.com.br'], // E-mail do Administrador
      subject: `[Patrimônio+] Novo Feedback: ${category.toUpperCase()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #00d4aa;">Novo Feedback Recebido</h2>
          <p><strong>Usuário:</strong> ${userName}</p>
          <p><strong>Categoria:</strong> ${category}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Mensagem:</strong></p>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 8px; font-style: italic;">
            "${content}"
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p>Acesse o <a href="https://patrimonio-plus.netlify.app/admin">Painel Administrativo</a> para responder.</p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending feedback email:', error);
    return { error: error.message };
  }
}
