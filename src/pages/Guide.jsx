import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout, { T, useIsMobile } from '../components/Layout';

const SECTIONS = [
    {
        id: 'dashboard',
        icon: '📊',
        titre: 'Tableau de bord',
        role: null,
        resume: 'Vue d\'ensemble de votre entreprise en un coup d\'œil.',
        contenu: [
            {
                sous_titre: 'À quoi ça sert ?',
                texte: 'Le tableau de bord est la première page que vous voyez après connexion. Il vous donne un résumé complet de la santé financière de votre entreprise : vos revenus, vos dépenses, votre solde disponible, et vos 5 dernières transactions.',
            },
            {
                sous_titre: 'Les chiffres clés (en haut)',
                texte: 'Vous y trouvez 4 blocs colorés :\n• 💰 Solde actuel — ce qu\'il vous reste en caisse\n• ↑ Entrées du mois — argent reçu ce mois-ci\n• ↓ Sorties du mois — argent dépensé ce mois-ci\n• 🔔 Alertes actives — notifications importantes non lues',
            },
            {
                sous_titre: 'Score de santé de l\'entreprise',
                texte: 'Un indicateur de 0 à 100 qui résume en un chiffre si votre entreprise se porte bien.\n• 🟢 80-100 — Excellente santé\n• 🟡 60-79 — Bonne santé\n• 🟠 40-59 — À surveiller\n• 🔴 0-39 — Attention requise\n\nCliquez sur "Voir le détail" pour voir les 5 critères évalués : flux du mois, solde, dettes, budgets, activité.',
            },
            {
                sous_titre: 'Prévision de trésorerie à 30 jours',
                texte: 'L\'application analyse vos 90 derniers jours d\'activité et calcule automatiquement une estimation de votre solde dans 30 jours. Elle prend aussi en compte les dettes et créances qui arrivent à échéance prochainement.\n\nExemple : si votre solde est 2 450 000 XOF aujourd\'hui et que la tendance est à la hausse, la prévision peut indiquer 2 825 000 XOF dans 30 jours.',
            },
            {
                sous_titre: 'Le graphique d\'évolution',
                texte: 'Le graphique est caché par défaut pour ne pas surcharger l\'écran. Cliquez sur "Évolution sur 6 mois" pour le déplier et voir la comparaison de vos revenus et dépenses mois par mois.',
            },
            {
                sous_titre: 'Dernières opérations',
                texte: 'Les 5 mouvements les plus récents sont affichés avec leur montant coloré en vert (entrée) ou rouge (sortie). Cliquez sur "Voir tout →" pour accéder à l\'historique complet.',
            },
        ],
        tips: [
            'Consultez le tableau de bord chaque matin — le score de santé vous dira immédiatement si quelque chose mérite votre attention.',
            'Si la prévision de trésorerie affiche une tendance à la baisse (↘), réduisez vos dépenses ce mois-ci.',
        ],
    },
    {
        id: 'transactions',
        icon: '⇅',
        titre: 'Transactions',
        role: null,
        resume: 'Enregistrez toutes vos entrées et sorties d\'argent.',
        contenu: [
            {
                sous_titre: 'À quoi ça sert ?',
                texte: 'Cette page est le cœur de l\'application. Ici vous notez chaque mouvement d\'argent de votre entreprise : les ventes, les achats, les salaires, les loyers… tout passe par cette page.',
            },
            {
                sous_titre: 'Comment enregistrer une transaction ?',
                texte: '1. Cliquez sur le bouton "＋ Nouvelle Transaction"\n2. Choisissez le type : Entrée (argent reçu) ou Sortie (argent dépensé)\n3. Saisissez le libellé (ex: "Vente de marchandises")\n4. Entrez le montant\n5. Choisissez la catégorie (Ventes, Achats, Salaires…)\n6. Sélectionnez la date\n7. Cliquez sur "Enregistrer"',
            },
            {
                sous_titre: 'Modifier une transaction',
                texte: 'Si vous avez fait une erreur, cliquez sur le bouton ✏️ à droite de la transaction. Le formulaire se remplira avec les données existantes — corrigez et cliquez "Mettre à jour".',
            },
            {
                sous_titre: 'Supprimer une transaction',
                texte: 'Cliquez sur le bouton 🗑 rouge à droite de la transaction. Une confirmation vous sera demandée avant suppression définitive.',
            },
            {
                sous_titre: 'Filtrer et rechercher',
                texte: 'Utilisez les filtres en haut pour afficher uniquement les entrées, les sorties, ou filtrer par catégorie, date, ou statut. Très utile pour retrouver une transaction précise.',
            },
            {
                sous_titre: 'Exporter en Excel',
                texte: 'Le bouton "Exporter Excel" télécharge toutes vos transactions dans un fichier que vous pouvez ouvrir avec Excel ou Google Sheets.',
            },
        ],
        tips: [
            'Enregistrez vos transactions au jour le jour pour ne rien oublier.',
            'Catégorisez bien chaque transaction — cela facilite les rapports de fin de mois.',
        ],
    },
    {
        id: 'caisse',
        icon: '⊞',
        titre: 'Mode Caisse rapide',
        role: null,
        resume: 'Enregistrez une vente ou une dépense en 3 secondes, sans remplir de formulaire.',
        contenu: [
            {
                sous_titre: 'À quoi ça sert ?',
                texte: 'Le mode caisse est conçu pour les moments où vous êtes occupé : vous venez de vendre quelque chose et vous voulez l\'enregistrer rapidement sans naviguer dans des menus. C\'est comme une caisse enregistreuse numérique.',
            },
            {
                sous_titre: 'Comment l\'utiliser ?',
                texte: '1. Choisissez le type : "↑ Entrée" (argent reçu) ou "↓ Sortie" (argent dépensé)\n2. Tapez le montant sur le pavé numérique\n3. Ajoutez une description courte (optionnel)\n4. Choisissez une catégorie (optionnel)\n5. Appuyez sur le grand bouton vert/rouge pour enregistrer\n\nLa transaction est sauvegardée instantanément et le montant se remet à zéro pour la prochaine opération.',
            },
            {
                sous_titre: 'L\'historique de session',
                texte: 'À droite (ou en bas sur téléphone), vous voyez toutes les opérations enregistrées depuis que vous avez ouvert la page. Un total net est affiché en haut de cette liste pour voir en un coup d\'œil combien vous avez encaissé et dépensé pendant votre session.',
            },
            {
                sous_titre: 'Raccourcis clavier (sur ordinateur)',
                texte: '• Chiffres 0-9 : saisir le montant\n• Touche Retour arrière : effacer le dernier chiffre\n• Touche Échap : remettre à zéro\n• Touche Entrée : enregistrer immédiatement',
            },
            {
                sous_titre: 'Différence avec la page Transactions',
                texte: 'La page Transactions est complète mais demande plus de temps à remplir. Le mode Caisse est rapide mais minimaliste. Les deux enregistrent dans le même historique — vous pouvez compléter les détails plus tard depuis la page Transactions.',
            },
        ],
        tips: [
            'Idéal pour les vendeurs en boutique ou au marché — gardez cette page ouverte sur votre téléphone pendant la journée.',
            'Vous pouvez enchaîner 10 ventes sans quitter la page — chaque enregistrement remet le montant à zéro automatiquement.',
        ],
    },
    {
        id: 'dettes',
        icon: '📄',
        titre: 'Dettes & Factures',
        role: null,
        resume: 'Suivez ce que vous devez et ce qu\'on vous doit.',
        contenu: [
            {
                sous_titre: 'À quoi ça sert ?',
                texte: 'Cette page gère les paiements à crédit. Il y a deux types :\n• 📤 Créance Client — un client vous doit de l\'argent\n• 📥 Dette Fournisseur — vous devez de l\'argent à un fournisseur',
            },
            {
                sous_titre: 'Créer une dette ou facture',
                texte: '1. Cliquez "＋ Nouvelle Dette"\n2. Choisissez le type (Client ou Fournisseur)\n3. Sélectionnez le tiers concerné (client ou fournisseur)\n4. Entrez le montant total dû\n5. Définissez la date d\'échéance (date limite de paiement)\n6. Cliquez "Enregistrer"',
            },
            {
                sous_titre: 'Enregistrer un paiement reçu ou effectué',
                texte: 'Sur chaque carte de dette, cliquez le bouton "💰 Reçu" (si c\'est un client qui paye) ou "💸 Paiement" (si vous payez un fournisseur).\nUne fenêtre s\'ouvre avec :\n• Le récapitulatif du montant dû\n• Un champ pour saisir le montant du paiement\n• La confirmation met à jour automatiquement le statut',
            },
            {
                sous_titre: 'Les statuts',
                texte: '• En cours — la dette est active, pas encore payée\n• Part. payé — un paiement partiel a été reçu\n• Soldé — la dette est entièrement remboursée\n• En retard — la date d\'échéance est dépassée',
            },
            {
                sous_titre: 'Envoyer un rappel par email 📧',
                texte: 'Sur chaque carte de dette non soldée, le bouton 📧 (violet) envoie automatiquement un email de rappel :\n\n• Si la dette est de type Client : un email professionnel est envoyé directement à votre client (si son email est enregistré dans la page Tiers) avec le montant restant et la date d\'échéance. Vous recevez aussi une copie.\n\n• Si la dette est de type Fournisseur : vous recevez un email vous rappelant que vous devez payer ce fournisseur.\n\nAprès l\'envoi, un message de confirmation apparaît sous la carte.',
            },
        ],
        tips: [
            'Vérifiez régulièrement les dettes "En retard" pour relancer vos clients.',
            'Ajoutez l\'email de vos clients dans la page Tiers pour pouvoir leur envoyer des rappels automatiques.',
            'Le montant "Restant dû" total en haut vous montre immédiatement votre exposition financière.',
        ],
    },
    {
        id: 'budgets',
        icon: '◎',
        titre: 'Budgets',
        role: null,
        resume: 'Fixez des limites de dépenses pour chaque catégorie.',
        contenu: [
            {
                sous_titre: 'À quoi ça sert ?',
                texte: 'Les budgets vous permettent de définir à l\'avance combien vous voulez dépenser dans chaque catégorie (ex: max 500 000 XOF par mois pour les achats). L\'application vous alerte quand vous approchez de la limite.',
            },
            {
                sous_titre: 'Créer un budget',
                texte: '1. Cliquez "＋ Nouveau Budget"\n2. Choisissez la catégorie de dépenses\n3. Saisissez le montant maximum autorisé\n4. Choisissez la période (mensuel, trimestriel, annuel)\n5. Définissez les dates de début et fin\n6. Cliquez "Enregistrer"',
            },
            {
                sous_titre: 'Lire les barres de progression',
                texte: 'Chaque budget affiche une barre colorée :\n• 🟢 Verte — vous êtes dans les limites, tout va bien\n• 🟡 Jaune — vous avez dépassé 75%, attention\n• 🔴 Rouge — budget dépassé, action nécessaire',
            },
        ],
        tips: [
            'Commencez par créer un budget pour vos 2-3 postes de dépenses les plus importants.',
            'Révisez vos budgets chaque trimestre selon l\'évolution de votre activité.',
        ],
    },
    {
        id: 'rapports',
        icon: '▲',
        titre: 'Rapports',
        role: 'admin',
        resume: 'Générez un bilan financier mensuel en PDF.',
        contenu: [
            {
                sous_titre: 'À quoi ça sert ?',
                texte: 'La page Rapports génère un document PDF professionnel avec toutes vos données financières du mois sélectionné. Ce document peut être partagé avec votre comptable, un investisseur, ou une banque.',
            },
            {
                sous_titre: 'Générer un rapport',
                texte: '1. Choisissez l\'année dans le menu déroulant\n2. Cliquez sur le mois souhaité\n3. Cliquez "Générer le PDF"\n4. Le document se télécharge automatiquement sur votre appareil',
            },
            {
                sous_titre: 'Contenu du rapport PDF',
                texte: 'Le rapport inclut :\n• Résumé financier (entrées, sorties, solde)\n• Tableau des transactions du mois\n• Répartition par catégorie\n• Graphique d\'évolution\n• En-tête avec le nom de votre entreprise',
            },
        ],
        tips: [
            'Générez votre rapport le 1er de chaque mois pour avoir un suivi régulier.',
            'Conservez les PDF dans un dossier pour avoir un historique de votre activité.',
        ],
    },
    {
        id: 'alertes',
        icon: '◈',
        titre: 'Alertes',
        role: null,
        resume: 'Restez informé des événements importants de votre entreprise.',
        contenu: [
            {
                sous_titre: 'À quoi ça sert ?',
                texte: 'Les alertes sont des notifications automatiques que le système crée quand quelque chose mérite votre attention : un budget dépassé, une dette en retard, une transaction inhabituelle.',
            },
            {
                sous_titre: 'Types d\'alertes',
                texte: '• 🔴 Critique — nécessite une action immédiate\n• 🟡 Avertissement — à surveiller\n• 🔵 Information — simple notification',
            },
            {
                sous_titre: 'Gérer les alertes',
                texte: 'Cliquez sur une alerte pour la marquer comme lue. Vous pouvez aussi supprimer les alertes qui ne sont plus pertinentes. Le badge rouge sur l\'icône Alertes dans le menu indique le nombre d\'alertes non lues.',
            },
        ],
        tips: ['Ne laissez pas les alertes s\'accumuler — traitez-les au fur et à mesure.'],
    },
    {
        id: 'tiers',
        icon: '◇',
        titre: 'Tiers (Clients & Fournisseurs)',
        role: null,
        resume: 'Gérez votre carnet d\'adresses professionnel.',
        contenu: [
            {
                sous_titre: 'À quoi ça sert ?',
                texte: 'Un "tiers" c\'est une personne ou une entreprise avec qui vous faites affaire. Ici vous enregistrez vos clients (ceux qui vous achètent) et vos fournisseurs (ceux à qui vous achetez).',
            },
            {
                sous_titre: 'Ajouter un tiers',
                texte: '1. Cliquez "＋ Nouveau Tiers"\n2. Entrez le nom de la personne ou l\'entreprise\n3. Choisissez le type : Client ou Fournisseur\n4. Ajoutez optionnellement le téléphone, email, adresse\n5. Cliquez "Enregistrer"',
            },
            {
                sous_titre: 'Pourquoi c\'est important ?',
                texte: 'Les tiers sont utilisés dans la page Dettes & Factures. Vous devez d\'abord créer un tiers avant de pouvoir lui associer une dette ou une facture. Cela vous permet aussi d\'avoir une liste organisée de tous vos partenaires commerciaux.',
            },
        ],
        tips: ['Créez vos principaux clients et fournisseurs dès le départ pour commencer à utiliser les dettes efficacement.'],
    },
    {
        id: 'parametres',
        icon: '⚙',
        titre: 'Paramètres',
        role: 'admin',
        resume: 'Gérez votre entreprise, votre équipe et vos catégories.',
        contenu: [
            {
                sous_titre: 'Informations de l\'entreprise',
                texte: 'Modifiez le nom de votre entreprise, la devise utilisée et d\'autres informations générales. Ces données apparaissent sur vos rapports PDF.',
            },
            {
                sous_titre: 'Inviter un gestionnaire',
                texte: 'Vous pouvez ajouter des membres à votre équipe (caissiers, comptables) sans leur donner tous vos accès :\n1. Dans la section "Inviter un Gestionnaire", saisissez son adresse email\n2. Cliquez "Envoyer l\'invitation"\n3. Votre collaborateur reçoit un email avec un lien\n4. Il clique le lien, crée son propre mot de passe\n5. Il peut alors accéder à l\'application avec des droits limités',
            },
            {
                sous_titre: 'Différence Admin et Gestionnaire',
                texte: '• 👑 Admin (vous) — accès complet : rapports, paramètres, gestion de l\'équipe\n• 👤 Gestionnaire — peut enregistrer des transactions, consulter les dettes et budgets, mais ne peut pas modifier les paramètres ni générer des rapports',
            },
            {
                sous_titre: 'Gérer l\'équipe',
                texte: 'Dans la liste de votre équipe, vous pouvez :\n• Désactiver temporairement un compte (en cas d\'absence)\n• Réactiver un compte désactivé\n• Supprimer définitivement un compte',
            },
            {
                sous_titre: 'Catégories de transactions',
                texte: 'Vous pouvez créer des catégories personnalisées pour mieux organiser vos transactions. Ex: "Carburant", "Location de matériel", "Commissions"…',
            },
        ],
        tips: [
            'N\'invitez que les personnes de confiance — les gestionnaires ont accès à vos données financières.',
            'Créez vos catégories avant de commencer à saisir des transactions.',
        ],
    },
];

