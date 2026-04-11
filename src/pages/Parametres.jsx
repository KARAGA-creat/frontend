import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createCategorie, deleteCategorie } from '../api/categoriesAPI';
import API from '../api/axios';
import { getUtilisateurs, creerGestionnaire } from '../api/authAPI';
export default function Parametres() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [newCat, setNewCat]         = useState('');
    const [entreprise, setEntreprise] = useState(null);
    const [formEntreprise, setFormEntreprise] = useState({
        nom: '', devise: 'XOF', date_creation: '', logo: '',
    });

    const [utilisateurs, setUtilisateurs] = useState([]);
    const [showUserForm, setShowUserForm] = useState(false);
    const [formUser, setFormUser] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [userError, setUserError]     = useState('');
    const [userSuccess, setUserSuccess] = useState('');
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [c, e] = await Promise.all([
                getCategories(),
                API.get('entreprises/'),
                getUtilisateurs(), 
            ]);
            setCategories(c);
            setEntreprise(e.data);
            setUtilisateurs(u);
            setFormEntreprise({
                nom: e.data.nom,
                devise: e.data.devise,
                date_creation: e.data.date_creation,
                logo: e.data.logo,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategorie = async (e) => {
        e.preventDefault();
        if (!newCat.trim()) return;
        try {
            await createCategorie({ nom_categorie: newCat });
            setNewCat('');
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteCategorie = async (id) => {
        if (window.confirm('Supprimer cette catégorie ?')) {
            await deleteCategorie(id);
            fetchData();
        }
    };

    const handleSaveEntreprise = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('nom', formEntreprise.nom);
            formData.append('devise', formEntreprise.devise);
            formData.append('date_creation', formEntreprise.date_creation);
            if (formEntreprise.logo instanceof File) {
                formData.append('logo', formEntreprise.logo);
            }
            await API.put('entreprises/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Entreprise mise à jour !');
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la mise à jour de l\'entreprise.');}
    };

    const handleCreerGestionnaire = async (e) => {
        e.preventDefault();
        setUserError('');
        setUserSuccess('');
        try {
            await creerGestionnaire(formUser);
            setUserSuccess('Gestionnaire créé avec succès !');
            setFormUser({ username: '', email: '', password: '' });
            setShowUserForm(false);
            fetchData();
        } catch (err) {
            setUserError(
            err.response?.data?.error ||
            'Erreur lors de la création !'
            );
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
                    <div style={styles.navItem} onClick={() => navigate('/alertes')}>🔔 Alertes</div>
                    <div style={styles.navItem} onClick={() => navigate('/tiers')}>👥 Tiers</div>
                    <div style={styles.navLabel}>Administration</div>
                    <div style={{...styles.navItem, ...styles.navActive}}>⚙ Paramètres</div>
                </nav>
            </aside>

            {/* MAIN */}
            <main style={styles.main}>
                <header style={styles.topbar}>
                    <div>
                        <h1 style={styles.pageTitle}>Paramètres</h1>
                        <p style={styles.pageSub}>Administration — Accès réservé</p>
                    </div>
                </header>

                <div style={styles.content}>
                    {/* ENTREPRISE */}
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>🏢 Informations Entreprise</h2>
                        <form onSubmit={handleSaveEntreprise}>
                            <div style={styles.formGrid}>

                <div style={styles.field}>
                    <label style={styles.label}>Nom de l'entreprise</label>
                        <input style={styles.input} type="text"
                            value={formEntreprise.nom}
                            onChange={e => setFormEntreprise({...formEntreprise, nom: e.target.value})}
                        required />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Devise</label>
                        <select style={styles.input}
                            value={formEntreprise.devise}
                            onChange={e => setFormEntreprise({...formEntreprise, devise: e.target.value})}>
                            <option value="XOF">XOF — Franc CFA</option>
                            <option value="GNF">GNF — Franc Guinéen</option>
                            <option value="EUR">EUR — Euro</option>
                            <option value="USD">USD — Dollar</option>
                            <option value="MAD">MAD — Dirham</option>
                        </select>
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Date de création</label>
                        <input style={styles.input} type="date"
                            value={formEntreprise.date_creation}
                            onChange={e => setFormEntreprise({...formEntreprise, date_creation: e.target.value})}
                        required />
                </div>

                <div style={styles.field}>
    <label style={styles.label}>Logo de l'entreprise</label>

    {/* Aperçu de l'image */}
    {(logoPreview || entreprise?.logo) && (
        <img 
            src={logoPreview || `http://127.0.0.1:8000${entreprise.logo}`}
            alt="Logo"
            style={{
                width: '80px', 
                height: '80px',
                borderRadius: '10px',
                marginBottom: '8px',
                objectFit: 'cover',
                border: '2px solid #1f2d45'
            }}
        />
    )}

    {/* Input caché */}
    <input 
        type="file" 
        accept="image/*"
        id="logoInput"
        style={{display: 'none'}}
        onChange={e => {
            const file = e.target.files[0];
            if (file) {
                setFormEntreprise({...formEntreprise, logo: file});
                setLogoPreview(URL.createObjectURL(file));
            }
        }}
    />

    {/* Bouton stylisé */}
    <label htmlFor="logoInput" style={{
    display: 'inline-block',
    padding: '8px 16px',
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.3)',
    borderRadius: '8px',
    color: '#3b82f6',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px'
}}>
    {(logoPreview || entreprise?.logo) 
        ? '📷 Changer le logo'      
        : '📷 Choisir un logo'      
    }
</label>
</div>
        </div>
                            <button type="submit" style={styles.btn}>
                                💾 Enregistrer
                            </button>
                        </form>
                    </div>

                    {/* CATEGORIES */}
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>🏷️ Gestion des Catégories</h2>

                        {/* Ajouter catégorie */}
                        <form onSubmit={handleAddCategorie} style={styles.addForm}>
                            <input style={{...styles.input, flex: 1}}
                                type="text"
                                value={newCat}
                                onChange={e => setNewCat(e.target.value)}
                                placeholder="Nom de la catégorie..." />
                            <button type="submit" style={styles.btn}>
                                ＋ Ajouter
                            </button>
                        </form>

                        {/* Liste catégories */}
                        <div style={styles.catList}>
                            {categories.map(c => (
                                <div key={c.id} style={styles.catItem}>
                                    <span style={styles.catNom}>
                                        🏷️ {c.nom_categorie}
                                    </span>
                                    <button style={styles.deleteBtn}
                                        onClick={() => handleDeleteCategorie(c.id)}>
                                        🗑 Supprimer
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* GESTION UTILISATEURS */}
<div style={styles.card}>
    <h2 style={styles.cardTitle}>👥 Gestion des Utilisateurs</h2>

    {userSuccess && (
        <div style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.3)',
            color: '#10b981', padding: '12px',
            borderRadius: '8px', marginBottom: '16px',
            fontSize: '13px'
        }}>
            ✅ {userSuccess}
        </div>
    )}

    {userError && (
        <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444', padding: '12px',
            borderRadius: '8px', marginBottom: '16px',
            fontSize: '13px'
        }}>
            ❌ {userError}
        </div>
    )}

    {/* Bouton créer gestionnaire */}
    <button style={styles.btn}
        onClick={() => setShowUserForm(!showUserForm)}>
        ＋ Nouveau Gestionnaire
    </button>

    {/* Formulaire création */}
    {showUserForm && (
        <form onSubmit={handleCreerGestionnaire}
            style={{marginTop: '20px'}}>
            <div style={styles.formGrid}>
                <div style={styles.field}>
                    <label style={styles.label}>Nom d'utilisateur</label>
                    <input style={styles.input} type="text"
                        value={formUser.username}
                        onChange={e => setFormUser({...formUser, username: e.target.value})}
                        placeholder="ex: gestionnaire1"
                        required />
                </div>
                <div style={styles.field}>
                    <label style={styles.label}>Email</label>
                    <input style={styles.input} type="email"
                        value={formUser.email}
                        onChange={e => setFormUser({...formUser, email: e.target.value})}
                        placeholder="ex: gest@email.com"
                        required />
                </div>
                <div style={styles.field}>
                    <label style={styles.label}>Mot de passe</label>
                    <input style={styles.input} type="password"
                        value={formUser.password}
                        onChange={e => setFormUser({...formUser, password: e.target.value})}
                        placeholder="Minimum 6 caractères"
                        required />
                </div>
            </div>
            <div style={styles.formActions}>
                <button type="submit" style={styles.btn}>
                    Créer le gestionnaire
                </button>
                <button type="button" style={styles.btnCancel}
                    onClick={() => setShowUserForm(false)}>
                    Annuler
                </button>
            </div>
        </form>
    )}

    {/* Liste des utilisateurs */}
    <div style={{marginTop: '20px'}}>
        <h3 style={{fontSize: '13px', fontWeight: '700',
            color: '#94a3b8', marginBottom: '12px'}}>
            Utilisateurs ({utilisateurs.length})
        </h3>
        {utilisateurs.length === 0 ? (
            <p style={styles.empty}>Aucun gestionnaire créé</p>
        ) : (
            utilisateurs.map(u => (
                <div key={u.id} style={{
                    display: 'flex', alignItems: 'center',
                    gap: '12px', padding: '12px 16px',
                    background: '#1a2235', borderRadius: '10px',
                    border: '1px solid #1f2d45', marginBottom: '8px'
                }}>
                    <div style={{
                        width: '36px', height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '14px',
                        fontWeight: '700', flexShrink: 0
                    }}>
                        {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div style={{flex: 1}}>
                        <div style={{fontSize: '13px', fontWeight: '600',
                            color: '#f1f5f9'}}>
                            {u.username}
                        </div>
                        <div style={{fontSize: '11px', color: '#64748b'}}>
                            {u.email} • {u.role}
                        </div>
                    </div>
                    <span style={{
                        padding: '3px 10px', borderRadius: '6px',
                        fontSize: '11px', fontWeight: '700',
                        background: u.statut === 'actif' ?
                            'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: u.statut === 'actif' ? '#10b981' : '#ef4444'
                    }}>
                        {u.statut}
                    </span>
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
    pageSub:     { fontSize: '12px', color: '#ef4444', marginTop: '2px', fontWeight: '600' },
    content:     { padding: '28px 32px' },
    card:        { background: '#111827', border: '1px solid #1f2d45', borderRadius: '16px', padding: '24px', marginBottom: '20px' },
    cardTitle:   { fontSize: '15px', fontWeight: '700', color: '#f1f5f9', marginBottom: '20px' },
    btn:         { padding: '10px 20px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
    formGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
    field:       { display: 'flex', flexDirection: 'column', gap: '6px' },
    label:       { fontSize: '12px', fontWeight: '600', color: '#94a3b8' },
    input:       { padding: '10px 14px', background: '#1a2235', border: '1px solid #1f2d45', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', outline: 'none' },
    addForm:     { display: 'flex', gap: '12px', marginBottom: '20px' },
    catList:     { display: 'flex', flexDirection: 'column', gap: '8px' },
    catItem:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#1a2235', borderRadius: '10px', border: '1px solid #1f2d45' },
    catNom:      { fontSize: '13.5px', fontWeight: '500', color: '#f1f5f9' },
    deleteBtn:   { padding: '6px 12px', background: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#ffffff', fontWeight: '700' },
};