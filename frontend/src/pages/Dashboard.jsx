import { useEffect, useState } from 'react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

const S = {
  page:  { padding:'2rem', maxWidth:900, margin:'0 auto' },
  title: { fontSize:22, fontWeight:700, color:'#0f172a', marginBottom:'1.5rem' },
  grid:  { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem', marginBottom:'2rem' },
  card:  { background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'1.25rem' },
  val:   { fontSize:28, fontWeight:700, color:'#6366f1' },
  lbl:   { fontSize:13, color:'#64748b', marginTop:4 },
  badge: (s) => ({
    display:'inline-block', padding:'3px 12px', borderRadius:20, fontSize:12, fontWeight:600,
    background: s==='trial' ? '#fef3c7' : s==='active' ? '#dcfce7' : '#fee2e2',
    color:       s==='trial' ? '#92400e' : s==='active' ? '#166534' : '#991b1b',
  }),
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const [sub, setSub]     = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/billing/subscription').then((r) => setSub(r.data)).catch(console.error);
    api.get('/tenant/users').then((r) => setUsers(r.data)).catch(console.error);
  }, []);

  const trialDaysLeft = sub?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(sub.trial_ends_at) - Date.now()) / 86400000))
    : null;

  return (
    <div style={S.page}>
      <div style={S.title}>Dashboard</div>

      <div style={S.grid}>
        <div style={S.card}>
          <div style={S.val}>{users.length}</div>
          <div style={S.lbl}>Utilisateurs</div>
        </div>
        <div style={S.card}>
          <div style={{ marginBottom:8 }}>
            {sub && <span style={S.badge(sub.status)}>{sub.status}</span>}
          </div>
          <div style={S.lbl}>
            {sub?.status === 'trial'
              ? `Essai — ${trialDaysLeft} jour(s) restant(s)`
              : `Plan : ${sub?.plan?.name || '—'}`}
          </div>
        </div>
        <div style={S.card}>
          <div style={S.val}>{user?.role}</div>
          <div style={S.lbl}>Votre rôle</div>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ fontSize:15, fontWeight:600, marginBottom:'1rem', color:'#0f172a' }}>
          Membres de l'équipe
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #e2e8f0', color:'#64748b', fontSize:12 }}>
              <th style={{ padding:'6px 0', textAlign:'left' }}>Nom</th>
              <th style={{ padding:'6px 0', textAlign:'left' }}>Email</th>
              <th style={{ padding:'6px 0', textAlign:'left' }}>Rôle</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                <td style={{ padding:'8px 0' }}>{u.name}</td>
                <td style={{ padding:'8px 0', color:'#64748b' }}>{u.email}</td>
                <td style={{ padding:'8px 0' }}>
                  <span style={S.badge(u.role === 'admin' ? 'active' : 'trial')}>{u.role}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
