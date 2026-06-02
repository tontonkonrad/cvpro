# CVPro — Générateur de CV avec IA

## 🚀 Déploiement GitHub → Vercel

### Étape 1 — Push sur GitHub
```bash
git init
git add .
git commit -m "CVPro initial"
git remote add origin https://github.com/TON_PSEUDO/cvpro.git
git push -u origin main
```

### Étape 2 — Déployer sur Vercel
1. [vercel.com](https://vercel.com) → "Add New Project"
2. Importe ton repo GitHub
3. **Framework Preset → "Other"**
4. Clique **Deploy**

### Étape 3 — Configurer
- Back-office : `https://ton-site.vercel.app/admin-panel`
- Login : `admin` / `admin2024`
- **Changer le mot de passe immédiatement**
- Ajouter la clé API IA et les clés CinetPay

## 📁 Structure
```
/
├── index.html          ← Accueil
├── create.html         ← Créer un CV
├── templates.html      ← Galerie modèles
├── tarifs.html         ← Tarifs
├── admin-panel.html    ← Back-office (secret)
├── vercel.json         ← Config Vercel
├── css/
└── js/
```

## URLs du site
- `/` → Accueil
- `/create` → Créer un CV
- `/templates` → Modèles
- `/tarifs` → Tarifs
- `/admin-panel` → Back-office (secret)
