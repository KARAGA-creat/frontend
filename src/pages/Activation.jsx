import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import API from '../api/axios';

export default function Activation() {
    const { token }   = useParams();
    const navigate    = useNavigate();
    const dispatch    = useDispatch();
    const [info, setInfo]           = useState(null);
    const [pageError, setPageError] = useState('');
    const [formError, setFormError] = useState('');
    const [loading, setLoading]     = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ username: '', password: '', confirm: '' });

    useEffect(() => {
        const verifier = async () => {
            try {
                const res = await API.get(`auth/invitations/${token}/verifier/`);
                setInfo(res.data);
            } catch (err) {
                setPageError(err.response?.data?.error || 'Lien invalide ou expiré.');
            } finally {
                setLoading(false);
            }
        };
        verifier();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (form.password !== form.confirm) {
            setFormError('Les mots de passe ne correspondent pas.');
            return;
        }
        setSubmitting(true);
        try {
            const res = await API.post(`auth/invitations/${token}/activer/`, {
                username: form.username,
                password: form.password,
            });
            dispatch(loginSuccess(res.data));
            navigate('/dashboard');
        } catch (err) {
            setFormError(err.response?.data?.error || "Erreur lors de l'activation.");
        } finally {
            setSubmitting(false);
        }
    };

    const inp = {
        width: '100%', padding: '12px 16px', background: '#1a2235',
        border: '1px solid #1f2d45', borderRadius: '10px', color: '#f1f5f9',
        fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    };

    if (loading) return (
        <div style={{ minHeight:'100vh', background:'#0b0f1a', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
            <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #1f2d45', borderTop:'3px solid #22C55E', animation:'spin 0.8s linear infinite' }}/>
            <p style={{ color:'#64748b', fontSize:14 }}>Vérification du lien…</p>
        </div>
    );

    if (pageError) return (
        <div style={{ minHeight:'100vh', background:'#0b0f1a', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ background:'#111827', border:'1px solid #1f2d45', borderRadius:16, padding:40, maxWidth:420, width:'100%', textAlign:'center' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>💹</div>
                <h1 style={{ color:'#f1f5f9', fontSize:24, fontWeight:800, marginBottom:8 }}>FinanceIQ</h1>
                <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444', padding:'14px', borderRadius:10, marginBottom:24, fontSize:14 }}>
                    ❌ {pageError}
                </div>
                <p style={{ color:'#64748b', fontSize:13, marginBottom:20 }}>
                    Ce lien d'invitation est invalide ou a expiré.<br/>Contactez votre administrateur pour recevoir un nouveau lien.
                </p>
                <button onClick={() => navigate('/login')}
                    style={{ padding:'12px 28px', background:'linear-gradient(135deg,#3b82f6,#06b6d4)', border:'none', borderRadius:10, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                    Retour à la connexion
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight:'100vh', background:'#0b0f1a', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
            <div style={{ background:'#111827', border:'1px solid #1f2d45', borderRadius:16, padding:40, width:'100%', maxWidth:460 }}>

                <div style={{ textAlign:'center', marginBottom:28 }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>💹</div>
                    <h1 style={{ color:'#f1f5f9', fontSize:26, fontWeight:800, marginBottom:6 }}>FinanceIQ</h1>
                    <p style={{ color:'#64748b', fontSize:13 }}>Activez votre accès</p>
                </div>

                {/* Info entreprise */}
                <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:10, padding:'14px 18px', marginBottom:24 }}>
                    <p style={{ color:'#22C55E', fontSize:13, fontWeight:700, marginBottom:4 }}>🏢 {info.entreprise}</p>
                    <p style={{ color:'#64748b', fontSize:12 }}>Invitation envoyée à <b style={{ color:'#94a3b8' }}>{info.email}</b></p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ color:'#3b82f6', fontSize:12, fontWeight:700, marginBottom:14, paddingBottom:8, borderBottom:'1px solid #1f2d45' }}>
                        👤 Choisissez vos identifiants
                    </div>

                    <div style={{ marginBottom:16 }}>
                        <label style={{ display:'block', color:'#94a3b8', fontSize:12, fontWeight:600, marginBottom:6 }}>Nom d'utilisateur</label>
                        <input style={inp} type="text" required placeholder="ex: marie_dupont"
                            value={form.username} onChange={e => setForm(p => ({...p, username: e.target.value}))}/>
                    </div>

                    <div style={{ marginBottom:16 }}>
                        <label style={{ display:'block', color:'#94a3b8', fontSize:12, fontWeight:600, marginBottom:6 }}>Mot de passe</label>
                        <input style={inp} type="password" required placeholder="Minimum 6 caractères"
                            value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))}/>
                    </div>

                    <div style={{ marginBottom:24 }}>
                        <label style={{ display:'block', color:'#94a3b8', fontSize:12, fontWeight:600, marginBottom:6 }}>Confirmer le mot de passe</label>
                        <input style={inp} type="password" required placeholder="Répétez le mot de passe"
                            value={form.confirm} onChange={e => setForm(p => ({...p, confirm: e.target.value}))}/>
                    </div>

                    {formError && (
                        <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444', padding:'10px 14px', borderRadius:8, marginBottom:16, fontSize:13 }}>
                            ❌ {formError}
                        </div>
                    )}

                    <button type="submit" disabled={submitting}
                        style={{ width:'100%', padding:14, background: submitting ? '#1f2d45' : 'linear-gradient(135deg,#22C55E,#16A34A)', border:'none', borderRadius:10, color: submitting ? '#64748b' : '#000', fontSize:15, fontWeight:700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                        {submitting ? 'Activation en cours…' : '🚀 Activer mon compte'}
                    </button>
                </form>

                <p style={{ textAlign:'center', marginTop:20, fontSize:12, color:'#475569' }}>
                    Déjà un compte ?{' '}
                    <span style={{ color:'#3b82f6', cursor:'pointer', fontWeight:600 }} onClick={() => navigate('/login')}>
                        Se connecter
                    </span>
                </p>
            </div>
        </div>
    );
}
