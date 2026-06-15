import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../api/transactionsAPI';
import { getCategories } from '../api/categoriesAPI';
import Layout, { T, useIsMobile } from '../components/Layout';
import API from '../api/axios';

const STATUT_LABEL = { validee: 'Validée', en_attente: 'En attente' };

export default function Transactions() {
    const isMobile = useIsMobile();
    const { user } = useSelector(s => s.auth);

    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories]     = useState([]);
    const [loading, setLoading]           = useState(true);
    const [showForm, setShowForm]         = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [error, setError]               = useState('');

    const [filtres, setFiltres] = useState({
        recherche: '',
        type:      '',
        statut:    '',
        categorie: '',
        date_debut:'',
        date_fin:  '',
    });

    const [form, setForm] = useState({
        type: 'Entree', montant: '', date_transaction: '', libelle: '', id_categorie: '', statut: 'validee',
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [t, c] = await Promise.all([getTransactions(), getCategories()]);
            setTransactions(Array.isArray(t) ? t : (t.results || []));
            setCategories(c);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return transactions.filter(t => {
            if (filtres.recherche && !t.libelle?.toLowerCase().includes(filtres.recherche.toLowerCase())) return false;
            if (filtres.type && t.type !== filtres.type) return false;
            if (filtres.statut && t.statut !== filtres.statut) return false;
            if (filtres.categorie && String(t.id_categorie) !== filtres.categorie) return false;
            if (filtres.date_debut && t.date_transaction < filtres.date_debut) return false;
            if (filtres.date_fin && t.date_transaction > filtres.date_fin) return false;
            return true;
        });
    }, [transactions, filtres]);

    const totalEntrees = filtered.filter(t => t.type === 'Entree').reduce((s, t) => s + parseFloat(t.montant || 0), 0);
    const totalSorties = filtered.filter(t => t.type === 'Sortie').reduce((s, t) => s + parseFloat(t.montant || 0), 0);

    const formVide = { type:'Entree', montant:'', date_transaction:'', libelle:'', id_categorie:'', statut:'validee' };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingId) {
                await updateTransaction(editingId, form);
            } else {
                await createTransaction(form);
            }
            setShowForm(false);
            setEditingId(null);
            setForm(formVide);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.montant?.[0] || 'Erreur lors de l\'enregistrement.');
        }
    };

    const handleEdit = (t) => {
        setEditingId(t.id);
        setForm({
            type:             t.type,
            montant:          t.montant,
            date_transaction: t.date_transaction,
            libelle:          t.libelle || '',
            id_categorie:     t.id_categorie || '',
            statut:           t.statut,
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAnnulerForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(formVide);
        setError('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette transaction ?')) return;
        await deleteTransaction(id);
        fetchData();
    };

    const handleExport = async () => {
        setExportLoading(true);
        try {
            const params = new URLSearchParams();
            if (filtres.type) params.append('type', filtres.type);
            if (filtres.statut) params.append('statut', filtres.statut);
            if (filtres.date_debut) params.append('date_debut', filtres.date_debut);
            if (filtres.date_fin) params.append('date_fin', filtres.date_fin);
            if (filtres.categorie) params.append('categorie', filtres.categorie);

            const token = localStorage.getItem('access_token');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/transactions/export/?${params}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions_${new Date().toISOString().slice(0,10)}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        } finally {
            setExportLoading(false);
        }
    };

    const resetFiltres = () => setFiltres({ recherche:'', type:'', statut:'', categorie:'', date_debut:'', date_fin:'' });

    if (loading) return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:T.bg, color:T.textSoft, flexDirection:'column', gap:12 }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
            <div style={{ width:36, height:36, borderRadius:99, border:`3px solid ${T.surface2}`, borderTop:`3px solid ${T.accent}`, animation:'spin 0.8s linear infinite' }}/>
            Chargement…
        </div>
    );

    const inputStyle = { padding:'9px 12px', background:T.surface2, border:`1px solid ${T.border}`, borderRadius:8, color:T.text, fontSize:13, outline:'none', width:'100%' };
    const btnStyle   = { padding:'9px 18px', background:`linear-gradient(135deg,${T.accent},#16A34A)`, border:'none', borderRadius:9, color:'#000', fontSize:13, fontWeight:700, cursor:'pointer' };
    const btnGray    = { padding:'9px 18px', background:T.surface2, border:`1px solid ${T.border}`, borderRadius:9, color:T.textSoft, fontSize:13, fontWeight:600, cursor:'pointer' };

    return (
        <Layout>
            <div style={{ padding: isMobile ? '16px' : '28px 32px' }}>

                {/* HEADER */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                    <div>
                        <h1 style={{ fontFamily:"'Calistoga',serif", fontSize:isMobile?20:24, fontWeight:400, letterSpacing:'-0.02em', color:T.text }}>Transactions</h1>
                        <p style={{ color:T.textSoft, fontSize:13, marginTop:4 }}>{filtered.length} sur {transactions.length}</p>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                        <button onClick={handleExport} disabled={exportLoading} style={{ ...btnGray, display:'flex', alignItems:'center', gap:6 }}>
                            {exportLoading ? '⏳' : '⬇'}{isMobile ? '' : ' Excel'}
                        </button>
                        {user?.role !== 'comptable' && (
                            <button style={btnStyle} onClick={() => setShowForm(p => !p)}>
                                {isMobile ? '＋' : '＋ Nouvelle transaction'}
                            </button>
                        )}
                    </div>
                </div>

                {/* KPI RAPIDE */}
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap:14, marginBottom:24 }}>
                    {[
                        { label:'Total Entrées (filtrées)', value:totalEntrees, color:T.accent },
                        { label:'Total Sorties (filtrées)', value:totalSorties, color:T.danger },
                        { label:'Solde filtré', value:totalEntrees - totalSorties, color: totalEntrees-totalSorties >= 0 ? T.accent : T.danger },
                    ].map(k => (
                        <div key={k.label} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:'16px 20px' }}>
                            <p style={{ fontSize:12, color:T.textSoft, marginBottom:8 }}>{k.label}</p>
                            <p style={{ fontSize:20, fontWeight:700, color:k.color, fontFamily:'monospace' }}>
                                {k.value >= 0 ? '+' : ''}{k.value.toLocaleString('fr-FR')} XOF
                            </p>
                        </div>
                    ))}
                </div>

                {/* FILTRES */}
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'18px 20px', marginBottom:20 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                        <span style={{ fontSize:13, fontWeight:600, color:T.textSoft }}>🔍 Filtres</span>
                        <button onClick={resetFiltres} style={{ background:'none', border:'none', color:T.muted, cursor:'pointer', fontSize:12 }}>Réinitialiser</button>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1fr 1fr 1fr 1fr 1fr', gap:10 }}>
                        <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
                            <input style={inputStyle} placeholder="Rechercher un libellé..."
                                value={filtres.recherche} onChange={e => setFiltres(p => ({...p, recherche:e.target.value}))} />
                        </div>
                        <select style={inputStyle} value={filtres.type} onChange={e => setFiltres(p => ({...p, type:e.target.value}))}>
                            <option value="">Tous types</option>
                            <option value="Entree">Entrée</option>
                            <option value="Sortie">Sortie</option>
                        </select>
                        <select style={inputStyle} value={filtres.statut} onChange={e => setFiltres(p => ({...p, statut:e.target.value}))}>
                            <option value="">Tous statuts</option>
                            <option value="validee">Validée</option>
                            <option value="en_attente">En attente</option>
                        </select>
                        <select style={inputStyle} value={filtres.categorie} onChange={e => setFiltres(p => ({...p, categorie:e.target.value}))}>
                            <option value="">Toutes catégories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.nom_categorie}</option>)}
                        </select>
                        <input style={inputStyle} type="date" title="Date début"
                            value={filtres.date_debut} onChange={e => setFiltres(p => ({...p, date_debut:e.target.value}))} />
                        <input style={inputStyle} type="date" title="Date fin"
                            value={filtres.date_fin} onChange={e => setFiltres(p => ({...p, date_fin:e.target.value}))} />
                    </div>
                </div>

                {/* FORMULAIRE NOUVELLE TRANSACTION */}
                {showForm && (
                    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'22px 24px', marginBottom:20 }}>
                        <h2 style={{ fontSize:15, fontWeight:700, color:T.text, marginBottom:18 }}>{editingId ? '✏️ Modifier la Transaction' : 'Nouvelle Transaction'}</h2>
                        {error && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:T.danger, padding:'10px 14px', borderRadius:8, marginBottom:14, fontSize:13 }}>{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap:14, marginBottom:14 }}>
                                <div>
                                    <label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Type</label>
                                    <select style={inputStyle} value={form.type} onChange={e => setForm(p => ({...p, type:e.target.value}))}>
                                        <option value="Entree">Entrée</option>
                                        <option value="Sortie">Sortie</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Montant (XOF)</label>
                                    <input style={inputStyle} type="number" min="0" step="1" required
                                        value={form.montant} onChange={e => setForm(p => ({...p, montant:e.target.value}))} />
                                </div>
                                <div>
                                    <label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Date</label>
                                    <input style={inputStyle} type="date" required
                                        value={form.date_transaction} onChange={e => setForm(p => ({...p, date_transaction:e.target.value}))} />
                                </div>
                                <div>
                                    <label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Catégorie</label>
                                    <select style={inputStyle} required value={form.id_categorie} onChange={e => setForm(p => ({...p, id_categorie:e.target.value}))}>
                                        <option value="">Choisir...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.nom_categorie}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Statut</label>
                                    <select style={inputStyle} value={form.statut} onChange={e => setForm(p => ({...p, statut:e.target.value}))}>
                                        <option value="validee">Validée</option>
                                        <option value="en_attente">En attente</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Libellé</label>
                                    <input style={inputStyle} type="text" placeholder="Description..."
                                        value={form.libelle} onChange={e => setForm(p => ({...p, libelle:e.target.value}))} />
                                </div>
                            </div>
                            <div style={{ display:'flex', gap:10 }}>
                                <button type="submit" style={btnStyle}>{editingId ? 'Mettre à jour' : 'Enregistrer'}</button>
                                <button type="button" style={btnGray} onClick={handleAnnulerForm}>Annuler</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* TABLE */}
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, overflow:'hidden', overflowX:'auto' }}>
                    <div style={{ padding:'16px 20px 12px', borderBottom:`1px solid ${T.border}` }}>
                        <span style={{ fontSize:14, fontWeight:600, color:T.text }}>
                            Liste des transactions
                        </span>
                        <span style={{ marginLeft:10, fontSize:12, color:T.muted }}>({filtered.length} résultat{filtered.length>1?'s':''})</span>
                    </div>

                    {filtered.length === 0 ? (
                        <div style={{ padding:'40px', textAlign:'center', color:T.muted, fontSize:14 }}>
                            Aucune transaction ne correspond aux filtres.
                        </div>
                    ) : (
                        <table style={{ width:'100%', borderCollapse:'collapse' }}>
                            <thead>
                                <tr>
                                    {['Libellé','Type','Montant','Catégorie','Date','Statut','Action'].map(h => (
                                        <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, textTransform:'uppercase', color:T.muted, borderBottom:`1px solid ${T.border}`, letterSpacing:'0.06em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(t => {
                                    const isE = t.type === 'Entree';
                                    const cat = categories.find(c => c.id === t.id_categorie || c.id === parseInt(t.id_categorie));
                                    return (
                                        <tr key={t.id} style={{ borderBottom:`1px solid ${T.border}` }}>
                                            <td style={{ padding:'12px 16px', fontSize:13, color:T.text, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                                {t.libelle || <span style={{ color:T.muted }}>—</span>}
                                            </td>
                                            <td style={{ padding:'12px 16px' }}>
                                                <span style={{ background:isE?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)', color:isE?T.accent:T.danger, padding:'3px 10px', borderRadius:6, fontSize:12, fontWeight:700 }}>
                                                    {isE ? '↑ Entrée' : '↓ Sortie'}
                                                </span>
                                            </td>
                                            <td style={{ padding:'12px 16px', fontSize:13, fontWeight:700, color:isE?T.accent:T.danger, fontFamily:'monospace', whiteSpace:'nowrap' }}>
                                                {isE ? '+' : '-'}{parseFloat(t.montant).toLocaleString('fr-FR')} XOF
                                            </td>
                                            <td style={{ padding:'12px 16px', fontSize:12, color:T.textSoft }}>
                                                {cat?.nom_categorie || '—'}
                                            </td>
                                            <td style={{ padding:'12px 16px', fontSize:12, color:T.muted, whiteSpace:'nowrap' }}>
                                                {new Date(t.date_transaction).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td style={{ padding:'12px 16px' }}>
                                                <span style={{ background:t.statut==='validee'?'rgba(34,197,94,0.1)':'rgba(245,158,11,0.1)', color:t.statut==='validee'?T.accent:T.warning, padding:'3px 10px', borderRadius:6, fontSize:12, fontWeight:700 }}>
                                                    {STATUT_LABEL[t.statut] || t.statut}
                                                </span>
                                            </td>
                                            <td style={{ padding:'12px 16px' }}>
                                                <div style={{ display:'flex', gap:6 }}>
                                                    <button onClick={() => handleEdit(t)} style={{ padding:'5px 12px', background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.25)', borderRadius:7, color:'#60A5FA', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                                                        ✏️
                                                    </button>
                                                    <button onClick={() => handleDelete(t.id)} style={{ padding:'5px 12px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:7, color:T.danger, cursor:'pointer', fontSize:12, fontWeight:600 }}>
                                                        🗑
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                <p style={{ textAlign:'center', fontSize:11, color:T.muted, marginTop:28 }}>FinanceIQ · © 2026</p>
            </div>
        </Layout>
    );
}
