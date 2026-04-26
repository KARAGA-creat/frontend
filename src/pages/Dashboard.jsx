import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { getTransactions } from '../api/transactionsAPI';
import { getAlertes } from '../api/alertesAPI';
import { getBudgets } from '../api/budgetsAPI';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const T = {
    bg:'#020617',surface:'#0F172A',surface2:'#1E293B',border:'#1E293B',
    accent:'#22C55E',accentDim:'rgba(34,197,94,0.12)',danger:'#EF4444',
    warning:'#F59E0B',info:'#3B82F6',purple:'#8B5CF6',
    muted:'#475569',text:'#F8FAFC',textSoft:'#94A3B8',
};

const NAV_ITEMS = [
    { icon:'▦', label:'Dashboard',    path:'/dashboard',    roles:['admin','gestionnaire'] },
    { icon:'⇅', label:'Transactions', path:'/transactions', roles:['admin','gestionnaire'] },
    { icon:'📄', label:'Dettes',      path:'/dettes',       roles:['admin','gestionnaire'] },
    { icon:'◎', label:'Budgets',      path:'/budgets',      roles:['admin','gestionnaire'] },
    { icon:'▲', label:'Rapports',     path:'/rapports',     roles:['admin'] },
    { icon:'◈', label:'Alertes',      path:'/alertes',      roles:['admin','gestionnaire'] },
    { icon:'◇', label:'Tiers',        path:'/tiers',        roles:['admin','gestionnaire'] },
    { icon:'⚙', label:'Paramètres',   path:'/parametres',   roles:['admin'] },
];

function fmt(n){const a=Math.abs(n);if(a>=1e6)return(n/1e6).toFixed(1)+'M';if(a>=1e3)return(n/1e3).toFixed(0)+'k';return n.toFixed(0);}

function buildChartData(transactions){
    const months=['Jan','Fév','Mar','Avr','Mai','Jui','Jul','Aoû','Sep','Oct','Nov','Déc'];
    const now=new Date();const data=[];
    for(let i=5;i>=0;i--){
        const d=new Date(now.getFullYear(),now.getMonth()-i,1);
        const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        const txs=transactions.filter(t=>t.date_transaction?.startsWith(key));
        data.push({
            mois:months[d.getMonth()],
            revenus:txs.filter(t=>t.type==='Entree').reduce((s,t)=>s+parseFloat(t.montant||0),0),
            depenses:txs.filter(t=>t.type==='Sortie').reduce((s,t)=>s+parseFloat(t.montant||0),0),
        });
    }
    return data;
}

function Counter({value}){
    const[v,setV]=useState(0);
    useEffect(()=>{
        let cur=0;const inc=(value/1000)*16;
        const t=setInterval(()=>{cur+=inc;if(cur>=value){setV(value);clearInterval(t);}else setV(cur);},16);
        return()=>clearInterval(t);
    },[value]);
    return<>{fmt(v)}</>;
}

function ChartTip({active,payload,label}){
    if(!active||!payload?.length)return null;
    return(<div style={{background:T.surface2,border:`1px solid ${T.border}`,borderRadius:10,padding:'10px 14px',fontSize:13}}>
        <p style={{color:T.textSoft,marginBottom:6}}>{label}</p>
        {payload.map((p,i)=><p key={i} style={{color:p.color,margin:'2px 0'}}>{p.name}: <b>{fmt(p.value)} XOF</b></p>)}
    </div>);
}

function KpiCard({label,value,color,suffix=''}){
    const[hov,setHov]=useState(false);
    return(
        <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
            background:T.surface,border:`1px solid ${hov?color:T.border}`,borderRadius:14,
            padding:'20px 22px',display:'flex',flexDirection:'column',gap:10,
            transform:hov?'translateY(-2px)':'translateY(0)',transition:'all 0.2s',cursor:'default',
        }}>
            <span style={{fontSize:13,color:T.textSoft,fontWeight:500}}>{label}</span>
            <div style={{fontSize:30,fontWeight:700,color:T.text,letterSpacing:'-0.03em',lineHeight:1}}>
                <Counter value={value}/>{suffix}
                {!suffix&&<span style={{fontSize:13,color:T.textSoft,fontWeight:400,marginLeft:5}}>XOF</span>}
            </div>
            <div style={{height:3,borderRadius:99,background:T.surface2}}>
                <div style={{height:'100%',borderRadius:99,background:`linear-gradient(90deg,${color},${color}66)`,width:'65%',transition:'width 1.2s'}}/>
            </div>
        </div>
    );
}

