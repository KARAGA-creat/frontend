import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getCategories, createCategorie, deleteCategorie } from '../api/categoriesAPI';
import API from '../api/axios';
import { getUtilisateurs, toggleStatutUtilisateur, supprimerUtilisateur } from '../api/authAPI';
import Layout, { T, useIsMobile } from '../components/Layout';

export default function Parametres() {
    const isMobile  = useIsMobile();
    const currentUser = useSelector(s => s.auth.user);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [newCat, setNewCat]         = useState('');
    const [entreprise, setEntreprise] = useState(null);
    const [formEntreprise, setFormEntreprise] = useState({ nom:'', devise:'XOF', date_creation:'', logo:'' });
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [inviteEmail, setInviteEmail]   = useState('');
    const [userError, setUserError]       = useState('');
    const [userSuccess, setUserSuccess]   = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [logoPreview, setLogoPreview]   = useState(null);
    const [entSuccess, setEntSuccess]     = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [c, e] = await Promise.all([getCategories(), API.get('entreprises/')]);
            setCategories(Array.isArray(c) ? c : (c.results || []));
            setEntreprise(e.data);
            setFormEntreprise({
                nom:           e.data.nom           || '',
                devise:        e.data.devise        || 'XOF',
                date_creation: e.data.date_creation || '',
                logo:          e.data.logo          || '',
            });
        } catch (err) { console.error('entreprise/categories:', err); }

        try {
            const u = await getUtilisateurs();
            setUtilisateurs(Array.isArray(u) ? u : (u.results || []));
        } catch (err) { console.error('utilisateurs:', err); }

        setLoading(false);
    };

    const handleAddCategorie = async (e) => {
        e.preventDefault();
        if (!newCat.trim()) return;
        try {
            await createCategorie({ nom_categorie: newCat });
            setNewCat('');
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleDeleteCategorie = async (id) => {
        if (window.confirm('Supprimer cette catégorie ?')) { await deleteCategorie(id); fetchData(); }
    };

    const handleSaveEntreprise = async (e) => {
        e.preventDefault();
        setEntSuccess('');
        try {
            const formData = new FormData();
            formData.append('nom', formEntreprise.nom);
            formData.append('devise', formEntreprise.devise);
            formData.append('date_creation', formEntreprise.date_creation);
            if (formEntreprise.logo instanceof File) formData.append('logo', formEntreprise.logo);
            await API.put('entreprises/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setEntSuccess('Informations mises à jour avec succès !');
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleInviter = async (e) => {
        e.preventDefault();
        setUserError('');
        setUserSuccess('');
        setInviteLoading(true);
        try {
            await API.post('auth/invitations/', { email: inviteEmail });
            setInviteLoading(false);
            setUserSuccess(`Invitation envoyée à ${inviteEmail} ! Le lien expire dans 48h.`);
            setInviteEmail('');
        } catch (err) {
            setInviteLoading(false);
            setUserError(err.response?.data?.error || "Erreur lors de l'envoi de l'invitation.");
        }
    };

    const handleToggleStatut = async (u) => {
        setActionLoading(`statut-${u.id}`);
        try {
            const updated = await toggleStatutUtilisateur(u.id);
            setUtilisateurs(prev => prev.map(x => x.id === u.id ? updated : x));
        } catch (err) {
            setUserError(err.response?.data?.error || 'Erreur lors du changement de statut.');
        } finally { setActionLoading(null); }
    };

    const handleSupprimerUser = async (u) => {
        if (!window.confirm(`Supprimer le compte de "${u.username}" ? Cette action est irréversible.`)) return;
        setActionLoading(`delete-${u.id}`);
        try {
            await supprimerUtilisateur(u.id);
            setUtilisateurs(prev => prev.filter(x => x.id !== u.id));
            setUserSuccess(`Compte "${u.username}" supprimé.`);
        } catch (err) {
            setUserError(err.response?.data?.error || 'Erreur lors de la suppression.');
        } finally { setActionLoading(null); }
    };

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

    return (
        <Layout>
            <div style={{ padding: isMobile ? '16px' : '28px 32px' }}>
                <div style={{ marginBottom:24 }}>
                    <h1 style={{ fontFamily:"'Calistoga',serif", fontSize:isMobile?20:24, fontWeight:400, color:T.text }}>Paramètres</h1>
                    <p style={{ color:T.danger, fontSize:13, marginTop:4, fontWeight:600 }}>Administration — Accès réservé</p>
                </div>

                {/* ENTREPRISE */}
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'22px 24px', marginBottom:20 }}>
                    <h2 style={{ fontSize:15, fontWeight:700, color:T.text, marginBottom:20 }}>🏢 Informations Entreprise</h2>
                    {entSuccess && <div style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', color:T.accent, padding:'10px 14px', borderRadius:8, marginBottom:16, fontSize:13 }}>✅ {entSuccess}</div>}
                    <form onSubmit={handleSaveEntreprise}>
                        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:14, marginBottom:14 }}>
                            <div><label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Nom de l'entreprise</label>
                                <input style={inp} type="text" required value={formEntreprise.nom} onChange={e => setFormEntreprise(p => ({...p, nom:e.target.value}))}/></div>
                            <div><label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Devise</label>
                                <select style={inp} value={formEntreprise.devise} onChange={e => setFormEntreprise(p => ({...p, devise:e.target.value}))}>
                                    <option value="XOF">XOF — Franc CFA (UEMOA)</option>
                                    <option value="XAF">XAF — Franc CFA (CEMAC)</option>
                                    <option value="GNF">GNF — Franc Guinéen</option>
                                    <option value="EUR">EUR — Euro</option>
                                    <option value="USD">USD — Dollar américain</option>
                                    <option value="MAD">MAD — Dirham marocain</option>
                                </select></div>
                            <div><label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Date de création</label>
                                <input style={inp} type="date" required value={formEntreprise.date_creation} onChange={e => setFormEntreprise(p => ({...p, date_creation:e.target.value}))}/></div>
                            <div>
                                <label style={{ fontSize:12, fontWeight:600, color:T.textSoft, display:'block', marginBottom:6 }}>Logo</label>
                                {(logoPreview || entreprise?.logo) && (
                                    <img src={logoPreview || `http://127.0.0.1:8000${entreprise.logo}`} alt="Logo"
                                        style={{ width:64, height:64, borderRadius:10, objectFit:'cover', border:`2px solid ${T.border}`, display:'block', marginBottom:8 }}/>
                                )}
                                <input type="file" accept="image/*" id="logoInput" style={{ display:'none' }}
                                    onChange={e => { const f = e.target.files[0]; if (f) { setFormEntreprise(p => ({...p, logo:f})); setLogoPreview(URL.createObjectURL(f)); } }}/>
                                <label htmlFor="logoInput" style={{ display:'inline-block', padding:'7px 14px', background:`rgba(59,130,246,0.1)`, border:`1px solid rgba(59,130,246,0.3)`, borderRadius:8, color:T.info, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                                    📷 {logoPreview || entreprise?.logo ? 'Changer le logo' : 'Choisir un logo'}
                                </label>
                            </div>
                        </div>
                        <button type="submit" style={btn}>💾 Enregistrer</button>
                    </form>
                </div>

                {/* CATEGORIES */}
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'22px 24px', marginBottom:20 }}>
                    <h2 style={{ fontSize:15, fontWeight:700, color:T.text, marginBottom:18 }}>🏷 Gestion des Catégories</h2>
                    <form onSubmit={handleAddCategorie} style={{ display:'flex', gap:10, marginBottom:18 }}>
                        <input style={{ ...inp, flex:1 }} type="text" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Nom de la nouvelle catégorie…"/>
                        <button type="submit" style={btn}>＋ Ajouter</button>
                    </form>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {categories.length === 0
                            ? <p style={{ color:T.muted, fontSize:13, textAlign:'center', padding:'20px 0' }}>Aucune catégorie créée.</p>
                            : categories.map(c => (
                                <div key={c.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:T.surface2, borderRadius:10, border:`1px solid ${T.border}` }}>
                                    <span style={{ fontSize:13, fontWeight:500, color:T.text }}>🏷 {c.nom_categorie}</span>
                                    <button onClick={() => handleDeleteCategorie(c.id)} style={{ padding:'5px 12px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:7, color:T.danger, fontSize:12, fontWeight:700, cursor:'pointer' }}>🗑 Supprimer</button>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* UTILISATEURS */}
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'22px 24px' }}>
                    <h2 style={{ fontSize:15, fontWeight:700, color:T.text, marginBottom:18 }}>👥 Gestion des Utilisateurs</h2>

                    {userSuccess && <div style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', color:T.accent, padding:'10px 14px', borderRadius:8, marginBottom:14, fontSize:13 }}>✅ {userSuccess}</div>}
                    {userError   && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:T.danger, padding:'10px 14px', borderRadius:8, marginBottom:14, fontSize:13 }}>❌ {userError}</div>}

                    {/* FORMULAIRE D'INVITATION */}
                    <form onSubmit={handleInviter} style={{ background:T.surface2, border:`1px solid ${T.border}`, borderRadius:12, padding:'18px 20px', marginBottom:24 }}>
                        <p style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:4 }}>📧 Inviter un gestionnaire</p>
                        <p style={{ fontSize:12, color:T.muted, marginBottom:14 }}>Un email avec un lien d'activation sera envoyé. Le lien expire après 48h.</p>
                        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                            <input style={{ ...inp, flex:1, minWidth:200 }} type="email" required
                                placeholder="email@exemple.com"
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}/>
                            <button type="submit" disabled={inviteLoading}
                                style={{ ...btn, opacity: inviteLoading ? 0.6 : 1, cursor: inviteLoading ? 'not-allowed' : 'pointer' }}>
                                {inviteLoading ? '⏳ Envoi…' : '✉️ Envoyer l\'invitation'}
                            </button>
                        </div>
                    </form>

                    <h3 style={{ fontSize:13, fontWeight:700, color:T.textSoft, marginBottom:12 }}>Utilisateurs ({utilisateurs.length})</h3>
                    {utilisateurs.length === 0
                        ? <p style={{ color:T.muted, fontSize:13, textAlign:'center', padding:'20px 0' }}>Aucun utilisateur trouvé.</p>
                        : <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                            {utilisateurs.map(u => {
                                const isMe      = currentUser?.id === u.id;
                                const isAdmin   = u.role === 'admin';
                                const isActif   = u.statut === 'actif';
                                const loadingStatut = actionLoading === `statut-${u.id}`;
                                const loadingDelete = actionLoading === `delete-${u.id}`;
                                return (
                                    <div key={u.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:T.surface2, borderRadius:10, border:`1px solid ${T.border}`, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                                        <div style={{ width:36, height:36, borderRadius:'50%', background: isAdmin ? `linear-gradient(135deg,#3B82F6,#1D4ED8)` : `linear-gradient(135deg,${T.accent},#16A34A)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'#fff', flexShrink:0 }}>
                                            {(u.username||'?').charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flex:1, minWidth:0 }}>
                                            <p style={{ fontSize:13, fontWeight:600, color:T.text }}>
                                                {u.username} {isMe && <span style={{ fontSize:11, color:T.muted }}>(vous)</span>}
                                            </p>
                                            <p style={{ fontSize:11, color:T.muted }}>{u.email} · {isAdmin ? 'Administrateur' : 'Gestionnaire'}</p>
                                        </div>
                                        <span style={{ padding:'3px 10px', borderRadius:6, fontSize:11, fontWeight:700, background:isActif?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', color:isActif?T.accent:T.danger, whiteSpace:'nowrap' }}>
                                            {isActif ? 'Actif' : 'Inactif'}
                                        </span>
                                        {!isMe && !isAdmin && (
                                            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                                                <button
                                                    onClick={() => handleToggleStatut(u)}
                                                    disabled={!!actionLoading}
                                                    style={{ padding:'5px 11px', background: isActif ? 'rgba(234,179,8,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${isActif ? 'rgba(234,179,8,0.3)' : 'rgba(34,197,94,0.3)'}`, borderRadius:7, color: isActif ? '#FBBF24' : T.accent, fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                                                    {loadingStatut ? '⏳' : isActif ? 'Désactiver' : 'Activer'}
                                                </button>
                                                <button
                                                    onClick={() => handleSupprimerUser(u)}
                                                    disabled={!!actionLoading}
                                                    style={{ padding:'5px 11px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:7, color:T.danger, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                                                    {loadingDelete ? '⏳' : '🗑'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    }
                </div>
            </div>
        </Layout>
    );
}
