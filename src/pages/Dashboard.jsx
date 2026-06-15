import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Layout, { T, useIsMobile } from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function fmt(n) {
    const a = Math.abs(n);
    if (a >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (a >= 1e3) return (n / 1e3).toFixed(0) + 'k';
    return n.toFixed(0);
}

function fmtFull(n) {
    return Math.abs(n).toLocaleString('fr-FR');
}

function Counter({ value }) {
    const [v, setV] = useState(0);
    useEffect(() => {
        let cur = 0;
        const inc = (value / 1000) * 16;
        const t = setInterval(() => {
            cur += inc;
            if (cur >= value) { setV(value); clearInterval(t); }
            else setV(cur);
        }, 16);
        return () => clearInterval(t);
    }, [value]);
    return <>{fmtFull(v)}</>;
}

const JOURS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MOIS_LONG = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

function dateAujourdhui() {
    const d = new Date();
    return `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

function PrevisionCard({ prevision, isMobile }) {
    const { solde_actuel, solde_prevu_30j, flux_journalier, a_recevoir_30j, a_payer_30j, tendance, nb_dettes_echeance } = prevision;
    const gain     = solde_prevu_30j - solde_actuel;
    const enHausse = tendance === 'hausse';
    const enBaisse = tendance === 'baisse';
    const couleur  = enHausse ? T.accent : enBaisse ? T.danger : T.warning;
    const fleche   = enHausse ? '↗' : enBaisse ? '↘' : '→';

    return (
        <div style={{ background:T.surface, border:`1px solid ${couleur}44`, borderRadius:14, padding:'18px 20px', position:'relative', overflow:'hidden' }}>
            {/* Fond dégradé subtil */}
            <div style={{ position:'absolute', bottom:-20, right:-20, width:100, height:100, borderRadius:'50%', background:`radial-gradient(circle, ${couleur}12 0%, transparent 70%)`, pointerEvents:'none' }}/>

            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14, gap:12 }}>
                <div>
                    <p style={{ fontSize:11, fontWeight:700, color:T.textSoft, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>
                        Prévision à 30 jours
                    </p>
                    <p style={{ fontSize:12, color:T.muted }}>Basé sur vos 90 derniers jours d'activité</p>
                </div>
                <span style={{ fontSize:24, lineHeight:1 }}>{fleche}</span>
            </div>

            {/* Solde actuel → Solde prévu */}
            <div style={{ display:'flex', alignItems:'center', gap: isMobile ? 10 : 20, marginBottom:16, flexWrap:'wrap' }}>
                <div style={{ textAlign:'center' }}>
                    <p style={{ fontSize:10, color:T.muted, marginBottom:3, textTransform:'uppercase', letterSpacing:'0.05em' }}>Aujourd'hui</p>
                    <p style={{ fontSize: isMobile ? 18 : 22, fontWeight:700, color:T.textSoft, fontFamily:'monospace' }}>
                        {fmtFull(solde_actuel)} <span style={{ fontSize:11, fontWeight:400 }}>XOF</span>
                    </p>
                </div>

                {/* Flèche de transition */}
                <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', minWidth:60 }}>
                    <div style={{ height:2, width:'100%', background:`linear-gradient(90deg, ${T.surface2}, ${couleur}, ${T.surface2})`, marginBottom:4 }}/>
                    <span style={{ fontSize:10, color:couleur, fontWeight:700 }}>
                        {gain >= 0 ? '+' : ''}{fmtFull(Math.round(gain))} XOF
                    </span>
                </div>

                <div style={{ textAlign:'center' }}>
                    <p style={{ fontSize:10, color:T.muted, marginBottom:3, textTransform:'uppercase', letterSpacing:'0.05em' }}>Dans 30 jours</p>
                    <p style={{ fontSize: isMobile ? 22 : 28, fontWeight:800, color:couleur, fontFamily:'monospace' }}>
                        {fmtFull(solde_prevu_30j)} <span style={{ fontSize:12, fontWeight:400 }}>XOF</span>
                    </p>
                </div>
            </div>

            {/* Détails complémentaires */}
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:8 }}>
                <div style={{ background:T.surface2, borderRadius:9, padding:'9px 12px' }}>
                    <p style={{ fontSize:10, color:T.muted, marginBottom:3 }}>Flux quotidien moyen</p>
                    <p style={{ fontSize:13, fontWeight:700, color: flux_journalier >= 0 ? T.accent : T.danger }}>
                        {flux_journalier >= 0 ? '+' : ''}{fmtFull(Math.round(flux_journalier))} XOF/jour
                    </p>
                </div>
                {nb_dettes_echeance > 0 && (
                    <>
                        <div style={{ background:T.surface2, borderRadius:9, padding:'9px 12px' }}>
                            <p style={{ fontSize:10, color:T.muted, marginBottom:3 }}>À recevoir (dettes clients)</p>
                            <p style={{ fontSize:13, fontWeight:700, color:T.accent }}>+{fmtFull(Math.round(a_recevoir_30j))} XOF</p>
                        </div>
                        <div style={{ background:T.surface2, borderRadius:9, padding:'9px 12px' }}>
                            <p style={{ fontSize:10, color:T.muted, marginBottom:3 }}>À payer (fournisseurs)</p>
                            <p style={{ fontSize:13, fontWeight:700, color:T.danger }}>-{fmtFull(Math.round(a_payer_30j))} XOF</p>
                        </div>
                    </>
                )}
            </div>

            {/* Message contextuel */}
            <p style={{ fontSize:11, color:T.textSoft, marginTop:12, lineHeight:1.6, fontStyle:'italic' }}>
                {enHausse && `Bonne tendance — votre trésorerie devrait croître de ${fmtFull(Math.round(Math.abs(gain)))} XOF en 30 jours.`}
                {enBaisse && `Attention — à ce rythme, votre trésorerie pourrait baisser de ${fmtFull(Math.round(Math.abs(gain)))} XOF. Pensez à réduire les dépenses.`}
                {tendance === 'stable' && `Votre trésorerie est stable. Enregistrez plus de transactions pour affiner cette prévision.`}
            </p>
        </div>
    );
}

let _cache = null;
let _cacheTime = 0;
export const invalidateDashboardCache = () => { _cache = null; _cacheTime = 0; };

export default function Dashboard() {
    const isMobile = useIsMobile();
    const navigate  = useNavigate();
    const { user }  = useSelector(s => s.auth);
    const [stats, setStats]       = useState(_cache?.stats || null);
    const [loading, setLoading]   = useState(!_cache);
    const [showChart, setShowChart] = useState(false);

    useEffect(() => {
        const now = Date.now();
        if (_cache && (now - _cacheTime) < 60000) { setLoading(false); return; }
        (async () => {
            try {
                const s = await API.get('transactions/stats/');
                setStats(s.data);
                _cache = { stats: s.data };
                _cacheTime = Date.now();
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const solde          = stats?.solde           || 0;
    const entreesMois    = stats?.entrees_mois    || 0;
    const sortiesMois    = stats?.sorties_mois    || 0;
    const alertesNonLues = stats?.alertes_non_lues || 0;
    const dettesRetard   = stats?.dettes_en_retard || 0;
    const nbTransactions = stats?.nb_transactions  || 0;
    const chartData      = stats?.evolution        || [];
    const transactions   = stats?.transactions_recentes || [];
    const scoreSante     = stats?.score_sante    ?? null;
    const scoreNiveau    = stats?.score_niveau   || '';
    const scoreCriteres  = stats?.score_criteres || [];

    const scoreColor  = scoreSante >= 80 ? '#22C55E' : scoreSante >= 60 ? '#F59E0B' : scoreSante >= 40 ? '#F97316' : '#EF4444';
    const scoreEmoji  = scoreSante >= 80 ? '🟢' : scoreSante >= 60 ? '🟡' : scoreSante >= 40 ? '🟠' : '🔴';
    const soldeColor  = solde >= 0 ? T.accent : T.danger;
    const prevision   = stats?.prevision || null;

    const [scoreOpen, setScoreOpen] = useState(false);

    if (loading) return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:T.bg, color:T.textSoft, flexDirection:'column', gap:12 }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
            <div style={{ width:36, height:36, borderRadius:99, border:`3px solid ${T.surface2}`, borderTop:`3px solid ${T.accent}`, animation:'spin 0.8s linear infinite' }}/>
            Chargement…
        </div>
    );

    return (
        <Layout alertesNonLues={alertesNonLues}>
            <div style={{ padding: isMobile ? '16px' : '28px 36px', maxWidth: 900, margin:'0 auto' }}>

                {/* ── ACCUEIL PERSONNALISÉ ── */}
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontFamily:"'Calistoga',serif", fontSize: isMobile ? 20 : 24, fontWeight:400, color:T.text }}>
                        Bonjour, {user?.username} 👋
                    </h1>
                    <p style={{ color:T.textSoft, fontSize:13, marginTop:4 }}>
                        {dateAujourdhui()} · {nbTransactions} opération{nbTransactions > 1 ? 's' : ''} enregistrée{nbTransactions > 1 ? 's' : ''}
                    </p>
                </div>

                {/* ── SOLDE + SCORE (2 colonnes) ── */}
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:14, marginBottom:14 }}>

                    {/* Solde actuel */}
                    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:'22px 24px', position:'relative', overflow:'hidden' }}>
                        <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:`radial-gradient(circle, ${soldeColor}15 0%, transparent 70%)`, pointerEvents:'none' }}/>
                        <p style={{ fontSize:12, fontWeight:600, color:T.textSoft, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Solde actuel</p>
                        <div style={{ fontSize: isMobile ? 30 : 36, fontWeight:800, color:soldeColor, letterSpacing:'-0.03em', lineHeight:1 }}>
                            {solde < 0 ? '-' : ''}<Counter value={Math.abs(solde)}/>
                        </div>
                        <p style={{ fontSize:14, color:T.textSoft, marginTop:6 }}>XOF</p>
                        <div style={{ marginTop:14, height:4, background:T.surface2, borderRadius:99 }}>
                            <div style={{ height:'100%', width:'100%', borderRadius:99, background:`linear-gradient(90deg, ${soldeColor}, ${soldeColor}55)` }}/>
                        </div>
                        <p style={{ fontSize:11, color:T.muted, marginTop:8 }}>
                            {solde >= 0 ? '✓ Solde positif — votre entreprise est dans le vert' : '⚠ Solde négatif — attention aux dépenses'}
                        </p>
                    </div>

                    {/* Score de santé — simplifié */}
                    {scoreSante !== null && (
                        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:'22px 24px' }}>
                            <p style={{ fontSize:12, fontWeight:600, color:T.textSoft, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Santé de l'entreprise</p>

                            <div style={{ display:'flex', alignItems:'flex-end', gap:10, marginBottom:12 }}>
                                <span style={{ fontSize: isMobile ? 36 : 44, fontWeight:800, color:scoreColor, lineHeight:1, letterSpacing:'-0.03em' }}>{scoreSante}</span>
                                <span style={{ fontSize:16, color:T.textSoft, marginBottom:6 }}>/100</span>
                                <span style={{ fontSize:13, fontWeight:700, color:scoreColor, marginBottom:6 }}>{scoreEmoji} {scoreNiveau}</span>
                            </div>

                            {/* Barre de progression simple */}
                            <div style={{ height:8, background:T.surface2, borderRadius:99, marginBottom:12, overflow:'hidden' }}>
                                <div style={{ height:'100%', width:`${scoreSante}%`, background:`linear-gradient(90deg, ${scoreColor}, ${scoreColor}aa)`, borderRadius:99, transition:'width 1.2s' }}/>
                            </div>

                            {/* Critères rapides */}
                            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 10px', marginBottom:12 }}>
                                {scoreCriteres.map(c => {
                                    const ok = c.pts >= c.max;
                                    const half = c.pts >= c.max / 2;
                                    const icon = ok ? '✓' : half ? '⚠' : '✗';
                                    const col  = ok ? '#22C55E' : half ? '#F59E0B' : '#EF4444';
                                    return (
                                        <span key={c.label} style={{ fontSize:11, color:col, fontWeight:600, display:'flex', alignItems:'center', gap:3 }}>
                                            <span>{icon}</span>{c.label}
                                        </span>
                                    );
                                })}
                            </div>

                            <button onClick={() => setScoreOpen(p => !p)} style={{ fontSize:12, color:T.info, background:'transparent', border:'none', cursor:'pointer', padding:0, fontWeight:600 }}>
                                {scoreOpen ? '▲ Masquer le détail' : '▼ Voir le détail'}
                            </button>

                            {scoreOpen && (
                                <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:6 }}>
                                    {scoreCriteres.map(c => {
                                        const pct = c.pts / c.max;
                                        const col = pct >= 1 ? '#22C55E' : pct >= 0.5 ? '#F59E0B' : '#EF4444';
                                        return (
                                            <div key={c.label} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 10px', background:T.surface2, borderRadius:8 }}>
                                                <div style={{ flex:1 }}>
                                                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                                                        <span style={{ fontSize:12, color:T.text, fontWeight:500 }}>{c.label}</span>
                                                        <span style={{ fontSize:11, color:col, fontWeight:700 }}>{c.pts}/{c.max}</span>
                                                    </div>
                                                    <div style={{ height:3, background:T.border, borderRadius:99, overflow:'hidden' }}>
                                                        <div style={{ height:'100%', width:`${pct*100}%`, background:col, borderRadius:99 }}/>
                                                    </div>
                                                    <p style={{ fontSize:10, color:T.muted, marginTop:3 }}>{c.detail}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── CE MOIS + ALERTES (4 blocs) ── */}
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap:10, marginBottom:20 }}>
                    {[
                        { label:'Entrées ce mois',  val: fmtFull(entreesMois) + ' XOF', color:T.accent,  icon:'↑' },
                        { label:'Sorties ce mois',  val: fmtFull(sortiesMois) + ' XOF', color:T.danger,  icon:'↓' },
                        { label:'Alertes actives',  val: alertesNonLues + ' alerte' + (alertesNonLues > 1 ? 's' : ''), color: alertesNonLues > 0 ? T.warning : T.textSoft, icon:'🔔', onClick: () => navigate('/alertes') },
                        { label:'Dettes en retard', val: dettesRetard + ' dossier' + (dettesRetard > 1 ? 's' : ''),    color: dettesRetard  > 0 ? T.danger  : T.textSoft, icon:'📄', onClick: () => navigate('/dettes')  },
                    ].map(k => (
                        <div key={k.label} onClick={k.onClick} style={{
                            background:T.surface, border:`1px solid ${T.border}`, borderRadius:12,
                            padding:'13px 14px', cursor: k.onClick ? 'pointer' : 'default',
                            transition:'border-color 0.15s',
                        }}>
                            <p style={{ fontSize:10, color:T.textSoft, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6, fontWeight:600 }}>{k.label}</p>
                            <p style={{ fontSize:14, fontWeight:700, color:k.color, lineHeight:1 }}>
                                <span style={{ marginRight:5 }}>{k.icon}</span>{k.val}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── PRÉVISION DE TRÉSORERIE ── */}
                {prevision && (
                    <div style={{ marginBottom:14 }}>
                        <PrevisionCard prevision={prevision} isMobile={isMobile} />
                    </div>
                )}

                {/* ── DERNIÈRES OPÉRATIONS ── */}
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, overflow:'hidden', marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 18px' }}>
                        <div>
                            <h2 style={{ fontSize:15, fontWeight:700, color:T.text }}>Dernières opérations</h2>
                            <p style={{ fontSize:12, color:T.textSoft, marginTop:2 }}>5 mouvements les plus récents</p>
                        </div>
                        <button onClick={() => navigate('/transactions')} style={{ padding:'7px 14px', borderRadius:8, border:`1px solid ${T.border}`, background:'transparent', color:T.textSoft, cursor:'pointer', fontSize:12, fontWeight:600 }}>
                            Voir tout →
                        </button>
                    </div>

                    <div style={{ borderTop:`1px solid ${T.border}` }}>
                        {transactions.length === 0
                            ? <p style={{ textAlign:'center', color:T.muted, fontSize:14, padding:'28px' }}>Aucune opération enregistrée</p>
                            : transactions.slice(0, 5).map((tx, i) => {
                                const isE = tx.type === 'Entree';
                                return (
                                    <div key={tx.id || i} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 18px', borderBottom: i < 4 ? `1px solid ${T.border}` : 'none' }}>
                                        <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background: isE ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
                                            {isE ? '↑' : '↓'}
                                        </div>
                                        <div style={{ flex:1, minWidth:0 }}>
                                            <p style={{ fontSize:13, fontWeight:600, color:T.text, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                                {tx.libelle || '—'}
                                            </p>
                                            <p style={{ fontSize:11, color:T.muted, margin:'2px 0 0' }}>
                                                {tx.categorie || (isE ? 'Entrée' : 'Sortie')} · {tx.date_transaction}
                                            </p>
                                        </div>
                                        <span style={{ fontSize:14, fontWeight:700, color: isE ? T.accent : T.danger, flexShrink:0 }}>
                                            {isE ? '+' : '-'}{parseFloat(tx.montant || 0).toLocaleString('fr-FR')} XOF
                                        </span>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>

                {/* ── GRAPHIQUE DÉPLIABLE ── */}
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, overflow:'hidden', marginBottom:20 }}>
                    <button
                        onClick={() => setShowChart(p => !p)}
                        style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', background:'transparent', border:'none', cursor:'pointer', textAlign:'left' }}
                    >
                        <div>
                            <span style={{ fontSize:14, fontWeight:600, color:T.text }}>Évolution sur 6 mois</span>
                            <span style={{ fontSize:12, color:T.textSoft, marginLeft:10 }}>Entrées vs Sorties</span>
                        </div>
                        <span style={{ fontSize:18, color:T.muted, transition:'transform 0.2s', transform: showChart ? 'rotate(180deg)' : 'none' }}>⌄</span>
                    </button>

                    {showChart && (
                        <div style={{ padding:'0 18px 18px', borderTop:`1px solid ${T.border}` }}>
                            <div style={{ display:'flex', gap:16, marginBottom:12, paddingTop:14 }}>
                                {[['Entrées', T.accent], ['Sorties', T.danger]].map(([l, c]) => (
                                    <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                                        <div style={{ width:10, height:10, borderRadius:2, background:c }}/>
                                        <span style={{ fontSize:11, color:T.textSoft }}>{l}</span>
                                    </div>
                                ))}
                            </div>
                            <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
                                <BarChart data={chartData} margin={{ top:4, right:4, left:0, bottom:0 }} barCategoryGap="30%" barGap={3}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false}/>
                                    <XAxis dataKey="mois" tick={{ fill:T.muted, fontSize:11 }} axisLine={false} tickLine={false}/>
                                    <YAxis tickFormatter={v => fmt(v)} tick={{ fill:T.muted, fontSize:11 }} axisLine={false} tickLine={false} width={42}/>
                                    <Tooltip
                                        cursor={{ fill:'rgba(255,255,255,0.04)' }}
                                        contentStyle={{ background:T.surface2, border:`1px solid ${T.border}`, borderRadius:10, fontSize:12 }}
                                        labelStyle={{ color:T.textSoft, marginBottom:4 }}
                                        formatter={(val, name) => [`${fmt(val)} XOF`, name]}
                                    />
                                    <Bar dataKey="revenus"  name="Entrées" fill={T.accent} radius={[4,4,0,0]} maxBarSize={32}/>
                                    <Bar dataKey="depenses" name="Sorties" fill={T.danger} radius={[4,4,0,0]} maxBarSize={32}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <p style={{ textAlign:'center', fontSize:11, color:T.muted, paddingBottom:8 }}>
                    FinanceIQ · © 2026
                </p>
            </div>
        </Layout>
    );
}