function Section({ section, isOpen, onToggle, isAdmin }) {
    const isAdminOnly = section.role === 'admin';
    if (isAdminOnly && !isAdmin) return null;

    return (
        <div style={{ border:`1px solid ${isOpen ? T.accent + '55' : T.border}`, borderRadius:14, overflow:'hidden', transition:'border-color 0.2s' }}>
            {/* Header accordéon */}
            <button
                onClick={onToggle}
                style={{
                    width:'100%', display:'flex', alignItems:'center', gap:14,
                    padding:'16px 20px', background: isOpen ? T.accentDim : T.surface,
                    border:'none', cursor:'pointer', textAlign:'left', transition:'background 0.2s',
                }}
            >
                <span style={{ fontSize:24, lineHeight:1, flexShrink:0 }}>{section.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ fontSize:15, fontWeight:700, color: isOpen ? T.accent : T.text }}>
                            {section.titre}
                        </span>
                        {isAdminOnly && (
                            <span style={{ fontSize:10, padding:'2px 8px', borderRadius:99, background:'rgba(139,92,246,0.15)', color:'#8B5CF6', fontWeight:700 }}>
                                ADMIN
                            </span>
                        )}
                    </div>
                    <p style={{ fontSize:12, color:T.textSoft, margin:0, marginTop:2 }}>{section.resume}</p>
                </div>
                <span style={{ fontSize:18, color: isOpen ? T.accent : T.muted, transition:'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none', flexShrink:0 }}>
                    ⌄
                </span>
            </button>

            {/* Contenu */}
            {isOpen && (
                <div style={{ background:T.bg, padding:'20px 24px', borderTop:`1px solid ${T.border}` }}>
                    {section.contenu.map((bloc, i) => (
                        <div key={i} style={{ marginBottom: i < section.contenu.length - 1 ? 22 : 0 }}>
                            <h3 style={{ fontSize:13, fontWeight:700, color:T.info, marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
                                <span style={{ width:5, height:5, borderRadius:99, background:T.info, display:'inline-block', flexShrink:0 }}/>
                                {bloc.sous_titre}
                            </h3>
                            <p style={{ fontSize:13, color:T.textSoft, lineHeight:1.8, whiteSpace:'pre-line', paddingLeft:13 }}>
                                {bloc.texte}
                            </p>
                        </div>
                    ))}

                    {section.tips?.length > 0 && (
                        <div style={{ marginTop:20, background:'rgba(34,197,94,0.07)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:10, padding:'12px 16px' }}>
                            <p style={{ fontSize:12, fontWeight:700, color:T.accent, marginBottom:8 }}>
                                💡 Conseils pratiques
                            </p>
                            {section.tips.map((tip, i) => (
                                <p key={i} style={{ fontSize:12, color:T.textSoft, margin:0, lineHeight:1.6, marginBottom: i < section.tips.length - 1 ? 6 : 0 }}>
                                    • {tip}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Guide() {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { user } = useSelector(s => s.auth);
    const isAdmin  = user?.role === 'admin';
    const [openId, setOpenId] = useState(null);

    const toggle = (id) => setOpenId(prev => prev === id ? null : id);

    return (
        <Layout>
            <div style={{ padding: isMobile ? '16px' : '28px 32px', maxWidth: 780 }}>

                {/* En-tête */}
                <div style={{ marginBottom:28 }}>
                    <h1 style={{ fontFamily:"'Calistoga',serif", fontSize:isMobile?22:28, fontWeight:400, color:T.text, marginBottom:8 }}>
                        Guide d'utilisation
                    </h1>
                    <p style={{ fontSize:14, color:T.textSoft, lineHeight:1.6 }}>
                        Bienvenue sur <span style={{ color:T.accent, fontWeight:700 }}>FinanceIQ</span>.
                        Ce guide vous explique chaque section de l'application pour vous aider à gérer
                        les finances de votre entreprise facilement.
                    </p>
                </div>

                {/* Carte résumé rapide */}
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'18px 20px', marginBottom:24 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:14 }}>
                        🗺️ Résumé des pages disponibles
                    </p>
                    <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:10 }}>
                        {SECTIONS.filter(s => !s.role || (s.role === 'admin' && isAdmin)).map(s => (
                            <button
                                key={s.id}
                                onClick={() => { setOpenId(s.id); setTimeout(() => document.getElementById(s.id)?.scrollIntoView({ behavior:'smooth', block:'start' }), 50); }}
                                style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:T.surface2, border:`1px solid ${T.border}`, borderRadius:9, cursor:'pointer', textAlign:'left' }}
                            >
                                <span style={{ fontSize:16 }}>{s.icon}</span>
                                <span style={{ fontSize:12, color:T.textSoft, fontWeight:500 }}>{s.titre}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Accordéon sections */}
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {SECTIONS.map(section => (
                        <div key={section.id} id={section.id}>
                            <Section
                                section={section}
                                isOpen={openId === section.id}
                                onToggle={() => toggle(section.id)}
                                isAdmin={isAdmin}
                            />
                        </div>
                    ))}
                </div>

                {/* Aide supplémentaire */}
                <div style={{ marginTop:28, background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'20px 22px' }}>
                    <p style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:10 }}>
                        ❓ Vous avez encore des questions ?
                    </p>
                    <p style={{ fontSize:13, color:T.textSoft, lineHeight:1.7, marginBottom:14 }}>
                        Si quelque chose n'est pas clair ou si vous rencontrez un problème, commencez
                        par vérifier que vous avez bien rempli tous les champs obligatoires (marqués *).
                        La plupart des erreurs viennent d'un champ manquant ou d'un format incorrect.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{ padding:'9px 18px', background:`linear-gradient(135deg,${T.accent},#16A34A)`, border:'none', borderRadius:9, color:'#000', fontSize:13, fontWeight:700, cursor:'pointer' }}
                    >
                        Retour au tableau de bord
                    </button>
                </div>
            </div>
        </Layout>
    );
}
