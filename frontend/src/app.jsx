import { useState, useEffect } from 'preact/hooks';
import axios from 'axios';

const API = 'https://managex-backend-production.up.railway.app/api';

// ══════════════════════════════════════
// DESIGN TOKENS
// ══════════════════════════════════════
const s = {
  app: { display:'flex', width:'100vw', height:'100vh', overflow:'hidden' },
  sidebar: { width:'220px', minWidth:'220px', background:'#161b27', borderRight:'1px solid rgba(255,255,255,.07)', display:'flex', flexDirection:'column', height:'100vh' },
  main: { flex:1, display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', minWidth:0 },
  content: { flex:1, padding:'2rem', background:'#0f1117', overflowY:'auto' },
  topbar: { height:'56px', minHeight:'56px', background:'#161b27', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.5rem' },
  topbarTitle: { fontSize:'1rem', fontWeight:'700', color:'#f1f5f9', display:'flex', alignItems:'center', gap:'.5rem' },
  sidebarHeader: { padding:'1.2rem 1rem', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', gap:'.7rem', flexShrink:0 },
  logoMark: { width:'32px', height:'32px', minWidth:'32px', background:'linear-gradient(135deg,#f59e0b,#f97316)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800', color:'#0f1117', fontSize:'.9rem' },
  logoText: { fontSize:'1.05rem', fontWeight:'700', color:'#f1f5f9' },
  navItem: (active) => ({ display:'flex', alignItems:'center', gap:'.7rem', padding:'.65rem .9rem', borderRadius:'6px', fontSize:'.85rem', fontWeight:'500', cursor:'pointer', margin:'0 .5rem .15rem', color: active ? '#f59e0b' : 'rgba(255,255,255,.6)', background: active ? 'rgba(245,158,11,.1)' : 'transparent', border: active ? '1px solid rgba(245,158,11,.2)' : '1px solid transparent', transition:'all .2s' }),
  card: { background:'#161b27', border:'1px solid rgba(255,255,255,.07)', borderRadius:'12px', overflow:'hidden', marginBottom:'1.5rem' },
  cardHeader: { padding:'1rem 1.25rem', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'space-between' },
  cardTitle: { fontSize:'.88rem', fontWeight:'700', color:'#f1f5f9' },
  cardBody: { padding:'1.25rem' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' },
  statCard: (color) => ({ background:'#161b27', border:'1px solid rgba(255,255,255,.07)', borderRadius:'12px', padding:'1.2rem', borderTop:`3px solid ${color}` }),
  statLabel: { fontSize:'.72rem', fontWeight:'600', color:'#64748b', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'.5rem' },
  statValue: { fontSize:'1.7rem', fontWeight:'700', color:'#f1f5f9', lineHeight:1 },
  statSub: { fontSize:'.75rem', color:'#64748b', marginTop:'.3rem' },
  btnPrimary: { background:'linear-gradient(135deg,#f59e0b,#f97316)', color:'#0f1117', border:'none', borderRadius:'8px', padding:'.6rem 1.3rem', fontSize:'.85rem', fontWeight:'700', cursor:'pointer' },
  btnSecondary: { background:'#1e2540', color:'#f1f5f9', border:'1px solid rgba(255,255,255,.12)', borderRadius:'8px', padding:'.6rem 1.3rem', fontSize:'.85rem', fontWeight:'600', cursor:'pointer' },
  btnDanger: { background:'rgba(239,68,68,.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,.2)', borderRadius:'8px', padding:'.42rem 1rem', fontSize:'.78rem', fontWeight:'600', cursor:'pointer' },
  btnSuccess: { background:'rgba(16,185,129,.1)', color:'#10b981', border:'1px solid rgba(16,185,129,.2)', borderRadius:'8px', padding:'.42rem 1rem', fontSize:'.78rem', fontWeight:'600', cursor:'pointer' },
  btnSmall: { background:'#1e2540', color:'#94a3b8', border:'1px solid rgba(255,255,255,.08)', borderRadius:'6px', padding:'.3rem .7rem', fontSize:'.75rem', cursor:'pointer' },
  formGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' },
  field: { display:'flex', flexDirection:'column', gap:'.35rem' },
  label: { fontSize:'.72rem', fontWeight:'600', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.06em' },
  input: { background:'#1c2236', border:'1px solid rgba(255,255,255,.12)', borderRadius:'8px', padding:'.65rem .9rem', fontSize:'.9rem', color:'#f1f5f9', outline:'none', width:'100%' },
  select: { background:'#1c2236', border:'1px solid rgba(255,255,255,.12)', borderRadius:'8px', padding:'.65rem .9rem', fontSize:'.9rem', color:'#f1f5f9', outline:'none', width:'100%' },
  textarea: { background:'#1c2236', border:'1px solid rgba(255,255,255,.12)', borderRadius:'8px', padding:'.65rem .9rem', fontSize:'.9rem', color:'#f1f5f9', outline:'none', width:'100%', resize:'vertical', minHeight:'80px' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { padding:'.65rem 1rem', textAlign:'left', fontSize:'.68rem', fontWeight:'700', letterSpacing:'.1em', textTransform:'uppercase', color:'#64748b', background:'#1c2236', borderBottom:'1px solid rgba(255,255,255,.07)', whiteSpace:'nowrap' },
  td: { padding:'.7rem 1rem', fontSize:'.84rem', color:'#94a3b8', borderBottom:'1px solid rgba(255,255,255,.04)', verticalAlign:'middle' },
  badge: (color, bg) => ({ display:'inline-flex', alignItems:'center', padding:'.2rem .6rem', borderRadius:'100px', fontSize:'.7rem', fontWeight:'600', color, background:bg }),
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,.75)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' },
  modal: { background:'#161b27', border:'1px solid rgba(255,255,255,.12)', borderRadius:'16px', width:'min(580px,100%)', maxHeight:'90vh', overflowY:'auto' },
  modalLg: { background:'#161b27', border:'1px solid rgba(255,255,255,.12)', borderRadius:'16px', width:'min(720px,100%)', maxHeight:'90vh', overflowY:'auto' },
  modalHeader: { padding:'1.2rem 1.5rem', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#161b27', zIndex:1 },
  modalTitle: { fontSize:'1rem', fontWeight:'700', color:'#f1f5f9' },
  modalBody: { padding:'1.5rem' },
  modalFooter: { padding:'1rem 1.5rem', borderTop:'1px solid rgba(255,255,255,.07)', display:'flex', justifyContent:'flex-end', gap:'.6rem', position:'sticky', bottom:0, background:'#161b27' },
  pageHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' },
  pageTitle: { fontSize:'1.35rem', fontWeight:'700', color:'#f1f5f9' },
  pageSub: { fontSize:'.82rem', color:'#64748b', marginTop:'.2rem' },
  emptyState: { textAlign:'center', padding:'3rem 1.5rem', color:'#64748b' },
  emptyIcon: { fontSize:'2.5rem', marginBottom:'.75rem' },
  emptyTitle: { fontSize:'.95rem', fontWeight:'600', color:'#94a3b8', marginBottom:'.3rem' },
  divider: { height:'1px', background:'rgba(255,255,255,.06)', margin:'1rem 0' },
  // Login styles
  loginInput: { background:'#1c2236', border:'1px solid rgba(255,255,255,.12)', borderRadius:'8px', padding:'.65rem .9rem', fontSize:'.9rem', color:'#f1f5f9', outline:'none', width:'100%' },
  loginLabel: { fontSize:'.72rem', fontWeight:'600', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.06em' },
};

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════
const getHeaders = (token) => ({ Authorization:`Bearer ${token}` });

const BadgeEstado = ({ estado }) => {
  const map = {
    pendiente:    ['#f59e0b','rgba(245,158,11,.1)'],
    confirmada:   ['#3b82f6','rgba(59,130,246,.1)'],
    completada:   ['#10b981','rgba(16,185,129,.1)'],
    cancelada:    ['#ef4444','rgba(239,68,68,.1)'],
    nuevo:        ['#94a3b8','rgba(148,163,184,.1)'],
    regular:      ['#3b82f6','rgba(59,130,246,.1)'],
    vip:          ['#f59e0b','rgba(245,158,11,.1)'],
    premium:      ['#8b5cf6','rgba(139,92,246,.1)'],
    efectivo:     ['#10b981','rgba(16,185,129,.1)'],
    tarjeta:      ['#3b82f6','rgba(59,130,246,.1)'],
    transferencia:['#8b5cf6','rgba(139,92,246,.1)'],
    free:         ['#94a3b8','rgba(148,163,184,.1)'],
    pro:          ['#f59e0b','rgba(245,158,11,.1)'],
  };
  const [color, bg] = map[estado] || ['#94a3b8','rgba(148,163,184,.1)'];
  return <span style={s.badge(color,bg)}>{estado}</span>;
};

// ══════════════════════════════════════
// LOGIN + REGISTRO
// ══════════════════════════════════════
function Login({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('admin@managex.com');
  const [password, setPassword] = useState('admin123');
  const [nombre, setNombre] = useState('');
  const [negocio, setNegocio] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (!negocio || !nombre || !email || !password) {
      setError('Todos los campos son obligatorios'); return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener mínimo 6 caracteres'); return;
    }
    setLoading(true); setError('');
    try {
      await axios.post(`${API}/auth/registro`, {
        nombre_negocio: negocio, nombre, email, password
      });
      setExito('¡Cuenta creada! Ya puedes iniciar sesión.');
      setTab('login');
      setEmail(email);
      setPassword('');
    } catch (e) {
      setError(e.response?.data?.error || 'Error al registrarse');
    }
    setLoading(false);
  };

  return (
    <div style={{ width:'100vw', height:'100vh', background:'#0f1117', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#161b27', border:'1px solid rgba(255,255,255,.1)', borderRadius:'20px', padding:'2.5rem', width:'420px' }}>

        {/* LOGO */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ width:'52px', height:'52px', background:'linear-gradient(135deg,#f59e0b,#f97316)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800', color:'#0f1117', fontSize:'1.4rem', margin:'0 auto .75rem' }}>M</div>
          <div style={{ fontSize:'1.5rem', fontWeight:'700', color:'#f1f5f9' }}>ManageX</div>
          <div style={{ fontSize:'.85rem', color:'#64748b', marginTop:'.25rem' }}>Sistema de Gestión para Negocios</div>
        </div>

        {/* TABS */}
        <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,.07)', marginBottom:'1.5rem' }}>
          <div onClick={()=>cambiarTab('login')}
            style={{ flex:1, textAlign:'center', padding:'.7rem', fontSize:'.88rem', fontWeight:'600', cursor:'pointer', color: tab==='login' ? '#f59e0b' : '#64748b', borderBottom: tab==='login' ? '2px solid #f59e0b' : '2px solid transparent' }}>
            Iniciar Sesión
          </div>
          <div onClick={()=>cambiarTab('registro')}
            style={{ flex:1, textAlign:'center', padding:'.7rem', fontSize:'.88rem', fontWeight:'600', cursor:'pointer', color: tab==='registro' ? '#f59e0b' : '#64748b', borderBottom: tab==='registro' ? '2px solid #f59e0b' : '2px solid transparent' }}>
            Crear Cuenta
          </div>
        </div>

        {/* MENSAJES */}
        {exito && <div style={{ color:'#10b981', fontSize:'.83rem', textAlign:'center', background:'rgba(16,185,129,.1)', padding:'.75rem', borderRadius:'8px', marginBottom:'1rem', border:'1px solid rgba(16,185,129,.2)' }}>{exito}</div>}
        {error && <div style={{ color:'#ef4444', fontSize:'.83rem', textAlign:'center', background:'rgba(239,68,68,.08)', padding:'.75rem', borderRadius:'8px', marginBottom:'1rem', border:'1px solid rgba(239,68,68,.2)' }}>{error}</div>}

        {/* LOGIN */}
        {tab === 'login' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={s.field}>
              <label style={s.loginLabel}>Email</label>
              <input style={s.loginInput} type="email" value={email} onInput={e=>setEmail(e.target.value)} placeholder="tu@email.com"/>
            </div>
            <div style={s.field}>
              <label style={s.loginLabel}>Contraseña</label>
              <input style={s.loginInput} type="password" value={password} onInput={e=>setPassword(e.target.value)} placeholder="••••••••"/>
            </div>
            <button style={{ background:'linear-gradient(135deg,#f59e0b,#f97316)', color:'#0f1117', border:'none', borderRadius:'8px', padding:'.85rem', fontSize:'1rem', fontWeight:'700', cursor:'pointer', width:'100%', marginTop:'.5rem' }} onClick={handleLogin}>
              {loading ? 'Iniciando...' : 'Iniciar Sesión →'}
            </button>
            <div style={{ textAlign:'center', fontSize:'.78rem', color:'#64748b' }}>
              ¿No tienes cuenta? <span style={{ color:'#f59e0b', cursor:'pointer', fontWeight:'600' }} onClick={()=>cambiarTab('registro')}>Regístrate gratis</span>
            </div>
          </div>
        )}

        {/* REGISTRO */}
        {tab === 'registro' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={s.field}>
              <label style={s.loginLabel}>Nombre del Negocio *</label>
              <input style={s.loginInput} value={negocio} onInput={e=>setNegocio(e.target.value)} placeholder="Ej: Salón María, Farmacia Juan"/>
            </div>
            <div style={s.field}>
              <label style={s.loginLabel}>Tu Nombre *</label>
              <input style={s.loginInput} value={nombre} onInput={e=>setNombre(e.target.value)} placeholder="Juan López"/>
            </div>
            <div style={s.field}>
              <label style={s.loginLabel}>Email *</label>
              <input style={s.loginInput} type="email" value={email} onInput={e=>setEmail(e.target.value)} placeholder="tu@email.com"/>
            </div>
            <div style={s.field}>
              <label style={s.loginLabel}>Contraseña * (mínimo 6 caracteres)</label>
              <input style={s.loginInput} type="password" value={password} onInput={e=>setPassword(e.target.value)} placeholder="••••••••"/>
            </div>
            <button style={{ background:'linear-gradient(135deg,#f59e0b,#f97316)', color:'#0f1117', border:'none', borderRadius:'8px', padding:'.85rem', fontSize:'1rem', fontWeight:'700', cursor:'pointer', width:'100%', marginTop:'.5rem' }} onClick={handleRegistro}>
              {loading ? 'Creando cuenta...' : 'Crear Mi Cuenta Gratis →'}
            </button>
            <div style={{ textAlign:'center', fontSize:'.78rem', color:'#64748b' }}>
              ¿Ya tienes cuenta? <span style={{ color:'#f59e0b', cursor:'pointer', fontWeight:'600' }} onClick={()=>cambiarTab('login')}>Inicia sesión</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════
function Dashboard({ token }) {
  const [stats, setStats] = useState({ clientes:0, citas:0, ventas:0, productos:0, ingresos:0 });

  useEffect(() => {
    const h = getHeaders(token);
    Promise.all([
      axios.get(`${API}/clientes`,{headers:h}),
      axios.get(`${API}/citas`,{headers:h}),
      axios.get(`${API}/ventas`,{headers:h}),
      axios.get(`${API}/inventario`,{headers:h}),
    ]).then(([c,ci,v,p]) => {
      const ventas = v.data.data||[];
      const ingresos = ventas.reduce((sum,vt)=>sum+parseFloat(vt.total||0),0);
      setStats({ clientes:(c.data.data||[]).length, citas:(ci.data.data||[]).length, ventas:ventas.length, productos:(p.data.data||[]).length, ingresos });
    }).catch(()=>{});
  },[]);

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <div style={s.pageTitle}>Dashboard</div>
          <div style={s.pageSub}>Bienvenido a ManageX — resumen del negocio</div>
        </div>
      </div>
      <div style={s.statsGrid}>
        <div style={s.statCard('#f59e0b')}>
          <div style={s.statLabel}>Ingresos totales</div>
          <div style={s.statValue}>${stats.ingresos.toFixed(2)}</div>
          <div style={s.statSub}>{stats.ventas} ventas registradas</div>
        </div>
        <div style={s.statCard('#3b82f6')}>
          <div style={s.statLabel}>Clientes</div>
          <div style={s.statValue}>{stats.clientes}</div>
          <div style={s.statSub}>registrados en el sistema</div>
        </div>
        <div style={s.statCard('#10b981')}>
          <div style={s.statLabel}>Citas</div>
          <div style={s.statValue}>{stats.citas}</div>
          <div style={s.statSub}>agendadas en total</div>
        </div>
        <div style={s.statCard('#8b5cf6')}>
          <div style={s.statLabel}>Productos</div>
          <div style={s.statValue}>{stats.productos}</div>
          <div style={s.statSub}>en inventario</div>
        </div>
      </div>
      <div style={s.card}>
        <div style={s.cardHeader}>
          <div style={s.cardTitle}>🚀 ManageX funcionando</div>
          <span style={s.badge('#10b981','rgba(16,185,129,.1)')}>✓ Conectado a MySQL</span>
        </div>
        <div style={s.cardBody}>
          <p style={{ color:'#94a3b8', fontSize:'.9rem', lineHeight:1.7, marginBottom:'1.2rem' }}>
            Sistema operando correctamente. Todos los módulos están conectados a la base de datos MySQL.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>
            {[['👥','Clientes','Gestiona tu cartera'],['📅','Citas','Agenda y calendario'],['💰','Ventas','POS y historial'],['📦','Inventario','Stock y productos']].map(([icon,title,desc])=>(
              <div key={title} style={{ background:'#1c2236', borderRadius:'8px', padding:'1rem', border:'1px solid rgba(255,255,255,.06)' }}>
                <div style={{ fontSize:'1.3rem', marginBottom:'.4rem' }}>{icon}</div>
                <div style={{ fontSize:'.85rem', fontWeight:'600', color:'#f1f5f9', marginBottom:'.2rem' }}>{title}</div>
                <div style={{ fontSize:'.75rem', color:'#64748b' }}>{desc}</div>
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
function Clientes({ token }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre:'', apellido:'', email:'', telefono:'', ciudad:'', etiqueta:'nuevo', notas:'' });
  const h = getHeaders(token);

  const cargar = async () => {
    setLoading(true);
    try { const r = await axios.get(`${API}/clientes`,{headers:h}); setClientes(r.data.data||[]); }
    catch(e){ console.error(e); }
    setLoading(false);
  };

  useEffect(()=>{ cargar(); },[]);

  const abrirNuevo = () => { setEditando(null); setForm({ nombre:'', apellido:'', email:'', telefono:'', ciudad:'', etiqueta:'nuevo', notas:'' }); setModal(true); };
  const abrirEditar = (c) => { setEditando(c); setForm({ nombre:c.nombre||'', apellido:c.apellido||'', email:c.email||'', telefono:c.telefono||'', ciudad:c.ciudad||'', etiqueta:c.etiqueta||'nuevo', notas:c.notas||'' }); setModal(true); };

  const guardar = async () => {
    if (!form.nombre) { alert('El nombre es obligatorio'); return; }
    try {
      if (editando) await axios.put(`${API}/clientes/${editando.id}`,form,{headers:h});
      else await axios.post(`${API}/clientes`,form,{headers:h});
      setModal(false); cargar();
    } catch(e){ alert('Error: '+e.message); }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    await axios.delete(`${API}/clientes/${id}`,{headers:h}); cargar();
  };

  return (
    <div>
      <div style={s.pageHeader}>
        <div><div style={s.pageTitle}>Clientes</div><div style={s.pageSub}>{clientes.length} registrados</div></div>
        <button style={s.btnPrimary} onClick={abrirNuevo}>+ Nuevo Cliente</button>
      </div>
      <div style={s.card}>
        <div style={{ overflowX:'auto' }}>
          <table style={s.table}>
            <thead><tr>
              <th style={s.th}>#</th><th style={s.th}>Nombre</th><th style={s.th}>Email</th>
              <th style={s.th}>Teléfono</th><th style={s.th}>Ciudad</th>
              <th style={s.th}>Etiqueta</th><th style={s.th}>Acciones</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="7" style={{...s.td,textAlign:'center',padding:'2rem'}}>Cargando...</td></tr>
              : clientes.length===0 ? <tr><td colSpan="7" style={{...s.td,textAlign:'center',padding:'2rem'}}>
                  <div style={s.emptyState}><div style={s.emptyIcon}>👥</div><div style={s.emptyTitle}>No hay clientes aún</div><div>Crea tu primer cliente</div></div>
                </td></tr>
              : clientes.map((c,i)=>(
                <tr key={c.id}>
                  <td style={{...s.td,color:'#64748b',fontFamily:'monospace'}}>{i+1}</td>
                  <td style={{...s.td,color:'#f1f5f9',fontWeight:'600'}}>{c.nombre} {c.apellido}</td>
                  <td style={s.td}>{c.email||'—'}</td>
                  <td style={s.td}>{c.telefono||'—'}</td>
                  <td style={s.td}>{c.ciudad||'—'}</td>
                  <td style={s.td}><BadgeEstado estado={c.etiqueta}/></td>
                  <td style={s.td}>
                    <div style={{ display:'flex', gap:'.4rem' }}>
                      <button style={s.btnSuccess} onClick={()=>abrirEditar(c)}>Editar</button>
                      <button style={s.btnDanger} onClick={()=>eliminar(c.id)}>Eliminar</button>
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
              <div style={s.modalTitle}>{editando ? '✏️ Editar Cliente' : '👤 Nuevo Cliente'}</div>
              <button style={s.btnSmall} onClick={()=>setModal(false)}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={s.formGrid}>
                <div style={s.field}><label style={s.label}>Nombre *</label><input style={s.input} value={form.nombre} onInput={e=>setForm({...form,nombre:e.target.value})} placeholder="Juan"/></div>
                <div style={s.field}><label style={s.label}>Apellido</label><input style={s.input} value={form.apellido} onInput={e=>setForm({...form,apellido:e.target.value})} placeholder="López"/></div>
                <div style={s.field}><label style={s.label}>Email</label><input style={s.input} type="email" value={form.email} onInput={e=>setForm({...form,email:e.target.value})} placeholder="juan@email.com"/></div>
                <div style={s.field}><label style={s.label}>Teléfono</label><input style={s.input} value={form.telefono} onInput={e=>setForm({...form,telefono:e.target.value})} placeholder="9876-5432"/></div>
                <div style={s.field}><label style={s.label}>Ciudad</label><input style={s.input} value={form.ciudad} onInput={e=>setForm({...form,ciudad:e.target.value})} placeholder="Tegucigalpa"/></div>
                <div style={s.field}><label style={s.label}>Etiqueta</label>
                  <select style={s.select} value={form.etiqueta} onChange={e=>setForm({...form,etiqueta:e.target.value})}>
                    <option value="nuevo">Nuevo</option><option value="regular">Regular</option>
                    <option value="vip">VIP</option><option value="premium">Premium</option>
                  </select>
                </div>
                <div style={{...s.field,gridColumn:'span 2'}}><label style={s.label}>Notas</label><textarea style={s.textarea} value={form.notas} onInput={e=>setForm({...form,notas:e.target.value})} placeholder="Observaciones..."/></div>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnSecondary} onClick={()=>setModal(false)}>Cancelar</button>
              <button style={s.btnPrimary} onClick={guardar}>{editando?'Guardar Cambios':'Crear Cliente'} ✓</button>
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
function Citas({ token }) {
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ cliente_id:'', servicio:'', fecha:'', hora_inicio:'', duracion_min:60, notas:'' });
  const h = getHeaders(token);

  const cargar = async () => {
    setLoading(true);
    try {
      const [ci,cl] = await Promise.all([axios.get(`${API}/citas`,{headers:h}),axios.get(`${API}/clientes`,{headers:h})]);
      setCitas(ci.data.data||[]); setClientes(cl.data.data||[]);
    } catch(e){ console.error(e); }
    setLoading(false);
  };

  useEffect(()=>{ cargar(); },[]);

  const guardar = async () => {
    if (!form.cliente_id||!form.fecha||!form.hora_inicio) { alert('Completa los campos obligatorios'); return; }
    try {
      await axios.post(`${API}/citas`,form,{headers:h});
      setModal(false); setForm({ cliente_id:'', servicio:'', fecha:'', hora_inicio:'', duracion_min:60, notas:'' }); cargar();
    } catch(e){ alert('Error: '+e.message); }
  };

  const cambiarEstado = async (id, estado) => {
    try { await axios.put(`${API}/citas/${id}`,{estado},{headers:h}); cargar(); }
    catch(e){ console.error(e); }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta cita?')) return;
    await axios.delete(`${API}/citas/${id}`,{headers:h}); cargar();
  };

  return (
    <div>
      <div style={s.pageHeader}>
        <div><div style={s.pageTitle}>Citas</div><div style={s.pageSub}>{citas.length} citas registradas</div></div>
        <button style={s.btnPrimary} onClick={()=>setModal(true)}>+ Nueva Cita</button>
      </div>
      <div style={s.card}>
        <div style={{ overflowX:'auto' }}>
          <table style={s.table}>
            <thead><tr>
              <th style={s.th}>#</th><th style={s.th}>Cliente</th><th style={s.th}>Servicio</th>
              <th style={s.th}>Fecha</th><th style={s.th}>Hora</th>
              <th style={s.th}>Duración</th><th style={s.th}>Estado</th><th style={s.th}>Acciones</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="8" style={{...s.td,textAlign:'center',padding:'2rem'}}>Cargando...</td></tr>
              : citas.length===0 ? <tr><td colSpan="8" style={{...s.td,textAlign:'center',padding:'2rem'}}>
                  <div style={s.emptyState}><div style={s.emptyIcon}>📅</div><div style={s.emptyTitle}>No hay citas aún</div><div>Agenda tu primera cita</div></div>
                </td></tr>
              : citas.map((c,i)=>(
                <tr key={c.id}>
                  <td style={{...s.td,color:'#64748b',fontFamily:'monospace'}}>{i+1}</td>
                  <td style={{...s.td,color:'#f1f5f9',fontWeight:'600'}}>{c.cliente_nombre||'—'}</td>
                  <td style={s.td}>{c.servicio||'—'}</td>
                  <td style={{...s.td,fontFamily:'monospace'}}>{c.fecha?.split('T')[0]||'—'}</td>
                  <td style={{...s.td,fontFamily:'monospace'}}>{c.hora_inicio||'—'}</td>
                  <td style={s.td}>{c.duracion_min} min</td>
                  <td style={s.td}><BadgeEstado estado={c.estado}/></td>
                  <td style={s.td}>
                    <div style={{ display:'flex', gap:'.35rem', flexWrap:'wrap' }}>
                      {c.estado==='pendiente' && <button style={s.btnSuccess} onClick={()=>cambiarEstado(c.id,'confirmada')}>Confirmar</button>}
                      {c.estado==='confirmada' && <button style={s.btnSuccess} onClick={()=>cambiarEstado(c.id,'completada')}>Completar</button>}
                      {c.estado!=='cancelada'&&c.estado!=='completada' && <button style={s.btnDanger} onClick={()=>cambiarEstado(c.id,'cancelada')}>Cancelar</button>}
                      <button style={s.btnSmall} onClick={()=>eliminar(c.id)}>🗑</button>
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
              <div style={s.modalTitle}>📅 Nueva Cita</div>
              <button style={s.btnSmall} onClick={()=>setModal(false)}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={s.formGrid}>
                <div style={{...s.field,gridColumn:'span 2'}}>
                  <label style={s.label}>Cliente *</label>
                  <select style={s.select} value={form.cliente_id} onChange={e=>setForm({...form,cliente_id:e.target.value})}>
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                  </select>
                </div>
                <div style={{...s.field,gridColumn:'span 2'}}><label style={s.label}>Servicio</label><input style={s.input} value={form.servicio} onInput={e=>setForm({...form,servicio:e.target.value})} placeholder="Ej: Consulta general"/></div>
                <div style={s.field}><label style={s.label}>Fecha *</label><input style={s.input} type="date" value={form.fecha} onInput={e=>setForm({...form,fecha:e.target.value})}/></div>
                <div style={s.field}><label style={s.label}>Hora *</label><input style={s.input} type="time" value={form.hora_inicio} onInput={e=>setForm({...form,hora_inicio:e.target.value})}/></div>
                <div style={s.field}><label style={s.label}>Duración</label>
                  <select style={s.select} value={form.duracion_min} onChange={e=>setForm({...form,duracion_min:parseInt(e.target.value)})}>
                    <option value={30}>30 minutos</option><option value={45}>45 minutos</option>
                    <option value={60}>60 minutos</option><option value={90}>90 minutos</option>
                    <option value={120}>2 horas</option>
                  </select>
                </div>
                <div style={{...s.field,gridColumn:'span 2'}}><label style={s.label}>Notas</label><textarea style={s.textarea} value={form.notas} onInput={e=>setForm({...form,notas:e.target.value})} placeholder="Instrucciones especiales..."/></div>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnSecondary} onClick={()=>setModal(false)}>Cancelar</button>
              <button style={s.btnPrimary} onClick={guardar}>Agendar Cita ✓</button>
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
function Ventas({ token }) {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ cliente_id:'', metodo_pago:'efectivo', descuento_pct:0, impuesto_pct:15, notas:'', items:[] });
  const h = getHeaders(token);

  const cargar = async () => {
    setLoading(true);
    try {
      const [v,cl,p] = await Promise.all([
        axios.get(`${API}/ventas`,{headers:h}),
        axios.get(`${API}/clientes`,{headers:h}),
        axios.get(`${API}/inventario`,{headers:h}),
      ]);
      setVentas(v.data.data||[]); setClientes(cl.data.data||[]); setProductos(p.data.data||[]);
    } catch(e){ console.error(e); }
    setLoading(false);
  };

  useEffect(()=>{ cargar(); },[]);

  const agregarItem = () => setForm({...form,items:[...form.items,{producto_id:'',cantidad:1,precio_unit:0}]});

  const actualizarItem = (i,campo,valor) => {
    const items=[...form.items]; items[i]={...items[i],[campo]:valor};
    if (campo==='producto_id') { const p=productos.find(p=>p.id==valor); if(p) items[i].precio_unit=parseFloat(p.precio_venta); }
    setForm({...form,items});
  };

  const quitarItem = (i) => setForm({...form,items:form.items.filter((_,idx)=>idx!==i)});

  const calcTotal = () => {
    const sub=form.items.reduce((s,it)=>s+(it.cantidad*it.precio_unit),0);
    const desc=sub*(form.descuento_pct/100);
    const imp=(sub-desc)*(form.impuesto_pct/100);
    return { subtotal:sub, descuento:desc, impuesto:imp, total:sub-desc+imp };
  };

  const guardar = async () => {
    if (form.items.length===0) { alert('Agrega al menos un producto'); return; }
    try {
      await axios.post(`${API}/ventas`,form,{headers:h});
      setModal(false); setForm({ cliente_id:'', metodo_pago:'efectivo', descuento_pct:0, impuesto_pct:15, notas:'', items:[] }); cargar();
    } catch(e){ alert('Error: '+e.message); }
  };

  const { subtotal, descuento, impuesto, total } = calcTotal();

  return (
    <div>
      <div style={s.pageHeader}>
        <div><div style={s.pageTitle}>Ventas</div><div style={s.pageSub}>{ventas.length} ventas registradas</div></div>
        <button style={s.btnPrimary} onClick={()=>setModal(true)}>+ Nueva Venta</button>
      </div>
      <div style={s.card}>
        <div style={{ overflowX:'auto' }}>
          <table style={s.table}>
            <thead><tr>
              <th style={s.th}>#</th><th style={s.th}>Cliente</th><th style={s.th}>Fecha</th>
              <th style={s.th}>Método Pago</th><th style={s.th}>Subtotal</th>
              <th style={s.th}>Total</th><th style={s.th}>Estado</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="7" style={{...s.td,textAlign:'center',padding:'2rem'}}>Cargando...</td></tr>
              : ventas.length===0 ? <tr><td colSpan="7" style={{...s.td,textAlign:'center',padding:'2rem'}}>
                  <div style={s.emptyState}><div style={s.emptyIcon}>💰</div><div style={s.emptyTitle}>No hay ventas aún</div><div>Registra tu primera venta</div></div>
                </td></tr>
              : ventas.map((v,i)=>(
                <tr key={v.id}>
                  <td style={{...s.td,color:'#64748b',fontFamily:'monospace'}}>{i+1}</td>
                  <td style={{...s.td,color:'#f1f5f9',fontWeight:'600'}}>{v.cliente_nombre||'Cliente general'}</td>
                  <td style={{...s.td,fontFamily:'monospace'}}>{v.creado_en?.split('T')[0]||'—'}</td>
                  <td style={s.td}><BadgeEstado estado={v.metodo_pago}/></td>
                  <td style={{...s.td,fontFamily:'monospace'}}>${parseFloat(v.subtotal||0).toFixed(2)}</td>
                  <td style={{...s.td,fontFamily:'monospace',color:'#f59e0b',fontWeight:'700'}}>${parseFloat(v.total||0).toFixed(2)}</td>
                  <td style={s.td}><BadgeEstado estado={v.estado}/></td>
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
              <div style={s.modalTitle}>💰 Nueva Venta</div>
              <button style={s.btnSmall} onClick={()=>setModal(false)}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={s.formGrid}>
                <div style={s.field}><label style={s.label}>Cliente</label>
                  <select style={s.select} value={form.cliente_id} onChange={e=>setForm({...form,cliente_id:e.target.value})}>
                    <option value="">Cliente general</option>
                    {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                  </select>
                </div>
                <div style={s.field}><label style={s.label}>Método de Pago</label>
                  <select style={s.select} value={form.metodo_pago} onChange={e=>setForm({...form,metodo_pago:e.target.value})}>
                    <option value="efectivo">💵 Efectivo</option>
                    <option value="tarjeta">💳 Tarjeta</option>
                    <option value="transferencia">📱 Transferencia</option>
                  </select>
                </div>
              </div>
              <div style={s.divider}/>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.75rem' }}>
                <div style={{ fontSize:'.82rem', fontWeight:'700', color:'#f1f5f9' }}>Productos</div>
                <button style={s.btnSmall} onClick={agregarItem}>+ Agregar producto</button>
              </div>
              {form.items.length===0 ? (
                <div style={{ textAlign:'center', padding:'1.5rem', color:'#64748b', background:'#1c2236', borderRadius:'8px', fontSize:'.85rem' }}>
                  Haz clic en "+ Agregar producto" para comenzar
                </div>
              ) : form.items.map((item,i)=>(
                <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:'.75rem', alignItems:'end', marginBottom:'.5rem', background:'#1c2236', borderRadius:'8px', padding:'.75rem' }}>
                  <div style={s.field}>
                    <label style={{...s.label,fontSize:'.62rem'}}>Producto</label>
                    <select style={s.select} value={item.producto_id} onChange={e=>actualizarItem(i,'producto_id',e.target.value)}>
                      <option value="">Seleccionar...</option>
                      {productos.map(p=><option key={p.id} value={p.id}>{p.nombre} — ${p.precio_venta}</option>)}
                    </select>
                  </div>
                  <div style={s.field}>
                    <label style={{...s.label,fontSize:'.62rem'}}>Cantidad</label>
                    <input style={{...s.input,width:'70px'}} type="number" min="1" value={item.cantidad} onInput={e=>actualizarItem(i,'cantidad',parseInt(e.target.value)||1)}/>
                  </div>
                  <div style={s.field}>
                    <label style={{...s.label,fontSize:'.62rem'}}>Precio</label>
                    <input style={{...s.input,width:'90px'}} type="number" value={item.precio_unit} onInput={e=>actualizarItem(i,'precio_unit',parseFloat(e.target.value)||0)}/>
                  </div>
                  <button style={s.btnDanger} onClick={()=>quitarItem(i)}>✕</button>
                </div>
              ))}
              <div style={s.divider}/>
              <div style={s.formGrid}>
                <div style={s.field}><label style={s.label}>Descuento (%)</label><input style={s.input} type="number" min="0" max="100" value={form.descuento_pct} onInput={e=>setForm({...form,descuento_pct:parseFloat(e.target.value)||0})}/></div>
                <div style={s.field}><label style={s.label}>Impuesto (%)</label><input style={s.input} type="number" min="0" value={form.impuesto_pct} onInput={e=>setForm({...form,impuesto_pct:parseFloat(e.target.value)||0})}/></div>
              </div>
              <div style={{ background:'rgba(245,158,11,.05)', border:'1px solid rgba(245,158,11,.2)', borderRadius:'8px', padding:'1rem', marginTop:'1rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.85rem', color:'#94a3b8', marginBottom:'.3rem' }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.85rem', color:'#94a3b8', marginBottom:'.3rem' }}><span>Descuento ({form.descuento_pct}%)</span><span>-${descuento.toFixed(2)}</span></div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.85rem', color:'#94a3b8', marginBottom:'.5rem' }}><span>Impuesto ({form.impuesto_pct}%)</span><span>${impuesto.toFixed(2)}</span></div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'1rem', fontWeight:'700', color:'#f59e0b', borderTop:'1px solid rgba(245,158,11,.2)', paddingTop:'.5rem' }}><span>TOTAL</span><span>${total.toFixed(2)}</span></div>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnSecondary} onClick={()=>setModal(false)}>Cancelar</button>
              <button style={s.btnPrimary} onClick={guardar}>Registrar Venta — ${total.toFixed(2)} ✓</button>
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
function Inventario({ token }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre:'', sku:'', categoria:'', tipo:'producto', precio_venta:0, precio_costo:0, stock_actual:0, stock_minimo:10 });
  const h = getHeaders(token);

  const cargar = async () => {
    setLoading(true);
    try { const r=await axios.get(`${API}/inventario`,{headers:h}); setProductos(r.data.data||[]); }
    catch(e){ console.error(e); }
    setLoading(false);
  };

  useEffect(()=>{ cargar(); },[]);

  const abrirNuevo = () => { setEditando(null); setForm({ nombre:'', sku:'', categoria:'', tipo:'producto', precio_venta:0, precio_costo:0, stock_actual:0, stock_minimo:10 }); setModal(true); };
  const abrirEditar = (p) => { setEditando(p); setForm({ nombre:p.nombre||'', sku:p.sku||'', categoria:p.categoria||'', tipo:p.tipo||'producto', precio_venta:p.precio_venta||0, precio_costo:p.precio_costo||0, stock_actual:p.stock_actual||0, stock_minimo:p.stock_minimo||10 }); setModal(true); };

  const guardar = async () => {
    if (!form.nombre) { alert('El nombre es obligatorio'); return; }
    try {
      if (editando) await axios.put(`${API}/inventario/${editando.id}`,form,{headers:h});
      else await axios.post(`${API}/inventario`,form,{headers:h});
      setModal(false); cargar();
    } catch(e){ alert('Error: '+e.message); }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await axios.delete(`${API}/inventario/${id}`,{headers:h}); cargar();
  };

  const stockBajo = productos.filter(p=>p.tipo==='producto'&&p.stock_actual<=p.stock_minimo);

  return (
    <div>
      <div style={s.pageHeader}>
        <div><div style={s.pageTitle}>Inventario</div><div style={s.pageSub}>{productos.length} productos · {stockBajo.length} con stock bajo</div></div>
        <button style={s.btnPrimary} onClick={abrirNuevo}>+ Nuevo Producto</button>
      </div>
      {stockBajo.length>0 && (
        <div style={{ background:'rgba(239,68,68,.07)', border:'1px solid rgba(239,68,68,.2)', borderRadius:'10px', padding:'1rem 1.2rem', marginBottom:'1.2rem', display:'flex', alignItems:'center', gap:'.75rem' }}>
          <span style={{ fontSize:'1.2rem' }}>⚠️</span>
          <div>
            <div style={{ fontSize:'.85rem', fontWeight:'600', color:'#ef4444' }}>{stockBajo.length} productos con stock crítico</div>
            <div style={{ fontSize:'.78rem', color:'#94a3b8' }}>{stockBajo.map(p=>p.nombre).join(', ')}</div>
          </div>
        </div>
      )}
      <div style={s.card}>
        <div style={{ overflowX:'auto' }}>
          <table style={s.table}>
            <thead><tr>
              <th style={s.th}>SKU</th><th style={s.th}>Producto</th><th style={s.th}>Categoría</th>
              <th style={s.th}>Tipo</th><th style={s.th}>Precio Venta</th><th style={s.th}>Costo</th>
              <th style={s.th}>Stock</th><th style={s.th}>Estado</th><th style={s.th}>Acciones</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="9" style={{...s.td,textAlign:'center',padding:'2rem'}}>Cargando...</td></tr>
              : productos.length===0 ? <tr><td colSpan="9" style={{...s.td,textAlign:'center',padding:'2rem'}}>
                  <div style={s.emptyState}><div style={s.emptyIcon}>📦</div><div style={s.emptyTitle}>No hay productos aún</div><div>Agrega tu primer producto</div></div>
                </td></tr>
              : productos.map(p=>(
                <tr key={p.id}>
                  <td style={{...s.td,fontFamily:'monospace',color:'#f59e0b',fontSize:'.78rem'}}>{p.sku||'—'}</td>
                  <td style={{...s.td,color:'#f1f5f9',fontWeight:'600'}}>{p.nombre}</td>
                  <td style={s.td}>{p.categoria||'—'}</td>
                  <td style={s.td}><span style={s.badge(p.tipo==='servicio'?'#8b5cf6':'#3b82f6',p.tipo==='servicio'?'rgba(139,92,246,.1)':'rgba(59,130,246,.1)')}>{p.tipo}</span></td>
                  <td style={{...s.td,fontFamily:'monospace',color:'#f59e0b',fontWeight:'700'}}>${parseFloat(p.precio_venta||0).toFixed(2)}</td>
                  <td style={{...s.td,fontFamily:'monospace'}}>${parseFloat(p.precio_costo||0).toFixed(2)}</td>
                  <td style={s.td}>
                    {p.tipo==='servicio' ? <span style={{ color:'#64748b' }}>—</span> :
                      <span style={{ color:p.stock_actual<=p.stock_minimo?'#ef4444':'#10b981', fontWeight:'700' }}>
                        {p.stock_actual} <span style={{ color:'#64748b', fontWeight:'400', fontSize:'.75rem' }}>/ mín {p.stock_minimo}</span>
                      </span>
                    }
                  </td>
                  <td style={s.td}>
                    {p.tipo==='servicio' ? <span style={s.badge('#8b5cf6','rgba(139,92,246,.1)')}>Servicio</span>
                    : p.stock_actual<=0 ? <span style={s.badge('#ef4444','rgba(239,68,68,.1)')}>Agotado</span>
                    : p.stock_actual<=p.stock_minimo ? <span style={s.badge('#f59e0b','rgba(245,158,11,.1)')}>Stock bajo</span>
                    : <span style={s.badge('#10b981','rgba(16,185,129,.1)')}>Normal</span>}
                  </td>
                  <td style={s.td}>
                    <div style={{ display:'flex', gap:'.4rem' }}>
                      <button style={s.btnSuccess} onClick={()=>abrirEditar(p)}>Editar</button>
                      <button style={s.btnDanger} onClick={()=>eliminar(p.id)}>Eliminar</button>
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
              <div style={s.modalTitle}>{editando?'✏️ Editar Producto':'📦 Nuevo Producto'}</div>
              <button style={s.btnSmall} onClick={()=>setModal(false)}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={s.formGrid}>
                <div style={{...s.field,gridColumn:'span 2'}}><label style={s.label}>Nombre *</label><input style={s.input} value={form.nombre} onInput={e=>setForm({...form,nombre:e.target.value})} placeholder="Ej: Producto Premium A"/></div>
                <div style={s.field}><label style={s.label}>SKU</label><input style={s.input} value={form.sku} onInput={e=>setForm({...form,sku:e.target.value})} placeholder="PRD-001"/></div>
                <div style={s.field}><label style={s.label}>Categoría</label><input style={s.input} value={form.categoria} onInput={e=>setForm({...form,categoria:e.target.value})} placeholder="Electrónica"/></div>
                <div style={s.field}><label style={s.label}>Tipo</label>
                  <select style={s.select} value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
                    <option value="producto">Producto</option><option value="servicio">Servicio</option>
                  </select>
                </div>
                <div style={s.field}><label style={s.label}>Precio de Venta *</label><input style={s.input} type="number" min="0" step="0.01" value={form.precio_venta} onInput={e=>setForm({...form,precio_venta:parseFloat(e.target.value)||0})}/></div>
                <div style={s.field}><label style={s.label}>Precio de Costo</label><input style={s.input} type="number" min="0" step="0.01" value={form.precio_costo} onInput={e=>setForm({...form,precio_costo:parseFloat(e.target.value)||0})}/></div>
                {form.tipo==='producto' && <>
                  <div style={s.field}><label style={s.label}>Stock Actual</label><input style={s.input} type="number" min="0" value={form.stock_actual} onInput={e=>setForm({...form,stock_actual:parseInt(e.target.value)||0})}/></div>
                  <div style={s.field}><label style={s.label}>Stock Mínimo</label><input style={s.input} type="number" min="0" value={form.stock_minimo} onInput={e=>setForm({...form,stock_minimo:parseInt(e.target.value)||0})}/></div>
                </>}
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnSecondary} onClick={()=>setModal(false)}>Cancelar</button>
              <button style={s.btnPrimary} onClick={guardar}>{editando?'Guardar Cambios':'Crear Producto'} ✓</button>
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
  const [token] = useState(()=>localStorage.getItem('token')||'');
  const [pagina, setPagina] = useState('dashboard');

  const logout = () => { localStorage.clear(); setUsuario(null); };

  if (!usuario) return <Login onLogin={setUsuario}/>;

  const navItems = [
    { id:'dashboard',  icon:'📊', label:'Dashboard' },
    { id:'clientes',   icon:'👥', label:'Clientes' },
    { id:'citas',      icon:'📅', label:'Citas' },
    { id:'ventas',     icon:'💰', label:'Ventas' },
    { id:'inventario', icon:'📦', label:'Inventario' },
  ];

  return (
    <div style={s.app}>
      <aside style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <div style={s.logoMark}>M</div>
          <div style={s.logoText}>ManageX</div>
        </div>
        <nav style={{ flex:1, padding:'.75rem 0', overflowY:'auto' }}>
          {navItems.map(item=>(
            <div key={item.id} style={s.navItem(pagina===item.id)} onClick={()=>setPagina(item.id)}>
              <span>{item.icon}</span><span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding:'.9rem 1rem', borderTop:'1px solid rgba(255,255,255,.07)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.6rem', marginBottom:'.75rem' }}>
            <div style={{ width:'32px', height:'32px', minWidth:'32px', borderRadius:'50%', background:'linear-gradient(135deg,#f59e0b,#f97316)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.8rem', fontWeight:'700', color:'#0f1117' }}>
              {usuario.nombre?.charAt(0)}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:'.82rem', fontWeight:'600', color:'#f1f5f9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{usuario.nombre}</div>
              <div style={{ fontSize:'.7rem', color:'#64748b' }}>{usuario.rol}</div>
            </div>
          </div>
          <button style={{ ...s.btnSecondary, width:'100%', fontSize:'.78rem', padding:'.5rem' }} onClick={logout}>Cerrar Sesión</button>
        </div>
      </aside>
      <div style={s.main}>
        <div style={s.topbar}>
          <div style={s.topbarTitle}>
            {navItems.find(n=>n.id===pagina)?.icon}
            <span style={{ marginLeft:'.4rem' }}>{navItems.find(n=>n.id===pagina)?.label}</span>
          </div>
          <div style={{ fontSize:'.82rem', color:'#64748b' }}>ManageX v1.0</div>
        </div>
        <div style={s.content}>
          {pagina==='dashboard'  && <Dashboard token={token}/>}
          {pagina==='clientes'   && <Clientes token={token}/>}
          {pagina==='citas'      && <Citas token={token}/>}
          {pagina==='ventas'     && <Ventas token={token}/>}
          {pagina==='inventario' && <Inventario token={token}/>}
        </div>
      </div>
    </div>
  );
}