function BudgetBar({budget}){
    const taux=Math.min((parseFloat(budget.montant_consomme||0)/parseFloat(budget.montant_limite||1))*100,100);
    const color=taux>=100?T.danger:taux>=75?T.warning:T.accent;
    return(
        <div style={{marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:600,color:T.text}}>Budget #{budget.id_categorie||budget.id}</span>
                <span style={{fontSize:13,fontWeight:700,color}}>{taux.toFixed(0)}%</span>
            </div>
            <div style={{height:7,background:T.surface2,borderRadius:99,overflow:'hidden',marginBottom:5}}>
                <div style={{height:'100%',borderRadius:99,background:color,width:`${taux}%`,transition:'width 1s'}}/>
            </div>
            <div style={{fontSize:12,color:T.textSoft}}>
                {parseFloat(budget.montant_consomme||0).toLocaleString()} / {parseFloat(budget.montant_limite||0).toLocaleString()} XOF
            </div>
        </div>
    );
}

function TxRow({tx}){
    const[hov,setHov]=useState(false);
    const isE=tx.type==='Entree';
    return(
        <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
            display:'grid',gridTemplateColumns:'1fr 100px 130px 90px',
            padding:'12px 16px',borderRadius:8,background:hov?T.surface2:'transparent',
            transition:'background 0.15s',cursor:'default',alignItems:'center',
        }}>
            <p style={{fontSize:14,fontWeight:500,color:T.text,margin:0}}>{tx.libelle}</p>
            <span style={{fontSize:12,fontWeight:600,color:isE?T.accent:T.danger}}>{isE?'↑':'↓'} {tx.type}</span>
            <p style={{fontSize:14,fontWeight:700,margin:0,color:isE?T.accent:T.danger}}>
                {isE?'+':'-'}{parseFloat(tx.montant||0).toLocaleString()} XOF
            </p>
            <p style={{fontSize:12,color:T.muted,margin:0}}>{tx.date_transaction}</p>
        </div>
    );
}

