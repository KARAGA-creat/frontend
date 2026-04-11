import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBudgets, createBudget, updateBudget } from '../api/budgetsAPI';
import { getCategories } from '../api/categoriesAPI';
import { getAlertes, marquerLue } from '../api/alertesAPI';

export default function Budgets() {
    const navigate = useNavigate();
    const [budgets, setBudgets]     = useState([]);
    const [alertes, setAlertes]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [showForm, setShowForm]   = useState(false);
    const [form, setForm] = useState({
        montant_limite: '',
        date_debut: '',
        date_fin: '',
        id_categorie: '',
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [b, a, c] = await Promise.all([
                getBudgets(),
                getAlertes(),
                getCategories(),
            ]);
            setBudgets(b);
            setAlertes(a);
            setCategories(c);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createBudget(form);
            setShowForm(false);
            setForm({ montant_limite: '', date_debut: '', date_fin: '', id_categorie: '' });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarquerLue = async (id) => {
        await marquerLue(id);
        fetchData();
    };

    const getColor = (taux) => {
        if (taux >= 100) return '#ef4444';
        if (taux >= 75)  return '#f59e0b';
        return '#10b981';
    };

    const getCatNom = (id) => {
        const cat = categories.find(c => c.id === id);
        return cat ? cat.nom_categorie : `Catégorie #${id}`;
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
                    <div style={styles.navItem} onClick={() => navigate('/dettes')}>📄 Dettes & Factures</div>
                    <div style={{...styles.navItem, ...styles.navActive}}>◎ Budgets & Alertes</div>
                    <div style={styles.navLabel}>Analyse</div>
                    <div style={styles.navItem} onClick={() => navigate('/rapports')}>📊 Rapports</div>
                    <div style={styles.navItem} onClick={() => navigate('/tiers')}>👥 Tiers</div>

                    <div style={styles.navItem} onClick={() => navigate('/parametres')}> ⚙ Paramètres</div>
   

                </nav>
            </aside>

            {/* MAIN */}
            <main style={styles.main}>
                <header style={styles.topbar}>
                    <div>
                        <h1 style={styles.pageTitle}>Budgets & Alertes</h1>
                        <p style={styles.pageSub}>Contrôle des dépenses et notifications</p>
                    </div>
                    <button style={styles.btn} onClick={() => setShowForm(!showForm)}>
                        ＋ Nouveau Budget
                    </button>
                </header>

                <div style={styles.content}>
                    {/* FORMULAIRE */}
                    {showForm && (
                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>Nouveau Budget</h2>
                            <form onSubmit={handleSubmit}>
                                <div style={styles.formGrid}>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Catégorie</label>
                                        <select style={styles.input}
                                            value={form.id_categorie}
                                            onChange={e => setForm({...form, id_categorie: e.target.value})}
                                            required>
                                            <option value="">Choisir...</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.nom_categorie}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Montant Limite (XOF)</label>
                                        <input style={styles.input} type="number"
                                            value={form.montant_limite}
                                            onChange={e => setForm({...form, montant_limite: e.target.value})}
                                            required />
                                    </div>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Date Début</label>
                                        <input style={styles.input} type="date"
                                            value={form.date_debut}
                                            onChange={e => setForm({...form, date_debut: e.target.value})}
                                            required />
                                    </div>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Date Fin</label>
                                        <input style={styles.input} type="date"
                                            value={form.date_fin}
                                            onChange={e => setForm({...form, date_fin: e.target.value})}
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

                    {/* DEUX COLONNES */}
                    <div style={styles.twoCol}>

                        {/* BUDGETS */}
                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>
                                Suivi des Budgets ({budgets.length})
                            </h2>
                            {budgets.length === 0 ? (
                                <p style={styles.empty}>Aucun budget défini</p>
                            ) : (
                                budgets.map(b => {
                                    const taux = Math.min(
                                        (parseFloat(b.montant_consomme) / parseFloat(b.montant_limite)) * 100, 100
                                    );
                                    const color = getColor(taux);
                                    return (
                                        <div key={b.id} style={styles.budgetItem}>
                                            <div style={styles.budgetHead}>
                                                <span style={styles.budgetName}>
                                                    {getCatNom(b.id_categorie)}
                                                </span>
                                                <span style={{color, fontWeight: '700', fontFamily: 'monospace'}}>
                                                    {taux.toFixed(0)}%
                                                </span>
                                            </div>
                                            <div style={styles.progTrack}>
                                                <div style={{
                                                    ...styles.progFill,
                                                    width: `${taux}%`,
                                                    background: color
                                                }}/>
                                            </div>
                                            <div style={styles.budgetVals}>
                                                {parseFloat(b.montant_consomme).toLocaleString()} /
                                                {parseFloat(b.montant_limite).toLocaleString()} XOF
                                            </div>
                                            <div style={styles.budgetDates}>
                                                {b.date_debut} → {b.date_fin}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* ALERTES */}
                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>
                                Alertes ({alertes.filter(a => a.statut === 'non_lue').length} non lues)
                            </h2>
                            {alertes.length === 0 ? (
                                <p style={styles.empty}>Aucune alerte</p>
                            ) : (
                                alertes.map(a => (
                                    <div key={a.id} style={{
                                        ...styles.alerteItem,
                                        opacity: a.statut === 'lue' ? 0.5 : 1,
                                        borderColor: a.type_alerte === 'depassement_budget' ? 'rgba(239,68,68,0.3)' :
                                                     a.type_alerte === 'baisse_tresorerie' ? 'rgba(245,158,11,0.3)' :
                                                     'rgba(59,130,246,0.3)'
                                    }}>
                                        <div style={styles.alerteIcon}>
                                            {a.type_alerte === 'depassement_budget' ? '⚠️' :
                                             a.type_alerte === 'baisse_tresorerie' ? '📉' :
                                             a.type_alerte === 'echeance_dette' ? '📅' : '🔔'}
                                        </div>
                                        <div style={styles.alerteBody}>
                                            <div style={styles.alerteMsg}>{a.message}</div>
                                            <div style={styles.alerteDate}>{a.date_emission}</div>
                                        </div>
                                        {a.statut === 'non_lue' && (
                                            <button style={styles.lueBtn}
                                                onClick={() => handleMarquerLue(a.id)}>
                                                ✓ Lu
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

const styles = {
    container:   { display: 'flex', minHeight: '100vh', background: '#0b0f1a', color: '#f1f5f9' },
    loading:     { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0b0f1a', color: '#f1f5f9' },
    sidebar:     { width: '240px', background: '#111827', borderRight: '1px solid #1f2d45', display: 'flex', flexDirection: 'column', padding: '28px 0', flexShrink: 0 },
    logo:        { padding: '0 24px 24px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #1f2d45', marginBottom: '20px' },
    logoText:    { fontSize: '17px', fontWeight: '800', color: '#f1f5f9' },
    logoSub:     { fontSize: '10px', color: '#64748b', textTransform: 'uppercase' },
    nav:         { padding: '0 16px', flex: 1 },
    navLabel:    { fontSize: '10px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#64748b', padding: '8px 8px', marginTop: '8px' },
    navItem:     { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', color: '#94a3b8', fontSize: '13.5px', fontWeight: '500', marginBottom: '2px' },
    navActive:   { background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.25)' },
    main:        { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' },
    topbar:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid #1f2d45' },
    pageTitle:   { fontSize: '20px', fontWeight: '800', color: '#f1f5f9' },
    pageSub:     { fontSize: '12px', color: '#64748b', marginTop: '2px' },
    content:     { padding: '28px 32px' },
    card:        { background: '#111827', border: '1px solid #1f2d45', borderRadius: '16px', padding: '24px', marginBottom: '20px' },
    cardTitle:   { fontSize: '15px', fontWeight: '700', color: '#f1f5f9', marginBottom: '16px' },
    btn:         { padding: '10px 20px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
    btnCancel:   { padding: '10px 20px', background: '#1a2235', border: '1px solid #1f2d45', borderRadius: '10px', color: '#94a3b8', fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginLeft: '10px' },
    formGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
    field:       { display: 'flex', flexDirection: 'column', gap: '6px' },
    label:       { fontSize: '12px', fontWeight: '600', color: '#94a3b8' },
    input:       { padding: '10px 14px', background: '#1a2235', border: '1px solid #1f2d45', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', outline: 'none' },
    formActions: { display: 'flex', gap: '10px', marginTop: '8px' },
    empty:       { color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px' },
    twoCol:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    budgetItem:  { marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #1f2d45' },
    budgetHead:  { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
    budgetName:  { fontSize: '13px', fontWeight: '600', color: '#f1f5f9' },
    progTrack:   { height: '7px', background: '#1a2235', borderRadius: '10px', overflow: 'hidden', marginBottom: '6px' },
    progFill:    { height: '100%', borderRadius: '10px' },
    budgetVals:  { fontSize: '12px', color: '#64748b' },
    budgetDates: { fontSize: '11px', color: '#475569', marginTop: '4px' },
    alerteItem:  { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', borderRadius: '10px', border: '1px solid', marginBottom: '10px', background: 'rgba(255,255,255,0.02)' },
    alerteIcon:  { fontSize: '20px', flexShrink: 0 },
    alerteBody:  { flex: 1 },
    alerteMsg:   { fontSize: '13px', fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' },
    alerteDate:  { fontSize: '11px', color: '#64748b' },
    lueBtn:      { padding: '4px 10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '6px', color: '#10b981', fontSize: '12px', fontWeight: '700', cursor: 'pointer', flexShrink: 0 },
};