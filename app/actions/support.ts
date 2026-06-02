'use server'

import { createClient } from '@/utils/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendSupportTicket(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData?.user) {
    return { error: 'Vocíª precisa estar logado para enviar um ticket.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', userData.user.id)
    .single()

  const userName = profile?.name || 'Usuário Patrimônio+'
  const userEmail = profile?.email || userData.user.email || 'Email desconhecido'
  const message = formData.get('message') as string

  if (!message || message.trim() === '') {
    return { error: 'A mensagem não pode estar vazia.' }
  }

  try {
    const { error } = await resend.emails.send({
      from: 'Patrimônio+ <suporte@patrimoniomais.com.br>', // Resend uses onboarding@resend.dev for unverified domains
      to: ['suporte@patrimoniomais.com.br', 'suporte@patrimoniomais.com.br'].includes(profile?.email || userData?.user?.email), // Precisa ser este email devido í  restrição do plano gratuito do Resend
      replyTo: userEmail, // Para o admin poder clicar em "Responder" no Gmail
      subject: `[Patrimônio+ Suporte] Novo Chamado de ${userName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #00d4aa;">Novo Ticket de Suporte ð</h2>
          <p><strong>Usuário:</strong> ${userName}</p>
          <p><strong>E-mail:</strong> <a href="mailto:${userEmail}">${userEmail}</a></p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <h3 style="color: #333;">Mensagem:</h3>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 8px; font-size: 16px; color: #555; white-space: pre-wrap;">${message}</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Para responder, basta clicar em "Responder" neste e-mail (a resposta irá direto para ${userEmail}).</p>
        </div>
      `,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro interno ao enviar e-mail.' }
  }
}
