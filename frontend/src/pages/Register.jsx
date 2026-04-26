import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const S = {
  page:  { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc' },
  card:  { background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:'2.5rem', width:420, boxShadow:'0 4px 24px #0001' },
  title: { fontSize:24, fontWeight:700, color:'#0f172a', marginBottom:4 },
  sub:   { fontSize:13, color:'#64748b', marginBottom:'2rem' },
  label: { fontSize:12, color:'#475569', marginBottom:4, display:'block', fontWeight:500 },
  input: { width:'100%', border:'1px solid #cbd5e1', borderRadius:8, padding:'0.6rem 0.8rem',
           fontSize:14, marginBottom:'1rem', outline:'none', color:'#0f172a' },
  btn:   { width:'100%', background:'#6366f1', color:'#fff', border:'none', borderRadius:8,
           padding:'0.75rem', fontSize:15, fontWeight:600, cursor:'pointer', marginTop:4 },
  err:   { color:'#ef4444', fontSize:13, marginBottom:'0.75rem' },
  link:  { color:'#6366f1', fontSize:13, textAlign:'center', display:'block', marginTop:'1rem' },
};

export default function Register() {
  const [form, setForm] = useState({ tenantName:'', adminName:'', email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      await api.post('/tenant/register', form);
      nav('/login?registered=1');
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally { setLoading(false); }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.title}>Créer votre espace</div>
        <div style={S.sub}>Essai gratuit de 14 jours — aucune carte requise</div>
        {error && <div style={S.err}>{error}</div>}
        <label style={S.label}>Nom de votre organisation</label>
        <input style={S.input} placeholder="Acme Corp" value={form.tenantName} onChange={set('tenantName')} />
        <label style={S.label}>Votre nom</label>
        <input style={S.input} placeholder="John Doe" value={form.adminName} onChange={set('adminName')} />
        <label style={S.label}>Email</label>
        <input style={S.input} type="email" placeholder="john@acme.com" value={form.email} onChange={set('email')} />
        <label style={S.label}>Mot de passe</label>
        <input style={S.input} type="password" value={form.password} onChange={set('password')}
          onKeyDown={(e) => e.key === 'Enter' && submit()} />
        <button style={S.btn} onClick={submit} disabled={loading}>
          {loading ? 'Création...' : 'Créer mon espace'}
        </button>
        <Link to="/login" style={S.link}>Déjà un compte ? Se connecter</Link>
      </div>
    </div>
  );
}
