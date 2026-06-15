import { useEffect, useState } from 'react';
import { getBudgets, createBudget } from '../api/budgetsAPI';
import { getCategories } from '../api/categoriesAPI';
import { getAlertes, marquerLue } from '../api/alertesAPI';
import Layout, { T, useIsMobile } from '../components/Layout';

export default function Budgets() {
    const isMobile = useIsMobile();
    const [budgets, setBudgets]       = useState([]);
    const [categories, setCategories] = useState([]);
    const [alertes, setAlertes]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [showForm, setShowForm]     = useState(false);
    const [form, setForm] = useState({ montant_limite:'', date_debut:'', date_fin:'', id_categorie:'' });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [b, c, a] = await Promise.all([getBudgets(), getCategories(), getAlertes()]);
            setBudgets(Array.isArray(b) ? b : (b.results || []));
            setCategories(c);
            setAlertes(Array.isArray(a) ? a : (a.results || []));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createBudget(form);
            setShowForm(false);
            setForm({ montant_limite:'', date_debut:'', date_fin:'', id_categorie:'' });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleMarquerLue = async (id) => { await marquerLue(id); fetchData(); };

    const getCatNom = (id) => categories.find(c => c.id === id || c.id === parseInt(id))?.nom_categorie || `#${id}`;
    const getColor  = (t) => t >= 100 ? T.danger : t >= 75 ? T.warning : T.accent;
    const nonLues   = alertes.filter(a => a.statut === 'non_lue').length;

    const inp = { padding:'9px 12px', background:T.surface2, border:`1px solid ${T.border}`, borderRadius:8, color:T.text, fontSize:13, outline:'none', width:'100%' };
    const btn = { padding:'9px 18px', background:`linear-gradient(135deg,${T.accent},#16A34A)`, border:'none', borderRadius:9, color:'#000', fontSize:13, fontWeight:700, cursor:'pointer' };
    const btnG = { padding:'9px 18px', background:T.surface2, border:`1px solid ${T.border}`, borderRadius:9, color:T.textSoft, fontSize:13, fontWeight:600, cursor:'pointer' };

    if (loading) return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:T.bg, color:T.textSoft, flexDirection:'column', gap:12 }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
            <div style={{ width:36, height:36, borderRadius:99, border:`3px solid ${T.surface2}`, borderTop:`3px solid ${T.accent}`, animation:'spin 0.8s linear infinite' }}/>
            Chargement…
        </div>
    );

    return (
        <Layout alertesNonLues={nonLues}>
            <div style={{ padding: isMobile ? '16px' : '28px 32px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                    <div>
                        <h1 style={{ fontFamily:"'Calistoga',serif", fontSize:isMobile?20:24, fontWeight:400, color:T.text }}>Budgets</h1>
                        <p style={{ color:T.textSoft, fontSize:13, marginTop:4 }}>{budgets.length} budget{budgets.length>1?'s':''} · {nonLues} alerte{nonLues>1?'s':''} non lue{nonLues>1?'s':''}</p>
                    </div>
                    <button style={btn} onClick={() => setShowForm(p => !p)}>＋ Nouveau Budget</button>
                </div>

                {showForm && (
                    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'22px 24px', marginBottom:20 }}>
                        <h2 style={{ fontSize:15, fontWeight:700, color:T.text, marginBottom:18 }}>Nouveau Budget</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap:14, marginBottom:14 }}>
                                <div><label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Catégorie</label>
                                    <select style={inp} required value={form.id_categorie} onChange={e => setForm(p => ({...p, id_categorie:e.target.value}))}>
                                        <option value="">Choisir...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.nom_categorie}</option>)}
                                    </select></div>
                                <div><label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Montant limite (XOF)</label>
                                    <input style={inp} type="number" min="0" required value={form.montant_limite} onChange={e => setForm(p => ({...p, montant_limite:e.target.value}))}/></div>
                                <div><label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Date début</label>
                                    <input style={inp} type="date" required value={form.date_debut} onChange={e => setForm(p => ({...p, date_debut:e.target.value}))}/></div>
                                <div><label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Date fin</label>
                                    <input style={inp} type="date" required value={form.date_fin} onChange={e => setForm(p => ({...p, date_fin:e.target.value}))}/></div>
                            </div>
                            <div style={{ display:'flex', gap:10 }}>
                                <button type="submit" style={btn}>Enregistrer</button>
                                <button type="button" style={btnG} onClick={() => setShowForm(false)}>Annuler</button>
                            </div>
                        </form>
                    </div>
                )}

                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap:20 }}>
                    {/* BUDGETS */}
                    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'22px 24px' }}>
                        <h2 style={{ fontSize:15, fontWeight:600, color:T.text, marginBottom:20 }}>Suivi des budgets ({budgets.length})</h2>
                        {budgets.length === 0
                            ? <p style={{ color:T.muted, textAlign:'center', padding:'30px 0' }}>Aucun budget défini</p>
                            : budgets.map(b => {
                                const taux = Math.min((parseFloat(b.montant_consomme||0)/parseFloat(b.montant_limite||1))*100, 100);
                                const color = getColor(taux);
                                return (
                                    <div key={b.id} style={{ marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${T.border}` }}>
                                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                                            <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{getCatNom(b.id_categorie)}</span>
                                            <span style={{ fontSize:13, fontWeight:700, color, fontFamily:'monospace' }}>{taux.toFixed(0)}%</span>
                                        </div>
                                        <div style={{ height:7, background:T.surface2, borderRadius:99, overflow:'hidden', marginBottom:6 }}>
                                            <div style={{ height:'100%', borderRadius:99, background:color, width:`${taux}%`, transition:'width 1s' }}/>
                                        </div>
                                        <div style={{ display:'flex', justifyContent:'space-between' }}>
                                            <span style={{ fontSize:12, color:T.muted }}>{parseFloat(b.montant_consomme||0).toLocaleString('fr-FR')} / {parseFloat(b.montant_limite).toLocaleString('fr-FR')} XOF</span>
                                            <span style={{ fontSize:11, color:T.muted }}>{b.date_debut} → {b.date_fin}</span>
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>

                    {/* ALERTES */}
                    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'22px 24px' }}>
                        <h2 style={{ fontSize:15, fontWeight:600, color:T.text, marginBottom:20 }}>
                            Alertes <span style={{ fontSize:12, color:nonLues>0?T.danger:T.muted }}>({nonLues} non lues)</span>
                        </h2>
                        {alertes.length === 0
                            ? <p style={{ color:T.muted, textAlign:'center', padding:'30px 0' }}>🎉 Aucune alerte</p>
                            : alertes.slice(0,6).map(a => {
                                const icone = a.type_alerte==='depassement_budget'?'🚨':a.type_alerte==='baisse_tresorerie'?'📉':'🔔';
                                const border = a.type_alerte==='depassement_budget'?`rgba(239,68,68,0.3)`:a.type_alerte==='baisse_tresorerie'?`rgba(245,158,11,0.3)`:`rgba(59,130,246,0.3)`;
                                return (
                                    <div key={a.id} style={{ display:'flex', gap:10, padding:'12px', borderRadius:10, border:`1px solid ${border}`, marginBottom:8, opacity:a.statut==='lue'?0.5:1, background:'rgba(255,255,255,0.02)' }}>
                                        <span style={{ fontSize:18, flexShrink:0 }}>{icone}</span>
                                        <div style={{ flex:1, minWidth:0 }}>
                                            <p style={{ fontSize:12, color:T.text, marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.message.split('\n')[0]}</p>
                                            <p style={{ fontSize:11, color:T.muted }}>{new Date(a.date_emission).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                        {a.statut === 'non_lue' && (
                                            <button onClick={() => handleMarquerLue(a.id)} style={{ padding:'4px 10px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:6, color:T.accent, fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0 }}>✓ Lu</button>
                                        )}
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        </Layout>
    );
}
