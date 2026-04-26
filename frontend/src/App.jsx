import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import api from './api/axios';
import useAuthStore from './store/authStore';
import Login      from './pages/Login';
import Register   from './pages/Register';
import Dashboard  from './pages/Dashboard';
import TenantsPage from './pages/superadmin/TenantsPage';

const S = {
  nav:  { background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'0 2rem',
          display:'flex', alignItems:'center', gap:'1.5rem', height:56 },
  logo: { color:'#6366f1', fontWeight:800, fontSize:18, marginRight:'auto' },
  link: { color:'#64748b', fontSize:13, cursor:'pointer', textDecoration:'none' },
  user: { color:'#94a3b8', fontSize:12 },
};

function Nav() {
  const { user, logout } = useAuthStore();
  return (
    <nav style={S.nav}>
      <span style={S.logo}>SaaS Starter</span>
      {user?.role === 'superadmin' && <Link to="/superadmin" style={S.link}>Tenants</Link>}
      {user && <Link to="/dashboard" style={S.link}>Dashboard</Link>}
      {user
        ? <><span style={S.user}>{user.name}</span><span style={S.link} onClick={logout}>Déconnexion</span></>
        : <Link to="/login" style={S.link}>Connexion</Link>}
    </nav>
  );
}

function PrivateRoute({ children, role }) {
  const { user } = useAuthStore();
  if (!localStorage.getItem('access_token')) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      api.get('/auth/me').then((r) => setUser(r.data)).catch(() => {});
    }
  }, []);

  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/superadmin" element={<PrivateRoute role="superadmin"><TenantsPage /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
