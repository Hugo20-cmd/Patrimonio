import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Vercel Cron will call this endpoint automatically
// Configuration should be added to vercel.json:
// { "crons": [{ "path": "/api/cron/monthly-report", "schedule": "0 0 1 * *" }] }

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  try {
    // Verify auth header for CRON (Vercel sets this)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch all premium users (or all users)
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, plan')
      .eq('plan', 'Premium'); // Apenas envia para Premium como benefício extra

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: 'No premium users found to send reports' });
    }

    const emailsSent = [];

    for (const profile of profiles) {
      // Fetch assets to calculate total
      const { data: assets } = await supabaseAdmin
        .from('assets')
        .select('*')
        .eq('user_id', profile.id);
      
      let totalCurrent = 0;
      let totalInvested = 0;
      
      if (assets) {
        assets.forEach((a) => {
          totalInvested += a.quantity * a.average_price;
          totalCurrent += a.quantity * a.current_price;
        });
      }

      const profit = totalCurrent - totalInvested;
      const profitPercent = totalInvested > 0 ? ((profit / totalInvested) * 100).toFixed(2) : '0.00';
      const isPositive = profit >= 0;

      // Montar HTML do e-mail
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Seu Relatório Mensal - Patrimônio+</h2>
          <p>Olá, <strong>${profile.name}</strong>!</p>
          <p>Aqui está o resumo do fechamento da sua carteira no último mês:</p>
          
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; border: 1px solid #eaeaea; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #555;">Resumo Patrimonial</h3>
            <p><strong>Total Investido:</strong> R$ ${totalInvested.toFixed(2)}</p>
            <p><strong>Patrimônio Atual:</strong> R$ ${totalCurrent.toFixed(2)}</p>
            <p style="color: ${isPositive ? '#00d4aa' : '#ff5050'};">
              <strong>Resultado:</strong> R$ ${profit.toFixed(2)} (${isPositive ? '+' : ''}${profitPercent}%)
            </p>
          </div>
          
          <p>Para baixar seu relatório detalhado em PDF, acesse o painel e clique em "Gerar Relatório PDF".</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://patrimonioplus.com/dashboard" style="background-color: #4f6ef7; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Acessar Meu Painel
            </a>
          </div>
          <p style="font-size: 12px; color: #999; text-align: center; margin-top: 40px;">
            Enviado automaticamente pelo Patrimônio+. Para cancelar o recebimento, altere suas configurações de notificação.
          </p>
        </div>
      `;

      // Simular envio de e-mail (ou enviar de verdade se houver chave)
      if (process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: 'Patrimônio+ <relatorios@patrimonioplus.com>',
            to: profile.email,
            subject: 'Seu Relatório Mensal de Investimentos chegou!',
            html: htmlContent,
          });
          emailsSent.push(profile.email);
        } catch (e) {
          console.error(`Failed to send email to ${profile.email}`, e);
        }
      } else {
        console.log(`[MOCK EMAIL] Sent to ${profile.email}`);
        emailsSent.push(profile.email);
      }
    }

    return NextResponse.json({ success: true, emailsSent });
  } catch (error) {
    console.error('Error in monthly-report cron:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
