import { useEffect, useState } from 'react';
import { getTiers, createTiers, updateTiers, deleteTiers } from '../api/tiersAPI';
import Layout, { T, useIsMobile } from '../components/Layout';

export default function Tiers() {
    const isMobile = useIsMobile();
    const [tiers, setTiers]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [search, setSearch]     = useState('');
    const [typeFiltre, setTypeFiltre] = useState('');
    const [form, setForm] = useState({ nom:'', type:'Client', email:'', telephone:'', adresse:'' });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const t = await getTiers();
            setTiers(Array.isArray(t) ? t : (t.results || []));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editItem) await updateTiers(editItem.id, form);
            else await createTiers(form);
            setShowForm(false);
            setEditItem(null);
            setForm({ nom:'', type:'Client', email:'', telephone:'', adresse:'' });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleEdit = (t) => {
        setEditItem(t);
        setForm({ nom:t.nom, type:t.type, email:t.email||'', telephone:t.telephone||'', adresse:t.adresse||'' });
        setShowForm(true);
        window.scrollTo({ top:0, behavior:'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce tiers ?')) { await deleteTiers(id); fetchData(); }
    };

    const filtered = tiers
        .filter(t => !typeFiltre || t.type === typeFiltre)
        .filter(t => !search || t.nom.toLowerCase().includes(search.toLowerCase()) || (t.email||'').toLowerCase().includes(search.toLowerCase()));

    const clients      = tiers.filter(t => t.type === 'Client').length;
    const fournisseurs = tiers.filter(t => t.type === 'Fournisseur').length;

    const inp  = { padding:'9px 12px', background:T.surface2, border:`1px solid ${T.border}`, borderRadius:8, color:T.text, fontSize:13, outline:'none', width:'100%' };
    const btn  = { padding:'9px 18px', background:`linear-gradient(135deg,${T.accent},#16A34A)`, border:'none', borderRadius:9, color:'#000', fontSize:13, fontWeight:700, cursor:'pointer' };
    const btnG = { padding:'9px 18px', background:T.surface2, border:`1px solid ${T.border}`, borderRadius:9, color:T.textSoft, fontSize:13, fontWeight:600, cursor:'pointer' };

    if (loading) return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:T.bg, color:T.textSoft, flexDirection:'column', gap:12 }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
            <div style={{ width:36, height:36, borderRadius:99, border:`3px solid ${T.surface2}`, borderTop:`3px solid ${T.accent}`, animation:'spin 0.8s linear infinite' }}/>
            Chargement…
        </div>
    );

    return (
        <Layout>
            <div style={{ padding: isMobile ? '16px' : '28px 32px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                    <div>
                        <h1 style={{ fontFamily:"'Calistoga',serif", fontSize:isMobile?20:24, fontWeight:400, color:T.text }}>Tiers</h1>
                        <p style={{ color:T.textSoft, fontSize:13, marginTop:4 }}>{clients} client{clients>1?'s':''} · {fournisseurs} fournisseur{fournisseurs>1?'s':''}</p>
                    </div>
                    <button style={btn} onClick={() => { setEditItem(null); setForm({ nom:'', type:'Client', email:'', telephone:'', adresse:'' }); setShowForm(p => !p); }}>
                        {isMobile ? '＋' : '＋ Nouveau Tiers'}
                    </button>
                </div>

                {/* KPI */}
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr 1fr' : '1fr 1fr 1fr', gap:14, marginBottom:20 }}>
                    {[
                        { label:'Total', val:tiers.length, color:T.info },
                        { label:'Clients', val:clients, color:T.accent },
                        { label:'Fournisseurs', val:fournisseurs, color:T.info },
                    ].map(k => (
                        <div key={k.label} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:'16px 18px' }}>
                            <p style={{ fontSize:11, color:T.textSoft, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>{k.label}</p>
                            <p style={{ fontSize:26, fontWeight:700, color:k.color }}>{k.val}</p>
                        </div>
                    ))}
                </div>

                {/* FORMULAIRE */}
                {showForm && (
                    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'22px 24px', marginBottom:20 }}>
                        <h2 style={{ fontSize:15, fontWeight:700, color:T.text, marginBottom:18 }}>{editItem ? '✏ Modifier Tiers' : '＋ Nouveau Tiers'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:14, marginBottom:14 }}>
                                <div><label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Nom *</label>
                                    <input style={inp} type="text" required value={form.nom} onChange={e => setForm(p => ({...p, nom:e.target.value}))}/></div>
                                <div><label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Type</label>
                                    <select style={inp} value={form.type} onChange={e => setForm(p => ({...p, type:e.target.value}))}>
                                        <option value="Client">Client</option>
                                        <option value="Fournisseur">Fournisseur</option>
                                    </select></div>
                                <div><label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Email</label>
                                    <input style={inp} type="email" value={form.email} onChange={e => setForm(p => ({...p, email:e.target.value}))}/></div>
                                <div><label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Téléphone</label>
                                    <input style={inp} type="text" value={form.telephone} onChange={e => setForm(p => ({...p, telephone:e.target.value}))}/></div>
                                <div style={{ gridColumn:'1 / -1' }}><label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Adresse</label>
                                    <input style={inp} type="text" value={form.adresse} onChange={e => setForm(p => ({...p, adresse:e.target.value}))}/></div>
                            </div>
                            <div style={{ display:'flex', gap:10 }}>
                                <button type="submit" style={btn}>{editItem ? 'Enregistrer les modifications' : 'Créer le tiers'}</button>
                                <button type="button" style={btnG} onClick={() => { setShowForm(false); setEditItem(null); }}>Annuler</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* RECHERCHE & FILTRE */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:20, alignItems:'center' }}>
                    <input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
                        style={{ ...inp, width: isMobile ? '100%' : 260, background:T.surface, border:`1px solid ${T.border}` }}/>
                    {['', 'Client', 'Fournisseur'].map(v => (
                        <button key={v} onClick={() => setTypeFiltre(v)} style={{ padding:'7px 14px', borderRadius:8, border:`1px solid ${typeFiltre===v?T.accent:T.border}`, background:typeFiltre===v?T.accentDim:'transparent', color:typeFiltre===v?T.accent:T.textSoft, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                            {v || 'Tous'}
                        </button>
                    ))}
                </div>

                {/* GRILLE */}
                {filtered.length === 0
                    ? <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'40px', textAlign:'center', color:T.muted }}>Aucun tiers trouvé.</div>
                    : <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:16 }}>
                        {filtered.map(t => (
                            <div key={t.id} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'18px 20px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                                    <div style={{ width:42, height:42, borderRadius:'50%', background:`linear-gradient(135deg,${T.accent},#16A34A)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, fontWeight:700, color:'#000', flexShrink:0 }}>
                                        {t.nom.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontSize:14, fontWeight:700, color:T.text }}>{t.nom}</p>
                                        <span style={{ padding:'2px 8px', borderRadius:6, fontSize:11, fontWeight:700, background:t.type==='Client'?'rgba(34,197,94,0.1)':'rgba(59,130,246,0.1)', color:t.type==='Client'?T.accent:T.info }}>
                                            {t.type}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ fontSize:12, color:T.muted, marginBottom:4 }}>{t.email && `📧 ${t.email}`}</div>
                                <div style={{ fontSize:12, color:T.muted, marginBottom:4 }}>{t.telephone && `📞 ${t.telephone}`}</div>
                                <div style={{ fontSize:12, color:T.muted, marginBottom:12 }}>{t.adresse && `📍 ${t.adresse}`}</div>
                                <div style={{ display:'flex', gap:8, paddingTop:12, borderTop:`1px solid ${T.border}` }}>
                                    <button onClick={() => handleEdit(t)} style={{ flex:1, padding:'7px', background:`rgba(59,130,246,0.1)`, border:`1px solid rgba(59,130,246,0.2)`, borderRadius:7, color:T.info, fontSize:12, fontWeight:700, cursor:'pointer' }}>✏ Modifier</button>
                                    <button onClick={() => handleDelete(t.id)} style={{ padding:'7px 12px', background:`rgba(239,68,68,0.1)`, border:`1px solid rgba(239,68,68,0.2)`, borderRadius:7, color:T.danger, fontSize:12, fontWeight:700, cursor:'pointer' }}>🗑</button>
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </div>
        </Layout>
    );
}
