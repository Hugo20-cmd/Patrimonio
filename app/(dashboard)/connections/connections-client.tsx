'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Plus, RefreshCw, Trash2, ShieldCheck, AlertCircle, Building, Wallet, Globe, Lock, ArrowRight, BrainCircuit, Sparkles, CheckCircle2, ChevronRight, Landmark } from 'lucide-react'
import { savePluggyItem, syncPluggyItem, deletePluggyItem } from '@/app/actions/pluggy'
import { submitFeedback } from '@/app/actions/feedback'
import PaywallModal from '@/components/PaywallModal'

// Pluggy Connect requires window to be defined, so we dynamically import it
const PluggyConnect = dynamic(
  () => import('react-pluggy-connect').then((mod) => mod.PluggyConnect),
  { ssr: false }
)

export default function ConnectionsClient({ initialConnections: connections, globalTotal, subscriptionStatus, userEmail }: { initialConnections: any[], globalTotal: number, subscriptionStatus: string, userEmail?: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectToken, setConnectToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  
  // Waitlist State
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [selectedInstitution, setSelectedInstitution] = useState('')
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const isMutating = loading || isPending || waitlistStatus === 'loading'

  const handleConnectClick = async (institutionName: string = 'Outra Instituição') => {
    // Se não for o admin, vai para lista de espera
    if (userEmail !== 'contatopennamc@gmail.com') {
      setSelectedInstitution(institutionName)
      setShowWaitlist(true)
      setWaitlistStatus('idle')
      return
    }

    // Fluxo original (apenas para Admin)
    if (subscriptionStatus === 'free' && connections.length >= 1) {
      setShowPaywall(true)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/pluggy/connect-token')
      const data = await res.json()
      if (data.accessToken) {
        setConnectToken(data.accessToken)
        setIsConnecting(true)
      } else {
        alert('Erro ao gerar token do Pluggy')
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao conectar com servidor.')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinWaitlist = async () => {
    setWaitlistStatus('loading')
    try {
      const formData = new FormData()
      formData.append('category', 'OPEN_FINANCE_WAITLIST')
      formData.append('message', `Interesse prioritário em conectar a instituição: ${selectedInstitution}`)
      
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

  const onSuccess = async (itemData: { item: { id: string } }) => {
    setIsConnecting(false)
    setConnectToken(null)
    setLoading(true)
    
    try {
      const res = await savePluggyItem(itemData.item.id)
      if (res.error) {
        alert(res.error)
      } else {
        startTransition(() => {
          router.refresh()
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (itemId: string) => {
    setLoading(true)
    try {
      const res = await syncPluggyItem(itemId)
      if (res.error) alert(res.error)
      else {
        startTransition(() => {
          router.refresh()
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Deseja realmente desconectar esta instituição? Os ativos sincronizados serão removidos da sua carteira.')) return
    
    setLoading(true)
    try {
      const res = await deletePluggyItem(itemId)
      if (res.error) alert(res.error)
      else {
        startTransition(() => {
          router.refresh()
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px', paddingBottom: '80px', opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s' }}>
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
      
      {/* 1. HEADER */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', background: 'var(--gradient-blue)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Conecte suas instituições financeiras
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto 24px', lineHeight: '1.6' }}>
          Conecte bancos e corretoras para importar automaticamente saldos, investimentos, movimentações e evolução patrimonial em tempo real através do Open Finance.
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--green-primary)', padding: '8px 16px', borderRadius: '24px', fontSize: '0.9rem', fontWeight: 600 }}>
          <Lock size={16} />
          Seus dados são protegidos por criptografia e você pode revogar qualquer conexão a qualquer momento.
        </div>
      </div>

      {/* 2. DASHBOARD DE RESUMO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Instituições conectadas</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700 }}>{connections.length}</span>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Patrimônio sincronizado</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: globalTotal > 0 ? 'var(--green-primary)' : 'var(--text-primary)' }}>{formatCurrency(globalTotal)}</span>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Última atualização</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '8px' }}>
            {connections.length > 0 ? new Date(connections[0].updated_at).toLocaleDateString('pt-BR') : '—'}
          </span>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Status Open Finance</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--green-primary)' }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Ativo</span>
          </div>
        </div>
      </div>

      {/* CENTRAL DE SINCRONIZAÇÃO */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RefreshCw size={24} color="var(--blue-primary)" />
          Central de Sincronização
        </h2>
        {connections.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border-strong)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-tertiary)', margin: 0 }}>Nenhuma conexão ativa no momento.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {connections.map((conn: any) => (
              <div key={conn.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                    {conn.connector_name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: conn.status === 'UPDATED' ? 'var(--green-primary)' : 'var(--red-primary)' }} />
                      {conn.connector_name}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', margin: 0 }}>
                      Última atualização: {new Date(conn.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                   <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Patrimônio sincronizado</span>
                   <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(conn.totalBalance)}</span>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleSync(conn.pluggy_item_id)}
                    disabled={isMutating}
                  >
                    <RefreshCw size={16} style={{ animation: isMutating ? 'spin 1s linear infinite' : 'none' }} /> Atualizar Agora
                  </button>
                  <button 
                    className="btn btn-ghost" 
                    style={{ color: 'var(--red-primary)' }}
                    onClick={() => handleDelete(conn.pluggy_item_id)}
                    disabled={isMutating}
                  >
                    Desconectar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. CATEGORIAS DE CONEXÃO */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Categorias de Conexão</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Escolha a instituição que deseja sincronizar.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* BANCOS */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ padding: '10px', background: 'rgba(0, 112, 243, 0.1)', borderRadius: '12px', color: 'var(--blue-primary)' }}>
                <Landmark size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Bancos</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {['Nubank', 'Banco Inter', 'Itaú Unibanco', 'Bradesco', 'Santander', 'Caixa'].map(bank => (
                <button key={bank} onClick={() => handleConnectClick(bank)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', cursor: 'pointer', transition: 'border-color 0.2s' }} className="hover-border-primary">{bank}</button>
              ))}
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Dados importados:</h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {['Saldo em conta', 'Extrato', 'Cartões', 'Limites', 'Empréstimos', 'Financiamentos'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="var(--green-primary)" /> {item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* CORRETORAS */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ padding: '10px', background: 'rgba(0, 212, 170, 0.1)', borderRadius: '12px', color: 'var(--green-primary)' }}>
                <Wallet size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Corretoras Brasileiras</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {['XP Investimentos', 'BTG Pactual', 'Rico', 'Clear', 'Genial'].map(broker => (
                <button key={broker} onClick={() => handleConnectClick(broker)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', cursor: 'pointer', transition: 'border-color 0.2s' }} className="hover-border-primary">{broker}</button>
              ))}
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Dados importados:</h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {['Ações', 'FIIs', 'ETFs', 'BDRs', 'Tesouro Direto', 'Dividendos', 'Histórico de operações'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="var(--green-primary)" /> {item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* INTERNACIONAIS */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ padding: '10px', background: 'rgba(138, 43, 226, 0.1)', borderRadius: '12px', color: '#8a2be2' }}>
                <Globe size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Corretoras Internacionais</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {['Nomad', 'Interactive Brokers', 'Charles Schwab', 'Avenue Securities'].map(broker => (
                <button key={broker} onClick={() => handleConnectClick(broker)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', cursor: 'pointer', transition: 'border-color 0.2s' }} className="hover-border-primary">{broker}</button>
              ))}
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Dados importados:</h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {['ETFs americanos', 'REITs', 'Stocks', 'Dividendos em dólar', 'Evolução patrimonial'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="var(--green-primary)" /> {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FLUXO DE CONEXÃO */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Como funciona o Open Finance?</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          {[
            { step: '1', title: 'Selecionar instituição', desc: 'Escolha seu banco ou corretora.' },
            { step: '2', title: 'Redirecionamento seguro', desc: 'Ambiente oficial da instituição.' },
            { step: '3', title: 'Autorizar compartilhamento', desc: 'Aprove o acesso leitura.' },
            { step: '4', title: 'Recebimento de dados', desc: 'Trazemos suas posições.' },
            { step: '5', title: 'Sincronização concluída', desc: 'Seu patrimônio consolidado.' }
          ].map((item, i) => (
            <div key={item.step} style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--blue-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
                {item.step}
              </div>
              <h4 style={{ margin: 0, fontSize: '1rem' }}>{item.title}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. INTELIGÊNCIA ARTIFICIAL */}
      <div style={{ background: 'linear-gradient(135deg, rgba(138,43,226,0.1) 0%, rgba(0,112,243,0.1) 100%)', border: '1px solid rgba(138,43,226,0.2)', borderRadius: '16px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#8a2be2', color: '#fff', padding: '6px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <Sparkles size={14} /> Em Breve
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BrainCircuit size={32} color="#8a2be2" />
            Inteligência Artificial Patrimônio+
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', marginBottom: '32px' }}>
            Após a sincronização, nossa IA assumirá o controle das análises, gerando insights profundos sobre sua carteira de forma automática.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {['Evolução patrimonial', 'Crescimento mensal', 'Dividendos recebidos', 'Alocação por classe', 'Exposição Brasil x Exterior', 'Renda passiva projetada', 'Alertas de concentração', 'Sugestões de rebalanceamento'].map(item => (
              <div key={item} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={18} color="#8a2be2" />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. PLANO PRO */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Seu patrimônio completo em um único lugar.</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto 40px' }}>
          Conecte bancos, corretoras e investimentos através do Open Finance e acompanhe sua evolução financeira em tempo real, sem precisar preencher dados manualmente.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {/* FREE */}
          <div style={{ flex: '1 1 300px', maxWidth: '400px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '32px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Plano Free</h3>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>Para quem está começando</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)' }}><CheckCircle2 size={20} color="var(--text-subtle)" /> 1 conexão gratuita</li>
              <li style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)' }}><CheckCircle2 size={20} color="var(--text-subtle)" /> Atualização manual</li>
              <li style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)' }}><CheckCircle2 size={20} color="var(--text-subtle)" /> Recursos limitados</li>
            </ul>
          </div>

          {/* PRO */}
          <div style={{ flex: '1 1 300px', maxWidth: '400px', background: 'var(--bg-elevated)', border: '2px solid var(--blue-primary)', borderRadius: '16px', padding: '32px', textAlign: 'left', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'var(--blue-primary)', color: '#fff', padding: '4px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Recomendado
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={20} color="var(--blue-primary)" /> Patrimônio+ PRO</h3>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>Visão completa da sua riqueza</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', gap: '12px', fontWeight: 600 }}><CheckCircle2 size={20} color="var(--blue-primary)" /> Conexões ilimitadas</li>
              <li style={{ display: 'flex', gap: '12px', fontWeight: 600 }}><CheckCircle2 size={20} color="var(--blue-primary)" /> Bancos e Corretoras ilimitadas</li>
              <li style={{ display: 'flex', gap: '12px', fontWeight: 600 }}><CheckCircle2 size={20} color="var(--blue-primary)" /> Atualização automática</li>
              <li style={{ display: 'flex', gap: '12px', fontWeight: 600 }}><CheckCircle2 size={20} color="var(--blue-primary)" /> Histórico completo e Relatórios</li>
              <li style={{ display: 'flex', gap: '12px', fontWeight: 600 }}><CheckCircle2 size={20} color="var(--blue-primary)" /> Insights da IA (Em breve)</li>
            </ul>
            <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }} onClick={() => setShowPaywall(true)}>
              Fazer Upgrade <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {isConnecting && connectToken && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '400px', height: '600px', background: '#fff', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
            <button 
              onClick={() => { setIsConnecting(false); setConnectToken(null) }}
              style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, background: '#f0f0f0', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#000' }}
            >
              ✕
            </button>
            <PluggyConnect
              connectToken={connectToken}
              onSuccess={onSuccess}
              onError={(error: any) => {
                console.error('Pluggy error', error)
                setIsConnecting(false)
                setConnectToken(null)
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL LISTA DE ESPERA (BETA FECHADO) */}
      {showWaitlist && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '450px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>
            <button 
              onClick={() => setShowWaitlist(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, background: 'var(--bg-elevated)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}
            >
              ✕
            </button>
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(138,43,226,0.2) 0%, rgba(0,112,243,0.2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Sparkles size={32} color="#8a2be2" />
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Open Finance (Beta)</h2>
              
              {waitlistStatus === 'success' ? (
                <div style={{ color: 'var(--green-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                  <CheckCircle2 size={48} />
                  <p style={{ margin: 0, fontWeight: 600 }}>Inscrição confirmada!</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Você será avisado assim que liberarmos novas vagas para o {selectedInstitution}.</p>
                </div>
              ) : (
                <>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                    Para garantirmos a máxima segurança de criptografia e performance na sincronização em tempo real, estamos liberando as vagas do Open Finance de forma gradual.
                  </p>
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '8px', fontWeight: 600 }}>Instituição escolhida:</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Landmark size={20} color="var(--text-primary)" />
                      <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedInstitution}</span>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
                    onClick={handleJoinWaitlist}
                    disabled={waitlistStatus === 'loading'}
                  >
                    {waitlistStatus === 'loading' ? 'Registrando...' : 'Entrar na Fila de Prioridade'}
                  </button>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '16px' }}>
                    *Sem custos, você não será cobrado.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
