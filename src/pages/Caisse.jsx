import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTransaction } from '../api/transactionsAPI';
import { getCategories } from '../api/categoriesAPI';
import Layout, { T, useIsMobile } from '../components/Layout';

const today = () => new Date().toISOString().split('T')[0];

const TOUCHES = [
    ['7','8','9'],
    ['4','5','6'],
    ['1','2','3'],
    ['C','0','⌫'],
];

export default function Caisse() {
    const isMobile  = useIsMobile();
    const navigate  = useNavigate();

    const [type, setType]           = useState('Entree');
    const [montant, setMontant]     = useState('0');
    const [libelle, setLibelle]     = useState('');
    const [categorieId, setCatId]   = useState('');
    const [date, setDate]           = useState(today());
    const [categories, setCategories] = useState([]);
    const [historique, setHistorique] = useState([]);
    const [loading, setLoading]     = useState(false);
    const [flash, setFlash]         = useState(null); // { ok: bool, msg: string }

    useEffect(() => {
        getCategories()
            .then(d => setCategories(Array.isArray(d) ? d : (d.results || [])))
            .catch(() => {});
    }, []);

    const presserTouche = useCallback((t) => {
        setMontant(prev => {
            if (t === 'C') return '0';
            if (t === '⌫') {
                const s = prev.slice(0, -1);
                return s === '' || s === '-' ? '0' : s;
            }
            if (t === '.' && prev.includes('.')) return prev;
            if (prev === '0' && t !== '.') return t;
            if (prev.length >= 12) return prev;
            return prev + t;
        });
    }, []);

    // Raccourcis clavier
    useEffect(() => {
        const handler = (e) => {
            if (e.target.tagName === 'INPUT') return;
            if ('0123456789'.includes(e.key)) presserTouche(e.key);
            else if (e.key === 'Backspace') presserTouche('⌫');
            else if (e.key === 'Escape') presserTouche('C');
            else if (e.key === 'Enter') handleSave();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [presserTouche, montant, libelle, categorieId, type, date]);

    const handleSave = async () => {
        const montantNum = parseFloat(montant);
        if (!montantNum || montantNum <= 0) {
            setFlash({ ok: false, msg: 'Saisissez un montant valide.' });
            setTimeout(() => setFlash(null), 2500);
            return;
        }

        setLoading(true);
        try {
            await createTransaction({
                type,
                montant: montantNum,
                libelle: libelle || (type === 'Entree' ? 'Vente' : 'Dépense'),
                id_categorie: categorieId || null,
                date_transaction: date,
                statut: 'validee',
            });

            const nomCat = categories.find(c => String(c.id) === String(categorieId))?.nom_categorie || '';
            setHistorique(prev => [{
                id: Date.now(),
                type,
                montant: montantNum,
                libelle: libelle || (type === 'Entree' ? 'Vente' : 'Dépense'),
                categorie: nomCat,
                heure: new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }),
            }, ...prev].slice(0, 10));

            setFlash({ ok: true, msg: `${type === 'Entree' ? '+' : '-'}${montantNum.toLocaleString('fr-FR')} XOF enregistré !` });
            setMontant('0');
            setLibelle('');
            setTimeout(() => setFlash(null), 2000);
        } catch {
            setFlash({ ok: false, msg: 'Erreur — réessayez.' });
            setTimeout(() => setFlash(null), 2500);
        } finally {
            setLoading(false);
        }
    };

    const isEntree    = type === 'Entree';
    const couleur     = isEntree ? T.accent : T.danger;
    const montantNum  = parseFloat(montant) || 0;
    const totalSession = historique.reduce((s, h) => s + (h.type === 'Entree' ? h.montant : -h.montant), 0);

    const taille = isMobile ? '100%' : 440;

    return (
        <Layout>
            <style>{`
                @keyframes flashAnim {
                    0%   { transform: scale(0.9); opacity:0; }
                    20%  { transform: scale(1.05); opacity:1; }
                    80%  { transform: scale(1); opacity:1; }
                    100% { transform: scale(1); opacity:0; }
                }
                @keyframes slideIn {
                    from { transform: translateX(20px); opacity:0; }
                    to   { transform: translateX(0);    opacity:1; }
                }
            `}</style>

            <div style={{ padding: isMobile ? '12px' : '24px 32px', display:'flex', gap:24, alignItems:'flex-start', justifyContent:'center', flexWrap:'wrap' }}>

                {/* ── TERMINAL CAISSE ── */}
                <div style={{ width: taille, flexShrink:0 }}>

                    {/* En-tête */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                        <div>
                            <h1 style={{ fontFamily:"'Calistoga',serif", fontSize:20, fontWeight:400, color:T.text }}>Mode Caisse</h1>
                            <p style={{ fontSize:12, color:T.textSoft, marginTop:2 }}>Enregistrement rapide</p>
                        </div>
                        <button onClick={() => navigate('/transactions')} style={{ fontSize:12, color:T.textSoft, background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, padding:'6px 12px', cursor:'pointer' }}>
                            Vue complète →
                        </button>
                    </div>

                    {/* Toggle Entrée / Sortie */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                        {['Entree','Sortie'].map(t => {
                            const sel = type === t;
                            const col = t === 'Entree' ? T.accent : T.danger;
                            return (
                                <button key={t} onClick={() => setType(t)} style={{
                                    padding:'13px', borderRadius:12, fontWeight:700, fontSize:15, cursor:'pointer',
                                    border:`2px solid ${sel ? col : T.border}`,
                                    background: sel ? `${col}18` : T.surface,
                                    color: sel ? col : T.textSoft,
                                    transition:'all 0.15s',
                                }}>
                                    {t === 'Entree' ? '↑ Entrée' : '↓ Sortie'}
                                </button>
                            );
                        })}
                    </div>

                    {/* Affichage montant */}
                    <div style={{
                        background: T.surface, border:`2px solid ${couleur}44`, borderRadius:16,
                        padding:'18px 22px', marginBottom:14, textAlign:'right', position:'relative', overflow:'hidden',
                    }}>
                        <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:`radial-gradient(ellipse at right, ${couleur}10, transparent 70%)`, pointerEvents:'none' }}/>
                        <p style={{ fontSize:11, color:T.textSoft, textAlign:'left', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.07em' }}>Montant (XOF)</p>
                        <p style={{
                            fontSize: montant.length > 8 ? 28 : montant.length > 5 ? 36 : 44,
                            fontWeight:800, color: couleur, fontFamily:'monospace',
                            letterSpacing:'-0.02em', lineHeight:1, transition:'font-size 0.1s',
                        }}>
                            {montantNum > 0 ? montantNum.toLocaleString('fr-FR') : '0'}
                        </p>
                    </div>

                    {/* Pavé numérique */}
                    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:'hidden', marginBottom:14 }}>
                        {TOUCHES.map((ligne, li) => (
                            <div key={li} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr' }}>
                                {ligne.map((t, ti) => {
                                    const isSpec = t === 'C' || t === '⌫';
                                    const isZero = t === '0';
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => presserTouche(t)}
                                            style={{
                                                padding: isMobile ? '18px 0' : '22px 0',
                                                fontSize: isSpec ? 18 : 22,
                                                fontWeight: isSpec ? 600 : 700,
                                                color: t === 'C' ? T.danger : t === '⌫' ? T.warning : T.text,
                                                background: T.surface,
                                                border:'none',
                                                borderRight: ti < 2 ? `1px solid ${T.border}` : 'none',
                                                borderBottom: li < 3 ? `1px solid ${T.border}` : 'none',
                                                cursor:'pointer',
                                                transition:'background 0.1s',
                                                fontFamily: isSpec ? 'inherit' : 'monospace',
                                                userSelect:'none',
                                            }}
                                            onMouseDown={e => e.currentTarget.style.background = T.surface2}
                                            onMouseUp={e => e.currentTarget.style.background = T.surface}
                                            onMouseLeave={e => e.currentTarget.style.background = T.surface}
                                            onTouchStart={e => e.currentTarget.style.background = T.surface2}
                                            onTouchEnd={e => e.currentTarget.style.background = T.surface}
                                        >
                                            {t}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Libellé + Catégorie (optionnels) */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                        <input
                            placeholder="Description (optionnel)"
                            value={libelle}
                            onChange={e => setLibelle(e.target.value)}
                            style={{ padding:'10px 12px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:13, outline:'none' }}
                        />
                        <select
                            value={categorieId}
                            onChange={e => setCatId(e.target.value)}
                            style={{ padding:'10px 12px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, color: categorieId ? T.text : T.textSoft, fontSize:13, outline:'none' }}
                        >
                            <option value="">Catégorie (optionnel)</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.nom_categorie}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div style={{ marginBottom:14 }}>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            style={{ width:'100%', padding:'10px 12px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, color:T.textSoft, fontSize:13, outline:'none', boxSizing:'border-box' }}
                        />
                    </div>

                    {/* Bouton Enregistrer */}
                    <button
                        onClick={handleSave}
                        disabled={loading || montantNum <= 0}
                        style={{
                            width:'100%', padding:'16px', borderRadius:14,
                            background: montantNum > 0
                                ? `linear-gradient(135deg, ${couleur}, ${isEntree ? '#16A34A' : '#B91C1C'})`
                                : T.surface2,
                            border:'none',
                            color: montantNum > 0 ? (isEntree ? '#000' : '#fff') : T.muted,
                            fontSize:16, fontWeight:800, cursor: montantNum > 0 ? 'pointer' : 'not-allowed',
                            transition:'all 0.2s', letterSpacing:'0.02em',
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading
                            ? 'Enregistrement...'
                            : montantNum > 0
                                ? `${isEntree ? '↑ Encaisser' : '↓ Dépenser'} ${montantNum.toLocaleString('fr-FR')} XOF`
                                : 'Saisissez un montant'
                        }
                    </button>

                    {/* Flash feedback */}
                    {flash && (
                        <div style={{
                            marginTop:12, padding:'12px 16px', borderRadius:12, textAlign:'center',
                            background: flash.ok ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            border:`1px solid ${flash.ok ? T.accent : T.danger}`,
                            color: flash.ok ? T.accent : T.danger,
                            fontSize:14, fontWeight:700,
                            animation:'flashAnim 2s ease forwards',
                        }}>
                            {flash.ok ? '✓' : '✗'} {flash.msg}
                        </div>
                    )}
                </div>

                {/* ── HISTORIQUE SESSION ── */}
                <div style={{ flex:1, minWidth: isMobile ? '100%' : 280, maxWidth: isMobile ? '100%' : 400 }}>
                    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, overflow:'hidden' }}>
                        <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <div>
                                <p style={{ fontSize:14, fontWeight:700, color:T.text }}>Session en cours</p>
                                <p style={{ fontSize:11, color:T.textSoft, marginTop:2 }}>{historique.length} opération{historique.length > 1 ? 's' : ''}</p>
                            </div>
                            {historique.length > 0 && (
                                <div style={{ textAlign:'right' }}>
                                    <p style={{ fontSize:11, color:T.textSoft }}>Total net</p>
                                    <p style={{ fontSize:16, fontWeight:800, color: totalSession >= 0 ? T.accent : T.danger, fontFamily:'monospace' }}>
                                        {totalSession >= 0 ? '+' : ''}{totalSession.toLocaleString('fr-FR')} XOF
                                    </p>
                                </div>
                            )}
                        </div>

                        {historique.length === 0
                            ? (
                                <div style={{ padding:'36px 20px', textAlign:'center' }}>
                                    <p style={{ fontSize:32, marginBottom:10 }}>🧾</p>
                                    <p style={{ fontSize:13, color:T.muted }}>Les opérations enregistrées<br/>apparaîtront ici</p>
                                </div>
                            )
                            : historique.map((h, i) => (
                                <div key={h.id} style={{
                                    display:'flex', alignItems:'center', gap:12, padding:'11px 16px',
                                    borderBottom: i < historique.length - 1 ? `1px solid ${T.border}` : 'none',
                                    animation: i === 0 ? 'slideIn 0.3s ease' : 'none',
                                }}>
                                    <div style={{
                                        width:34, height:34, borderRadius:9, flexShrink:0,
                                        background: h.type === 'Entree' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                                        display:'flex', alignItems:'center', justifyContent:'center',
                                        fontSize:16, color: h.type === 'Entree' ? T.accent : T.danger, fontWeight:700,
                                    }}>
                                        {h.type === 'Entree' ? '↑' : '↓'}
                                    </div>
                                    <div style={{ flex:1, minWidth:0 }}>
                                        <p style={{ fontSize:13, fontWeight:600, color:T.text, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                            {h.libelle}
                                        </p>
                                        <p style={{ fontSize:11, color:T.muted, margin:'2px 0 0' }}>
                                            {h.heure}{h.categorie ? ` · ${h.categorie}` : ''}
                                        </p>
                                    </div>
                                    <span style={{ fontSize:14, fontWeight:700, color: h.type === 'Entree' ? T.accent : T.danger, flexShrink:0, fontFamily:'monospace' }}>
                                        {h.type === 'Entree' ? '+' : '-'}{h.montant.toLocaleString('fr-FR')}
                                    </span>
                                </div>
                            ))
                        }
                    </div>

                    {historique.length > 0 && (
                        <p style={{ fontSize:11, color:T.muted, textAlign:'center', marginTop:10 }}>
                            Toutes les opérations sont sauvegardées en temps réel.
                        </p>
                    )}
                </div>
            </div>
        </Layout>
    );
}