function Sidebar({collapsed,onToggle,user,alertesNonLues,onLogout}){
    const navigate=useNavigate();
    const path=window.location.pathname;
    const visible=NAV_ITEMS.filter(i=>!user?.role||i.roles.includes(user.role));
    return(
        <aside style={{width:collapsed?64:230,minHeight:'100vh',background:T.surface,borderRight:`1px solid ${T.border}`,
            display:'flex',flexDirection:'column',transition:'width 0.25s cubic-bezier(.4,0,.2,1)',overflow:'hidden',position:'sticky',top:0,flexShrink:0}}>
            <div style={{padding:'22px 16px 20px',display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:34,height:34,borderRadius:9,flexShrink:0,background:`linear-gradient(135deg,${T.accent},#16A34A)`,
                    display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:17,color:'#000'}}>F</div>
                {!collapsed&&<span style={{fontFamily:"'Calistoga',serif",fontSize:19,color:T.text,letterSpacing:'-0.02em',whiteSpace:'nowrap'}}>
                    Finance<span style={{color:T.accent}}>IQ</span></span>}
            </div>
            <nav style={{flex:1,padding:'4px 8px'}}>
                {visible.map(item=>{
                    const isActive=path===item.path;
                    return(
                        <div key={item.path} onClick={()=>navigate(item.path)} style={{
                            display:'flex',alignItems:'center',gap:12,padding:'10px 10px',borderRadius:9,marginBottom:2,cursor:'pointer',
                            background:isActive?T.accentDim:'transparent',
                            borderLeft:isActive?`2px solid ${T.accent}`:'2px solid transparent',transition:'all 0.15s',
                        }}>
                            <span style={{fontSize:16,color:isActive?T.accent:T.muted,flexShrink:0,lineHeight:1}}>{item.icon}</span>
                            {!collapsed&&<span style={{fontSize:14,fontWeight:isActive?600:400,color:isActive?T.text:T.textSoft,whiteSpace:'nowrap'}}>{item.label}</span>}
                            {item.path==='/alertes'&&alertesNonLues>0&&(
                                <span style={{marginLeft:'auto',background:T.danger,color:'#fff',fontSize:10,fontWeight:700,padding:'2px 6px',borderRadius:99,flexShrink:0}}>{alertesNonLues}</span>
                            )}
                        </div>
                    );
                })}
            </nav>
            <div style={{padding:'12px 10px',borderTop:`1px solid ${T.border}`}}>
                {!collapsed&&(
                    <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px',marginBottom:8,borderRadius:9,background:T.surface2}}>
                        <div style={{width:30,height:30,borderRadius:99,flexShrink:0,background:`linear-gradient(135deg,${T.info},${T.purple})`,
                            display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#fff'}}>
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p style={{fontSize:13,fontWeight:600,color:T.text,margin:0}}>{user?.username}</p>
                            <p style={{fontSize:11,color:T.muted,margin:0,textTransform:'capitalize'}}>{user?.role}</p>
                        </div>
                    </div>
                )}
                <button onClick={onLogout} style={{width:'100%',padding:'8px',borderRadius:8,border:`1px solid rgba(239,68,68,0.25)`,
                    background:'rgba(239,68,68,0.08)',color:T.danger,cursor:'pointer',fontSize:13,fontWeight:600,marginBottom:8,fontFamily:'inherit'}}>
                    {collapsed?'×':'Déconnexion'}
                </button>
                <button onClick={onToggle} style={{width:'100%',padding:'7px',borderRadius:8,border:'none',
                    background:T.surface2,color:T.muted,cursor:'pointer',fontSize:13,fontFamily:'inherit'}}>
                    {collapsed?'→':'← Réduire'}
                </button>
            </div>
        </aside>
    );
}

export default function Dashboard(){
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const{user}=useSelector(s=>s.auth);
    const[transactions,setTransactions]=useState([]);
    const[alertes,setAlertes]=useState([]);
    const[budgets,setBudgets]=useState([]);
    const[loading,setLoading]=useState(true);
    const[collapsed,setCollapsed]=useState(false);
    const[period,setPeriod]=useState('6M');

    useEffect(()=>{
        (async()=>{
            try{
                const[t,a,b]=await Promise.all([getTransactions(),getAlertes(),getBudgets()]);
                setTransactions(t);setAlertes(a);setBudgets(b);
            }catch(e){console.error(e);}finally{setLoading(false);}
        })();
    },[]);

    const handleLogout=()=>{dispatch(logout());navigate('/login');};

    const totalEntrees=transactions.filter(t=>t.type==='Entree').reduce((s,t)=>s+parseFloat(t.montant||0),0);
    const totalSorties=transactions.filter(t=>t.type==='Sortie').reduce((s,t)=>s+parseFloat(t.montant||0),0);
    const solde=totalEntrees-totalSorties;
    const alertesNonLues=alertes.filter(a=>a.statut==='non_lue').length;
    const taux=totalEntrees>0?Math.abs((solde/totalEntrees)*100):0;
    const chartData=buildChartData(transactions);
    const total=totalEntrees+totalSorties||1;
    const pieData=[
        {name:'Entrées',value:Math.round((totalEntrees/total)*100),color:T.accent},
        {name:'Sorties',value:Math.round((totalSorties/total)*100),color:T.danger},
    ];

    if(loading)return(
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:T.bg,color:T.textSoft,fontSize:16,gap:12,flexDirection:'column'}}>
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
            <div style={{width:36,height:36,borderRadius:99,border:`3px solid ${T.surface2}`,borderTop:`3px solid ${T.accent}`,animation:'spin 0.8s linear infinite'}}/>
            Chargement…
        </div>
    );

    return(
        <div style={{display:'flex',minHeight:'100vh',background:T.bg,fontFamily:"'Inter',sans-serif",color:T.text}}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Calistoga&family=Inter:wght@300;400;500;600;700&display=swap');
                *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
                body{background:${T.bg};}
                ::-webkit-scrollbar{width:5px;}
                ::-webkit-scrollbar-thumb{background:${T.surface2};border-radius:4px;}
                button{font-family:inherit;}
            `}</style>

            <Sidebar collapsed={collapsed} onToggle={()=>setCollapsed(p=>!p)} user={user} alertesNonLues={alertesNonLues} onLogout={handleLogout}/>

            <main style={{flex:1,padding:'28px 32px',overflowY:'auto',minWidth:0}}>

                {/* HEADER */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:30}}>
                    <div>
                        <h1 style={{fontFamily:"'Calistoga',serif",fontSize:26,fontWeight:400,letterSpacing:'-0.02em'}}>Tableau de bord</h1>
                        <p style={{color:T.textSoft,fontSize:13,marginTop:4}}>Aperçu financier · {transactions.length} transaction{transactions.length>1?'s':''}</p>
                    </div>
                    <div style={{display:'flex',gap:8}}>
                        {['1M','3M','6M','1A'].map(p=>(
                            <button key={p} onClick={()=>setPeriod(p)} style={{
                                padding:'7px 14px',borderRadius:8,
                                border:period===p?'none':`1px solid ${T.border}`,
                                background:period===p?T.accent:'transparent',
                                color:period===p?'#000':T.textSoft,
                                fontWeight:period===p?700:400,cursor:'pointer',fontSize:13,transition:'all 0.15s',
                            }}>{p}</button>
                        ))}
                    </div>
                </div>

                {/* KPIs */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
                    <KpiCard label="Solde actuel"  value={Math.abs(solde)}  color={solde>=0?T.accent:T.danger}/>
                    <KpiCard label="Total Entrées" value={totalEntrees}      color={T.accent}/>
                    <KpiCard label="Total Sorties" value={totalSorties}      color={T.danger}/>
                    <KpiCard label="Taux de marge" value={taux}              color={T.info} suffix="%"/>
                </div>

                {/* CHARTS */}
                <div style={{display:'grid',gridTemplateColumns:'1.8fr 1fr',gap:14,marginBottom:24}}>
                    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:'22px 24px'}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
                            <div>
                                <h2 style={{fontSize:15,fontWeight:600}}>Entrées vs Sorties</h2>
                                <p style={{fontSize:12,color:T.textSoft,marginTop:3}}>6 derniers mois · XOF</p>
                            </div>
                            <div style={{display:'flex',gap:14}}>
                                {[['Entrées',T.accent],['Sorties',T.danger]].map(([l,c])=>(
                                    <div key={l} style={{display:'flex',alignItems:'center',gap:6}}>
                                        <div style={{width:8,height:8,borderRadius:99,background:c}}/>
                                        <span style={{fontSize:12,color:T.textSoft}}>{l}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={chartData} margin={{top:4,right:4,left:0,bottom:0}}>
                                <defs>
                                    <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={T.accent} stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor={T.accent} stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={T.danger} stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor={T.danger} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false}/>
                                <XAxis dataKey="mois" tick={{fill:T.muted,fontSize:12}} axisLine={false} tickLine={false}/>
                                <YAxis tickFormatter={v=>fmt(v)} tick={{fill:T.muted,fontSize:11}} axisLine={false} tickLine={false} width={52}/>
                                <Tooltip content={<ChartTip/>}/>
                                <Area type="monotone" dataKey="revenus"  name="Entrées" stroke={T.accent} strokeWidth={2.5} fill="url(#gR)" dot={false} activeDot={{r:5,fill:T.accent}}/>
                                <Area type="monotone" dataKey="depenses" name="Sorties" stroke={T.danger} strokeWidth={2.5} fill="url(#gD)" dot={false} activeDot={{r:5,fill:T.danger}}/>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:'22px 24px'}}>
                        <h2 style={{fontSize:15,fontWeight:600,marginBottom:4}}>Répartition flux</h2>
                        <p style={{fontSize:12,color:T.textSoft,marginBottom:12}}>Entrées vs Sorties globales</p>
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={4} strokeWidth={0}>
                                    {pieData.map((c,i)=><Cell key={i} fill={c.color}/>)}
                                </Pie>
                                <Tooltip formatter={v=>`${v}%`} contentStyle={{background:T.surface2,border:`1px solid ${T.border}`,borderRadius:8,fontSize:12}}/>
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:8}}>
                            {pieData.map(c=>(
                                <div key={c.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                                        <div style={{width:8,height:8,borderRadius:2,background:c.color}}/>
                                        <span style={{fontSize:13,color:T.textSoft}}>{c.name}</span>
                                    </div>
                                    <span style={{fontSize:13,fontWeight:700,color:T.text}}>{c.value}%</span>
                                </div>
                            ))}
                            <div style={{paddingTop:8,borderTop:`1px solid ${T.border}`}}>
                                <div style={{display:'flex',justifyContent:'space-between'}}>
                                    <span style={{fontSize:12,color:T.textSoft}}>Alertes non lues</span>
                                    <span style={{fontSize:12,fontWeight:700,color:alertesNonLues>0?T.warning:T.accent}}>{alertesNonLues}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TRANSACTIONS + BUDGETS */}
                <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:14}}>

                    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,overflow:'hidden'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 20px 14px'}}>
                            <div>
                                <h2 style={{fontSize:15,fontWeight:600}}>Transactions récentes</h2>
                                <p style={{fontSize:12,color:T.textSoft,marginTop:3}}>5 dernières opérations</p>
                            </div>
                            <button onClick={()=>navigate('/transactions')}
                                onMouseEnter={e=>{e.target.style.borderColor=T.accent;e.target.style.color=T.accent;}}
                                onMouseLeave={e=>{e.target.style.borderColor=T.border;e.target.style.color=T.textSoft;}}
                                style={{padding:'7px 14px',borderRadius:8,border:`1px solid ${T.border}`,background:'transparent',color:T.textSoft,cursor:'pointer',fontSize:12,fontWeight:500,transition:'all 0.15s'}}>
                                Voir tout →
                            </button>
                        </div>
                        <div style={{borderTop:`1px solid ${T.border}`}}>
                            <div style={{display:'grid',gridTemplateColumns:'1fr 100px 130px 90px',padding:'8px 16px 10px'}}>
                                {['Libellé','Type','Montant','Date'].map(h=>(
                                    <span key={h} style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:'uppercase',letterSpacing:'0.07em'}}>{h}</span>
                                ))}
                            </div>
                            <div style={{padding:'4px 4px 10px'}}>
                                {transactions.length===0
                                    ?<p style={{textAlign:'center',color:T.muted,fontSize:14,padding:'20px'}}>Aucune transaction</p>
                                    :transactions.slice(0,5).map((tx,i)=><TxRow key={tx.id||i} tx={tx}/>)
                                }
                            </div>
                        </div>
                    </div>

                    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:'22px 24px'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                            <div>
                                <h2 style={{fontSize:15,fontWeight:600}}>Suivi des budgets</h2>
                                <p style={{fontSize:12,color:T.textSoft,marginTop:3}}>{budgets.length} budget{budgets.length>1?'s':''} actif{budgets.length>1?'s':''}</p>
                            </div>
                            <button onClick={()=>navigate('/budgets')}
                                onMouseEnter={e=>{e.target.style.borderColor=T.accent;e.target.style.color=T.accent;}}
                                onMouseLeave={e=>{e.target.style.borderColor=T.border;e.target.style.color=T.textSoft;}}
                                style={{padding:'7px 14px',borderRadius:8,border:`1px solid ${T.border}`,background:'transparent',color:T.textSoft,cursor:'pointer',fontSize:12,fontWeight:500,transition:'all 0.15s'}}>
                                Gérer →
                            </button>
                        </div>
                        {budgets.length===0
                            ?<p style={{color:T.muted,fontSize:14,textAlign:'center',padding:'20px 0'}}>Aucun budget défini</p>
                            :budgets.slice(0,4).map((b,i)=><BudgetBar key={b.id||i} budget={b}/>)
                        }
                    </div>
                </div>

                <p style={{textAlign:'center',fontSize:11,color:T.muted,marginTop:32,paddingBottom:8}}>
                    FinanceIQ · © 2025 · Franc CFA (XOF)
                </p>
            </main>
        </div>
    );
}
