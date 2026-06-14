import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { signOut } from '@/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{
        borderBottom: '1px solid rgba(142,59,78,0.12)',
        background: 'var(--surface)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)' }}>
              Film Journal
            </span>
            <span style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: 1 }}>/ Admin</span>
          </div>
          <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            <a href="/admin/reviews" style={navLink}>Reviews</a>
            <a href="/" style={navLink}>← Site</a>
            <form action={async () => {
              'use server'
              await signOut({ redirectTo: '/admin/login' })
            }}>
              <button type="submit" style={signOutBtn}>Sign out</button>
            </form>
          </nav>
        </div>
      </header>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {children}
      </main>
    </div>
  )
}

const navLink: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--muted)',
  textDecoration: 'none',
  padding: '0.35rem 0.65rem',
  borderRadius: 4,
}

const signOutBtn: React.CSSProperties = {
  background: 'none',
  border: '1px solid rgba(142,59,78,0.25)',
  color: 'var(--rose)',
  padding: '0.3rem 0.75rem',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: '0.82rem',
  marginLeft: '0.5rem',
}
