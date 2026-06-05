# Sécurité CVPro

## Actions obligatoires après déploiement
1. **Changer le MDP admin** → /admin-panel → Sécurité → Changer mot de passe
2. **Clé API IA** → console.anthropic.com → Admin → IA → Enregistrer
3. **CinetPay** → cinetpay.com → Admin → Paiements → Enregistrer

## Mesures de sécurité
- Mot de passe : SHA-256 + sel (identifiant)
- Clé API : chiffrée AES-GCM 256 bits (PBKDF2)
- Token paiement : signé HMAC-SHA256 (usage unique)
- Blocage login : 5 tentatives → 5 min, récidive → 30 min
- Anti-XSS : sanitization sur tous les champs utilisateur
- Rate limiting : max 3 CV/heure par session
- HSTS : max-age=31536000
- URL admin non indexée et non référencée
