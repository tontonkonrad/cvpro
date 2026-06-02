# CVPro — Générateur de CV professionnel avec IA

## 🚀 Déploiement sur Vercel (GitHub)

```bash
git init
git add .
git commit -m "CVPro v1.0"
git remote add origin https://github.com/TON_PSEUDO/cvpro.git
git push -u origin main
```
Puis sur vercel.com → Add New Project → importer le repo → Framework: **Other** → Deploy.

## 🔐 Première connexion admin
URL : `/admin-panel`  
Login : `admin` | Mot de passe : `admin2024`  
**→ Changer le mot de passe immédiatement dans Sécurité**

## ⚙️ Configuration requise après déploiement
1. **Clé API IA** → Admin → Configuration IA → Enregistrer
2. **CinetPay** → Admin → Paiements → Clé API + Site ID

## 📁 Structure
```
/
├── index.html          ← Accueil
├── create.html         ← Créer un CV (wizard 5 étapes)
├── templates.html      ← Galerie 11 templates
├── tarifs.html         ← Page tarifs
├── admin-panel.html    ← Back-office (URL secrète)
├── vercel.json         ← Config Vercel
├── css/main.css        ← Tous les styles
└── js/
    ├── main.js         ← Logique CV + sécurité
    └── i18n.js         ← Traductions (future extension)
```
