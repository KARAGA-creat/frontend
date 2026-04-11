import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlertes, marquerLue } from '../api/alertesAPI';

export default function Alertes() {
    const navigate = useNavigate();
    const [alertes, setAlertes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const a = await getAlertes();
            setAlertes(a);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarquerLue = async (id) => {
        await marquerLue(id);
        fetchData();
    };

    const handleToutMarquerLu = async () => {
        const nonLues = alertes.filter(a => a.statut === 'non_lue');
        for (const a of nonLues) {
            await marquerLue(a.id);
        }
        fetchData();
    };

    const getIcone = (type) => {
        switch(type) {
            case 'depassement_budget': return '🚨';
            case 'baisse_tresorerie':  return '📉';
            case 'echeance_dette':     return '📅';
            default:                   return '🔔';
        }
    };

    const getCouleur = (type) => {
        switch(type) {
            case 'depassement_budget': return 'rgba(239,68,68,0.2)';
            case 'baisse_tresorerie':  return 'rgba(245,158,11,0.2)';
            default:                   return 'rgba(59,130,246,0.2)';
        }
    };

    if (loading) return <div style={styles.loading}>Chargement...</div>;

    const nonLues = alertes.filter(a => a.statut === 'non_lue').length;

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
                    <div style={styles.navItem} onClick={() => navigate('/budgets')}>◎ Budgets</div>
                    <div style={styles.navLabel}>Analyse</div>
                    <div style={styles.navItem} onClick={() => navigate('/rapports')}>📊 Rapports</div>
                    <div style={{...styles.navItem, ...styles.navActive}}>🔔 Alertes</div>
                    <div style={styles.navItem} onClick={() => navigate('/tiers')}>👥 Tiers</div>

                    <div style={styles.navItem} onClick={() => navigate('/parametres')}>
                             ⚙ Paramètres
                    </div>

                </nav>
            </aside>

            {/* MAIN */}
            <main style={styles.main}>
                <header style={styles.topbar}>
                    <div>
                        <h1 style={styles.pageTitle}>Alertes</h1>
                        <p style={styles.pageSub}>
                            {nonLues} alerte{nonLues > 1 ? 's' : ''} non lue{nonLues > 1 ? 's' : ''}
                        </p>
                    </div>
                    {nonLues > 0 && (
                        <button style={styles.btn} onClick={handleToutMarquerLu}>
                            ✓ Tout marquer lu
                        </button>
                    )}
                </header>

                <div style={styles.content}>
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>
                            Toutes les alertes ({alertes.length})
                        </h2>
                        {alertes.length === 0 ? (
                            <p style={styles.empty}>🎉 Aucune alerte — tout va bien !</p>
                        ) : (
                            alertes.map(a => (
                                <div key={a.id} style={{
                                    ...styles.alerteItem,
                                    opacity: a.statut === 'lue' ? 0.5 : 1,
                                    background: getCouleur(a.type_alerte),
                                }}>
                                    <div style={styles.alerteIcon}>
                                        {getIcone(a.type_alerte)}
                                    </div>
                                    <div style={styles.alerteBody}>
                                        <div style={styles.alerteMsg}>{a.message}</div>
                                        <div style={styles.alerteMeta}>
                                            <span style={styles.alerteType}>
                                                {a.type_alerte.replace(/_/g, ' ')}
                                            </span>
                                            <span style={styles.alerteDate}>
                                                {new Date(a.date_emission).toLocaleString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={styles.alerteRight}>
                                        <span style={{
                                            ...styles.statutBadge,
                                            background: a.statut === 'lue' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                            color: a.statut === 'lue' ? '#10b981' : '#ef4444'
                                        }}>
                                            {a.statut === 'lue' ? '✓ Lue' : '● Non lue'}
                                        </span>
                                        {a.statut === 'non_lue' && (
                                            <button style={styles.lueBtn}
                                                onClick={() => handleMarquerLue(a.id)}>
                                                Marquer lu
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
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
    card:        { background: '#111827', border: '1px solid #1f2d45', borderRadius: '16px', padding: '24px' },
    cardTitle:   { fontSize: '15px', fontWeight: '700', color: '#f1f5f9', marginBottom: '16px' },
    btn:         { padding: '10px 20px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
    empty:       { color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '40px' },
    alerteItem:  { display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px', borderRadius: '12px', marginBottom: '10px' },
    alerteIcon:  { fontSize: '24px', flexShrink: 0 },
    alerteBody:  { flex: 1 },
    alerteMsg:   { fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px' },
    alerteMeta:  { display: 'flex', gap: '12px', alignItems: 'center' },
    alerteType:  { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
    alerteDate:  { fontSize: '11px', color: '#64748b' },
    alerteRight: { display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', flexShrink: 0 },
    statutBadge: { padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' },
    lueBtn:      { padding: '5px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '6px', color: '#10b981', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
};