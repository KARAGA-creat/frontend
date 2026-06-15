import { useEffect, useState } from 'react';
import { getRapports, genererRapport } from '../api/rapportsAPI';
import Layout, { T, useIsMobile } from '../components/Layout';

const MOIS = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
               'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function Rapports() {
    const isMobile = useIsMobile();
    const [rapports, setRapports]     = useState([]);
    const [loading, setLoading]       = useState(true);
    const [generating, setGenerating] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(null);
    const [form, setForm] = useState({ mois: new Date().getMonth() + 1, annee: new Date().getFullYear() });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const r = await getRapports();
            setRapports(Array.isArray(r) ? r : (r.results || []));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleGenerer = async () => {
        setGenerating(true);
        try {
            await genererRapport(form.mois, form.annee);
            fetchData();
        } catch (err) { console.error(err); }
        finally { setGenerating(false); }
    };

    const handleExportPDF = async (mois, annee) => {
        setPdfLoading(`${mois}-${annee}`);
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`/api/rapports/pdf/?mois=${mois}&annee=${annee}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Erreur PDF');
            const blob = await res.blob();
            const url  = window.URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `rapport_${MOIS[mois]}_${annee}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) { console.error(err); }
        finally { setPdfLoading(null); }
    };

    const totalEntrees = rapports.reduce((s, r) => s + parseFloat(r.total_entrees || 0), 0);
    const totalSorties = rapports.reduce((s, r) => s + parseFloat(r.total_sorties || 0), 0);
    const soldeFinal   = totalEntrees - totalSorties;

    const inp = { padding:'9px 12px', background:T.surface2, border:`1px solid ${T.border}`, borderRadius:8, color:T.text, fontSize:13, outline:'none' };

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
                <div style={{ marginBottom:24 }}>
                    <h1 style={{ fontFamily:"'Calistoga',serif", fontSize:isMobile?20:24, fontWeight:400, color:T.text }}>Rapports Financiers</h1>
                    <p style={{ color:T.textSoft, fontSize:13, marginTop:4 }}>Historique des snapshots mensuels</p>
                </div>

                {/* KPI GLOBAUX */}
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap:14, marginBottom:24 }}>
                    {[
                        { label:'Total Entrées', val:totalEntrees, color:T.accent },
                        { label:'Total Sorties', val:totalSorties, color:T.danger },
                        { label:'Solde Global',  val:soldeFinal,   color:soldeFinal>=0?T.accent:T.danger },
                    ].map(k => (
                        <div key={k.label} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:'18px 20px' }}>
                            <p style={{ fontSize:11, color:T.textSoft, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>{k.label}</p>
                            <p style={{ fontSize:18, fontWeight:700, color:k.color, fontFamily:'monospace' }}>
                                {k.val >= 0 ? '+' : ''}{k.val.toLocaleString('fr-FR')} XOF
                            </p>
                        </div>
                    ))}
                </div>

                {/* GENERATEUR */}
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'22px 24px', marginBottom:20 }}>
                    <h2 style={{ fontSize:15, fontWeight:600, color:T.text, marginBottom:18 }}>Générer un Rapport</h2>
                    <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-end', gap:14 }}>
                        <div>
                            <label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Mois</label>
                            <select style={inp} value={form.mois} onChange={e => setForm(p => ({...p, mois: parseInt(e.target.value)}))}>
                                {MOIS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Année</label>
                            <input style={inp} type="number" value={form.annee} min="2020" max="2035"
                                onChange={e => setForm(p => ({...p, annee: parseInt(e.target.value)}))}/>
                        </div>
                        <button onClick={handleGenerer} disabled={generating} style={{ padding:'10px 22px', background:generating?T.surface2:`linear-gradient(135deg,${T.accent},#16A34A)`, border:'none', borderRadius:9, color:generating?T.muted:'#000', fontSize:13, fontWeight:700, cursor:generating?'not-allowed':'pointer' }}>
                            {generating ? '⏳ Génération…' : '📊 Générer'}
                        </button>
                    </div>
                </div>

                {/* TABLEAU */}
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, overflow:'hidden', overflowX:'auto' }}>
                    <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.border}` }}>
                        <span style={{ fontSize:14, fontWeight:600, color:T.text }}>Historique</span>
                        <span style={{ marginLeft:10, fontSize:12, color:T.muted }}>({rapports.length} rapport{rapports.length>1?'s':''})</span>
                    </div>
                    {rapports.length === 0
                        ? <p style={{ textAlign:'center', color:T.muted, padding:'40px', fontSize:14 }}>Aucun rapport généré — cliquez sur "Générer" ci-dessus.</p>
                        : <table style={{ width:'100%', borderCollapse:'collapse' }}>
                            <thead>
                                <tr style={{ background:'rgba(255,255,255,0.02)' }}>
                                    {['Période','Total Entrées','Total Sorties','Solde Final','PDF'].map(h => (
                                        <th key={h} style={{ padding:'10px 20px', textAlign:'left', fontSize:11, fontWeight:700, textTransform:'uppercase', color:T.muted, borderBottom:`1px solid ${T.border}`, letterSpacing:'0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rapports.map(r => {
                                    const solde = parseFloat(r.solde_final);
                                    return (
                                        <tr key={r.id} style={{ borderBottom:`1px solid ${T.border}` }}>
                                            <td style={{ padding:'14px 20px', fontSize:13, fontWeight:700, color:T.text }}>{MOIS[r.mois]} {r.annee}</td>
                                            <td style={{ padding:'14px 20px', fontSize:13, fontFamily:'monospace', color:T.accent }}>
                                                +{parseFloat(r.total_entrees).toLocaleString('fr-FR')} XOF
                                            </td>
                                            <td style={{ padding:'14px 20px', fontSize:13, fontFamily:'monospace', color:T.danger }}>
                                                -{parseFloat(r.total_sorties).toLocaleString('fr-FR')} XOF
                                            </td>
                                            <td style={{ padding:'14px 20px', fontSize:14, fontFamily:'monospace', fontWeight:700, color:solde>=0?T.accent:T.danger }}>
                                                {solde>=0?'+':''}{solde.toLocaleString('fr-FR')} XOF
                                            </td>
                                            <td style={{ padding:'14px 20px' }}>
                                                <button
                                                    onClick={() => handleExportPDF(r.mois, r.annee)}
                                                    disabled={pdfLoading === `${r.mois}-${r.annee}`}
                                                    style={{ padding:'6px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:7, color:'#F87171', fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                                                    {pdfLoading === `${r.mois}-${r.annee}` ? '⏳' : '📄 PDF'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    }
                </div>
            </div>
        </Layout>
    );
}
