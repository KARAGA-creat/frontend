import { useEffect, useState } from 'react';
import { getDettes, createDette, updateDette, envoyerRappelDette } from '../api/dettesAPI';
import { getTiers } from '../api/tiersAPI';
import Layout, { T, useIsMobile } from '../components/Layout';

const STATUT_LABEL = { en_cours:'En cours', partiellement_paye:'Part. payé', solde:'Soldé', en_retard:'En retard' };
const STATUT_COLOR = { en_cours:T.info, partiellement_paye:'#F59E0B', solde:'#22C55E', en_retard:'#EF4444' };

export default function Dettes() {
    const isMobile = useIsMobile();
    const [dettes, setDettes]       = useState([]);
    const [tiers, setTiers]         = useState([]);
    const [loading, setLoading]     = useState(true);
    const [showForm, setShowForm]   = useState(false);
    const [filtre, setFiltre]       = useState('');
    const [form, setForm] = useState({ type:'Client', montant_total:'', montant_paye:'0', date_echeance:'', id_tiers:'' });

    // Rappels
    const [rappelLoading, setRappelLoading] = useState({});
    const [rappelMsg, setRappelMsg]         = useState({});

    // Modal de paiement
    const [paiementModal, setPaiementModal]       = useState(null);
    const [montantPaiement, setMontantPaiement]   = useState('');
    const [paiementLoading, setPaiementLoading]   = useState(false);
    const [paiementError, setPaiementError]       = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [d, t] = await Promise.all([getDettes(), getTiers()]);
            setDettes(Array.isArray(d) ? d : (d.results || []));
            setTiers(t);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createDette(form);
            setShowForm(false);
            setForm({ type:'Client', montant_total:'', montant_paye:'0', date_echeance:'', id_tiers:'' });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleRappel = async (dette) => {
        setRappelLoading(p => ({ ...p, [dette.id]: true }));
        setRappelMsg(p => ({ ...p, [dette.id]: null }));
        try {
            const res = await envoyerRappelDette(dette.id);
            setRappelMsg(p => ({ ...p, [dette.id]: { type: 'ok', texte: res.message || res.warning } }));
        } catch (err) {
            const msg = err.response?.data?.error || 'Erreur lors de l\'envoi.';
            setRappelMsg(p => ({ ...p, [dette.id]: { type: 'err', texte: msg } }));
        } finally {
            setRappelLoading(p => ({ ...p, [dette.id]: false }));
        }
    };

    const ouvrirPaiement = (dette) => {
        setPaiementModal(dette);
        setMontantPaiement('');
        setPaiementError('');
    };

    const fermerPaiement = () => {
        if (paiementLoading) return;
        setPaiementModal(null);
        setMontantPaiement('');
        setPaiementError('');
    };

    const handleConfirmerPaiement = async () => {
        const montant  = parseFloat(montantPaiement);
        const restant  = parseFloat(paiementModal.montant_total) - parseFloat(paiementModal.montant_paye || 0);

        if (!montantPaiement || isNaN(montant) || montant <= 0) {
            setPaiementError('Veuillez saisir un montant valide.');
            return;
        }
        if (montant > restant + 0.01) {
            setPaiementError(`Le montant dépasse le restant dû (${restant.toLocaleString('fr-FR')} XOF).`);
            return;
        }

        setPaiementLoading(true);
        setPaiementError('');
        try {
            const nouveauMontantPaye = parseFloat(paiementModal.montant_paye || 0) + montant;
            const statut = nouveauMontantPaye >= parseFloat(paiementModal.montant_total) - 0.01 ? 'solde' : 'partiellement_paye';
            await updateDette(paiementModal.id, { montant_paye: nouveauMontantPaye, statut });
            setPaiementModal(null);
            setMontantPaiement('');
            fetchData();
        } catch {
            setPaiementError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setPaiementLoading(false);
        }
    };

    const getTiersNom = (id) => tiers.find(t => t.id === id || t.id === parseInt(id))?.nom || `Tiers #${id}`;

    const filtered = filtre ? dettes.filter(d => d.statut === filtre) : dettes;
    const totalDu  = dettes.filter(d => d.statut !== 'solde').reduce((s,d) => s + (parseFloat(d.montant_total)-parseFloat(d.montant_paye||0)), 0);

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

    const restantModal = paiementModal
        ? parseFloat(paiementModal.montant_total) - parseFloat(paiementModal.montant_paye || 0)
        : 0;

    return (
        <Layout>
            <div style={{ padding: isMobile ? '16px' : '28px 32px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                    <div>
                        <h1 style={{ fontFamily:"'Calistoga',serif", fontSize:isMobile?20:24, fontWeight:400, color:T.text }}>Dettes & Factures</h1>
                        <p style={{ color:T.textSoft, fontSize:13, marginTop:4 }}>{dettes.length} enregistrement{dettes.length>1?'s':''}</p>
                    </div>
                    <button style={btn} onClick={() => setShowForm(p => !p)}>{isMobile ? '＋' : '＋ Nouvelle Dette'}</button>
                </div>

                {/* KPI */}
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap:14, marginBottom:20 }}>
                    {[
                        { label:'Total', val:dettes.length, color:T.info, suf:'' },
                        { label:'En cours', val:dettes.filter(d=>d.statut==='en_cours').length, color:T.info, suf:'' },
                        { label:'En retard', val:dettes.filter(d=>d.statut==='en_retard').length, color:T.danger, suf:'' },
                        { label:'Restant dû', val:totalDu, color:T.warning, suf:' XOF', fmt:true },
                    ].map(k => (
                        <div key={k.label} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:'16px 18px' }}>
                            <p style={{ fontSize:11, color:T.textSoft, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>{k.label}</p>
                            <p style={{ fontSize:k.fmt?16:22, fontWeight:700, color:k.color, fontFamily:'monospace' }}>
                                {k.fmt ? k.val.toLocaleString('fr-FR') : k.val}{k.suf}
                            </p>
                        </div>
                    ))}
                </div>

                {/* FILTRE */}
                <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
                    {['', 'en_cours', 'partiellement_paye', 'solde', 'en_retard'].map(s => (
                        <button key={s} onClick={() => setFiltre(s)} style={{ padding:'7px 14px', borderRadius:8, border:`1px solid ${filtre===s?T.accent:T.border}`, background:filtre===s?T.accentDim:'transparent', color:filtre===s?T.accent:T.textSoft, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                            {s === '' ? 'Tous' : STATUT_LABEL[s]}
                        </button>
                    ))}
                </div>

                {showForm && (
                    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'22px 24px', marginBottom:20 }}>
                        <h2 style={{ fontSize:15, fontWeight:700, color:T.text, marginBottom:18 }}>Nouvelle Dette / Facture</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap:14, marginBottom:14 }}>
                                <div><label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Type</label>
                                    <select style={inp} value={form.type} onChange={e => setForm(p => ({...p, type:e.target.value}))}>
                                        <option value="Client">Client (créance)</option>
                                        <option value="Fournisseur">Fournisseur (dette)</option>
                                    </select></div>
                                <div><label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Tiers</label>
                                    <select style={inp} required value={form.id_tiers} onChange={e => setForm(p => ({...p, id_tiers:e.target.value}))}>
                                        <option value="">Choisir...</option>
                                        {tiers.map(t => <option key={t.id} value={t.id}>{t.nom} ({t.type})</option>)}
                                    </select></div>
                                <div><label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Montant total (XOF)</label>
                                    <input style={inp} type="number" min="0" required value={form.montant_total} onChange={e => setForm(p => ({...p, montant_total:e.target.value}))}/></div>
                                <div><label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Date échéance</label>
                                    <input style={inp} type="date" required value={form.date_echeance} onChange={e => setForm(p => ({...p, date_echeance:e.target.value}))}/></div>
                            </div>
                            <div style={{ display:'flex', gap:10 }}>
                                <button type="submit" style={btn}>Enregistrer</button>
                                <button type="button" style={btnG} onClick={() => setShowForm(false)}>Annuler</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* CARDS */}
                {filtered.length === 0
                    ? <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'40px', textAlign:'center', color:T.muted }}>Aucune dette pour ce filtre.</div>
                    : <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:16 }}>
                        {filtered.map(d => {
                            const taux    = Math.min((parseFloat(d.montant_paye||0)/parseFloat(d.montant_total||1))*100, 100);
                            const color   = STATUT_COLOR[d.statut] || T.muted;
                            const restant = parseFloat(d.montant_total) - parseFloat(d.montant_paye||0);
                            return (
                                <div key={d.id} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'18px 20px' }}>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                                        <div>
                                            <p style={{ fontSize:14, fontWeight:700, color:T.text }}>{getTiersNom(d.id_tiers)}</p>
                                            <p style={{ fontSize:12, color:T.muted, marginTop:2 }}>{d.type==='Client'?'📤 Créance':'📥 Dette'}</p>
                                        </div>
                                        <span style={{ padding:'3px 10px', borderRadius:6, fontSize:11, fontWeight:700, background:`${color}22`, color }}>
                                            {STATUT_LABEL[d.statut]||d.statut}
                                        </span>
                                    </div>
                                    <p style={{ fontSize:22, fontWeight:700, color:T.text, fontFamily:'monospace', marginBottom:10 }}>
                                        {parseFloat(d.montant_total).toLocaleString('fr-FR')} XOF
                                    </p>
                                    <div style={{ height:5, background:T.surface2, borderRadius:99, overflow:'hidden', marginBottom:6 }}>
                                        <div style={{ height:'100%', background:color, borderRadius:99, width:`${taux}%`, transition:'width 1s' }}/>
                                    </div>
                                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                                        <span style={{ fontSize:12, color:T.muted }}>Payé : {parseFloat(d.montant_paye||0).toLocaleString('fr-FR')} XOF ({taux.toFixed(0)}%)</span>
                                        <span style={{ fontSize:12, color:T.warning, fontWeight:600 }}>Reste : {restant.toLocaleString('fr-FR')} XOF</span>
                                    </div>
                                    <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:12 }}>
                                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: rappelMsg[d.id] ? 8 : 0 }}>
                                            <span style={{ fontSize:11, color:T.muted }}>Échéance : {new Date(d.date_echeance).toLocaleDateString('fr-FR')}</span>
                                            <div style={{ display:'flex', gap:6 }}>
                                                {d.statut !== 'solde' && (
                                                    <button
                                                        onClick={() => handleRappel(d)}
                                                        disabled={rappelLoading[d.id]}
                                                        title="Envoyer un rappel par email"
                                                        style={{ padding:'5px 10px', background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.25)', borderRadius:7, color:'#8B5CF6', fontSize:12, fontWeight:700, cursor:'pointer', opacity: rappelLoading[d.id] ? 0.6 : 1 }}
                                                    >
                                                        {rappelLoading[d.id] ? '...' : '📧'}
                                                    </button>
                                                )}
                                                {d.statut !== 'solde' && (
                                                    <button onClick={() => ouvrirPaiement(d)} style={{ padding:'5px 12px', background:`rgba(59,130,246,0.1)`, border:`1px solid rgba(59,130,246,0.25)`, borderRadius:7, color:T.info, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                                                        {d.type==='Client'?'💰 Reçu':'💸 Paiement'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {rappelMsg[d.id] && (
                                            <p style={{ fontSize:11, color: rappelMsg[d.id].type === 'ok' ? T.accent : T.danger, lineHeight:1.4 }}>
                                                {rappelMsg[d.id].type === 'ok' ? '✓' : '✗'} {rappelMsg[d.id].texte}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                }
            </div>

            {/* MODAL PAIEMENT */}
            {paiementModal && (
                <div
                    onClick={fermerPaiement}
                    style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:'28px 28px 24px', width:'100%', maxWidth:420, boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}
                    >
                        <h2 style={{ fontSize:16, fontWeight:700, color:T.text, marginBottom:4 }}>
                            {paiementModal.type === 'Client' ? '💰 Enregistrer un encaissement' : '💸 Enregistrer un paiement'}
                        </h2>
                        <p style={{ fontSize:13, color:T.textSoft, marginBottom:20 }}>{getTiersNom(paiementModal.id_tiers)}</p>

                        {/* Récapitulatif */}
                        <div style={{ background:T.surface2, borderRadius:10, padding:'12px 16px', marginBottom:20 }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                                <span style={{ fontSize:12, color:T.textSoft }}>Montant total</span>
                                <span style={{ fontSize:12, fontWeight:600, color:T.text, fontFamily:'monospace' }}>
                                    {parseFloat(paiementModal.montant_total).toLocaleString('fr-FR')} XOF
                                </span>
                            </div>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                                <span style={{ fontSize:12, color:T.textSoft }}>Déjà payé</span>
                                <span style={{ fontSize:12, fontWeight:600, color:'#22C55E', fontFamily:'monospace' }}>
                                    {parseFloat(paiementModal.montant_paye||0).toLocaleString('fr-FR')} XOF
                                </span>
                            </div>
                            <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:10, display:'flex', justifyContent:'space-between' }}>
                                <span style={{ fontSize:13, fontWeight:600, color:T.textSoft }}>Restant dû</span>
                                <span style={{ fontSize:15, fontWeight:700, color:T.warning, fontFamily:'monospace' }}>
                                    {restantModal.toLocaleString('fr-FR')} XOF
                                </span>
                            </div>
                        </div>

                        {/* Champ montant */}
                        <div style={{ marginBottom:16 }}>
                            <label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>
                                Montant à enregistrer (XOF)
                            </label>
                            <input
                                style={{ ...inp, fontSize:15, fontWeight:600 }}
                                type="number"
                                min="1"
                                max={restantModal}
                                placeholder={`Max : ${restantModal.toLocaleString('fr-FR')}`}
                                value={montantPaiement}
                                onChange={e => { setMontantPaiement(e.target.value); setPaiementError(''); }}
                                autoFocus
                                onKeyDown={e => e.key === 'Enter' && !paiementLoading && handleConfirmerPaiement()}
                            />
                        </div>

                        {paiementError && (
                            <p style={{ fontSize:12, color:T.danger, marginBottom:14, padding:'8px 12px', background:`${T.danger}18`, borderRadius:7 }}>
                                {paiementError}
                            </p>
                        )}

                        <div style={{ display:'flex', gap:10 }}>
                            <button
                                onClick={handleConfirmerPaiement}
                                disabled={paiementLoading}
                                style={{ ...btn, flex:1, opacity:paiementLoading?0.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
                            >
                                {paiementLoading
                                    ? <><span style={{ width:14, height:14, border:'2px solid #000', borderTop:'2px solid transparent', borderRadius:99, display:'inline-block', animation:'spin 0.7s linear infinite' }}/> Enregistrement...</>
                                    : 'Confirmer'
                                }
                            </button>
                            <button onClick={fermerPaiement} disabled={paiementLoading} style={{ ...btnG, flex:1 }}>
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
        </Layout>
    );
}
