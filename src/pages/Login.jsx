import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../store/authSlice';
import { login } from '../api/authAPI';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const dispatch  = useDispatch();
    const navigate  = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await login(username, password);
            dispatch(loginSuccess(data));
            navigate('/dashboard');
        } catch (err) {
            setError('Identifiants incorrects !');
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
                    Connectez-vous à votre espace
                </p>

                {error && (
                    <div style={styles.error}>{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label style={styles.label}>
                            Nom d'utilisateur
                        </label>
                        <input
                            style={styles.input}
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Entrez votre username"
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>
                            Mot de passe
                        </label>
                        <input
                            style={styles.input}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Entrez votre mot de passe"
                            required
                        />
                    </div>

                    <button
                        style={loading ? styles.btnDisabled : styles.btn}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>

                    <div style={{
                        textAlign: 'center', 
                        marginTop: '16px', 
                        fontSize: '13px', 
                        color: '#64748b',
                        background: 'rgba(59,130,246,0.05)',
                        border: '1px solid rgba(59,130,246,0.15)',
                        padding: '12px',
                        borderRadius: '8px'
                    }}>
                     Nouveau sur FinanceIQ ?{' '}
                    <span style={{color: '#3b82f6', cursor: 'pointer', fontWeight: '600'}}
                          onClick={() => navigate('/inscription')}>
                          Créer mon entreprise
                    </span>
                        <div style={{fontSize: '11px', color: '#475569', marginTop: '4px'}}>
                            ⚠️ Réservé aux propriétaires d'entreprise
                        </div>
                    </div>
                </form>
            </div>
        </div>
    ); 
}

const styles = {
    container: {
        minHeight: '100vh',
        background: '#0b0f1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        background: '#111827',
        border: '1px solid #1f2d45',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
    },
    logo: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    title: {
        color: '#f1f5f9',
        fontSize: '28px',
        fontWeight: '800',
        marginBottom: '8px',
    },
    subtitle: {
        color: '#64748b',
        fontSize: '14px',
        marginBottom: '32px',
    },
    error: {
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        color: '#ef4444',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px',
    },
    field: {
        marginBottom: '20px',
        textAlign: 'left',
    },
    label: {
        display: 'block',
        color: '#94a3b8',
        fontSize: '13px',
        fontWeight: '600',
        marginBottom: '8px',
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        background: '#1a2235',
        border: '1px solid #1f2d45',
        borderRadius: '10px',
        color: '#f1f5f9',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
    },
    btn: {
        width: '100%',
        padding: '14px',
        background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
        border: 'none',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        marginTop: '8px',
    },
    btnDisabled: {
        width: '100%',
        padding: '14px',
        background: '#1f2d45',
        border: 'none',
        borderRadius: '10px',
        color: '#64748b',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'not-allowed',
        marginTop: '8px',
    },
};