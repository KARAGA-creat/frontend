import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';

export const T = {
    bg:'#020617', surface:'#0F172A', surface2:'#1E293B', border:'#1E293B',
    accent:'#22C55E', accentDim:'rgba(34,197,94,0.12)', danger:'#EF4444',
    warning:'#F59E0B', info:'#3B82F6', purple:'#8B5CF6',
    muted:'#475569', text:'#F8FAFC', textSoft:'#94A3B8',
};

const NAV_ITEMS = [
    { icon:'▦',  label:'Dashboard',    path:'/dashboard',    roles:['admin','gestionnaire'] },
    { icon:'⇅',  label:'Transactions', path:'/transactions', roles:['admin','gestionnaire'] },
    { icon:'📄', label:'Dettes',       path:'/dettes',       roles:['admin','gestionnaire'] },
    { icon:'◎',  label:'Budgets',      path:'/budgets',      roles:['admin','gestionnaire'] },
    { icon:'▲',  label:'Rapports',     path:'/rapports',     roles:['admin'] },
    { icon:'◈',  label:'Alertes',      path:'/alertes',      roles:['admin','gestionnaire'] },
    { icon:'◇',  label:'Tiers',        path:'/tiers',        roles:['admin','gestionnaire'] },
    { icon:'⊞',  label:'Caisse',        path:'/caisse',        roles:['admin','gestionnaire'] },
    { icon:'⚙',  label:'Paramètres',   path:'/parametres',   roles:['admin'] },
    { icon:'?',  label:'Guide',         path:'/guide',         roles:['admin','gestionnaire'] },
];

// Navigation mobile : 4 items principaux + "Plus"
const NAV_MOBILE_PRIMARY = ['/dashboard', '/transactions', '/alertes', '/dettes'];

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', h);
        return () => window.removeEventListener('resize', h);
    }, []);
    return isMobile;
}

