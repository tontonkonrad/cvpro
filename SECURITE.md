# Guide Sécurité — CVPro

## ⚠️ Actions obligatoires après déploiement

### 1. Changer le mot de passe admin immédiatement
- Accéder à : `https://votre-site.vercel.app/admin-panel`
- Login : `admin` / Mot de passe : `admin2024`
- Aller dans **Sécurité → Changer le mot de passe**
- Utiliser minimum 12 caractères avec majuscules, chiffres et symboles

### 2. Configurer la clé API IA
- Créer un compte sur https://console.anthropic.com
- Générer une clé API (format : `sk-ant-api03-...`)
- Dans le back-office → **Configuration IA** → coller la clé → Enregistrer
- La clé est chiffrée en AES-256 dans votre navigateur

### 3. Configurer CinetPay (paiements)
- Créer un compte marchand sur https://cinetpay.com
- Récupérer votre **Clé API** et votre **Site ID**
- Dans le back-office → **Paiements** → saisir les deux valeurs
- Laisser le **Mode production désactivé** pendant les tests
- Activer uniquement quand vous êtes prêt à encaisser de vrais paiements

### 4. Forcer HTTPS sur Vercel
- Vercel → Project Settings → Domains → activer **Force HTTPS**
- HTTPS est activé automatiquement sur les domaines `.vercel.app`

### 5. Ne jamais partager l'URL admin
- L'URL `/admin-panel` n'est référencée nulle part sur le site public
- Ne pas la communiquer, ne pas la mettre dans un email non chiffré

---

## 🔒 Mesures de sécurité déjà en place

| Mesure | Détail |
|--------|--------|
| Mot de passe haché | SHA-256 avec sel (identifiant) — jamais stocké en clair |
| Clé API chiffrée | AES-GCM 256 bits dérivé du navigateur (PBKDF2) |
| Token de paiement | Signé HMAC-SHA256 — impossible à forger |
| Blocage après échecs | 5 tentatives → blocage 5 min, récidive → 30 min |
| Session sécurisée | Token vérifié par hash — injection impossible |
| Anti-XSS | Tous les champs sanitisés, HTML IA filtré |
| Anti-clickjacking | X-Frame-Options: DENY |
| HSTS | max-age=31536000 (1 an) |
| Rate limiting | Max 3 générations IA par heure par session |
| Prompt injection | Délimiteurs de contexte dans les prompts IA |
| URL admin secrète | Non indexée, non référencée sur le site |

---

## ⚠️ Limite fondamentale (site statique)

Le site n'a pas de backend serveur. La vérification du paiement CinetPay
est simulée côté client. Pour une sécurité paiement maximale en production,
il faudra implémenter un webhook CinetPay côté serveur (ex: Netlify Functions
ou Vercel Serverless) qui confirme le paiement avant d'autoriser le téléchargement.

---

## 🆘 En cas de problème de sécurité

1. Changer immédiatement le mot de passe admin
2. Effacer le cache depuis **Sécurité → Effacer le cache** (révoque les clés)
3. Révoquer la clé API sur console.anthropic.com
4. Vérifier les logs d'accès dans **Sécurité → Voir les logs**
