'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Plus, RefreshCw, Trash2, ShieldCheck, AlertCircle } from 'lucide-react'
import { savePluggyItem, syncPluggyItem, deletePluggyItem } from '@/app/actions/pluggy'
import PaywallModal from '@/components/PaywallModal'

// Pluggy Connect requires window to be defined, so we dynamically import it
const PluggyConnect = dynamic(
  () => import('react-pluggy-connect').then((mod) => mod.PluggyConnect),
  { ssr: false }
)

export default function ConnectionsClient({ initialConnections, subscriptionStatus }: { initialConnections: any[], subscriptionStatus: string }) {
  const [connections, setConnections] = useState(initialConnections)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectToken, setConnectToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  const handleConnect = async () => {
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

  const onSuccess = async (itemData: { item: { id: string } }) => {
    setIsConnecting(false)
    setConnectToken(null)
    setLoading(true)
    
    try {
      const res = await savePluggyItem(itemData.item.id)
      if (res.error) {
        alert(res.error)
      } else {
        // Optimistically reload page or we can just let Server Actions handle it via revalidatePath
        window.location.reload()
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
      else alert('Sincronizado com sucesso!')
      window.location.reload()
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
      else window.location.reload()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Integraçí­Âµes</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="var(--green-primary)" />
            Sincronização automática com corretoras via Open Finance. Conexão criptografada e somente leitura.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ gap: '8px' }} 
          onClick={handleConnect}
          disabled={loading || isConnecting}
        >
          {loading && !isConnecting ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
          Conectar Corretora
        </button>
      </div>

      {isConnecting && connectToken && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '400px', height: '600px', background: '#fff', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
            <button 
              onClick={() => { setIsConnecting(false); setConnectToken(null) }}
              style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, background: '#f0f0f0', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              í¢ÂÂ
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

      {connections.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,212,170,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <ShieldCheck size={32} color="var(--green-primary)" />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Nenhuma conta conectada</h3>
          <p style={{ color: 'var(--text-tertiary)', maxWidth: '400px', margin: '0 auto 24px' }}>
            Conecte sua conta da B3 ou corretoras como XP, BTG, Nubank e NuInvest para sincronizar seu patrimônio automaticamente.
          </p>
          <button className="btn btn-primary" onClick={handleConnect} disabled={loading}>
            Conectar minha primeira conta
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {connections.map((conn) => (
            <div key={conn.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
                  {conn.connector_name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{conn.connector_name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: conn.status === 'UPDATED' ? 'var(--green-primary)' : 'var(--red-primary)' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      {conn.status === 'UPDATED' ? 'Sincronizado' : 'Erro de sincronização'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                      í¢ÂÂ¢ í­Âltima att: {new Date(conn.updated_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn btn-ghost" 
                  style={{ padding: '8px', color: 'var(--text-secondary)' }}
                  onClick={() => handleSync(conn.pluggy_item_id)}
                  disabled={loading}
                  title="Sincronizar agora"
                >
                  <RefreshCw size={18} />
                </button>
                <button 
                  className="btn btn-ghost" 
                  style={{ padding: '8px', color: 'var(--red-primary)' }}
                  onClick={() => handleDelete(conn.pluggy_item_id)}
                  disabled={loading}
                  title="Desconectar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
