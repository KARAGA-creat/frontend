import { useNavigate } from 'react-router-dom';

export default function AccesExpire() {
    const navigate = useNavigate();

    return (
        <div style={S.container}>
            <style>{`
                @keyframes fadeUp {
                    from { opacity:0; transform:translateY(20px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                .card { animation: fadeUp 0.5s ease; }
            `}</style>

            <div className="card" style={S.card}>
                {/* Logo */}
                <div style={S.logoRow}>
                    <div style={S.logoCircle}>F</div>
                    <span style={S.logoText}>Finance<span style={{ color:'#22C55E' }}>IQ</span></span>
                </div>

                {/* Icône */}
                <div style={S.iconWrap}>
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                        <circle cx="28" cy="28" r="28" fill="rgba(239,68,68,0.1)"/>
                        <path d="M28 16v14" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
                        <circle cx="28" cy="38" r="2" fill="#EF4444"/>
                    </svg>
                </div>

                <h1 style={S.titre}>Accès suspendu</h1>
                <p style={S.texte}>
                    L'accès à votre espace FinanceIQ a été suspendu.
                    <br />
                    Pour continuer à utiliser l'application, contactez-nous.
                </p>

                {/* Contacts */}
                <div style={S.contactsBox}>
                    <a href="mailto:contact@financeiq.app" style={S.contactItem}>
                        <span style={S.contactIcon}>✉</span>
                        <span>contact@financeiq.app</span>
                    </a>
                    <div style={S.separateur} />
                    <a href="tel:+22500000000" style={S.contactItem}>
                        <span style={S.contactIcon}>☎</span>
                        <span>+225 00 00 00 00 00</span>
                    </a>
                </div>

                <button onClick={() => navigate('/login')} style={S.btn}>
                    Retour à la connexion
                </button>
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
        fontFamily: "'Inter', sans-serif",
    },
    card: {
        background: '#0F172A',
        border: '1px solid #1E293B',
        borderRadius: '20px',
        padding: '44px 40px',
        width: '100%',
        maxWidth: '440px',
        textAlign: 'center',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    },
    logoRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 32,
    },
    logoCircle: {
        width: 36,
        height: 36,
        borderRadius: 9,
        background: 'linear-gradient(135deg, #22C55E, #16A34A)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 900,
        color: '#000',
    },
    logoText: {
        fontSize: 22,
        fontWeight: 800,
        color: '#F8FAFC',
    },
    iconWrap: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 20,
    },
    titre: {
        fontSize: 22,
        fontWeight: 700,
        color: '#F8FAFC',
        marginBottom: 12,
    },
    texte: {
        fontSize: 14,
        color: '#94A3B8',
        lineHeight: 1.7,
        marginBottom: 28,
    },
    contactsBox: {
        background: '#1E293B',
        border: '1px solid #334155',
        borderRadius: 12,
        padding: '6px 0',
        marginBottom: 28,
    },
    contactItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 20px',
        color: '#CBD5E1',
        fontSize: 14,
        textDecoration: 'none',
        transition: 'background 0.15s',
    },
    contactIcon: {
        fontSize: 18,
        color: '#22C55E',
        flexShrink: 0,
    },
    separateur: {
        height: 1,
        background: '#334155',
        margin: '0 20px',
    },
    btn: {
        width: '100%',
        padding: '13px',
        background: 'transparent',
        border: '1px solid #334155',
        borderRadius: 10,
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
    },
};
