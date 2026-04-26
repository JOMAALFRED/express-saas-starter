import { useEffect, useState } from 'react';
import api from '../../api/axios';

const S = {
  page:  { padding:'2rem', maxWidth:1100, margin:'0 auto' },
  title: { fontSize:20, fontWeight:700, color:'#0f172a', marginBottom:'1.5rem' },
  table: { width:'100%', borderCollapse:'collapse', background:'#fff',
           border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden', fontSize:14 },
  th:    { padding:'10px 14px', textAlign:'left', background:'#f8fafc',
           color:'#64748b', fontSize:12, borderBottom:'1px solid #e2e8f0' },
  td:    { padding:'10px 14px', borderBottom:'1px solid #f1f5f9', color:'#1e293b' },
  badge: (v) => ({
    display:'inline-block', padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:600,
    background: v ? '#dcfce7' : '#fee2e2',
    color:       v ? '#166534' : '#991b1b',
  }),
  sub:   (s) => ({
    display:'inline-block', padding:'2px 10px', borderRadius:20, fontSize:11,
    background: s==='trial'?'#fef3c7':s==='active'?'#dcfce7':'#fee2e2',
    color:       s==='trial'?'#92400e':s==='active'?'#166534':'#991b1b',
  }),
  btn:   (c='#ef4444') => ({
    background:c, color:'#fff', border:'none', borderRadius:6,
    padding:'3px 10px', cursor:'pointer', fontSize:12,
  }),
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    api.get('/superadmin/tenants').then((r) => setTenants(r.data)).catch(console.error);
  }, []);

  const toggle = async (id) => {
    await api.patch(`/superadmin/tenants/${id}/toggle`);
    setTenants((t) => t.map((x) => x.id === id ? { ...x, is_active: !x.is_active } : x));
  };

  return (
    <div style={S.page}>
      <div style={S.title}>Gestion des Tenants</div>
      <table style={S.table}>
        <thead>
          <tr>
            {['Nom','Slug','Email','Statut','Abonnement','Plan','Actions'].map((h) => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tenants.map((t) => (
            <tr key={t.id}>
              <td style={S.td}><strong>{t.name}</strong></td>
              <td style={{ ...S.td, color:'#64748b', fontFamily:'monospace' }}>{t.slug}</td>
              <td style={S.td}>{t.email}</td>
              <td style={S.td}><span style={S.badge(t.is_active)}>{t.is_active ? 'actif' : 'suspendu'}</span></td>
              <td style={S.td}>
                {t.subscription && <span style={S.sub(t.subscription.status)}>{t.subscription.status}</span>}
              </td>
              <td style={S.td}>{t.subscription?.plan?.name || '—'}</td>
              <td style={S.td}>
                <button style={S.btn(t.is_active ? '#ef4444' : '#22c55e')} onClick={() => toggle(t.id)}>
                  {t.is_active ? 'Suspendre' : 'Réactiver'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