export default function Layout({ children, alertesNonLues = 0 }) {
    const dispatch   = useDispatch();
    const navigate   = useNavigate();
    const { user }   = useSelector(s => s.auth);
    const isMobile   = useIsMobile();
    const [collapsed, setCollapsed] = useState(false);
    const [drawer, setDrawer]       = useState(false); // menu "Plus" sur mobile
    const path    = window.location.pathname;
    const visible = NAV_ITEMS.filter(i => !user?.role || i.roles.includes(user.role));

    const primaryMobile  = visible.filter(i => NAV_MOBILE_PRIMARY.includes(i.path));
    const secondaryMobile = visible.filter(i => !NAV_MOBILE_PRIMARY.includes(i.path));

    const handleLogout = () => { dispatch(logout()); navigate('/login'); };
    const goTo = (p) => { navigate(p); setDrawer(false); };

    return (
        <div style={{ display:'flex', minHeight:'100vh', background:T.bg, fontFamily:"'Inter',sans-serif", color:T.text }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Calistoga&family=Inter:wght@300;400;500;600;700&display=swap');
                *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
                body{background:${T.bg};}
                ::-webkit-scrollbar{width:5px;}
                ::-webkit-scrollbar-thumb{background:${T.surface2};border-radius:4px;}
                button,input,select,textarea{font-family:inherit;}
            `}</style>

            {/* ── SIDEBAR DESKTOP ── */}
            {!isMobile && (
                <aside style={{ width:collapsed?64:230, minHeight:'100vh', background:T.surface,
                    borderRight:`1px solid ${T.border}`, display:'flex', flexDirection:'column',
                    transition:'width 0.25s cubic-bezier(.4,0,.2,1)', overflow:'hidden',
                    position:'sticky', top:0, flexShrink:0 }}>

                    <div style={{ padding:'22px 16px 20px', display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:9, flexShrink:0,
                            background:`linear-gradient(135deg,${T.accent},#16A34A)`,
                            display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:17, color:'#000' }}>F</div>
                        {!collapsed && <span style={{ fontFamily:"'Calistoga',serif", fontSize:19, color:T.text, letterSpacing:'-0.02em', whiteSpace:'nowrap' }}>
                            Finance<span style={{ color:T.accent }}>IQ</span>
                        </span>}
                    </div>

                    <nav style={{ flex:1, padding:'4px 8px' }}>
                        {visible.map(item => {
                            const isActive = path === item.path;
                            return (
                                <div key={item.path} onClick={() => navigate(item.path)} style={{
                                    display:'flex', alignItems:'center', gap:12, padding:'10px 10px',
                                    borderRadius:9, marginBottom:2, cursor:'pointer',
                                    background:isActive ? T.accentDim : 'transparent',
                                    borderLeft:isActive ? `2px solid ${T.accent}` : '2px solid transparent',
                                    transition:'all 0.15s',
                                }}>
                                    <span style={{ fontSize:16, color:isActive?T.accent:T.muted, flexShrink:0, lineHeight:1 }}>{item.icon}</span>
                                    {!collapsed && <span style={{ fontSize:14, fontWeight:isActive?600:400, color:isActive?T.text:T.textSoft, whiteSpace:'nowrap' }}>{item.label}</span>}
                                    {item.path==='/alertes' && alertesNonLues>0 && (
                                        <span style={{ marginLeft:'auto', background:T.danger, color:'#fff', fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:99, flexShrink:0 }}>{alertesNonLues}</span>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    <div style={{ padding:'12px 10px', borderTop:`1px solid ${T.border}` }}>
                        {!collapsed && (
                            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px', marginBottom:8, borderRadius:9, background:T.surface2 }}>
                                <div style={{ width:30, height:30, borderRadius:99, flexShrink:0,
                                    background:`linear-gradient(135deg,${T.info},${T.purple})`,
                                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff' }}>
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p style={{ fontSize:13, fontWeight:600, color:T.text, margin:0 }}>{user?.username}</p>
                                    <p style={{ fontSize:11, color:T.muted, margin:0, textTransform:'capitalize' }}>{user?.role}</p>
                                </div>
                            </div>
                        )}
                        <button onClick={handleLogout} style={{ width:'100%', padding:'8px', borderRadius:8,
                            border:`1px solid rgba(239,68,68,0.25)`, background:'rgba(239,68,68,0.08)',
                            color:T.danger, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:8 }}>
                            {collapsed ? '×' : 'Déconnexion'}
                        </button>
                        <button onClick={() => setCollapsed(p => !p)} style={{ width:'100%', padding:'7px', borderRadius:8,
                            border:'none', background:T.surface2, color:T.muted, cursor:'pointer', fontSize:13 }}>
                            {collapsed ? '→' : '← Réduire'}
                        </button>
                    </div>
                </aside>
            )}

            {/* ── CONTENU PRINCIPAL ── */}
            <main style={{ flex:1, overflowY:'auto', minWidth:0, paddingBottom: isMobile ? 72 : 0 }}>
                {children}
            </main>

            {/* ── BARRE DE NAV MOBILE (fixe en bas) ── */}
            {isMobile && (
                <>
                    <nav style={{
                        position:'fixed', bottom:0, left:0, right:0, height:64,
                        background:T.surface, borderTop:`1px solid ${T.border}`,
                        display:'flex', alignItems:'stretch', zIndex:100,
                        boxShadow:'0 -4px 20px rgba(0,0,0,0.4)',
                    }}>
                        {primaryMobile.map(item => {
                            const isActive = path === item.path;
                            return (
                                <button key={item.path} onClick={() => goTo(item.path)} style={{
                                    flex:1, display:'flex', flexDirection:'column', alignItems:'center',
                                    justifyContent:'center', gap:4, background:'transparent', border:'none',
                                    color:isActive ? T.accent : T.muted, cursor:'pointer',
                                    borderTop: isActive ? `2px solid ${T.accent}` : '2px solid transparent',
                                    position:'relative',
                                }}>
                                    <span style={{ fontSize:20, lineHeight:1 }}>{item.icon}</span>
                                    <span style={{ fontSize:10, fontWeight:isActive?700:400 }}>{item.label}</span>
                                    {item.path==='/alertes' && alertesNonLues>0 && (
                                        <span style={{ position:'absolute', top:8, right:'calc(50% - 16px)',
                                            background:T.danger, color:'#fff', fontSize:9, fontWeight:700,
                                            padding:'1px 5px', borderRadius:99 }}>{alertesNonLues}</span>
                                    )}
                                </button>
                            );
                        })}

                        {/* Bouton "Plus" */}
                        <button onClick={() => setDrawer(p => !p)} style={{
                            flex:1, display:'flex', flexDirection:'column', alignItems:'center',
                            justifyContent:'center', gap:4, background:'transparent', border:'none',
                            color:drawer ? T.accent : T.muted, cursor:'pointer',
                            borderTop: drawer ? `2px solid ${T.accent}` : '2px solid transparent',
                        }}>
                            <span style={{ fontSize:20, lineHeight:1 }}>☰</span>
                            <span style={{ fontSize:10, fontWeight:drawer?700:400 }}>Plus</span>
                        </button>
                    </nav>

                    {/* ── DRAWER "PLUS" ── */}
                    {drawer && (
                        <>
                            {/* Fond semi-transparent */}
                            <div onClick={() => setDrawer(false)} style={{
                                position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:200,
                            }}/>
                            {/* Panneau glissant du bas */}
                            <div style={{
                                position:'fixed', bottom:64, left:0, right:0,
                                background:T.surface, borderTop:`1px solid ${T.border}`,
                                borderRadius:'20px 20px 0 0', zIndex:201,
                                padding:'16px 0 8px',
                                boxShadow:'0 -8px 30px rgba(0,0,0,0.5)',
                            }}>
                                {/* Poignée */}
                                <div style={{ width:40, height:4, background:T.border, borderRadius:99, margin:'0 auto 16px' }}/>

                                {/* Infos utilisateur */}
                                <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px',
                                    marginBottom:8, borderBottom:`1px solid ${T.border}` }}>
                                    <div style={{ width:38, height:38, borderRadius:99, flexShrink:0,
                                        background:`linear-gradient(135deg,${T.info},${T.purple})`,
                                        display:'flex', alignItems:'center', justifyContent:'center',
                                        fontSize:16, fontWeight:700, color:'#fff' }}>
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontSize:14, fontWeight:600, color:T.text, margin:0 }}>{user?.username}</p>
                                        <p style={{ fontSize:12, color:T.muted, margin:0, textTransform:'capitalize' }}>{user?.role}</p>
                                    </div>
                                </div>

                                {/* Items secondaires */}
                                {secondaryMobile.map(item => {
                                    const isActive = path === item.path;
                                    return (
                                        <button key={item.path} onClick={() => goTo(item.path)} style={{
                                            width:'100%', display:'flex', alignItems:'center', gap:14,
                                            padding:'14px 24px', background:isActive ? T.accentDim : 'transparent',
                                            border:'none', color:isActive ? T.accent : T.textSoft,
                                            cursor:'pointer', fontSize:15, fontWeight:isActive?600:400,
                                            textAlign:'left',
                                        }}>
                                            <span style={{ fontSize:20, color:isActive?T.accent:T.muted }}>{item.icon}</span>
                                            {item.label}
                                        </button>
                                    );
                                })}

                                {/* Déconnexion */}
                                <button onClick={handleLogout} style={{
                                    width:'100%', display:'flex', alignItems:'center', gap:14,
                                    padding:'14px 24px', background:'transparent',
                                    border:'none', borderTop:`1px solid ${T.border}`,
                                    color:T.danger, cursor:'pointer', fontSize:15, fontWeight:600,
                                    marginTop:8, textAlign:'left',
                                }}>
                                    <span style={{ fontSize:20 }}>→</span>
                                    Déconnexion
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
