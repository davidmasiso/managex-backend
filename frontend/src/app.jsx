import { useState, useEffect } from 'preact/hooks';
import axios from 'axios';

// ManageX v1.1 - forgot password
const API = 'https://managex-backend-production-ec28.up.railway.app/api';

const Icon = ({ name, style: x = {} }) => (
  <i className={`fa-solid fa-${name}`} style={{ lineHeight:1, ...x }} />
);

const LogoHex = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" style={{ filter:'drop-shadow(0 0 14px rgba(245,166,35,0.35))' }}>
    <defs>
      <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F5A623"/>
        <stop offset="100%" stopColor="#FF6B35"/>
      </linearGradient>
    </defs>
    <path d="M28 4L50 16.5V39.5L28 52L6 39.5V16.5L28 4Z" fill="url(#lg)" opacity="0.12"/>
    <path d="M28 4L50 16.5V39.5L28 52L6 39.5V16.5L28 4Z" stroke="url(#lg)" strokeWidth="1.5"/>
    <rect x="14" y="32" width="5" height="10" rx="1.5" fill="url(#lg)" opacity="0.5"/>
    <rect x="21" y="24" width="5" height="18" rx="1.5" fill="url(#lg)" opacity="0.75"/>
    <rect x="28" y="18" width="5" height="24" rx="1.5" fill="url(#lg)"/>
    <rect x="35" y="27" width="5" height="15" rx="1.5" fill="url(#lg)" opacity="0.65"/>
    <polyline points="16.5,30 23.5,22 30.5,16 37.5,25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
    <circle cx="37.5" cy="25" r="2" fill="white" opacity="0.9"/>
  </svg>
);

const C = {
  gold: '#F5A623', gold2: '#FF6B35',
  dark: '#080C14', dark2: '#0D1220', dark3: '#111827',
  surface: '#161D2E', surface2: '#1C2438', surface3: '#202B42',
  border: 'rgba(255,255,255,0.06)', border2: 'rgba(255,255,255,0.1)',
  text: '#F0F4FF', textSub: '#8892AA', textMuted: '#4A5568',
  green: '#10B981', blue: '#3B82F6', purple: '#8B5CF6', red: '#EF4444',
};

// Hook para detectar mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

