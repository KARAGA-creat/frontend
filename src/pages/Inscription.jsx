import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../store/authSlice';
import API from '../api/axios';

export default function Inscription() {
    const dispatch  = useDispatch();
    const navigate  = useNavigate();
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        username:       '',
        email:          '',
        password:       '',
        nom_entreprise: '',
        devise:         'XOF',
        date_creation:  '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await API.post('auth/inscription/', form);
            dispatch(loginSuccess(response.data));
            navigate('/dashboard');
        } catch (err) {
            setError(
                err.response?.data?.username?.[0] ||
                err.response?.data?.email?.[0] ||
                err.response?.data?.nom_entreprise?.[0] ||
                'Erreur lors de l\'inscription !'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logo}>💹</div>
                <h1 style={styles.title}>FinanceIQ</h1>
                <p style={styles.subtitle}>
                    Créez votre compte et votre entreprise
                </p>

                {error && (
                    <div style={styles.error}>{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Infos utilisateur */}
                    <div style={styles.sectionTitle}>
                        👤 Informations personnelles
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Nom d'utilisateur</label>
                        <input style={styles.input} type="text"
                            value={form.username}
                            onChange={e => setForm({...form, username: e.target.value})}
                            placeholder="ex: alpha_bah"
                            required />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Email</label>
                        <input style={styles.input} type="email"
                            value={form.email}
                            onChange={e => setForm({...form, email: e.target.value})}
                            placeholder="ex: alpha@gmail.com"
                            required />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Mot de passe</label>
                        <input style={styles.input} type="password"
                            value={form.password}
                            onChange={e => setForm({...form, password: e.target.value})}
                            placeholder="Minimum 6 caractères"
                            required />
                    </div>

                    {/* Infos entreprise */}
                    <div style={styles.sectionTitle}>
                        🏢 Informations entreprise
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Nom de l'entreprise</label>
                        <input style={styles.input} type="text"
                            value={form.nom_entreprise}
                            onChange={e => setForm({...form, nom_entreprise: e.target.value})}
                            placeholder="ex: Ma Boutique SARL"
                            required />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Devise</label>
                        <select style={styles.input}
                            value={form.devise}
                            onChange={e => setForm({...form, devise: e.target.value})}>
                            <option value="XOF">XOF — Franc CFA (UEMOA)</option>
                            <option value="GNF">GNF — Franc Guinéen</option>
                            <option value="EUR">EUR — Euro</option>
                            <option value="USD">USD — Dollar Américain</option>
                            <option value="MAD">MAD — Dirham Marocain</option>
                        </select>
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Date de création</label>
                        <input style={styles.input} type="date"
                            value={form.date_creation}
                            onChange={e => setForm({...form, date_creation: e.target.value})}
                            required />
                    </div>

                    <button
                        style={loading ? styles.btnDisabled : styles.btn}
                        type="submit"
                        disabled={loading}>
                        {loading ? 'Création en cours...' : '🚀 Créer mon compte'}
                    </button>

                    <div style={styles.loginLink}>
                        Déjà un compte ?{' '}
                        <span style={styles.link}
                            onClick={() => navigate('/login')}>
                            Se connecter
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container:    { minHeight: '100vh', background: '#0b0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    card:         { background: '#111827', border: '1px solid #1f2d45', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '460px' },
    logo:         { fontSize: '48px', textAlign: 'center', marginBottom: '12px' },
    title:        { color: '#f1f5f9', fontSize: '26px', fontWeight: '800', textAlign: 'center', marginBottom: '6px' },
    subtitle:     { color: '#64748b', fontSize: '13px', textAlign: 'center', marginBottom: '28px' },
    error:        { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' },
    sectionTitle: { color: '#3b82f6', fontSize: '13px', fontWeight: '700', marginBottom: '14px', marginTop: '20px', paddingBottom: '8px', borderBottom: '1px solid #1f2d45' },
    field:        { marginBottom: '16px' },
    label:        { display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '6px' },
    input:        { width: '100%', padding: '11px 14px', background: '#1a2235', border: '1px solid #1f2d45', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
    btn:          { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' },
    btnDisabled:  { width: '100%', padding: '13px', background: '#1f2d45', border: 'none', borderRadius: '10px', color: '#64748b', fontSize: '14px', fontWeight: '700', cursor: 'not-allowed', marginTop: '8px' },
    loginLink:    { textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748b' },
    link:         { color: '#3b82f6', cursor: 'pointer', fontWeight: '600' },
};