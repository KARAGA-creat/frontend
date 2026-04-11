import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRapports, genererRapport } from '../api/rapportsAPI';


export default function Rapports() {
    const navigate = useNavigate();
    const [rapports, setRapports] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [generating, setGenerating] = useState(false);
    const [form, setForm] = useState({
        mois: new Date().getMonth() + 1,
        annee: new Date().getFullYear(),
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const r = await getRapports();
            setRapports(r);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerer = async () => {
        setGenerating(true);
        try {
            await genererRapport(form.mois, form.annee);
            fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    const moisNoms = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

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
                    <div style={styles.navItem} onClick={() => navigate('/budgets')}>◎ Budgets</div>
                    <div style={styles.navLabel}>Analyse</div>
                    <div style={{...styles.navItem, ...styles.navActive}}>📊 Rapports</div>
                    <div style={styles.navItem} onClick={() => navigate('/tiers')}>👥 Tiers</div>
                    <div style={styles.navItem} onClick={() => navigate('/parametres')}> ⚙ Paramètres </div>
                </nav>
            </aside>

            {/* MAIN */}
            <main style={styles.main}>
                <header style={styles.topbar}>
                    <div>
                        <h1 style={styles.pageTitle}>Rapports Financiers</h1>
                        <p style={styles.pageSub}>Historique des snapshots mensuels</p>
                    </div>
                </header>

                <div style={styles.content}>
                    {/* GENERATEUR */}
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Générer un Rapport</h2>
                        <div style={styles.genForm}>
                            <div style={styles.field}>
                                <label style={styles.label}>Mois</label>
                                <select style={styles.input}
                                    value={form.mois}
                                    onChange={e => setForm({...form, mois: parseInt(e.target.value)})}>
                                    {moisNoms.slice(1).map((m, i) => (
                                        <option key={i+1} value={i+1}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Année</label>
                                <input style={styles.input} type="number"
                                    value={form.annee}
                                    onChange={e => setForm({...form, annee: parseInt(e.target.value)})}
                                    min="2020" max="2030" />
                            </div>
                            <button style={generating ? styles.btnDisabled : styles.btn}
                                onClick={handleGenerer}
                                disabled={generating}>
                                {generating ? 'Génération...' : '📊 Générer'}
                            </button>
                        </div>
                    </div>

                    {/* LISTE RAPPORTS */}
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>
                            Historique ({rapports.length} rapports)
                        </h2>
                        {rapports.length === 0 ? (
                            <p style={styles.empty}>Aucun rapport généré</p>
                        ) : (
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Période</th>
                                        <th style={styles.th}>Total Entrées</th>
                                        <th style={styles.th}>Total Sorties</th>
                                        <th style={styles.th}>Solde Final</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rapports.map(r => (
                                        <tr key={r.id}>
                                            <td style={styles.td}>
                                                <strong>
                                                    {moisNoms[r.mois]} {r.annee}
                                                </strong>
                                            </td>
                                            <td style={{...styles.td, color: '#10b981', fontFamily: 'monospace'}}>
                                                +{parseFloat(r.total_entrees).toLocaleString()} XOF
                                            </td>
                                            <td style={{...styles.td, color: '#ef4444', fontFamily: 'monospace'}}>
                                                -{parseFloat(r.total_sorties).toLocaleString()} XOF
                                            </td>
                                            <td style={{
                                                ...styles.td,
                                                color: parseFloat(r.solde_final) >= 0 ? '#10b981' : '#ef4444',
                                                fontFamily: 'monospace',
                                                fontWeight: '700'
                                            }}>
                                                {parseFloat(r.solde_final).toLocaleString()} XOF
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
    card:        { background: '#111827', border: '1px solid #1f2d45', borderRadius: '16px', padding: '24px', marginBottom: '20px' },
    cardTitle:   { fontSize: '15px', fontWeight: '700', color: '#f1f5f9', marginBottom: '16px' },
    genForm:     { display: 'flex', alignItems: 'flex-end', gap: '16px' },
    field:       { display: 'flex', flexDirection: 'column', gap: '6px' },
    label:       { fontSize: '12px', fontWeight: '600', color: '#94a3b8' },
    input:       { padding: '10px 14px', background: '#1a2235', border: '1px solid #1f2d45', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', outline: 'none' },
    btn:         { padding: '10px 20px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
    btnDisabled: { padding: '10px 20px', background: '#1a2235', border: 'none', borderRadius: '10px', color: '#64748b', fontSize: '13px', fontWeight: '700', cursor: 'not-allowed' },
    empty:       { color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px' },
    table:       { width: '100%', borderCollapse: 'collapse' },
    th:          { padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #1f2d45' },
    td:          { padding: '12px 16px', fontSize: '13px', color: '#f1f5f9', borderBottom: '1px solid #1f2d45' },
};