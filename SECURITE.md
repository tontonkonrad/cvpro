# Guide Sécurité CVPro

## Après déploiement : actions obligatoires

### 1. Changer le mot de passe admin immédiatement
Accéder à `/admin-panel.html`, se connecter avec `admin` / `admin2024`,
aller dans **Sécurité → Changer le mot de passe** et mettre un mot de passe fort (12+ caractères).

### 2. Netlify : Forcer HTTPS
Dans Netlify → Site settings → Domain management → activer "Force HTTPS"

### 3. Netlify : Headers de sécurité serveur
Créer un fichier `_headers` à la racine avec ce contenu :
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/admin-panel.html
  X-Robots-Tag: noindex, nofollow, noarchive
```

### 4. Protéger la clé API
La clé API est stockée dans le localStorage du navigateur admin.
**Ne jamais partager l'accès à l'ordinateur depuis lequel tu gères l'admin.**
Pour une protection maximale, utiliser Netlify Functions (backend) pour proxifier les appels API.

### 5. URL admin secrète
L'URL `/admin-panel.html` n'est pas référencée sur le site.
Ne pas la partager. Utiliser un mot de passe fort.

### 6. Rate limiting paiement
En production, intégrer le webhook CinetPay côté serveur pour vérifier 
que le paiement est RÉELLEMENT confirmé avant de permettre le téléchargement.
