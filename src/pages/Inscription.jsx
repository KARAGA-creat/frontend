import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../store/authSlice';
import API from '../api/axios';

const FEATURES = [
    { icon: '📊', text: 'Tableau de bord en temps réel' },
    { icon: '💸', text: 'Suivi des transactions & budgets' },
    { icon: '📄', text: 'Rapports PDF professionnels' },
    { icon: '👥', text: 'Gestion de votre équipe' },
];

function EcranBienvenue({ username, nomEntreprise, onContinue }) {
    const [compte, setCompte] = useState(5);

    useEffect(() => {
        if (compte <= 0) { onContinue(); return; }
        const t = setTimeout(() => setCompte(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [compte, onContinue]);

    return (
        <div style={styles.container}>
            <style>{`
                @keyframes popIn {
                    0%   { transform: scale(0); opacity: 0; }
                    70%  { transform: scale(1.15); opacity: 1; }
                    100% { transform: scale(1); }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes drawCircle {
                    from { stroke-dashoffset: 283; }
                    to   { stroke-dashoffset: 0; }
                }
                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
                    50%      { box-shadow: 0 0 0 16px rgba(34,197,94,0); }
                }
            `}</style>

            <div style={{ ...styles.card, textAlign: 'center', animation: 'fadeUp 0.5s ease' }}>

                {/* Checkmark animé */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                    <div style={{
                        width: 88, height: 88, borderRadius: '50%',
                        background: 'rgba(34,197,94,0.12)',
                        border: '2px solid rgba(34,197,94,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'popIn 0.6s cubic-bezier(.36,.07,.19,.97) both, pulse 2s ease 0.6s infinite',
                    }}>
                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                            <circle cx="22" cy="22" r="20" stroke="#22C55E" strokeWidth="2.5"
                                strokeDasharray="125.6" strokeDashoffset="125.6"
                                style={{ animation: 'drawCircle 0.6s ease 0.2s forwards' }}/>
                            <polyline points="12,22 19,30 32,14" stroke="#22C55E" strokeWidth="3"
                                strokeLinecap="round" strokeLinejoin="round"
                                style={{ animation: 'popIn 0.4s ease 0.7s both', transformOrigin: 'center' }}/>
                        </svg>
                    </div>
                </div>

                {/* Message principal */}
                <div style={{ animation: 'fadeUp 0.5s ease 0.3s both' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#22C55E', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                        Compte créé avec succès !
                    </p>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>
                        Bienvenue, {username} !
                    </h1>
                    <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 28, lineHeight: 1.5 }}>
                        <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{nomEntreprise}</span> est maintenant<br/>
                        enregistrée sur FinanceIQ.
                    </p>
                </div>

                {/* Séparateur */}
                <div style={{ borderTop: '1px solid #1f2d45', marginBottom: 20 }} />

                {/* Features */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', marginBottom: 28, textAlign: 'left', animation: 'fadeUp 0.5s ease 0.5s both' }}>
                    {FEATURES.map(f => (
                        <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 18 }}>{f.icon}</span>
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>{f.text}</span>
                        </div>
                    ))}
                </div>

                {/* Bouton CTA */}
                <div style={{ animation: 'fadeUp 0.5s ease 0.7s both' }}>
                    <button onClick={onContinue} style={{
                        width: '100%', padding: '13px',
                        background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                        border: 'none', borderRadius: 10,
                        color: '#000', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                        Découvrir mon tableau de bord
                        <span style={{
                            background: 'rgba(0,0,0,0.2)', borderRadius: '50%',
                            width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 800,
                        }}>{compte}</span>
                    </button>
                    <p style={{ fontSize: 11, color: '#475569', marginTop: 10 }}>
                        Redirection automatique dans {compte} seconde{compte > 1 ? 's' : ''}…
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function Inscription() {
    const dispatch   = useDispatch();
    const navigate   = useNavigate();
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const [successData, setSuccessData] = useState(null);
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
            setSuccessData({ username: form.username, nomEntreprise: form.nom_entreprise });
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

    if (successData) {
        return (
            <EcranBienvenue
                username={successData.username}
                nomEntreprise={successData.nomEntreprise}
                onContinue={() => navigate('/dashboard')}
            />
        );
    }

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
                            <option value="XAF">XAF — Franc CFA (CEMAC)</option>
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
