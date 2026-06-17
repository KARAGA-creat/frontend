import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../store/authSlice';
import { login } from '../api/authAPI';

export default function Login() {
    const [username, setUsername]   = useState('');
    const [password, setPassword]   = useState('');
    const [error, setError]         = useState('');
    const [loading, setLoading]     = useState(false);
    const [attemptsLeft, setAttemptsLeft] = useState(null); // null = pas encore d'avertissement
    const [blockedFor, setBlockedFor]     = useState(0);    // secondes restantes de blocage
    const timerRef = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Compte à rebours quand l'IP est bloquée
    useEffect(() => {
        if (blockedFor > 0) {
            timerRef.current = setInterval(() => {
                setBlockedFor(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setError('');
                        setAttemptsLeft(null);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [blockedFor]);

    const formatCountdown = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (blockedFor > 0) return;
        setLoading(true);
        setError('');
        try {
            const data = await login(username, password);
            dispatch(loginSuccess(data));
            navigate('/dashboard');
        } catch (err) {
            const resp   = err?.response?.data;
            const status = err?.response?.status;

            if (status === 403 && resp?.acces_expire) {
                navigate('/acces-expire');
                return;
            } else if (status === 429) {
                const attente = resp?.attente_secondes || 900;
                setBlockedFor(attente);
                setAttemptsLeft(0);
                setError(resp?.error || 'Trop de tentatives. Compte temporairement bloqué.');
            } else {
                const msg = resp?.error || resp?.detail || err?.message || 'Erreur inconnue';
                setError(msg);
                if (typeof resp?.tentatives_restantes === 'number') {
                    setAttemptsLeft(resp.tentatives_restantes);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const isBlocked = blockedFor > 0;

    return (
        <div style={S.container}>
            <style>{`
                @keyframes shake {
                    0%,100%{transform:translateX(0)}
                    20%,60%{transform:translateX(-6px)}
                    40%,80%{transform:translateX(6px)}
                }
                @keyframes fadeIn {
                    from{opacity:0;transform:translateY(-8px)}
                    to{opacity:1;transform:translateY(0)}
                }
                .login-card { animation: fadeIn 0.4s ease; }
                .shake-card { animation: shake 0.4s ease; }
            `}</style>

            <div className="login-card" style={S.card}>
                {/* Logo */}
                <div style={S.logoWrap}>
                    <div style={S.logoCircle}>F</div>
                </div>
                <h1 style={S.title}>Finance<span style={{ color:'#22C55E' }}>IQ</span></h1>
                <p style={S.subtitle}>Connectez-vous à votre espace</p>

                {/* Bandeau d'erreur */}
                {error && (
                    <div style={{
                        ...S.alertBox,
                        background: isBlocked ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${isBlocked ? 'rgba(245,158,11,0.35)' : 'rgba(239,68,68,0.3)'}`,
                        color: isBlocked ? '#F59E0B' : '#EF4444',
                    }}>
                        <span style={{ fontSize:18, marginRight:8 }}>{isBlocked ? '🔒' : '⚠️'}</span>
                        <div>
                            <div style={{ fontWeight:600, marginBottom:2 }}>{error}</div>
                            {isBlocked && (
                                <div style={{ fontSize:12, opacity:0.85 }}>
                                    Déblocage automatique dans{' '}
                                    <span style={{ fontWeight:700, fontVariantNumeric:'tabular-nums' }}>
                                        {formatCountdown(blockedFor)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Barre de tentatives restantes */}
                {attemptsLeft !== null && !isBlocked && (
                    <div style={S.attemptsBar}>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} style={{
                                ...S.attemptDot,
                                background: i < attemptsLeft ? '#22C55E' : '#EF4444',
                            }}/>
                        ))}
                        <span style={{ fontSize:11, color:'#94A3B8', marginLeft:8 }}>
                            {attemptsLeft} tentative(s) restante(s)
                        </span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={S.field}>
                        <label style={S.label}>Nom d'utilisateur</label>
                        <input
                            style={{ ...S.input, opacity: isBlocked ? 0.4 : 1 }}
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Entrez votre username"
                            required
                            disabled={isBlocked}
                        />
                    </div>

                    <div style={S.field}>
                        <label style={S.label}>Mot de passe</label>
                        <input
                            style={{ ...S.input, opacity: isBlocked ? 0.4 : 1 }}
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Entrez votre mot de passe"
                            required
                            disabled={isBlocked}
                        />
                    </div>

                    <button
                        style={loading || isBlocked ? S.btnDisabled : S.btn}
                        type="submit"
                        disabled={loading || isBlocked}
                    >
                        {isBlocked
                            ? `🔒 Bloqué — ${formatCountdown(blockedFor)}`
                            : loading ? 'Connexion...' : 'Se connecter'}
                    </button>

                    <div style={S.inscriptionBox}>
                        Nouveau sur FinanceIQ ?{' '}
                        <span style={S.link} onClick={() => navigate('/inscription')}>
                            Créer mon entreprise
                        </span>
                        <div style={{ fontSize:11, color:'#475569', marginTop:4 }}>
                            ⚠️ Réservé aux propriétaires d'entreprise
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

const S = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #020617 0%, #0F172A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
    },
    card: {
        background: '#0F172A',
        border: '1px solid #1E293B',
        borderRadius: '20px',
        padding: '44px 40px',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    },
    logoWrap: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '16px',
    },
    logoCircle: {
        width: 52,
        height: 52,
        borderRadius: 14,
        background: 'linear-gradient(135deg, #22C55E, #16A34A)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 26,
        fontWeight: 900,
        color: '#000',
    },
    title: {
        color: '#F8FAFC',
        fontSize: '28px',
        fontWeight: '800',
        marginBottom: '6px',
        fontFamily: "'Inter', sans-serif",
    },
    subtitle: {
        color: '#64748b',
        fontSize: '14px',
        marginBottom: '28px',
    },
    alertBox: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 4,
        padding: '12px 14px',
        borderRadius: '10px',
        marginBottom: '16px',
        fontSize: '13px',
        textAlign: 'left',
    },
    attemptsBar: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginBottom: '16px',
        padding: '8px 12px',
        background: 'rgba(239,68,68,0.06)',
        border: '1px solid rgba(239,68,68,0.15)',
        borderRadius: '8px',
    },
    attemptDot: {
        width: 10,
        height: 10,
        borderRadius: '50%',
        flexShrink: 0,
    },
    field: {
        marginBottom: '18px',
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
        background: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '10px',
        color: '#F8FAFC',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    },
    btn: {
        width: '100%',
        padding: '14px',
        background: 'linear-gradient(135deg, #22C55E, #16A34A)',
        border: 'none',
        borderRadius: '10px',
        color: '#000',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        marginTop: '4px',
        transition: 'opacity 0.2s',
    },
    btnDisabled: {
        width: '100%',
        padding: '14px',
        background: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '10px',
        color: '#475569',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'not-allowed',
        marginTop: '4px',
    },
    inscriptionBox: {
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '13px',
        color: '#64748b',
        background: 'rgba(59,130,246,0.05)',
        border: '1px solid rgba(59,130,246,0.15)',
        padding: '12px',
        borderRadius: '8px',
    },
    link: {
        color: '#3b82f6',
        cursor: 'pointer',
        fontWeight: '600',
    },
};
