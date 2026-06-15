import { useEffect, useState } from 'react';
import { getAlertes, marquerLue } from '../api/alertesAPI';
import Layout, { T, useIsMobile } from '../components/Layout';

const TYPE_CONFIG = {
    depassement_budget: { icone:'🚨', color:'rgba(239,68,68,0.15)', border:'rgba(239,68,68,0.3)', label:'Budget dépassé' },
    baisse_tresorerie:  { icone:'📉', color:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.3)', label:'Trésorerie' },
    echeance_dette:     { icone:'📅', color:'rgba(59,130,246,0.1)',  border:'rgba(59,130,246,0.3)', label:'Échéance' },
    anomalie:           { icone:'🔔', color:'rgba(139,92,246,0.1)', border:'rgba(139,92,246,0.3)', label:'Anomalie' },
};

export default function Alertes() {
    const isMobile = useIsMobile();
    const [alertes, setAlertes]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [filtre, setFiltre]     = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const a = await getAlertes();
            setAlertes(Array.isArray(a) ? a : (a.results || []));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleMarquerLue = async (id) => { await marquerLue(id); fetchData(); };

    const handleToutMarquerLu = async () => {
        for (const a of alertes.filter(a => a.statut === 'non_lue')) await marquerLue(a.id);
        fetchData();
    };

    const nonLues = alertes.filter(a => a.statut === 'non_lue').length;
    const filtered = filtre ? alertes.filter(a => a.type_alerte === filtre) : alertes;

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
                        <h1 style={{ fontFamily:"'Calistoga',serif", fontSize:isMobile?20:24, fontWeight:400, color:T.text }}>Alertes</h1>
                        <p style={{ color:T.textSoft, fontSize:13, marginTop:4 }}>
                            {nonLues > 0
                                ? <span style={{ color:T.danger, fontWeight:600 }}>{nonLues} alerte{nonLues>1?'s':''} non lue{nonLues>1?'s':''}</span>
                                : 'Tout est à jour ✓'
                            }
                        </p>
                    </div>
                    {nonLues > 0 && (
                        <button onClick={handleToutMarquerLu} style={{ padding:'9px 18px', background:T.surface2, border:`1px solid ${T.border}`, borderRadius:9, color:T.accent, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                            ✓ Tout marquer lu
                        </button>
                    )}
                </div>

                {/* FILTRES */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                    {[['', 'Toutes'], ['depassement_budget','Budget'], ['baisse_tresorerie','Trésorerie'], ['echeance_dette','Échéances']].map(([val, label]) => (
                        <button key={val} onClick={() => setFiltre(val)} style={{ padding:'7px 14px', borderRadius:8, border:`1px solid ${filtre===val?T.accent:T.border}`, background:filtre===val?T.accentDim:'transparent', color:filtre===val?T.accent:T.textSoft, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                            {label}
                        </button>
                    ))}
                </div>

                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, overflow:'hidden' }}>
                    <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.border}` }}>
                        <span style={{ fontSize:14, fontWeight:600, color:T.text }}>Liste des alertes</span>
                        <span style={{ marginLeft:10, fontSize:12, color:T.muted }}>({filtered.length})</span>
                    </div>

                    {filtered.length === 0
                        ? <p style={{ textAlign:'center', color:T.muted, padding:'40px', fontSize:14 }}>🎉 Aucune alerte ici</p>
                        : <div style={{ padding:'8px 12px' }}>
                            {filtered.map(a => {
                                const cfg = TYPE_CONFIG[a.type_alerte] || TYPE_CONFIG.anomalie;
                                return (
                                    <div key={a.id} style={{ display:'flex', flexWrap: isMobile ? 'wrap' : 'nowrap', gap:14, padding:'14px', borderRadius:12, background:cfg.color, border:`1px solid ${cfg.border}`, marginBottom:10, opacity:a.statut==='lue'?0.55:1 }}>
                                        <span style={{ fontSize:26, flexShrink:0 }}>{cfg.icone}</span>
                                        <div style={{ flex:1, minWidth:0 }}>
                                            <div style={{ display:'flex', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                                                <span style={{ fontSize:10, fontWeight:700, background:'rgba(255,255,255,0.08)', color:T.textSoft, padding:'2px 8px', borderRadius:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>{cfg.label}</span>
                                                <span style={{ fontSize:10, color:T.muted }}>{new Date(a.date_emission).toLocaleString('fr-FR')}</span>
                                            </div>
                                            <pre style={{ fontSize:12, color:T.text, whiteSpace:'pre-wrap', fontFamily:'inherit', margin:0, lineHeight:1.6 }}>{a.message}</pre>
                                        </div>
                                        <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end', flexShrink:0 }}>
                                            <span style={{ padding:'3px 10px', borderRadius:6, fontSize:11, fontWeight:700, background:a.statut==='lue'?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', color:a.statut==='lue'?T.accent:T.danger }}>
                                                {a.statut === 'lue' ? '✓ Lue' : '● Non lue'}
                                            </span>
                                            {a.statut === 'non_lue' && (
                                                <button onClick={() => handleMarquerLue(a.id)} style={{ padding:'5px 12px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:6, color:T.accent, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                                                    Marquer lu
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    }
                </div>
            </div>
        </Layout>
    );
}
