import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { getTransactions } from '../api/transactionsAPI';
import { getAlertes } from '../api/alertesAPI';
import { getBudgets } from '../api/budgetsAPI';

export default function Dashboard() {
    const dispatch  = useDispatch();
    const navigate  = useNavigate();
    const { user }  = useSelector((state) => state.auth);

    const [transactions, setTransactions] = useState([]);
    const [alertes, setAlertes]           = useState([]);
    const [budgets, setBudgets]           = useState([]);
    const [loading, setLoading]           = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [t, a, b] = await Promise.all([
                    getTransactions(),
                    getAlertes(),
                    getBudgets(),
                ]);
                setTransactions(t);
                setAlertes(a);
                setBudgets(b);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Calculs KPI
    const totalEntrees = transactions
        .filter(t => t.type === 'Entree')
        .reduce((sum, t) => sum + parseFloat(t.montant), 0);

    const totalSorties = transactions
        .filter(t => t.type === 'Sortie')
        .reduce((sum, t) => sum + parseFloat(t.montant), 0);

    const solde = totalEntrees - totalSorties;

    const alertesNonLues = alertes.filter(a => a.statut === 'non_lue').length;

    if (loading) return (
        <div style={styles.loading}>Chargement...</div>
    );

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <aside style={styles.sidebar}>
                <div style={styles.logo}>
                    <span style={styles.logoIcon}>💹</span>
                    <div>
                        <div style={styles.logoText}>FinanceIQ</div>
                        <div style={styles.logoSub}>Gestion Financière</div>
                    </div>
                </div>

                <nav style={styles.nav}>
                    <div style={styles.navLabel}>Principal</div>
                    <div style={{...styles.navItem, ...styles.navActive}}>
                        ⊞ Dashboard
                    </div>
                    <div style={styles.navItem} onClick={() => navigate('/transactions')}>
                        ↕ Transactions
                    </div>
                    <div style={styles.navItem} onClick={() => navigate('/dettes')}>
                        📄 Dettes & Factures
                    </div>
                    <div style={styles.navItem} onClick={() => navigate('/budgets')}>
                        ◎ Budgets
                    </div>
                    <div style={styles.navLabel}>Analyse</div>
                    <div style={styles.navItem} onClick={() => navigate('/rapports')}>
                        📊 Rapports
                    </div>
                    <div style={styles.navItem} onClick={() => navigate('/alertes')}>
                        🔔 Alertes
                        {alertesNonLues > 0 && (
                            <span style={styles.badge}>{alertesNonLues}</span>
                        )}
                    </div>
                    <div style={styles.navItem} onClick={() => navigate('/tiers')}>
                        👥 Tiers
                    </div>
                    <div style={styles.navItem} onClick={() => navigate('/parametres')}> ⚙ Paramètres </div>
                       
                   
                </nav>

                <div style={styles.sidebarBottom}>
                    <div style={styles.userCard}>
                        <div style={styles.avatar}>
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={styles.userName}>{user?.username}</div>
                            <div style={styles.userRole}>{user?.role}</div>
                        </div>
                    </div>
                    <button style={styles.logoutBtn} onClick={handleLogout}>
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main style={styles.main}>
                {/* TOPBAR */}
                <header style={styles.topbar}>
                    <div>
                        <h1 style={styles.pageTitle}>Tableau de Bord</h1>
                        <p style={styles.pageSub}>
                            Aperçu financier en temps réel
                        </p>
                    </div>
                </header>

                {/* CONTENT */}
                <div style={styles.content}>

                    {/* KPI CARDS */}
                    <div style={styles.kpiGrid}>
                        <div style={{...styles.kpiCard, borderTopColor: '#3b82f6'}}>
                            <div style={styles.kpiLabel}>Solde Actuel</div>
                            <div style={{...styles.kpiValue, color: '#3b82f6'}}>
                                {solde.toLocaleString()} XOF
                            </div>
                        </div>
                        <div style={{...styles.kpiCard, borderTopColor: '#10b981'}}>
                            <div style={styles.kpiLabel}>Total Entrées</div>
                            <div style={{...styles.kpiValue, color: '#10b981'}}>
                                {totalEntrees.toLocaleString()} XOF
                            </div>
                        </div>
                        <div style={{...styles.kpiCard, borderTopColor: '#ef4444'}}>
                            <div style={styles.kpiLabel}>Total Sorties</div>
                            <div style={{...styles.kpiValue, color: '#ef4444'}}>
                                {totalSorties.toLocaleString()} XOF
                            </div>
                        </div>
                        <div style={{...styles.kpiCard, borderTopColor: '#f59e0b'}}>
                            <div style={styles.kpiLabel}>Alertes</div>
                            <div style={{...styles.kpiValue, color: '#f59e0b'}}>
                                {alertesNonLues} non lues
                            </div>
                        </div>
                    </div>

                    {/* TRANSACTIONS RECENTES */}
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>
                            Transactions Récentes
                        </h2>
                        {transactions.length === 0 ? (
                            <p style={styles.empty}>
                                Aucune transaction pour le moment
                            </p>
                        ) : (
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Libellé</th>
                                        <th style={styles.th}>Type</th>
                                        <th style={styles.th}>Montant</th>
                                        <th style={styles.th}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.slice(0, 5).map(t => (
                                        <tr key={t.id}>
                                            <td style={styles.td}>{t.libelle}</td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    color: t.type === 'Entree' ? '#10b981' : '#ef4444'
                                                }}>
                                                    {t.type === 'Entree' ? '↑' : '↓'} {t.type}
                                                </span>
                                            </td>
                                            <td style={{
                                                ...styles.td,
                                                color: t.type === 'Entree' ? '#10b981' : '#ef4444',
                                                fontFamily: 'monospace'
                                            }}>
                                                {t.type === 'Entree' ? '+' : '-'}
                                                {parseFloat(t.montant).toLocaleString()} XOF
                                            </td>
                                            <td style={{...styles.td, color: '#64748b'}}>
                                                {t.date_transaction}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* BUDGETS */}
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Suivi des Budgets</h2>
                        {budgets.length === 0 ? (
                            <p style={styles.empty}>Aucun budget défini</p>
                        ) : (
                            budgets.map(b => {
                                const taux = Math.min(
                                    (parseFloat(b.montant_consomme) / parseFloat(b.montant_limite)) * 100,
                                    100
                                );
                                const color = taux >= 100 ? '#ef4444' : taux >= 75 ? '#f59e0b' : '#10b981';
                                return (
                                    <div key={b.id} style={styles.budgetItem}>
                                        <div style={styles.budgetHead}>
                                            <span style={styles.budgetName}>
                                                Catégorie #{b.id_categorie}
                                            </span>
                                            <span style={{color, fontWeight: '700'}}>
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
    loading:      { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0b0f1a', color: '#f1f5f9', fontSize: '18px' },
    sidebar:      { width: '240px', background: '#111827', borderRight: '1px solid #1f2d45', display: 'flex', flexDirection: 'column', padding: '28px 0', flexShrink: 0 },
    logo:         { padding: '0 24px 24px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #1f2d45', marginBottom: '20px' },
    logoIcon:     { fontSize: '28px' },
    logoText:     { fontSize: '17px', fontWeight: '800', color: '#f1f5f9' },
    logoSub:      { fontSize: '10px', color: '#64748b', textTransform: 'uppercase' },
    nav:          { padding: '0 16px', flex: 1 },
    navLabel:     { fontSize: '10px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#64748b', padding: '8px 8px', marginTop: '8px' },
    navItem:      { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', color: '#94a3b8', fontSize: '13.5px', fontWeight: '500', marginBottom: '2px' },
    navActive:    { background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.25)' },
    badge:        { marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '20px' },
    sidebarBottom:{ padding: '16px', borderTop: '1px solid #1f2d45' },
    userCard:     { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: '#1a2235', marginBottom: '10px' },
    avatar:       { width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700' },
    userName:     { fontSize: '13px', fontWeight: '600', color: '#f1f5f9' },
    userRole:     { fontSize: '11px', color: '#64748b' },
    logoutBtn:    { width: '100%', padding: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#ef4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    main:         { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' },
    topbar:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid #1f2d45', background: 'rgba(11,15,26,0.8)' },
    pageTitle:    { fontSize: '20px', fontWeight: '800', color: '#f1f5f9' },
    pageSub:      { fontSize: '12px', color: '#64748b', marginTop: '2px' },
    content:      { padding: '28px 32px' },
    kpiGrid:      { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    kpiCard:      { background: '#111827', border: '1px solid #1f2d45', borderRadius: '14px', padding: '20px', borderTop: '3px solid' },
    kpiLabel:     { fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', marginBottom: '10px' },
    kpiValue:     { fontSize: '22px', fontWeight: '700', fontFamily: 'monospace' },
    card:         { background: '#111827', border: '1px solid #1f2d45', borderRadius: '16px', padding: '24px', marginBottom: '20px' },
    cardTitle:    { fontSize: '15px', fontWeight: '700', color: '#f1f5f9', marginBottom: '16px' },
    empty:        { color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px' },
    table:        { width: '100%', borderCollapse: 'collapse' },
    th:           { padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #1f2d45' },
    td:           { padding: '12px 16px', fontSize: '13px', color: '#f1f5f9', borderBottom: '1px solid #1f2d45' },
    budgetItem:   { marginBottom: '16px' },
    budgetHead:   { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
    budgetName:   { fontSize: '13px', fontWeight: '600', color: '#f1f5f9' },
    progTrack:    { height: '7px', background: '#1a2235', borderRadius: '10px', overflow: 'hidden', marginBottom: '6px' },
    progFill:     { height: '100%', borderRadius: '10px' },
    budgetVals:   { fontSize: '12px', color: '#64748b' },
};