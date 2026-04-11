import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactions, createTransaction, deleteTransaction } from '../api/transactionsAPI';
import { getCategories } from '../api/categoriesAPI';
import { useSelector } from 'react-redux';

export default function Transactions() {
    const navigate = useNavigate();
    const { user }                        = useSelector((state) => state.auth);

    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories]     = useState([]);
    const [loading, setLoading]           = useState(true);
    const [showForm, setShowForm]         = useState(false);

    const [form, setForm] = useState({
        type: 'Entree',
        montant: '',
        date_transaction: '',
        libelle: '',
        id_categorie: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [t, c] = await Promise.all([
                getTransactions(),
                getCategories(),
            ]);
            setTransactions(t);
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
            await createTransaction(form);
            setShowForm(false);
            setForm({ type: 'Entree', montant: '', date_transaction: '', libelle: '', id_categorie: '' });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cette transaction ?')) {
            await deleteTransaction(id);
            fetchData();
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
                    <div style={{...styles.navItem, ...styles.navActive}}>↕ Transactions</div>
                    <div style={styles.navItem} onClick={() => navigate('/dettes')}>📄 Dettes & Factures</div>
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
                        <h1 style={styles.pageTitle}>Transactions</h1>
                        <p style={styles.pageSub}>Toutes les entrées et sorties</p>
                    </div>
                    {user?.role !== 'comptable' && (
                    <button style={styles.btn} onClick={() => setShowForm(!showForm)}>
                        ＋ Nouvelle Transaction
                    </button>
                )}
                </header>

                <div style={styles.content}>
                    {/* FORMULAIRE */}
                    {showForm && (
                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>Nouvelle Transaction</h2>
                            <form onSubmit={handleSubmit}>
                                <div style={styles.formGrid}>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Type</label>
                                        <select style={styles.input}
                                            value={form.type}
                                            onChange={e => setForm({...form, type: e.target.value})}>
                                            <option value="Entree">Entrée</option>
                                            <option value="Sortie">Sortie</option>
                                        </select>
                                    </div>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Montant (XOF)</label>
                                        <input style={styles.input} type="number"
                                            value={form.montant}
                                            onChange={e => setForm({...form, montant: e.target.value})}
                                            required />
                                    </div>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Date</label>
                                        <input style={styles.input} type="date"
                                            value={form.date_transaction}
                                            onChange={e => setForm({...form, date_transaction: e.target.value})}
                                            required />
                                    </div>
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
                                    <div style={{...styles.field, gridColumn: '1 / -1'}}>
                                        <label style={styles.label}>Libellé</label>
                                        <input style={styles.input} type="text"
                                            value={form.libelle}
                                            onChange={e => setForm({...form, libelle: e.target.value})}
                                            placeholder="Description de la transaction" />
                                    </div>
                                </div>
                                <div style={styles.formActions}>
                                    <button type="submit" style={styles.btn}>
                                        Enregistrer
                                    </button>
                                    <button type="button"
                                        style={styles.btnCancel}
                                        onClick={() => setShowForm(false)}>
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TABLE */}
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>
                            Liste des Transactions ({transactions.length})
                        </h2>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Libellé</th>
                                    <th style={styles.th}>Type</th>
                                    <th style={styles.th}>Montant</th>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>Statut</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(t => (
                                    <tr key={t.id}>
                                        <td style={styles.td}>{t.libelle}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                color: t.type === 'Entree' ? '#10b981' : '#ef4444',
                                                fontWeight: '700'
                                            }}>
                                                {t.type === 'Entree' ? '↑' : '↓'} {t.type}
                                            </span>
                                        </td>
                                        <td style={{
                                            ...styles.td,
                                            color: t.type === 'Entree' ? '#10b981' : '#ef4444',
                                            fontFamily: 'monospace', fontWeight: '700'
                                        }}>
                                            {t.type === 'Entree' ? '+' : '-'}
                                            {parseFloat(t.montant).toLocaleString()} XOF
                                        </td>
                                        <td style={{...styles.td, color: '#64748b'}}>
                                            {t.date_transaction}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                background: t.statut === 'validee' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                                color: t.statut === 'validee' ? '#10b981' : '#f59e0b',
                                                padding: '3px 10px', borderRadius: '6px',
                                                fontSize: '12px', fontWeight: '700'
                                            }}>
                                                {t.statut}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <button
                                                style={styles.deleteBtn}
                                                onClick={() => handleDelete(t.id)}>
                                                🗑 Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
    table:       { width: '100%', borderCollapse: 'collapse' },
    th:          { padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #1f2d45' },
    td:          { padding: '12px 16px', fontSize: '13px', color: '#f1f5f9', borderBottom: '1px solid #1f2d45' },
    deleteBtn:   { padding: '6px 12px', background: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#ffffff', fontWeight: '700' },
};