const s = {
  app: { display:'flex', width:'100vw', height:'100vh', overflow:'hidden', background:C.dark, fontFamily:"'DM Sans', sans-serif" },
  sidebar: { width:'240px', minWidth:'240px', background:C.surface, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', height:'100vh', position:'relative' },
  sidebarGlow: { position:'absolute', top:0, left:0, right:0, height:'200px', background:'radial-gradient(ellipse at 50% 0%, rgba(245,166,35,0.06) 0%, transparent 70%)', pointerEvents:'none' },
  sidebarHeader: { padding:'1.4rem 1.2rem', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:'.75rem', flexShrink:0 },
  logoText: { fontFamily:"'Syne', sans-serif", fontSize:'1.1rem', fontWeight:'800', letterSpacing:'-0.03em', color:C.text },
  logoX: { background:`linear-gradient(135deg, ${C.gold}, ${C.gold2})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' },
  navSection: { padding:'.5rem .75rem .25rem', fontSize:'.6rem', fontWeight:'700', letterSpacing:'.12em', textTransform:'uppercase', color:C.textMuted },
  navItem: (a) => ({ display:'flex', alignItems:'center', gap:'.7rem', padding:'.6rem .75rem', borderRadius:'8px', fontSize:'.83rem', fontWeight:'500', cursor:'pointer', margin:'0 .5rem .1rem', color: a ? C.gold : C.textSub, background: a ? 'rgba(245,166,35,0.08)' : 'transparent', border: a ? `1px solid rgba(245,166,35,0.15)` : '1px solid transparent', transition:'all .15s' }),
  navIcon: (a) => ({ width:'16px', textAlign:'center', color: a ? C.gold : C.textMuted }),
  sidebarFooter: { padding:'.9rem 1rem', borderTop:`1px solid ${C.border}`, marginTop:'auto' },
  userCard: { display:'flex', alignItems:'center', gap:'.6rem', padding:'.6rem .7rem', borderRadius:'8px', background:C.surface2, border:`1px solid ${C.border}`, marginBottom:'.6rem' },
  avatar: { width:'30px', height:'30px', minWidth:'30px', borderRadius:'50%', background:`linear-gradient(135deg, ${C.gold}, ${C.gold2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.75rem', fontWeight:'700', color:C.dark },
  userName: { fontSize:'.8rem', fontWeight:'600', color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  userRole: { fontSize:'.65rem', color:C.textMuted, textTransform:'capitalize' },
  btnLogout: { display:'flex', alignItems:'center', justifyContent:'center', gap:'.4rem', width:'100%', padding:'.5rem', background:'transparent', border:`1px solid ${C.border}`, borderRadius:'8px', color:C.textSub, fontSize:'.75rem', fontWeight:'500', cursor:'pointer' },
  main: { flex:1, display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', minWidth:0, background:C.dark3 },
  topbar: { height:'56px', minHeight:'56px', background:C.surface, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.75rem', flexShrink:0 },
  topbarLeft: { display:'flex', alignItems:'center', gap:'.6rem' },
  topbarTitle: { fontFamily:"'Syne', sans-serif", fontSize:'.95rem', fontWeight:'700', color:C.text },
  topbarRight: { display:'flex', alignItems:'center', gap:'.75rem' },
  topbarBadge: { background:C.surface2, border:`1px solid ${C.border}`, borderRadius:'6px', padding:'.3rem .7rem', fontSize:'.72rem', color:C.textSub, fontWeight:'500' },
  content: { flex:1, padding:'1.75rem 2rem', background:C.dark3, overflowY:'auto' },
  pageHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' },
  pageTitle: { fontFamily:"'Syne', sans-serif", fontSize:'1.4rem', fontWeight:'800', color:C.text, letterSpacing:'-0.02em' },
  pageSub: { fontSize:'.8rem', color:C.textMuted, marginTop:'.25rem' },
  card: { background:C.surface, border:`1px solid ${C.border}`, borderRadius:'14px', overflow:'hidden', marginBottom:'1.5rem' },
  cardHeader: { padding:'1rem 1.25rem', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' },
  cardTitle: { fontSize:'.85rem', fontWeight:'700', color:C.text, display:'flex', alignItems:'center', gap:'.5rem' },
  cardBody: { padding:'1.25rem' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' },
  statCard: (color) => ({ background:C.surface, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'1.25rem', position:'relative', overflow:'hidden', borderTop:`2px solid ${color}` }),
  statGlow: (color) => ({ position:'absolute', top:0, right:0, width:'80px', height:'80px', background:`radial-gradient(circle at 100% 0%, ${color}18 0%, transparent 70%)`, pointerEvents:'none' }),
  statIcon: (color) => ({ width:'36px', height:'36px', borderRadius:'10px', background:`${color}15`, border:`1px solid ${color}25`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'.75rem' }),
  statLabel: { fontSize:'.68rem', fontWeight:'600', color:C.textMuted, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.3rem' },
  statValue: { fontFamily:"'Syne', sans-serif", fontSize:'1.8rem', fontWeight:'800', color:C.text, lineHeight:1, letterSpacing:'-0.02em' },
  statSub: { fontSize:'.72rem', color:C.textMuted, marginTop:'.3rem' },
  btnPrimary: { background:`linear-gradient(135deg, ${C.gold}, ${C.gold2})`, color:C.dark, border:'none', borderRadius:'9px', padding:'.6rem 1.2rem', fontSize:'.82rem', fontWeight:'700', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'.4rem', fontFamily:"'DM Sans', sans-serif", boxShadow:`0 4px 16px rgba(245,166,35,0.2)` },
  btnSecondary: { background:C.surface2, color:C.text, border:`1px solid ${C.border2}`, borderRadius:'9px', padding:'.6rem 1.2rem', fontSize:'.82rem', fontWeight:'600', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'.4rem' },
  btnDanger: { background:'rgba(239,68,68,0.08)', color:C.red, border:`1px solid rgba(239,68,68,0.2)`, borderRadius:'8px', padding:'.38rem .85rem', fontSize:'.75rem', fontWeight:'600', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'.35rem' },
  btnSuccess: { background:'rgba(16,185,129,0.08)', color:C.green, border:`1px solid rgba(16,185,129,0.2)`, borderRadius:'8px', padding:'.38rem .85rem', fontSize:'.75rem', fontWeight:'600', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'.35rem' },
  btnSmall: { background:C.surface2, color:C.textSub, border:`1px solid ${C.border}`, borderRadius:'7px', padding:'.3rem .65rem', fontSize:'.73rem', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'.3rem' },
  btnBlue: { background:'rgba(59,130,246,0.08)', color:C.blue, border:`1px solid rgba(59,130,246,0.2)`, borderRadius:'8px', padding:'.38rem .85rem', fontSize:'.75rem', fontWeight:'600', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'.35rem' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { padding:'.6rem 1rem', textAlign:'left', fontSize:'.65rem', fontWeight:'700', letterSpacing:'.1em', textTransform:'uppercase', color:C.textMuted, background:C.surface2, borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap' },
  td: { padding:'.75rem 1rem', fontSize:'.82rem', color:C.textSub, borderBottom:`1px solid ${C.border}`, verticalAlign:'middle' },
  badge: (color, bg) => ({ display:'inline-flex', alignItems:'center', gap:'.3rem', padding:'.18rem .6rem', borderRadius:'100px', fontSize:'.68rem', fontWeight:'600', color, background:bg }),
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,.8)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', backdropFilter:'blur(4px)' },
  modal: { background:C.surface, border:`1px solid ${C.border2}`, borderRadius:'18px', width:'min(580px,100%)', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(0,0,0,.5)' },
  modalLg: { background:C.surface, border:`1px solid ${C.border2}`, borderRadius:'18px', width:'min(720px,100%)', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(0,0,0,.5)' },
  modalHeader: { padding:'1.25rem 1.5rem', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:C.surface, zIndex:1, borderRadius:'18px 18px 0 0' },
  modalTitle: { fontFamily:"'Syne', sans-serif", fontSize:'.95rem', fontWeight:'700', color:C.text, display:'flex', alignItems:'center', gap:'.5rem' },
  modalBody: { padding:'1.5rem' },
  modalFooter: { padding:'1rem 1.5rem', borderTop:`1px solid ${C.border}`, display:'flex', justifyContent:'flex-end', gap:'.6rem', position:'sticky', bottom:0, background:C.surface, borderRadius:'0 0 18px 18px' },
  formGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' },
  field: { display:'flex', flexDirection:'column', gap:'.35rem' },
  label: { fontSize:'.67rem', fontWeight:'600', color:C.textSub, textTransform:'uppercase', letterSpacing:'.08em' },
  input: { background:C.surface2, border:`1px solid ${C.border}`, borderRadius:'9px', padding:'.65rem .9rem', fontSize:'.88rem', color:C.text, outline:'none', width:'100%', fontFamily:"'DM Sans', sans-serif" },
  select: { background:C.surface2, border:`1px solid ${C.border}`, borderRadius:'9px', padding:'.65rem .9rem', fontSize:'.88rem', color:C.text, outline:'none', width:'100%', fontFamily:"'DM Sans', sans-serif" },
  textarea: { background:C.surface2, border:`1px solid ${C.border}`, borderRadius:'9px', padding:'.65rem .9rem', fontSize:'.88rem', color:C.text, outline:'none', width:'100%', resize:'vertical', minHeight:'80px', fontFamily:"'DM Sans', sans-serif" },
  divider: { height:'1px', background:C.border, margin:'1rem 0' },
  emptyState: { textAlign:'center', padding:'3rem 1.5rem' },
  emptyTitle: { fontSize:'.9rem', fontWeight:'600', color:C.textSub, marginTop:'.75rem', marginBottom:'.3rem' },
  emptyDesc: { fontSize:'.78rem', color:C.textMuted },
  loginInput: { background:C.surface2, border:`1px solid ${C.border}`, borderRadius:'10px', padding:'.7rem 1rem', fontSize:'.9rem', color:C.text, outline:'none', width:'100%', fontFamily:"'DM Sans', sans-serif" },
  loginLabel: { fontSize:'.67rem', fontWeight:'600', color:C.textSub, textTransform:'uppercase', letterSpacing:'.1em' },
};

const getHeaders = (token) => ({ Authorization:`Bearer ${token}` });

const BadgeEstado = ({ estado }) => {
  const map = {
    pendiente:[C.gold,'rgba(245,166,35,0.1)'], confirmada:[C.blue,'rgba(59,130,246,0.1)'],
    completada:[C.green,'rgba(16,185,129,0.1)'], cancelada:[C.red,'rgba(239,68,68,0.1)'],
    nuevo:[C.textSub,'rgba(148,163,184,0.1)'], regular:[C.blue,'rgba(59,130,246,0.1)'],
    vip:[C.gold,'rgba(245,166,35,0.1)'], premium:[C.purple,'rgba(139,92,246,0.1)'],
    efectivo:[C.green,'rgba(16,185,129,0.1)'], tarjeta:[C.blue,'rgba(59,130,246,0.1)'],
    transferencia:[C.purple,'rgba(139,92,246,0.1)'], pagado:[C.green,'rgba(16,185,129,0.1)'],
  };
  const [color,bg] = map[estado]||[C.textSub,'rgba(148,163,184,0.1)'];
  return <span style={s.badge(color,bg)}><span style={{ width:'5px',height:'5px',borderRadius:'50%',background:color,display:'inline-block' }}/>{estado}</span>;
};

// ══════════════════════════════════════
// FORGOT PASSWORD
// ══════════════════════════════════════
function ForgotPassword({ onVolver }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email) { setError('Ingresa tu email'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`${API}/email/forgot-password`, { email });
      setExito('Si el email existe, recibirás instrucciones para restablecer tu contraseña.');
    } catch (e) {
      setError('Error al enviar el email. Intenta de nuevo.');
    }
    setLoading(false);
  };

  return (
    <div style={{ width:'100%', maxWidth:'360px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'2rem' }}>
        <LogoHex size={40}/>
        <div style={{ fontFamily:"'Syne', sans-serif", fontSize:'1.3rem', fontWeight:'800', color:C.text }}>
          Manage<span style={{ background:`linear-gradient(135deg,${C.gold},${C.gold2})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>X</span>
        </div>
      </div>
      <div style={{ marginBottom:'1.5rem' }}>
        <div style={{ fontFamily:"'Syne', sans-serif", fontSize:'1.4rem', fontWeight:'800', color:C.text, letterSpacing:'-0.02em' }}>¿Olvidaste tu contraseña?</div>
        <div style={{ fontSize:'.82rem', color:C.textMuted, marginTop:'.4rem' }}>Ingresa tu email y te enviaremos un enlace para restablecerla.</div>
      </div>

      {exito && <div style={{ color:C.green, fontSize:'.82rem', background:'rgba(16,185,129,0.08)', padding:'.75rem 1rem', borderRadius:'9px', marginBottom:'1rem', border:'1px solid rgba(16,185,129,0.2)', display:'flex', alignItems:'center', gap:'.5rem' }}><Icon name="circle-check"/> {exito}</div>}
      {error && <div style={{ color:C.red, fontSize:'.82rem', background:'rgba(239,68,68,0.08)', padding:'.75rem 1rem', borderRadius:'9px', marginBottom:'1rem', border:'1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', gap:'.5rem' }}><Icon name="circle-exclamation"/> {error}</div>}

      {!exito && (
        <>
          <div style={{ ...s.field, marginBottom:'1rem' }}>
            <label style={s.loginLabel}>Email</label>
            <input style={s.loginInput} type="email" value={email} onInput={e=>setEmail(e.target.value)} placeholder="tu@empresa.com" onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/>
          </div>
          <button style={{ ...s.btnPrimary, width:'100%', justifyContent:'center', padding:'.85rem', fontSize:'.9rem', borderRadius:'10px', marginBottom:'1rem' }} onClick={handleSubmit}>
            <Icon name="paper-plane"/> {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </button>
        </>
      )}

      <div style={{ textAlign:'center', fontSize:'.78rem', color:C.textMuted }}>
        <span style={{ color:C.gold, cursor:'pointer', fontWeight:'600' }} onClick={onVolver}>← Volver al inicio de sesión</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// RESET PASSWORD
// ══════════════════════════════════════
function ResetPassword({ token, onVolver }) {
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!password || !confirmar) { setError('Completa todos los campos'); return; }
    if (password !== confirmar) { setError('Las contraseñas no coinciden'); return; }
    if (password.length < 6) { setError('La contraseña debe tener mínimo 6 caracteres'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`${API}/email/reset-password`, { token, password });
      setExito('¡Contraseña actualizada! Ya puedes iniciar sesión.');
    } catch (e) {
      setError(e.response?.data?.error || 'Token inválido o expirado');
    }
    setLoading(false);
  };

  return (
    <div style={{ width:'100%', maxWidth:'360px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'2rem' }}>
        <LogoHex size={40}/>
        <div style={{ fontFamily:"'Syne', sans-serif", fontSize:'1.3rem', fontWeight:'800', color:C.text }}>
          Manage<span style={{ background:`linear-gradient(135deg,${C.gold},${C.gold2})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>X</span>
        </div>
      </div>
      <div style={{ marginBottom:'1.5rem' }}>
        <div style={{ fontFamily:"'Syne', sans-serif", fontSize:'1.4rem', fontWeight:'800', color:C.text, letterSpacing:'-0.02em' }}>Nueva contraseña</div>
        <div style={{ fontSize:'.82rem', color:C.textMuted, marginTop:'.4rem' }}>Elige una contraseña segura para tu cuenta.</div>
      </div>

      {exito && <div style={{ color:C.green, fontSize:'.82rem', background:'rgba(16,185,129,0.08)', padding:'.75rem 1rem', borderRadius:'9px', marginBottom:'1rem', border:'1px solid rgba(16,185,129,0.2)', display:'flex', alignItems:'center', gap:'.5rem' }}><Icon name="circle-check"/> {exito}</div>}
      {error && <div style={{ color:C.red, fontSize:'.82rem', background:'rgba(239,68,68,0.08)', padding:'.75rem 1rem', borderRadius:'9px', marginBottom:'1rem', border:'1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', gap:'.5rem' }}><Icon name="circle-exclamation"/> {error}</div>}

      {!exito && (
        <div style={{ display:'flex', flexDirection:'column', gap:'.9rem' }}>
          <div style={s.field}>
            <label style={s.loginLabel}>Nueva contraseña</label>
            <input style={s.loginInput} type="password" value={password} onInput={e=>setPassword(e.target.value)} placeholder="••••••••"/>
          </div>
          <div style={s.field}>
            <label style={s.loginLabel}>Confirmar contraseña</label>
            <input style={s.loginInput} type="password" value={confirmar} onInput={e=>setConfirmar(e.target.value)} placeholder="••••••••"/>
          </div>
          <button style={{ ...s.btnPrimary, width:'100%', justifyContent:'center', padding:'.85rem', fontSize:'.9rem', borderRadius:'10px' }} onClick={handleSubmit}>
            <Icon name="lock"/> {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </div>
      )}

      {exito && (
        <div style={{ textAlign:'center', marginTop:'1rem' }}>
          <span style={{ color:C.gold, cursor:'pointer', fontWeight:'600', fontSize:'.78rem' }} onClick={onVolver}>Ir al inicio de sesión →</span>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// LOGIN
// ══════════════════════════════════════
function Login({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [vista, setVista] = useState('login');
  const [resetToken, setResetToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [negocio, setNegocio] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const path = window.location.pathname;
    if (token && path.includes('reset-password')) {
      setResetToken(token);
      setVista('reset');
    }
  }, []);

  const cambiarTab = (t) => { setTab(t); setError(''); setExito(''); };

  const handleLogin = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      onLogin(res.data.usuario);
    } catch { setError('Credenciales incorrectas'); }
    setLoading(false);
  };

  const handleRegistro = async () => {
    if (!negocio||!nombre||!email||!password) { setError('Todos los campos son obligatorios'); return; }
    if (password.length<6) { setError('La contraseña debe tener mínimo 6 caracteres'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`${API}/auth/registro`, { nombre_negocio:negocio, nombre, email, password });
      try { await axios.post(`${API}/email/verificar-email`, { email }); } catch(e) {}
      setExito('¡Cuenta creada! Revisa tu correo para verificar tu email.');
      setTab('login'); setEmail(email); setPassword('');
    } catch (e) { setError(e.response?.data?.error||'Error al registrarse'); }
    setLoading(false);
  };

  if (vista === 'forgot') return (
    <div style={{ width:'100vw', height:'100vh', background:C.dark, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', padding:'1rem' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none' }}/>
      <ForgotPassword onVolver={() => setVista('login')}/>
    </div>
  );

  if (vista === 'reset') return (
    <div style={{ width:'100vw', height:'100vh', background:C.dark, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', padding:'1rem' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none' }}/>
      <ResetPassword token={resetToken} onVolver={() => setVista('login')}/>
    </div>
  );

  return (
    <div style={{ width:'100vw', height:'100vh', background:C.dark, display:'flex', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'600px', height:'600px', background:'radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'500px', height:'500px', background:'radial-gradient(circle, rgba(255,107,53,0.05) 0%, transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none' }}/>

      {/* LOGIN PANEL */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding: isMobile ? '1.5rem' : '3rem', position:'relative', zIndex:1, overflowY:'auto' }}>
        <div style={{ width:'100%', maxWidth:'360px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'2.5rem' }}>
            <LogoHex size={48}/>
            <div>
              <div style={{ fontFamily:"'Syne', sans-serif", fontSize:'1.5rem', fontWeight:'800', letterSpacing:'-0.03em', color:C.text }}>
                Manage<span style={{ background:`linear-gradient(135deg,${C.gold},${C.gold2})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>X</span>
              </div>
              <div style={{ fontSize:'.72rem', color:C.textMuted, letterSpacing:'.08em', textTransform:'uppercase', fontWeight:'500' }}>Sistema de Gestión</div>
            </div>
          </div>

          <div style={{ marginBottom:'1.75rem' }}>
            <div style={{ fontFamily:"'Syne', sans-serif", fontSize:'1.6rem', fontWeight:'800', color:C.text, letterSpacing:'-0.02em', lineHeight:1.2 }}>
              {tab==='login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
            </div>
            <div style={{ fontSize:'.82rem', color:C.textMuted, marginTop:'.4rem' }}>
              {tab==='login' ? 'Ingresa tus credenciales para continuar' : 'Empieza gratis, sin tarjeta de crédito'}
            </div>
          </div>

          <div style={{ display:'flex', background:C.surface, borderRadius:'10px', padding:'4px', marginBottom:'1.5rem', border:`1px solid ${C.border}` }}>
            {['login','registro'].map(t=>(
              <div key={t} onClick={()=>cambiarTab(t)} style={{ flex:1, textAlign:'center', padding:'.5rem', borderRadius:'7px', fontSize:'.8rem', fontWeight:'600', cursor:'pointer', color:tab===t?C.gold:C.textMuted, background:tab===t?'rgba(245,166,35,0.1)':'transparent', border:tab===t?`1px solid rgba(245,166,35,0.2)`:'1px solid transparent', transition:'all .2s' }}>
                {t==='login'?'Iniciar Sesión':'Crear Cuenta'}
              </div>
            ))}
          </div>

          {exito && <div style={{ color:C.green, fontSize:'.82rem', background:'rgba(16,185,129,0.08)', padding:'.75rem 1rem', borderRadius:'9px', marginBottom:'1rem', border:'1px solid rgba(16,185,129,0.2)', display:'flex', alignItems:'center', gap:'.5rem' }}><Icon name="circle-check"/> {exito}</div>}
          {error && <div style={{ color:C.red, fontSize:'.82rem', background:'rgba(239,68,68,0.08)', padding:'.75rem 1rem', borderRadius:'9px', marginBottom:'1rem', border:'1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', gap:'.5rem' }}><Icon name="circle-exclamation"/> {error}</div>}

          {tab==='login' ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'.9rem' }}>
              <div style={s.field}><label style={s.loginLabel}>Email</label><input style={s.loginInput} type="email" value={email} onInput={e=>setEmail(e.target.value)} placeholder="tu@empresa.com"/></div>
              <div style={s.field}>
                <label style={s.loginLabel}>Contraseña</label>
                <input style={s.loginInput} type="password" value={password} onInput={e=>setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
              </div>
              <div style={{ textAlign:'right', marginTop:'-.4rem' }}>
                <span style={{ fontSize:'.75rem', color:C.gold, cursor:'pointer', fontWeight:'500' }} onClick={()=>setVista('forgot')}>
                  ¿Olvidaste tu contraseña?
                </span>
              </div>
              <button style={{ ...s.btnPrimary, width:'100%', justifyContent:'center', padding:'.85rem', fontSize:'.9rem', borderRadius:'10px' }} onClick={handleLogin}>
                <Icon name="right-to-bracket"/> {loading?'Iniciando...':'Iniciar Sesión'}
              </button>
              <div style={{ textAlign:'center', fontSize:'.76rem', color:C.textMuted }}>¿No tienes cuenta? <span style={{ color:C.gold, cursor:'pointer', fontWeight:'600' }} onClick={()=>cambiarTab('registro')}>Regístrate gratis</span></div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'.9rem' }}>
              {[['Nombre del Negocio *',negocio,setNegocio,'text','Mi Empresa S.A.'],['Tu Nombre *',nombre,setNombre,'text','Juan López'],['Email *',email,setEmail,'email','tu@empresa.com'],['Contraseña * (mín. 6 caracteres)',password,setPassword,'password','••••••••']].map(([lbl,val,set,type,ph])=>(
                <div key={lbl} style={s.field}><label style={s.loginLabel}>{lbl}</label><input style={s.loginInput} type={type} value={val} onInput={e=>set(e.target.value)} placeholder={ph}/></div>
              ))}
              <button style={{ ...s.btnPrimary, width:'100%', justifyContent:'center', padding:'.85rem', fontSize:'.9rem', borderRadius:'10px' }} onClick={handleRegistro}>
                <Icon name="user-plus"/> {loading?'Creando cuenta...':'Crear Mi Cuenta Gratis'}
              </button>
              <div style={{ textAlign:'center', fontSize:'.76rem', color:C.textMuted }}>¿Ya tienes cuenta? <span style={{ color:C.gold, cursor:'pointer', fontWeight:'600' }} onClick={()=>cambiarTab('login')}>Inicia sesión</span></div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL — solo en desktop */}
      {!isMobile && (
        <div style={{ width:'420px', background:C.surface, borderLeft:`1px solid ${C.border}`, display:'flex', flexDirection:'column', justifyContent:'center', padding:'3rem 2.5rem', position:'relative', zIndex:1 }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'300px', background:'radial-gradient(ellipse at 50% 0%, rgba(245,166,35,0.07) 0%, transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ fontFamily:"'Syne', sans-serif", fontSize:'1.1rem', fontWeight:'800', color:C.text, marginBottom:'.5rem', letterSpacing:'-0.02em' }}>Todo lo que necesita tu negocio</div>
          <div style={{ fontSize:'.8rem', color:C.textMuted, marginBottom:'2rem', lineHeight:1.6 }}>Gestión completa en una sola plataforma profesional.</div>
          {[
            { icon:'users', color:C.blue, title:'Gestión de Clientes', desc:'Cartera completa con historial y etiquetas' },
            { icon:'calendar-days', color:C.green, title:'Agenda Inteligente', desc:'Citas y estados en tiempo real' },
            { icon:'money-bill-wave', color:C.gold, title:'Punto de Venta', desc:'Ventas con múltiples métodos de pago' },
            { icon:'boxes-stacked', color:C.purple, title:'Control de Inventario', desc:'Stock con alertas automáticas' },
          ].map(({ icon, color, title, desc })=>(
            <div key={title} style={{ display:'flex', alignItems:'flex-start', gap:'.85rem', marginBottom:'1rem', padding:'.85rem', background:C.surface2, borderRadius:'10px', border:`1px solid ${C.border}` }}>
              <div style={{ width:'34px', height:'34px', minWidth:'34px', borderRadius:'9px', background:`${color}15`, border:`1px solid ${color}25`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name={icon} style={{ color, fontSize:'.85rem' }}/>
              </div>
              <div>
                <div style={{ fontSize:'.82rem', fontWeight:'600', color:C.text, marginBottom:'.15rem' }}>{title}</div>
                <div style={{ fontSize:'.72rem', color:C.textMuted, lineHeight:1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════
function Dashboard({ token, isMobile }) {
  const [stats, setStats] = useState({ clientes:0, citas:0, ventas:0, productos:0, ingresos:0 });
  useEffect(()=>{
    const h=getHeaders(token);
    Promise.all([axios.get(`${API}/clientes`,{headers:h}),axios.get(`${API}/citas`,{headers:h}),axios.get(`${API}/ventas`,{headers:h}),axios.get(`${API}/inventario`,{headers:h})]).then(([c,ci,v,p])=>{
      const ventas=v.data.data||[]; const ingresos=ventas.reduce((s,vt)=>s+parseFloat(vt.total||0),0);
      setStats({ clientes:(c.data.data||[]).length, citas:(ci.data.data||[]).length, ventas:ventas.length, productos:(p.data.data||[]).length, ingresos });
    }).catch(()=>{});
  },[]);

  const statCards=[
    { label:'Ingresos Totales', value:`$${stats.ingresos.toFixed(2)}`, sub:`${stats.ventas} ventas`, icon:'dollar-sign', color:C.gold },
    { label:'Clientes', value:stats.clientes, sub:'registrados', icon:'users', color:C.blue },
    { label:'Citas', value:stats.citas, sub:'agendadas', icon:'calendar-check', color:C.green },
    { label:'Productos', value:stats.productos, sub:'en inventario', icon:'boxes-stacked', color:C.purple },
  ];

  return (
    <div>
      <div style={{ ...s.pageHeader, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '.75rem' : '0' }}>
        <div><div style={s.pageTitle}>Dashboard</div><div style={s.pageSub}>Resumen general de tu negocio</div></div>
        <div style={{ display:'flex', alignItems:'center', gap:'.5rem', background:C.surface, border:`1px solid ${C.border}`, borderRadius:'9px', padding:'.5rem .9rem', fontSize:'.75rem', color:C.textSub }}>
          <Icon name="circle" style={{ color:C.green, fontSize:'.5rem' }}/> Sistema operativo
        </div>
      </div>
      <div style={{ ...s.statsGrid, gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)' }}>
        {statCards.map(({ label, value, sub, icon, color })=>(
          <div key={label} style={s.statCard(color)}>
            <div style={s.statGlow(color)}/>
            <div style={s.statIcon(color)}><Icon name={icon} style={{ color, fontSize:'.85rem' }}/></div>
            <div style={s.statLabel}>{label}</div>
            <div style={{ ...s.statValue, fontSize: isMobile ? '1.4rem' : '1.8rem' }}>{value}</div>
            <div style={s.statSub}>{sub}</div>
          </div>
        ))}
      </div>
      <div style={s.card}>
        <div style={s.cardHeader}>
          <div style={s.cardTitle}><Icon name="grid-2" style={{ color:C.gold }}/> Módulos del Sistema</div>
          <span style={s.badge(C.green,'rgba(16,185,129,0.1)')}><span style={{ width:'5px',height:'5px',borderRadius:'50%',background:C.green,display:'inline-block' }}/>Todos conectados</span>
        </div>
        <div style={s.cardBody}>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap:'1rem' }}>
            {[{icon:'users',color:C.blue,title:'Clientes',desc:'Gestiona tu cartera'},{icon:'calendar-days',color:C.green,title:'Citas',desc:'Agenda y calendario'},{icon:'money-bill-wave',color:C.gold,title:'Ventas',desc:'POS e historial'},{icon:'boxes-stacked',color:C.purple,title:'Inventario',desc:'Stock y productos'}].map(({ icon, color, title, desc })=>(
              <div key={title} style={{ background:C.surface2, borderRadius:'12px', padding:'1.25rem', border:`1px solid ${C.border}` }}>
                <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:`${color}15`, border:`1px solid ${color}20`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'.75rem' }}>
                  <Icon name={icon} style={{ color, fontSize:'1rem' }}/>
                </div>
                <div style={{ fontSize:'.85rem', fontWeight:'700', color:C.text, marginBottom:'.25rem', fontFamily:"'Syne', sans-serif" }}>{title}</div>
                <div style={{ fontSize:'.72rem', color:C.textMuted, lineHeight:1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// CLIENTES
// ══════════════════════════════════════
function Clientes({ token, isMobile }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [buscar, setBuscar] = useState('');
  const [form, setForm] = useState({ nombre:'', apellido:'', email:'', telefono:'', ciudad:'', etiqueta:'nuevo', notas:'' });
  const h = getHeaders(token);

  const cargar = async () => { setLoading(true); try { const r=await axios.get(`${API}/clientes`,{headers:h}); setClientes(r.data.data||[]); } catch(e){} setLoading(false); };
  useEffect(()=>{ cargar(); },[]);
  const abrirNuevo = () => { setEditando(null); setForm({ nombre:'', apellido:'', email:'', telefono:'', ciudad:'', etiqueta:'nuevo', notas:'' }); setModal(true); };
  const abrirEditar = (c) => { setEditando(c); setForm({ nombre:c.nombre||'', apellido:c.apellido||'', email:c.email||'', telefono:c.telefono||'', ciudad:c.ciudad||'', etiqueta:c.etiqueta||'nuevo', notas:c.notas||'' }); setModal(true); };
  const guardar = async () => { if(!form.nombre){alert('El nombre es obligatorio');return;} try { if(editando) await axios.put(`${API}/clientes/${editando.id}`,form,{headers:h}); else await axios.post(`${API}/clientes`,form,{headers:h}); setModal(false); cargar(); } catch(e){alert('Error: '+e.message);} };
  const eliminar = async (id) => { if(!confirm('¿Eliminar este cliente?'))return; await axios.delete(`${API}/clientes/${id}`,{headers:h}); cargar(); };
  const filtrados = clientes.filter(c=>`${c.nombre} ${c.apellido} ${c.email}`.toLowerCase().includes(buscar.toLowerCase()));

  return (
    <div>
      <div style={{ ...s.pageHeader, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '.75rem' : '0' }}>
        <div><div style={s.pageTitle}>Clientes</div><div style={s.pageSub}>{clientes.length} clientes registrados</div></div>
        <button style={{ ...s.btnPrimary, width: isMobile ? '100%' : 'auto', justifyContent:'center' }} onClick={abrirNuevo}><Icon name="user-plus"/> Nuevo Cliente</button>
      </div>
      <div style={{ marginBottom:'1rem', position:'relative' }}>
        <Icon name="magnifying-glass" style={{ position:'absolute', left:'.9rem', top:'50%', transform:'translateY(-50%)', color:C.textMuted, fontSize:'.8rem' }}/>
        <input style={{ ...s.input, paddingLeft:'2.5rem', borderRadius:'10px' }} placeholder="Buscar clientes..." value={buscar} onInput={e=>setBuscar(e.target.value)}/>
      </div>
      <div style={s.card}>
        <div style={{ overflowX:'auto' }}>
          <table style={s.table}>
            <thead><tr><th style={s.th}>#</th><th style={s.th}>Cliente</th>{!isMobile && <th style={s.th}>Contacto</th>}{!isMobile && <th style={s.th}>Ciudad</th>}<th style={s.th}>Etiqueta</th><th style={s.th}>Acciones</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="6" style={{...s.td,textAlign:'center',padding:'3rem'}}><Icon name="spinner" style={{ color:C.textMuted }}/></td></tr>
              : filtrados.length===0 ? <tr><td colSpan="6"><div style={s.emptyState}><Icon name="users" style={{ fontSize:'2rem', color:C.textMuted }}/><div style={s.emptyTitle}>No hay clientes</div><div style={s.emptyDesc}>Crea tu primer cliente</div></div></td></tr>
              : filtrados.map((c,i)=>(
                <tr key={c.id}>
                  <td style={{...s.td,color:C.textMuted,fontFamily:'monospace',fontSize:'.75rem'}}>{i+1}</td>
                  <td style={s.td}>
                    <div style={{ display:'flex', alignItems:'center', gap:'.7rem' }}>
                      <div style={{ width:'30px', height:'30px', minWidth:'30px', borderRadius:'50%', background:`linear-gradient(135deg,${C.blue},${C.purple})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.72rem', fontWeight:'700', color:'white' }}>{c.nombre?.charAt(0)}{c.apellido?.charAt(0)}</div>
                      <div><div style={{ fontSize:'.83rem', fontWeight:'600', color:C.text }}>{c.nombre} {c.apellido}</div>{!isMobile && <div style={{ fontSize:'.72rem', color:C.textMuted }}>{c.email||'Sin email'}</div>}</div>
                    </div>
                  </td>
                  {!isMobile && <td style={s.td}>{c.telefono||'—'}</td>}
                  {!isMobile && <td style={s.td}>{c.ciudad||'—'}</td>}
                  <td style={s.td}><BadgeEstado estado={c.etiqueta}/></td>
                  <td style={s.td}>
                    <div style={{ display:'flex', gap:'.4rem' }}>
                      <button style={s.btnBlue} onClick={()=>abrirEditar(c)}><Icon name="pen-to-square"/>{!isMobile && ' Editar'}</button>
                      <button style={s.btnDanger} onClick={()=>eliminar(c.id)}><Icon name="trash"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}><Icon name={editando?'pen-to-square':'user-plus'} style={{ color:C.gold }}/>{editando?'Editar Cliente':'Nuevo Cliente'}</div>
              <button style={s.btnSmall} onClick={()=>setModal(false)}><Icon name="xmark"/></button>
            </div>
            <div style={s.modalBody}>
              <div style={{ ...s.formGrid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                <div style={s.field}><label style={s.label}>Nombre *</label><input style={s.input} value={form.nombre} onInput={e=>setForm({...form,nombre:e.target.value})} placeholder="Juan"/></div>
                <div style={s.field}><label style={s.label}>Apellido</label><input style={s.input} value={form.apellido} onInput={e=>setForm({...form,apellido:e.target.value})} placeholder="López"/></div>
                <div style={s.field}><label style={s.label}>Email</label><input style={s.input} type="email" value={form.email} onInput={e=>setForm({...form,email:e.target.value})} placeholder="juan@email.com"/></div>
                <div style={s.field}><label style={s.label}>Teléfono</label><input style={s.input} value={form.telefono} onInput={e=>setForm({...form,telefono:e.target.value})} placeholder="9876-5432"/></div>
                <div style={s.field}><label style={s.label}>Ciudad</label><input style={s.input} value={form.ciudad} onInput={e=>setForm({...form,ciudad:e.target.value})} placeholder="San Pedro Sula"/></div>
                <div style={s.field}><label style={s.label}>Etiqueta</label><select style={s.select} value={form.etiqueta} onChange={e=>setForm({...form,etiqueta:e.target.value})}><option value="nuevo">Nuevo</option><option value="regular">Regular</option><option value="vip">VIP</option><option value="premium">Premium</option></select></div>
                <div style={{...s.field, gridColumn: isMobile ? '1' : 'span 2'}}><label style={s.label}>Notas</label><textarea style={s.textarea} value={form.notas} onInput={e=>setForm({...form,notas:e.target.value})} placeholder="Observaciones..."/></div>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnSecondary} onClick={()=>setModal(false)}><Icon name="xmark"/> Cancelar</button>
              <button style={s.btnPrimary} onClick={guardar}><Icon name="check"/> {editando?'Guardar Cambios':'Crear Cliente'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// CITAS
// ══════════════════════════════════════
function Citas({ token, isMobile }) {
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ cliente_id:'', servicio:'', fecha:'', hora_inicio:'', duracion_min:60, notas:'' });
  const h = getHeaders(token);

  const cargar = async () => { setLoading(true); try { const [ci,cl]=await Promise.all([axios.get(`${API}/citas`,{headers:h}),axios.get(`${API}/clientes`,{headers:h})]); setCitas(ci.data.data||[]); setClientes(cl.data.data||[]); } catch(e){} setLoading(false); };
  useEffect(()=>{ cargar(); },[]);
  const guardar = async () => { if(!form.cliente_id||!form.fecha||!form.hora_inicio){alert('Completa los campos obligatorios');return;} try { await axios.post(`${API}/citas`,form,{headers:h}); setModal(false); setForm({ cliente_id:'', servicio:'', fecha:'', hora_inicio:'', duracion_min:60, notas:'' }); cargar(); } catch(e){alert('Error: '+e.message);} };
  const cambiarEstado = async (id,estado) => { try { await axios.put(`${API}/citas/${id}`,{estado},{headers:h}); cargar(); } catch(e){} };
  const eliminar = async (id) => { if(!confirm('¿Eliminar esta cita?'))return; await axios.delete(`${API}/citas/${id}`,{headers:h}); cargar(); };

  return (
    <div>
      <div style={{ ...s.pageHeader, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '.75rem' : '0' }}>
        <div><div style={s.pageTitle}>Citas</div><div style={s.pageSub}>{citas.length} citas registradas</div></div>
        <button style={{ ...s.btnPrimary, width: isMobile ? '100%' : 'auto', justifyContent:'center' }} onClick={()=>setModal(true)}><Icon name="calendar-plus"/> Nueva Cita</button>
      </div>
      <div style={s.card}>
        <div style={{ overflowX:'auto' }}>
          <table style={s.table}>
            <thead><tr><th style={s.th}>#</th><th style={s.th}>Cliente</th>{!isMobile && <th style={s.th}>Servicio</th>}<th style={s.th}>Fecha</th><th style={s.th}>Estado</th><th style={s.th}>Acciones</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="6" style={{...s.td,textAlign:'center',padding:'3rem'}}><Icon name="spinner" style={{ color:C.textMuted }}/></td></tr>
              : citas.length===0 ? <tr><td colSpan="6"><div style={s.emptyState}><Icon name="calendar-days" style={{ fontSize:'2rem', color:C.textMuted }}/><div style={s.emptyTitle}>No hay citas</div><div style={s.emptyDesc}>Agenda tu primera cita</div></div></td></tr>
              : citas.map((c,i)=>(
                <tr key={c.id}>
                  <td style={{...s.td,color:C.textMuted,fontFamily:'monospace',fontSize:'.75rem'}}>{i+1}</td>
                  <td style={{...s.td,color:C.text,fontWeight:'600'}}>{c.cliente_nombre||'—'}</td>
                  {!isMobile && <td style={s.td}>{c.servicio||'—'}</td>}
                  <td style={s.td}><div style={{ fontSize:'.82rem', color:C.text }}>{c.fecha?.split('T')[0]||'—'}</div><div style={{ fontSize:'.72rem', color:C.textMuted }}>{c.hora_inicio||'—'}</div></td>
                  <td style={s.td}><BadgeEstado estado={c.estado}/></td>
                  <td style={s.td}>
                    <div style={{ display:'flex', gap:'.35rem', flexWrap:'wrap' }}>
                      {c.estado==='pendiente' && <button style={s.btnSuccess} onClick={()=>cambiarEstado(c.id,'confirmada')}><Icon name="check"/>{!isMobile && ' Confirmar'}</button>}
                      {c.estado==='confirmada' && <button style={s.btnSuccess} onClick={()=>cambiarEstado(c.id,'completada')}><Icon name="check-double"/>{!isMobile && ' Completar'}</button>}
                      {c.estado!=='cancelada'&&c.estado!=='completada' && <button style={s.btnDanger} onClick={()=>cambiarEstado(c.id,'cancelada')}><Icon name="ban"/>{!isMobile && ' Cancelar'}</button>}
                      <button style={s.btnSmall} onClick={()=>eliminar(c.id)}><Icon name="trash"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}><Icon name="calendar-plus" style={{ color:C.gold }}/> Nueva Cita</div>
              <button style={s.btnSmall} onClick={()=>setModal(false)}><Icon name="xmark"/></button>
            </div>
            <div style={s.modalBody}>
              <div style={{ ...s.formGrid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                <div style={{...s.field, gridColumn: isMobile ? '1' : 'span 2'}}><label style={s.label}>Cliente *</label><select style={s.select} value={form.cliente_id} onChange={e=>setForm({...form,cliente_id:e.target.value})}><option value="">Seleccionar cliente...</option>{clientes.map(c=><option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}</select></div>
                <div style={{...s.field, gridColumn: isMobile ? '1' : 'span 2'}}><label style={s.label}>Servicio</label><input style={s.input} value={form.servicio} onInput={e=>setForm({...form,servicio:e.target.value})} placeholder="Ej: Consulta general"/></div>
                <div style={s.field}><label style={s.label}>Fecha *</label><input style={s.input} type="date" value={form.fecha} onInput={e=>setForm({...form,fecha:e.target.value})}/></div>
                <div style={s.field}><label style={s.label}>Hora *</label><input style={s.input} type="time" value={form.hora_inicio} onInput={e=>setForm({...form,hora_inicio:e.target.value})}/></div>
                <div style={{...s.field, gridColumn: isMobile ? '1' : 'span 2'}}><label style={s.label}>Duración</label><select style={s.select} value={form.duracion_min} onChange={e=>setForm({...form,duracion_min:parseInt(e.target.value)})}><option value={30}>30 minutos</option><option value={45}>45 minutos</option><option value={60}>60 minutos</option><option value={90}>90 minutos</option><option value={120}>2 horas</option></select></div>
                <div style={{...s.field, gridColumn: isMobile ? '1' : 'span 2'}}><label style={s.label}>Notas</label><textarea style={s.textarea} value={form.notas} onInput={e=>setForm({...form,notas:e.target.value})} placeholder="Instrucciones especiales..."/></div>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnSecondary} onClick={()=>setModal(false)}><Icon name="xmark"/> Cancelar</button>
              <button style={s.btnPrimary} onClick={guardar}><Icon name="check"/> Agendar Cita</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// VENTAS
// ══════════════════════════════════════
function Ventas({ token, isMobile }) {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ cliente_id:'', metodo_pago:'efectivo', descuento_pct:0, impuesto_pct:15, notas:'', items:[] });
  const h = getHeaders(token);

  const cargar = async () => { setLoading(true); try { const [v,cl,p]=await Promise.all([axios.get(`${API}/ventas`,{headers:h}),axios.get(`${API}/clientes`,{headers:h}),axios.get(`${API}/inventario`,{headers:h})]); setVentas(v.data.data||[]); setClientes(cl.data.data||[]); setProductos(p.data.data||[]); } catch(e){} setLoading(false); };
  useEffect(()=>{ cargar(); },[]);
  const agregarItem = () => setForm({...form,items:[...form.items,{producto_id:'',cantidad:1,precio_unit:0}]});
  const actualizarItem = (i,campo,valor) => { const items=[...form.items]; items[i]={...items[i],[campo]:valor}; if(campo==='producto_id'){const p=productos.find(p=>p.id==valor); if(p) items[i].precio_unit=parseFloat(p.precio_venta);} setForm({...form,items}); };
  const quitarItem = (i) => setForm({...form,items:form.items.filter((_,idx)=>idx!==i)});
  const calcTotal = () => { const sub=form.items.reduce((s,it)=>s+(it.cantidad*it.precio_unit),0); const desc=sub*(form.descuento_pct/100); const imp=(sub-desc)*(form.impuesto_pct/100); return { subtotal:sub, descuento:desc, impuesto:imp, total:sub-desc+imp }; };
  const guardar = async () => { if(form.items.length===0){alert('Agrega al menos un producto');return;} try { await axios.post(`${API}/ventas`,form,{headers:h}); setModal(false); setForm({ cliente_id:'', metodo_pago:'efectivo', descuento_pct:0, impuesto_pct:15, notas:'', items:[] }); cargar(); } catch(e){alert('Error: '+e.message);} };
  const { subtotal, descuento, impuesto, total } = calcTotal();
  const totalIngresos = ventas.reduce((s,v)=>s+parseFloat(v.total||0),0);

  return (
    <div>
      <div style={{ ...s.pageHeader, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '.75rem' : '0' }}>
        <div><div style={s.pageTitle}>Ventas</div><div style={s.pageSub}>{ventas.length} ventas · ${totalIngresos.toFixed(2)} en ingresos</div></div>
        <button style={{ ...s.btnPrimary, width: isMobile ? '100%' : 'auto', justifyContent:'center' }} onClick={()=>setModal(true)}><Icon name="plus"/> Nueva Venta</button>
      </div>
      <div style={s.card}>
        <div style={{ overflowX:'auto' }}>
          <table style={s.table}>
            <thead><tr><th style={s.th}>#</th><th style={s.th}>Cliente</th>{!isMobile && <th style={s.th}>Fecha</th>}{!isMobile && <th style={s.th}>Pago</th>}<th style={s.th}>Total</th><th style={s.th}>Estado</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="6" style={{...s.td,textAlign:'center',padding:'3rem'}}><Icon name="spinner" style={{ color:C.textMuted }}/></td></tr>
              : ventas.length===0 ? <tr><td colSpan="6"><div style={s.emptyState}><Icon name="money-bill-wave" style={{ fontSize:'2rem', color:C.textMuted }}/><div style={s.emptyTitle}>No hay ventas</div><div style={s.emptyDesc}>Registra tu primera venta</div></div></td></tr>
              : ventas.map((v,i)=>(
                <tr key={v.id}>
                  <td style={{...s.td,color:C.textMuted,fontFamily:'monospace',fontSize:'.75rem'}}>{i+1}</td>
                  <td style={{...s.td,color:C.text,fontWeight:'600'}}>{v.cliente_nombre||'Cliente general'}</td>
                  {!isMobile && <td style={{...s.td,fontFamily:'monospace',fontSize:'.78rem'}}>{v.creado_en?.split('T')[0]||'—'}</td>}
                  {!isMobile && <td style={s.td}><BadgeEstado estado={v.metodo_pago}/></td>}
                  <td style={{...s.td,fontFamily:'monospace',fontWeight:'700'}}><span style={{ color:C.gold }}>${parseFloat(v.total||0).toFixed(2)}</span></td>
                  <td style={s.td}><BadgeEstado estado={v.estado||'pagado'}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div style={s.overlay}>
          <div style={s.modalLg}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}><Icon name="money-bill-wave" style={{ color:C.gold }}/> Nueva Venta</div>
              <button style={s.btnSmall} onClick={()=>setModal(false)}><Icon name="xmark"/></button>
            </div>
            <div style={s.modalBody}>
              <div style={{ ...s.formGrid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                <div style={s.field}><label style={s.label}>Cliente</label><select style={s.select} value={form.cliente_id} onChange={e=>setForm({...form,cliente_id:e.target.value})}><option value="">Cliente general</option>{clientes.map(c=><option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}</select></div>
                <div style={s.field}><label style={s.label}>Método de Pago</label><select style={s.select} value={form.metodo_pago} onChange={e=>setForm({...form,metodo_pago:e.target.value})}><option value="efectivo">Efectivo</option><option value="tarjeta">Tarjeta</option><option value="transferencia">Transferencia</option></select></div>
              </div>
              <div style={s.divider}/>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.75rem' }}>
                <div style={{ fontSize:'.82rem', fontWeight:'700', color:C.text }}>Productos</div>
                <button style={s.btnSmall} onClick={agregarItem}><Icon name="plus"/> Agregar producto</button>
              </div>
              {form.items.length===0 ? (
                <div style={{ textAlign:'center', padding:'1.5rem', color:C.textMuted, background:C.surface2, borderRadius:'10px', fontSize:'.82rem', border:`1px dashed ${C.border2}` }}>Haz clic en "Agregar producto" para comenzar</div>
              ) : form.items.map((item,i)=>(
                <div key={i} style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 60px auto' : '1fr 80px 100px auto', gap:'.75rem', alignItems:'end', marginBottom:'.5rem', background:C.surface2, borderRadius:'10px', padding:'.75rem', border:`1px solid ${C.border}` }}>
                  <div style={s.field}><label style={{...s.label,fontSize:'.6rem'}}>Producto</label><select style={s.select} value={item.producto_id} onChange={e=>actualizarItem(i,'producto_id',e.target.value)}><option value="">Seleccionar...</option>{productos.map(p=><option key={p.id} value={p.id}>{p.nombre} — ${p.precio_venta}</option>)}</select></div>
                  <div style={s.field}><label style={{...s.label,fontSize:'.6rem'}}>Cant.</label><input style={s.input} type="number" min="1" value={item.cantidad} onInput={e=>actualizarItem(i,'cantidad',parseInt(e.target.value)||1)}/></div>
                  {!isMobile && <div style={s.field}><label style={{...s.label,fontSize:'.6rem'}}>Precio</label><input style={s.input} type="number" value={item.precio_unit} onInput={e=>actualizarItem(i,'precio_unit',parseFloat(e.target.value)||0)}/></div>}
                  <button style={s.btnDanger} onClick={()=>quitarItem(i)}><Icon name="xmark"/></button>
                </div>
              ))}
              <div style={s.divider}/>
              <div style={{ ...s.formGrid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                <div style={s.field}><label style={s.label}>Descuento (%)</label><input style={s.input} type="number" min="0" max="100" value={form.descuento_pct} onInput={e=>setForm({...form,descuento_pct:parseFloat(e.target.value)||0})}/></div>
                <div style={s.field}><label style={s.label}>Impuesto (%)</label><input style={s.input} type="number" min="0" value={form.impuesto_pct} onInput={e=>setForm({...form,impuesto_pct:parseFloat(e.target.value)||0})}/></div>
              </div>
              <div style={{ background:`rgba(245,166,35,0.04)`, border:`1px solid rgba(245,166,35,0.15)`, borderRadius:'10px', padding:'1rem 1.25rem', marginTop:'1rem' }}>
                {[['Subtotal',`$${subtotal.toFixed(2)}`],['Descuento',`-$${descuento.toFixed(2)}`],['Impuesto',`$${impuesto.toFixed(2)}`]].map(([l,v])=>(
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:'.82rem', color:C.textSub, marginBottom:'.3rem' }}><span>{l}</span><span>{v}</span></div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', fontFamily:"'Syne', sans-serif", fontSize:'1.05rem', fontWeight:'800', color:C.gold, borderTop:`1px solid rgba(245,166,35,0.15)`, paddingTop:'.6rem', marginTop:'.3rem' }}><span>TOTAL</span><span>${total.toFixed(2)}</span></div>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnSecondary} onClick={()=>setModal(false)}><Icon name="xmark"/> Cancelar</button>
              <button style={s.btnPrimary} onClick={guardar}><Icon name="check"/> Registrar — ${total.toFixed(2)}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// INVENTARIO
// ══════════════════════════════════════
function Inventario({ token, isMobile }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre:'', sku:'', categoria:'', tipo:'producto', precio_venta:0, precio_costo:0, stock_actual:0, stock_minimo:10 });
  const h = getHeaders(token);

  const cargar = async () => { setLoading(true); try { const r=await axios.get(`${API}/inventario`,{headers:h}); setProductos(r.data.data||[]); } catch(e){} setLoading(false); };
  useEffect(()=>{ cargar(); },[]);
  const abrirNuevo = () => { setEditando(null); setForm({ nombre:'', sku:'', categoria:'', tipo:'producto', precio_venta:0, precio_costo:0, stock_actual:0, stock_minimo:10 }); setModal(true); };
  const abrirEditar = (p) => { setEditando(p); setForm({ nombre:p.nombre||'', sku:p.sku||'', categoria:p.categoria||'', tipo:p.tipo||'producto', precio_venta:p.precio_venta||0, precio_costo:p.precio_costo||0, stock_actual:p.stock_actual||0, stock_minimo:p.stock_minimo||10 }); setModal(true); };
  const guardar = async () => { if(!form.nombre){alert('El nombre es obligatorio');return;} try { if(editando) await axios.put(`${API}/inventario/${editando.id}`,form,{headers:h}); else await axios.post(`${API}/inventario`,form,{headers:h}); setModal(false); cargar(); } catch(e){alert('Error: '+e.message);} };
  const eliminar = async (id) => { if(!confirm('¿Eliminar este producto?'))return; await axios.delete(`${API}/inventario/${id}`,{headers:h}); cargar(); };
  const stockBajo = productos.filter(p=>p.tipo==='producto'&&p.stock_actual<=p.stock_minimo);

  return (
    <div>
      <div style={{ ...s.pageHeader, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '.75rem' : '0' }}>
        <div><div style={s.pageTitle}>Inventario</div><div style={s.pageSub}>{productos.length} productos · {stockBajo.length} con stock crítico</div></div>
        <button style={{ ...s.btnPrimary, width: isMobile ? '100%' : 'auto', justifyContent:'center' }} onClick={abrirNuevo}><Icon name="plus"/> Nuevo Producto</button>
      </div>
      {stockBajo.length>0 && (
        <div style={{ background:'rgba(239,68,68,0.06)', border:`1px solid rgba(239,68,68,0.2)`, borderRadius:'12px', padding:'.9rem 1.2rem', marginBottom:'1.2rem', display:'flex', alignItems:'center', gap:'.75rem' }}>
          <div style={{ width:'34px', height:'34px', minWidth:'34px', borderRadius:'9px', background:'rgba(239,68,68,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name="triangle-exclamation" style={{ color:C.red }}/></div>
          <div><div style={{ fontSize:'.83rem', fontWeight:'600', color:C.red }}>{stockBajo.length} productos con stock crítico</div><div style={{ fontSize:'.73rem', color:C.textMuted }}>{stockBajo.map(p=>p.nombre).join(', ')}</div></div>
        </div>
      )}
      <div style={s.card}>
        <div style={{ overflowX:'auto' }}>
          <table style={s.table}>
            <thead><tr>{!isMobile && <th style={s.th}>SKU</th>}<th style={s.th}>Producto</th>{!isMobile && <th style={s.th}>Tipo</th>}<th style={s.th}>Venta</th>{!isMobile && <th style={s.th}>Stock</th>}<th style={s.th}>Estado</th><th style={s.th}>Acciones</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="7" style={{...s.td,textAlign:'center',padding:'3rem'}}><Icon name="spinner" style={{ color:C.textMuted }}/></td></tr>
              : productos.length===0 ? <tr><td colSpan="7"><div style={s.emptyState}><Icon name="boxes-stacked" style={{ fontSize:'2rem', color:C.textMuted }}/><div style={s.emptyTitle}>No hay productos</div><div style={s.emptyDesc}>Agrega tu primer producto</div></div></td></tr>
              : productos.map(p=>(
                <tr key={p.id}>
                  {!isMobile && <td style={{...s.td,fontFamily:'monospace',color:C.gold,fontSize:'.75rem'}}>{p.sku||'—'}</td>}
                  <td style={{...s.td,color:C.text,fontWeight:'600'}}>{p.nombre}</td>
                  {!isMobile && <td style={s.td}><span style={s.badge(p.tipo==='servicio'?C.purple:C.blue,p.tipo==='servicio'?'rgba(139,92,246,0.1)':'rgba(59,130,246,0.1)')}><span style={{ width:'5px',height:'5px',borderRadius:'50%',background:p.tipo==='servicio'?C.purple:C.blue,display:'inline-block' }}/>{p.tipo}</span></td>}
                  <td style={{...s.td,fontFamily:'monospace',fontWeight:'700',color:C.gold}}>${parseFloat(p.precio_venta||0).toFixed(2)}</td>
                  {!isMobile && <td style={s.td}>{p.tipo==='servicio'?<span style={{ color:C.textMuted }}>—</span>:<span style={{ color:p.stock_actual<=p.stock_minimo?C.red:C.green,fontWeight:'700',fontSize:'.82rem' }}>{p.stock_actual}</span>}</td>}
                  <td style={s.td}>
                    {p.tipo==='servicio'?<span style={s.badge(C.purple,'rgba(139,92,246,0.1)')}><span style={{ width:'5px',height:'5px',borderRadius:'50%',background:C.purple,display:'inline-block' }}/>Servicio</span>
                    :p.stock_actual<=0?<span style={s.badge(C.red,'rgba(239,68,68,0.1)')}><span style={{ width:'5px',height:'5px',borderRadius:'50%',background:C.red,display:'inline-block' }}/>Agotado</span>
                    :p.stock_actual<=p.stock_minimo?<span style={s.badge(C.gold,'rgba(245,166,35,0.1)')}><span style={{ width:'5px',height:'5px',borderRadius:'50%',background:C.gold,display:'inline-block' }}/>Bajo</span>
                    :<span style={s.badge(C.green,'rgba(16,185,129,0.1)')}><span style={{ width:'5px',height:'5px',borderRadius:'50%',background:C.green,display:'inline-block' }}/>Normal</span>}
                  </td>
                  <td style={s.td}>
                    <div style={{ display:'flex', gap:'.4rem' }}>
                      <button style={s.btnBlue} onClick={()=>abrirEditar(p)}><Icon name="pen-to-square"/>{!isMobile && ' Editar'}</button>
                      <button style={s.btnDanger} onClick={()=>eliminar(p.id)}><Icon name="trash"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}><Icon name={editando?'pen-to-square':'boxes-stacked'} style={{ color:C.gold }}/>{editando?'Editar Producto':'Nuevo Producto'}</div>
              <button style={s.btnSmall} onClick={()=>setModal(false)}><Icon name="xmark"/></button>
            </div>
            <div style={s.modalBody}>
              <div style={{ ...s.formGrid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                <div style={{...s.field, gridColumn: isMobile ? '1' : 'span 2'}}><label style={s.label}>Nombre *</label><input style={s.input} value={form.nombre} onInput={e=>setForm({...form,nombre:e.target.value})} placeholder="Producto Premium A"/></div>
                <div style={s.field}><label style={s.label}>SKU</label><input style={s.input} value={form.sku} onInput={e=>setForm({...form,sku:e.target.value})} placeholder="PRD-001"/></div>
                <div style={s.field}><label style={s.label}>Categoría</label><input style={s.input} value={form.categoria} onInput={e=>setForm({...form,categoria:e.target.value})} placeholder="Electrónica"/></div>
                <div style={s.field}><label style={s.label}>Tipo</label><select style={s.select} value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}><option value="producto">Producto</option><option value="servicio">Servicio</option></select></div>
                <div style={s.field}><label style={s.label}>Precio de Venta *</label><input style={s.input} type="number" min="0" step="0.01" value={form.precio_venta} onInput={e=>setForm({...form,precio_venta:parseFloat(e.target.value)||0})}/></div>
                <div style={s.field}><label style={s.label}>Precio de Costo</label><input style={s.input} type="number" min="0" step="0.01" value={form.precio_costo} onInput={e=>setForm({...form,precio_costo:parseFloat(e.target.value)||0})}/></div>
                {form.tipo==='producto'&&<><div style={s.field}><label style={s.label}>Stock Actual</label><input style={s.input} type="number" min="0" value={form.stock_actual} onInput={e=>setForm({...form,stock_actual:parseInt(e.target.value)||0})}/></div><div style={s.field}><label style={s.label}>Stock Mínimo</label><input style={s.input} type="number" min="0" value={form.stock_minimo} onInput={e=>setForm({...form,stock_minimo:parseInt(e.target.value)||0})}/></div></>}
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnSecondary} onClick={()=>setModal(false)}><Icon name="xmark"/> Cancelar</button>
              <button style={s.btnPrimary} onClick={guardar}><Icon name="check"/> {editando?'Guardar Cambios':'Crear Producto'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════════
export function App() {
  const [usuario, setUsuario] = useState(()=>{ const u=localStorage.getItem('usuario'); return u?JSON.parse(u):null; });
  const [token, setToken] = useState(()=>localStorage.getItem('token')||'');
  const [pagina, setPagina] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const logout = () => { localStorage.clear(); setUsuario(null); setToken(''); };

  const handleLogin = (usr) => {
    setUsuario(usr);
    setToken(localStorage.getItem('token')||'');
  };

  if (!usuario) return <Login onLogin={handleLogin}/>;

  const navItems = [
    { id:'dashboard',  icon:'chart-pie',      label:'Dashboard' },
    { id:'clientes',   icon:'users',           label:'Clientes' },
    { id:'citas',      icon:'calendar-days',   label:'Citas' },
    { id:'ventas',     icon:'money-bill-wave', label:'Ventas' },
    { id:'inventario', icon:'boxes-stacked',   label:'Inventario' },
  ];

  const current = navItems.find(n=>n.id===pagina);

  const handleNav = (id) => {
    setPagina(id);
    if (isMobile) setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div style={s.sidebarGlow}/>
      <div style={s.sidebarHeader}>
        <LogoHex size={32}/>
        <div style={s.logoText}>Manage<span style={s.logoX}>X</span></div>
        {isMobile && <button onClick={()=>setSidebarOpen(false)} style={{ marginLeft:'auto', background:'transparent', border:'none', color:C.textMuted, cursor:'pointer', fontSize:'1.1rem' }}><Icon name="xmark"/></button>}
      </div>
      <nav style={{ flex:1, padding:'.6rem .5rem', overflowY:'auto' }}>
        <div style={s.navSection}>Principal</div>
        {navItems.map(item=>(
          <div key={item.id} style={s.navItem(pagina===item.id)} onClick={()=>handleNav(item.id)}>
            <span style={s.navIcon(pagina===item.id)}><Icon name={item.icon}/></span>
            <span>{item.label}</span>
            {pagina===item.id && <span style={{ marginLeft:'auto', width:'5px', height:'5px', borderRadius:'50%', background:C.gold }}/>}
          </div>
        ))}
      </nav>
      <div style={s.sidebarFooter}>
        <div style={s.userCard}>
          <div style={s.avatar}>{usuario.nombre?.charAt(0)?.toUpperCase()}</div>
          <div style={{ minWidth:0 }}>
            <div style={s.userName}>{usuario.nombre}</div>
            <div style={s.userRole}>{usuario.rol}</div>
          </div>
        </div>
        <button style={s.btnLogout} onClick={logout}><Icon name="right-from-bracket"/> Cerrar Sesión</button>
      </div>
    </>
  );

  return (
    <div style={s.app}>
      {/* Sidebar desktop */}
      {!isMobile && (
        <aside style={s.sidebar}>
          <SidebarContent/>
        </aside>
      )}

      {/* Sidebar mobile — overlay */}
      {isMobile && sidebarOpen && (
        <>
          <div onClick={()=>setSidebarOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:400 }}/>
          <aside style={{ ...s.sidebar, position:'fixed', left:0, top:0, zIndex:500, boxShadow:'4px 0 24px rgba(0,0,0,0.4)' }}>
            <SidebarContent/>
          </aside>
        </>
      )}

      <div style={s.main}>
        <div style={{ ...s.topbar, padding: isMobile ? '0 1rem' : '0 1.75rem' }}>
          <div style={s.topbarLeft}>
            {isMobile && (
              <button onClick={()=>setSidebarOpen(true)} style={{ background:'transparent', border:'none', color:C.text, cursor:'pointer', fontSize:'1.1rem', marginRight:'.5rem', padding:'.25rem' }}>
                <Icon name="bars"/>
              </button>
            )}
            {!isMobile && <div style={{ color:C.textMuted, fontSize:'.78rem' }}>ManageX</div>}
            {!isMobile && <span style={{ color:C.textMuted }}>/</span>}
            <div style={s.topbarTitle}>{current?.label}</div>
          </div>
          <div style={s.topbarRight}>
            {!isMobile && <div style={s.topbarBadge}><Icon name="circle" style={{ color:C.green, fontSize:'.5rem', marginRight:'.35rem' }}/>Sistema activo</div>}
            <div style={s.topbarBadge}>v1.0</div>
          </div>
        </div>
        <div style={{ ...s.content, padding: isMobile ? '1rem' : '1.75rem 2rem' }}>
          {pagina==='dashboard'  && <Dashboard token={token} isMobile={isMobile}/>}
          {pagina==='clientes'   && <Clientes token={token} isMobile={isMobile}/>}
          {pagina==='citas'      && <Citas token={token} isMobile={isMobile}/>}
          {pagina==='ventas'     && <Ventas token={token} isMobile={isMobile}/>}
          {pagina==='inventario' && <Inventario token={token} isMobile={isMobile}/>}
        </div>
      </div>
    </div>
  );
}