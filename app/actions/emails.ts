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
