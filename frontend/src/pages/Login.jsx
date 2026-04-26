import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

const S = {
  page:  { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc' },
  card:  { background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:'2.5rem', width:380, boxShadow:'0 4px 24px #0001' },
  title: { fontSize:22, fontWeight:700, color:'#0f172a', marginBottom:'1.5rem' },
  label: { fontSize:12, color:'#475569', marginBottom:4, display:'block', fontWeight:500 },
  input: { width:'100%', border:'1px solid #cbd5e1', borderRadius:8, padding:'0.6rem 0.8rem',
           fontSize:14, marginBottom:'1rem', outline:'none', color:'#0f172a' },
  btn:   { width:'100%', background:'#6366f1', color:'#fff', border:'none', borderRadius:8,
           padding:'0.75rem', fontSize:15, fontWeight:600, cursor:'pointer' },
  err:   { color:'#ef4444', fontSize:13, marginBottom:'0.75rem' },
  link:  { color:'#6366f1', fontSize:13, textAlign:'center', display:'block', marginTop:'1rem' },
};

export default function Login() {
  const [form,    setForm]    = useState({ email:'', password:'' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const nav = useNavigate();

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('access_token',  data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      const me = await api.get('/auth/me');
      setUser(me.data);
      nav(me.data.role === 'superadmin' ? '/superadmin' : '/dashboard');
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur de connexion');
    } finally { setLoading(false); }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.title}>Connexion</div>
        {error && <div style={S.err}>{error}</div>}
        <label style={S.label}>Email</label>
        <input style={S.input} type="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label style={S.label}>Mot de passe</label>
        <input style={S.input} type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && submit()} />
        <button style={S.btn} onClick={submit} disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        <Link to="/register" style={S.link}>Créer un compte</Link>
      </div>
    </div>
  );
}
