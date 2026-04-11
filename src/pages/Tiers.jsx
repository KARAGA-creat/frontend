import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTiers, createTiers, updateTiers, deleteTiers } from '../api/tiersAPI';

export default function Tiers() {
    const navigate = useNavigate();
    const [tiers, setTiers]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({
        nom: '', type: 'Client',
        email: '', telephone: '', adresse: '',
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const t = await getTiers();
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
            if (editItem) {
                await updateTiers(editItem.id, form);
            } else {
                await createTiers(form);
            }
            setShowForm(false);
            setEditItem(null);
            setForm({ nom: '', type: 'Client', email: '', telephone: '', adresse: '' });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (t) => {
        setEditItem(t);
        setForm({ nom: t.nom, type: t.type, email: t.email || '', telephone: t.telephone || '', adresse: t.adresse || '' });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce tiers ?')) {
            await deleteTiers(id);
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
                    <div style={styles.navItem} onClick={() => navigate('/transactions')}>↕ Transactions</div>
                    <div style={styles.navItem} onClick={() => navigate('/dettes')}>📄 Dettes & Factures</div>
                    <div style={styles.navItem} onClick={() => navigate('/budgets')}>◎ Budgets</div>
                    <div style={styles.navLabel}>Analyse</div>
                    <div style={styles.navItem} onClick={() => navigate('/rapports')}>📊 Rapports</div>
                    <div style={{...styles.navItem, ...styles.navActive}}>👥 Tiers</div>
                    <div style={styles.navItem} onClick={() => navigate('/parametres')}> ⚙ Paramètres </div>
                </nav>
            </aside>

            {/* MAIN */}
            <main style={styles.main}>
                <header style={styles.topbar}>
                    <div>
                        <h1 style={styles.pageTitle}>Tiers</h1>
                        <p style={styles.pageSub}>Clients & Fournisseurs</p>
                    </div>
                    <button style={styles.btn} onClick={() => {
                        setEditItem(null);
                        setForm({ nom: '', type: 'Client', email: '', telephone: '', adresse: '' });
                        setShowForm(!showForm);
                    }}>
                        ＋ Nouveau Tiers
                    </button>
                </header>

                <div style={styles.content}>
                    {/* FORMULAIRE */}
                    {showForm && (
                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>
                                {editItem ? 'Modifier Tiers' : 'Nouveau Tiers'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div style={styles.formGrid}>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Nom</label>
                                        <input style={styles.input} type="text"
                                            value={form.nom}
                                            onChange={e => setForm({...form, nom: e.target.value})}
                                            required />
                                    </div>
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
                                        <label style={styles.label}>Email</label>
                                        <input style={styles.input} type="email"
                                            value={form.email}
                                            onChange={e => setForm({...form, email: e.target.value})} />
                                    </div>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Téléphone</label>
                                        <input style={styles.input} type="text"
                                            value={form.telephone}
                                            onChange={e => setForm({...form, telephone: e.target.value})} />
                                    </div>
                                    <div style={{...styles.field, gridColumn: '1 / -1'}}>
                                        <label style={styles.label}>Adresse</label>
                                        <input style={styles.input} type="text"
                                            value={form.adresse}
                                            onChange={e => setForm({...form, adresse: e.target.value})} />
                                    </div>
                                </div>
                                <div style={styles.formActions}>
                                    <button type="submit" style={styles.btn}>
                                        {editItem ? 'Modifier' : 'Enregistrer'}
                                    </button>
                                    <button type="button" style={styles.btnCancel}
                                        onClick={() => setShowForm(false)}>
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* LISTE TIERS */}
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>
                            Liste des Tiers ({tiers.length})
                        </h2>
                        <div style={styles.tiersGrid}>
                            {tiers.length === 0 ? (
                                <p style={styles.empty}>Aucun tiers enregistré</p>
                            ) : (
                                tiers.map(t => (
                                    <div key={t.id} style={styles.tiersCard}>
                                        <div style={styles.tiersHead}>
                                            <div style={styles.tiersAvatar}>
                                                {t.nom.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={styles.tiersNom}>{t.nom}</div>
                                                <span style={{
                                                    ...styles.tiersBadge,
                                                    background: t.type === 'Client' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
                                                    color: t.type === 'Client' ? '#10b981' : '#3b82f6'
                                                }}>
                                                    {t.type}
                                                </span>
                                            </div>
                                        </div>
                                        {t.email && (
                                            <div style={styles.tiersInfo}>
                                                📧 {t.email}
                                            </div>
                                        )}
                                        {t.telephone && (
                                            <div style={styles.tiersInfo}>
                                                📞 {t.telephone}
                                            </div>
                                        )}
                                        {t.adresse && (
                                            <div style={styles.tiersInfo}>
                                                📍 {t.adresse}
                                            </div>
                                        )}
                                        <div style={styles.tiersActions}>
                                            <button style={styles.editBtn}
                                                onClick={() => handleEdit(t)}>
                                                ✏ Modifier
                                            </button>
                                            <button style={styles.deleteBtn}
                                                onClick={() => handleDelete(t.id)}>
                                                🗑 Supprimer
                                            </button>
                                        </div>
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
    tiersGrid:   { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
    tiersCard:   { background: '#1a2235', border: '1px solid #1f2d45', borderRadius: '12px', padding: '18px' },
    tiersHead:   { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
    tiersAvatar: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', flexShrink: 0 },
    tiersNom:    { fontSize: '14px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' },
    tiersBadge:  { padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' },
    tiersInfo:   { fontSize: '12px', color: '#64748b', marginBottom: '6px' },
    tiersActions:{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #1f2d45' },
    editBtn:     { flex: 1, padding: '6px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '8px', color: '#3b82f6', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
    deleteBtn:   {padding: '6px 12px', background: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#ffffff', fontWeight: '700' },
};