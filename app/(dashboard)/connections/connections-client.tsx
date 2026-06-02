'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Rocket, Sparkles, ShieldCheck, Target, ArrowRight, 
  Activity, CheckCircle2, BrainCircuit, UploadCloud, 
  Database, LineChart, Badge, Lock, Users
} from 'lucide-react'
import PaywallModal from '@/components/PaywallModal'
import { submitFeedback } from '@/app/actions/feedback'

export default function ConnectionsClient({ subscriptionStatus, userEmail, activeSubscribers = 0 }: { subscriptionStatus: string, userEmail?: string, activeSubscribers?: number }) {
  const router = useRouter()
  const [showPaywall, setShowPaywall] = useState(false)
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  // Gamification Data
  const FOUNDERS_GOAL = 2000
  const CURRENT_FOUNDERS = 412 + activeSubscribers // Número psicológico inicial + assinantes reais
  const PROGRESS_PERCENT = Math.min((CURRENT_FOUNDERS / FOUNDERS_GOAL) * 100, 100)

  const handleJoinWaitlist = async () => {
    setWaitlistStatus('loading')
    try {
      const formData = new FormData()
      formData.append('category', 'OPEN_FINANCE_WAITLIST')
      formData.append('message', `Interesse na lista de espera do Open Finance.`)
      
      const res = await submitFeedback(formData)
      if (res.error) {
        alert(res.error)
        setWaitlistStatus('idle')
      } else {
        setWaitlistStatus('success')
        setTimeout(() => {
          setShowWaitlist(false)
        }, 3000)
      }
    } catch (err) {
      console.error(err)
      setWaitlistStatus('idle')
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px', paddingBottom: '80px' }}
    >
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', fontWeight: 800 }}>
          Central de <span style={{ color: 'var(--blue-primary)' }}>Conexões</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
          Sincronize sua vida financeira. Escolha o melhor método para manter seus dados atualizados e participe da revolução do Open Finance colaborativo.
        </p>
      </div>

      {/* SEÇÃO 1: MÉTODOS DISPONÍVEIS (FASE 1) */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={24} color="var(--text-primary)" />
          Métodos Disponíveis (Fase 1)
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Nossas ferramentas atuais contam com IA avançada para facilitar sua vida.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          {/* 1. Cadastro Manual */}
          <div 
            className="hover-scale"
            onClick={() => router.push('/portfolio')}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0,112,243,0.1)', color: 'var(--blue-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Activity size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Cadastro Manual</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', lineHeight: 1.5, flex: 1 }}>
              Lançamento manual de receitas, despesas e investimentos. Organização automática e sugestões inteligentes de categorização através da nossa IA.
            </p>
          </div>

          {/* 2. Importação CSV/OFX */}
          <div 
            className="hover-scale"
            onClick={() => router.push('/portfolio')}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--blue-primary)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', position: 'relative', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 30px rgba(79,110,247,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ position: 'absolute', top: '-10px', right: '20px', background: 'var(--blue-primary)', color: '#fff', padding: '2px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Recomendado</div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(138,43,226,0.1)', color: '#8a2be2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <BrainCircuit size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Importação Inteligente (OFX/CSV)</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', lineHeight: 1.5, flex: 1 }}>
              Upload de extratos bancários. Processamento automático e classificação inteligente via IA, com criação instantânea de dashboards.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'rgba(0,212,170,0.1)', color: 'var(--green-primary)', border: 'none' }}>Detecção de Padrões</span>
              <span className="badge" style={{ background: 'rgba(0,212,170,0.1)', color: 'var(--green-primary)', border: 'none' }}>Zero Digitação</span>
            </div>
          </div>

          {/* 3. Integração API Corretoras */}
          <div 
            className="hover-scale"
            onClick={() => setShowWaitlist(true)}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,140,0,0.1)', color: '#ff8c00', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <LineChart size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Integração via API</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', lineHeight: 1.5, flex: 1 }}>
              Conexão com corretoras parceiras para sincronização de posições. Atualizações periódicas em segundo plano para manter sua carteira no verde.
            </p>
          </div>

        </div>
      </div>

      {/* SEÇÃO 2: OPEN FINANCE (GAMIFICAÇÃO) */}
      <div style={{ background: 'linear-gradient(145deg, #111 0%, #1a1a24 100%)', border: '1px solid #333', borderRadius: '24px', padding: '40px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(79,110,247,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(138,43,226,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,212,170,0.15)', color: '#00ffcc', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                <Rocket size={14} /> Em Desenvolvimento
              </div>
              <h2 style={{ fontSize: '2.2rem', margin: '0 0 16px 0', color: '#fff', fontWeight: 800 }}>
                A Revolução do Open Finance
              </h2>
              <p style={{ color: '#aaa', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '600px' }}>
                Estamos construindo a integração completa com o Open Finance para tornar sua experiência ainda mais automatizada. 
                Para liberar essa funcionalidade em larga escala direto do Banco Central, estamos expandindo nossa comunidade Premium.
                <strong style={{ color: '#fff', display: 'block', marginTop: '8px' }}>Cada novo assinante nos aproxima da ativação dessa tecnologia para todos.</strong>
              </p>
            </div>

            {/* Selo Pioneiro */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', width: '220px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
              <div style={{ width: '60px', height: '60px', margin: '0 auto 12px', background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(255,215,0,0.4)' }}>
                <Sparkles size={32} color="#000" />
              </div>
              <h4 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '1rem' }}>Selo Pioneiro</h4>
              <p style={{ color: '#888', fontSize: '0.75rem', margin: 0, lineHeight: 1.4 }}>
                Todos que assinarem o PRO antes do lançamento ganharão este badge permanente no perfil.
              </p>
            </div>
          </div>

          {/* BARRA DE PROGRESSO PÚBLICA */}
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #333', borderRadius: '20px', padding: '32px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={20} color="var(--blue-primary)" /> Meta da Comunidade
                </h3>
                <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>
                  Acompanhamento em tempo real da nossa evolução.
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{PROGRESS_PERCENT.toFixed(1)}%</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--blue-primary)', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>Concluído</div>
              </div>
            </div>

            <div style={{ width: '100%', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
              <div style={{
                width: `${PROGRESS_PERCENT}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4f6ef7 0%, #00ffcc 100%)',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(0,255,204,0.4)',
                position: 'relative',
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', animation: 'shine 2s infinite' }} />
              </div>
            </div>

            <p style={{ textAlign: 'center', color: '#ccc', fontWeight: 600, margin: 0, fontSize: '1rem' }}>
              <strong style={{ color: '#fff' }}>{CURRENT_FOUNDERS.toLocaleString('pt-BR')}</strong> de <strong style={{ color: '#fff' }}>{FOUNDERS_GOAL.toLocaleString('pt-BR')}</strong> membros já contribuíram para liberar o Open Finance.
            </p>
          </div>

          {/* DESBLOQUEIO POR MARCOS (MILESTONES) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            <div style={{ background: CURRENT_FOUNDERS >= 500 ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${CURRENT_FOUNDERS >= 500 ? 'var(--green-primary)' : '#333'}`, borderRadius: '12px', padding: '16px', textAlign: 'center', position: 'relative', boxShadow: CURRENT_FOUNDERS >= 500 ? '0 0 15px rgba(0,212,170,0.2)' : 'none' }}>
              {CURRENT_FOUNDERS >= 500 && (
                <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--green-primary)', color: '#000', padding: '2px 12px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 0 10px rgba(0,212,170,0.5)' }}>
                  <CheckCircle2 size={12} /> LIBERADO (USANDO IA)
                </div>
              )}
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: CURRENT_FOUNDERS >= 500 ? 'var(--green-primary)' : '#fff', marginBottom: '8px', marginTop: CURRENT_FOUNDERS >= 500 ? '8px' : '0' }}>500 Assinantes</div>
              <div style={{ color: '#888', fontSize: '0.9rem' }}>Relatórios Avançados e Comparativos de Mercado</div>
            </div>
            
            <div style={{ background: CURRENT_FOUNDERS >= 1000 ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${CURRENT_FOUNDERS >= 1000 ? 'var(--green-primary)' : '#333'}`, borderRadius: '12px', padding: '16px', textAlign: 'center', position: 'relative', boxShadow: CURRENT_FOUNDERS >= 1000 ? '0 0 15px rgba(0,212,170,0.2)' : 'none' }}>
              {CURRENT_FOUNDERS >= 1000 && (
                <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--green-primary)', color: '#000', padding: '2px 12px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 0 10px rgba(0,212,170,0.5)' }}>
                  <CheckCircle2 size={12} /> LIBERADO (USANDO IA)
                </div>
              )}
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: CURRENT_FOUNDERS >= 1000 ? 'var(--green-primary)' : '#fff', marginBottom: '8px', marginTop: CURRENT_FOUNDERS >= 1000 ? '8px' : '0' }}>1.000 Assinantes</div>
              <div style={{ color: '#888', fontSize: '0.9rem' }}>Novos Dashboards de Renda e Projeção IA</div>
            </div>

            <div style={{ background: CURRENT_FOUNDERS >= 2000 ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${CURRENT_FOUNDERS >= 2000 ? 'var(--green-primary)' : '#333'}`, borderRadius: '12px', padding: '16px', textAlign: 'center', position: 'relative', boxShadow: CURRENT_FOUNDERS >= 2000 ? '0 0 15px rgba(0,212,170,0.2)' : 'none' }}>
              {CURRENT_FOUNDERS >= 2000 && (
                <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--green-primary)', color: '#000', padding: '2px 12px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 0 10px rgba(0,212,170,0.5)' }}>
                  <CheckCircle2 size={12} /> LIBERADO (USANDO IA)
                </div>
              )}
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: CURRENT_FOUNDERS >= 2000 ? 'var(--green-primary)' : '#fff', marginBottom: '8px', marginTop: CURRENT_FOUNDERS >= 2000 ? '8px' : '0' }}>2.000 Assinantes</div>
              <div style={{ color: '#888', fontSize: '0.9rem' }}>Open Finance 100% Liberado Automático</div>
            </div>
          </div>

          {/* CALL TO ACTION */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary" 
              style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}
              onClick={() => setShowPaywall(true)}
              disabled={subscriptionStatus === 'pro'}
            >
              {subscriptionStatus === 'pro' ? (
                <><CheckCircle2 size={20} /> Você já está ajudando a meta!</>
              ) : (
                <><Sparkles size={20} /> Assinar Premium e Apoiar</>
              )}
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
              onClick={() => setShowWaitlist(true)}
            >
              Entrar na Lista de Espera
            </button>
          </div>

        </div>

        <style jsx>{`
          @keyframes shine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>

      {/* MODAL LISTA DE ESPERA */}
      {showWaitlist && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '450px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(79,110,247,0.2) 0%, rgba(0,212,170,0.2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Users size={32} color="var(--blue-primary)" />
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Fila do Open Finance</h2>
              
              {waitlistStatus === 'success' ? (
                <div style={{ color: 'var(--green-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                  <CheckCircle2 size={48} />
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>Inscrição confirmada!</p>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                    Sua posição na fila de prioridade foi registrada. Enviaremos um e-mail assim que a meta for atingida e a tecnologia for lançada.
                  </p>
                  <button className="btn btn-secondary" style={{ width: '100%', marginTop: '16px' }} onClick={() => setShowWaitlist(false)}>Fechar</button>
                </div>
              ) : (
                <>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                    Ao entrar na lista de espera, você garante prioridade de acesso assim que a meta de 2.000 assinantes for atingida.
                  </p>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '16px', fontSize: '1rem', marginBottom: '12px' }}
                    onClick={handleJoinWaitlist}
                    disabled={waitlistStatus === 'loading'}
                  >
                    {waitlistStatus === 'loading' ? 'Registrando...' : 'Quero ser avisado no lançamento'}
                  </button>
                  <button 
                    className="btn btn-ghost" 
                    style={{ width: '100%' }}
                    onClick={() => setShowWaitlist(false)}
                    disabled={waitlistStatus === 'loading'}
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </motion.div>
  )
}
