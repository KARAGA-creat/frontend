import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDettes, createDette, updateDette } from '../api/dettesAPI';
import { getTiers } from '../api/tiersAPI';

export default function Dettes() {
    const navigate = useNavigate();
    const [dettes, setDettes]     = useState([]);
    const [tiers, setTiers]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        type: 'Client',
        montant_total: '',
        montant_paye: '0',
        date_echeance: '',
        id_tiers: '',
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [d, t] = await Promise.all([getDettes(), getTiers()]);
            setDettes(d);
            setTiers(t);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createDette(form);
            setShowForm(false);
            setForm({ type: 'Client', montant_total: '', montant_paye: '0', date_echeance: '', id_tiers: '' });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handlePaiement = async (dette) => {
        const montant = prompt('Montant du paiement :');
        if (!montant) return;
        const nouveauMontantPaye = parseFloat(dette.montant_paye) + parseFloat(montant);
        const statut = nouveauMontantPaye >= parseFloat(dette.montant_total) ? 'solde' : 'partiellement_paye';
        await updateDette(dette.id, {
            montant_paye: nouveauMontantPaye,
            statut: statut
        });
        fetchData();
    };

    const getStatutColor = (statut) => {
        switch(statut) {
            case 'solde':              return '#10b981';
            case 'en_retard':         return '#ef4444';
            case 'partiellement_paye': return '#f59e0b';
            default:                  return '#3b82f6';
        }
    };

    if (loading) return <div style={styles.loading}>Chargement...</div>;

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <aside style={styles.sidebar}>
                <div style={styles.logo}>
                    <span>💹</span>
                    <div>
                        <div style={styles.logoText}>FinanceIQ</div>
                        <div style={styles.logoSub}>Gestion Financière</div>
                    </div>
                </div>
                <nav style={styles.nav}>
                    <div style={styles.navLabel}>Principal</div>
                    <div style={styles.navItem} onClick={() => navigate('/dashboard')}>⊞ Dashboard</div>
                    <div style={styles.navItem} onClick={() => navigate('/transactions')}>↕ Transactions</div>
                    <div style={{...styles.navItem, ...styles.navActive}}>📄 Dettes & Factures</div>
                    <div style={styles.navItem} onClick={() => navigate('/budgets')}>◎ Budgets</div>
                    <div style={styles.navLabel}>Analyse</div>
                    <div style={styles.navItem} onClick={() => navigate('/rapports')}>📊 Rapports</div>
                    <div style={styles.navItem} onClick={() => navigate('/alertes')}>🔔 Alertes</div>
                    <div style={styles.navItem} onClick={() => navigate('/tiers')}>👥 Tiers</div>
                    <div style={styles.navItem} onClick={() => navigate('/parametres')}> ⚙ Paramètres </div>

                </nav>
            </aside>

            {/* MAIN */}
            <main style={styles.main}>
                <header style={styles.topbar}>
                    <div>
                        <h1 style={styles.pageTitle}>Dettes & Factures</h1>
                        <p style={styles.pageSub}>Suivi des créances et dettes</p>
                    </div>
                    <button style={styles.btn} onClick={() => setShowForm(!showForm)}>
                        ＋ Nouvelle Dette
                    </button>
                </header>

                <div style={styles.content}>
                    {/* FORMULAIRE */}
                    {showForm && (
                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>Nouvelle Dette / Facture</h2>
                            <form onSubmit={handleSubmit}>
                                <div style={styles.formGrid}>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Type</label>
                                        <select style={styles.input}
                                            value={form.type}
                                            onChange={e => setForm({...form, type: e.target.value})}>
                                            <option value="Client">Client</option>
                                            <option value="Fournisseur">Fournisseur</option>
                                        </select>
                                    </div>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Tiers</label>
                                        <select style={styles.input}
                                            value={form.id_tiers}
                                            onChange={e => setForm({...form, id_tiers: e.target.value})}
                                            required>
                                            <option value="">Choisir...</option>
                                            {tiers.map(t => (
                                                <option key={t.id} value={t.id}>
                                                    {t.nom} ({t.type})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Montant Total (XOF)</label>
                                        <input style={styles.input} type="number"
                                            value={form.montant_total}
                                            onChange={e => setForm({...form, montant_total: e.target.value})}
                                            required />
                                    </div>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Date Échéance</label>
                                        <input style={styles.input} type="date"
                                            value={form.date_echeance}
                                            onChange={e => setForm({...form, date_echeance: e.target.value})}
                                            required />
                                    </div>
                                </div>
                                <div style={styles.formActions}>
                                    <button type="submit" style={styles.btn}>Enregistrer</button>
                                    <button type="button" style={styles.btnCancel}
                                        onClick={() => setShowForm(false)}>Annuler</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* CARDS DETTES */}
                    <div style={styles.detteGrid}>
                        {dettes.length === 0 ? (
                            <p style={styles.empty}>Aucune dette pour le moment</p>
                        ) : (
                            dettes.map(d => {
                                const taux = Math.min(
                                    (parseFloat(d.montant_paye) / parseFloat(d.montant_total)) * 100, 100
                                );
                                const tiersTrouve = tiers.find(t => t.id === d.id_tiers);
                                return (
                                    <div key={d.id} style={styles.detteCard}>
                                        <div style={styles.detteHead}>
                                            <div>
                                                <div style={styles.detteTiers}>
                                                    {tiersTrouve ? tiersTrouve.nom : `Tiers #${d.id_tiers}`}
                                                </div>
                                                <div style={styles.detteType}>
                                                    {d.type === 'Client' ? '📤 Créance' : '📥 Dette'}
                                                </div>
                                            </div>
                                            <span style={{
                                                ...styles.statutBadge,
                                                background: `${getStatutColor(d.statut)}22`,
                                                color: getStatutColor(d.statut)
                                            }}>
                                                {d.statut.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div style={styles.detteAmount}>
                                            {parseFloat(d.montant_total).toLocaleString()} XOF
                                        </div>
                                        <div style={styles.progTrack}>
                                            <div style={{
                                                ...styles.progFill,
                                                width: `${taux}%`,
                                                background: getStatutColor(d.statut)
                                            }}/>
                                        </div>
                                        <div style={styles.dettePaye}>
                                            Payé : {parseFloat(d.montant_paye).toLocaleString()} XOF ({taux.toFixed(0)}%)
                                        </div>
                                        <div style={styles.detteFooter}>
                                            <span style={styles.echeance}>
                                                Échéance : {d.date_echeance}
                                            </span>
                                            {d.statut !== 'solde' && (
                                                <button style={styles.payBtn}
                                                    onClick={() => handlePaiement(d)}>
                                                     {d.type === 'Client' ? '💰 Marquer reçu' : '💸 Effectuer paiement'}

                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

const styles = {
    container:    { display: 'flex', minHeight: '100vh', background: '#0b0f1a', color: '#f1f5f9' },
    loading:      { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0b0f1a', color: '#f1f5f9' },
    sidebar:      { width: '240px', background: '#111827', borderRight: '1px solid #1f2d45', display: 'flex', flexDirection: 'column', padding: '28px 0', flexShrink: 0 },
    logo:         { padding: '0 24px 24px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #1f2d45', marginBottom: '20px' },
    logoText:     { fontSize: '17px', fontWeight: '800', color: '#f1f5f9' },
    logoSub:      { fontSize: '10px', color: '#64748b', textTransform: 'uppercase' },
    nav:          { padding: '0 16px', flex: 1 },
    navLabel:     { fontSize: '10px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#64748b', padding: '8px 8px', marginTop: '8px' },
    navItem:      { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', color: '#94a3b8', fontSize: '13.5px', fontWeight: '500', marginBottom: '2px' },
    navActive:    { background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.25)' },
    main:         { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' },
    topbar:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid #1f2d45' },
    pageTitle:    { fontSize: '20px', fontWeight: '800', color: '#f1f5f9' },
    pageSub:      { fontSize: '12px', color: '#64748b', marginTop: '2px' },
    content:      { padding: '28px 32px' },
    card:         { background: '#111827', border: '1px solid #1f2d45', borderRadius: '16px', padding: '24px', marginBottom: '20px' },
    cardTitle:    { fontSize: '15px', fontWeight: '700', color: '#f1f5f9', marginBottom: '16px' },
    btn:          { padding: '10px 20px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
    btnCancel:    { padding: '10px 20px', background: '#1a2235', border: '1px solid #1f2d45', borderRadius: '10px', color: '#94a3b8', fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginLeft: '10px' },
    formGrid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
    field:        { display: 'flex', flexDirection: 'column', gap: '6px' },
    label:        { fontSize: '12px', fontWeight: '600', color: '#94a3b8' },
    input:        { padding: '10px 14px', background: '#1a2235', border: '1px solid #1f2d45', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', outline: 'none' },
    formActions:  { display: 'flex', gap: '10px', marginTop: '8px' },
    empty:        { color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px' },
    detteGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
    detteCard:    { background: '#111827', border: '1px solid #1f2d45', borderRadius: '14px', padding: '20px' },
    detteHead:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' },
    detteTiers:   { fontSize: '14px', fontWeight: '700', color: '#f1f5f9' },
    detteType:    { fontSize: '12px', color: '#64748b', marginTop: '3px' },
    statutBadge:  { padding: '4px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: '700' },
    detteAmount:  { fontSize: '22px', fontWeight: '700', color: '#f1f5f9', marginBottom: '12px', fontFamily: 'monospace' },
    progTrack:    { height: '6px', background: '#1a2235', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' },
    progFill:     { height: '100%', borderRadius: '10px' },
    dettePaye:    { fontSize: '12px', color: '#64748b', marginBottom: '12px' },
    detteFooter:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1f2d45', paddingTop: '12px' },
    echeance:     { fontSize: '12px', color: '#64748b' },
    payBtn:       { padding: '6px 14px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '8px', color: '#3b82f6', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
};