/* ===== CVPro — JavaScript partagé ===== */

// Mobile menu toggle
function toggleMenu() {
  const m = document.getElementById('navMobile');
  if (m) m.classList.toggle('open');
}

// Toast notification
function showToast(msg, icon = 'ℹ️') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = icon + ' ' + msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3500);
}

// Save/load from sessionStorage
function saveData(key, val) {
  try { sessionStorage.setItem('cvpro_' + key, JSON.stringify(val)); } catch(e){}
}
function loadData(key) {
  try { const v = sessionStorage.getItem('cvpro_' + key); return v ? JSON.parse(v) : null; } catch(e){ return null; }
}

// Templates data (shared)
const TEMPLATES = [
  { id: 'modern',     name: 'Modern Pro',       desc: 'Sidebar colorée teal, layout bicolonne élégant', emoji: '🎨', badge: 'Populaire', c1: '#0F6E56', c2: '#E1F5EE' },
  { id: 'minimal',    name: 'Clean Minimal',     desc: 'Blanc pur, typographie Syne bold, maximal épuré', emoji: '⬜', c1: '#1a1a1a', c2: '#f8f8f8' },
  { id: 'teal',       name: 'Teal Créatif',      desc: 'Accent turquoise vif sur fond clair raffiné', emoji: '🌊', c1: '#1D9E75', c2: '#E1F5EE' },
  { id: 'corporate',  name: 'Corporate',         desc: 'Sidebar teal structurée, style grandes entreprises', emoji: '💼', badge: 'Pro', c1: '#0F6E56', c2: '#f4f4f4' },
  { id: 'blue',       name: 'Académique Bleu',   desc: 'Bandes bleues, style ingénieur et universitaire', emoji: '📘', c1: '#185FA5', c2: '#E6F1FB' },
  { id: 'dark',       name: 'Slate Premium',     desc: 'Fond sombre, accents cyan, ultra moderne', emoji: '🌙', c1: '#1e2a3a', c2: '#5DCAA5' },
  { id: 'editorial',  name: 'Éditorial',         desc: 'Bordure noire double, typographie magazine haut de gamme', emoji: '📰', c1: '#1a1a1a', c2: '#ffffff' },
  { id: 'warm',       name: 'Terracotta Warm',   desc: 'Tons sable et terracotta, chaleureux et professionnel', emoji: '🏜', c1: '#D85A30', c2: '#fdf8f3' },
  { id: 'bold',       name: 'Bold Impact',       desc: 'Sidebar noir, contraste maximal, effet grand format', emoji: '⚫', c1: '#111', c2: '#fff' },
  { id: 'pastel',     name: 'Pastel Indigo',     desc: 'Palette lavande douce, idéal pour les secteurs créatifs', emoji: '🌸', c1: '#4F46E5', c2: '#EEF2FF' },
  { id: 'classique',  name: 'Classique Pro',     desc: 'Fond blanc, titres bleu marine, sections structurées avec double ligne — style sobre et percutant', emoji: '📄', badge: 'Nouveau', c1: '#1A3A6B', c2: '#ffffff' },
];

// XSS Sanitization

// Decrypt API key (uses same derivation as admin panel)
async function _decryptKeyGlobal(ciphertext) {
  try {
    const fp = navigator.userAgent.substring(0,50) + screen.width + navigator.language + navigator.hardwareConcurrency;
    const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(fp), 'PBKDF2', false, ['deriveKey']);
    const k = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: new TextEncoder().encode('cvpro-salt-2026'), iterations: 100000, hash: 'SHA-256' },
      km, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
    );
    const combined = new Uint8Array(atob(ciphertext).split('').map(c=>c.charCodeAt(0)));
    const iv = combined.slice(0,12), data = combined.slice(12);
    const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, k, data);
    return new TextDecoder().decode(dec);
  } catch { return null; }
}


// Strip dangerous tags from AI HTML output (XSS protection)
function _stripScripts(html) {
  if (!html) return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?(script|iframe|object|embed|link|meta|base|form)[^>]*>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:/gi, '');
}

function sanitize(s){if(!s)return "";return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/\x27/g,"&#x27;");}

// Build CV HTML from data
function buildCVHTML(data, aiContent) {
  const tpl = data.template || 'modern';

  const dots = (n) => [1,2,3,4,5].map(i =>
    `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${i<=n?'#0F6E56':'#ddd'};margin-right:4px"></span>`
  ).join('');

  const initials = ((data.prenom||'')[0]||'') + ((data.nom||'')[0]||'');

  const expHTML = (data.exps||[]).map(e => `
    <div style="margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid #eee">
      <div style="font-size:.75rem;color:#0F6E56;font-weight:700;margin-bottom:2px">${sanitize(e.start)||''}${e.end?' – '+e.end:''}</div>
      <div style="font-weight:700;font-size:.95rem;color:#1a1a1a">${sanitize(e.company)||''}</div>
      <div style="font-size:.85rem;color:#0F6E56;font-style:italic;margin-bottom:8px">${sanitize(e.role)||''}</div>
      <div style="font-size:.83rem;color:#555;line-height:1.65">${_stripScripts(e.aiDesc || e.desc || '')}</div>
    </div>
  `).join('');

  const eduHTML = (data.edus||[]).map(e => `
    <div style="margin-bottom:14px">
      <div style="font-size:.75rem;color:#0F6E56;font-weight:700">${sanitize(e.start)||''}${e.end?' – '+e.end:''}</div>
      <div style="font-weight:600;font-size:.9rem;color:#1a1a1a">${sanitize(e.school)||''}</div>
      <div style="font-size:.82rem;color:#666">${sanitize(e.degree)||''}</div>
    </div>
  `).join('');

  const skillsHTML = (data.skills||[]).map(s => `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <span style="font-size:.83rem;color:#333">${sanitize(s.name)||''}</span>
      <div>${dots(s.level||3)}</div>
    </div>
  `).join('');

  const langsHTML = (data.langs||[]).map(l => `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <span style="font-size:.83rem;color:#333">${sanitize(l.name)||''}</span>
      <div>${dots(l.level||3)}</div>
    </div>
  `).join('');

  const secTitle = (lbl) => `
    <div style="font-family:'Syne',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.12em;color:#0F6E56;text-transform:uppercase;margin:0 0 14px;padding-bottom:6px;border-bottom:2px solid #0F6E56">${lbl}</div>
  `;
  const cvT = (key) => (typeof t === 'function') ? t(key) : key;

  const profil = aiContent?.profil || data.profil || '';

  // ===== TEMPLATE CLASSIQUE PRO (style Konrad GBEDO) =====
  if (tpl === 'classique') {
    const navy = '#1A3A6B';
    const secCls = (t) => `
      <div style="margin-bottom:18px">
        <div style="font-family:Arial,sans-serif;font-size:.78rem;font-weight:700;letter-spacing:.09em;color:${navy};text-transform:uppercase;padding-bottom:4px;border-bottom:3px solid ${navy};border-top:1px solid ${navy};padding-top:4px;margin-bottom:10px">${t}</div>
      </div>`;

    const expClsHTML = (data.exps||[]).map(e => `
      <div style="margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3px">
          <div style="font-weight:700;font-size:.9rem;color:#1a1a1a;text-transform:uppercase;letter-spacing:.03em;max-width:72%">${sanitize(e.role)||''}</div>
          <div style="font-size:.82rem;color:#333;font-weight:600;white-space:nowrap">${sanitize(e.start)||''}${e.end?' - '+e.end:''}</div>
        </div>
        <div style="font-size:.82rem;color:${navy};font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-bottom:7px">${sanitize(e.company)||''}</div>
        <div style="font-size:.82rem;color:#444;line-height:1.7">${_stripScripts(e.aiDesc) || (e.desc ? `<ul style="padding-left:16px;margin:0">${e.desc.split('\n').filter(l=>l.trim()).map(l=>`<li style="margin-bottom:3px">${l}</li>`).join('')}</ul>` : '')}</div>
      </div>`).join('');

    const eduClsHTML = (data.edus||[]).map(e => `
      <div style="margin-bottom:12px">
        <div style="font-weight:700;font-size:.87rem;color:#1a1a1a">${sanitize(e.school)||''}</div>
        <div style="font-size:.82rem;color:${navy};font-weight:600">${sanitize(e.degree)||''}</div>
        <div style="font-size:.78rem;color:#666">${sanitize(e.start)||''}${e.end?' - '+e.end:''}</div>
      </div>`).join('');

    const skClsHTML = (data.skills||[]).map(s =>
      `<span style="font-size:.82rem;color:#333">${sanitize(s.name)}</span>`).join(' &nbsp;·&nbsp; ');

    const lgClsHTML = (data.langs||[]).map(l =>
      `<span style="font-size:.82rem;color:#333">${sanitize(l.name)}</span>`).join(' &nbsp;·&nbsp; ');

    const prfl = aiContent?.profil || data.profil || '';

    return `
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap" rel="stylesheet">
<div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;background:#fff;padding:40px 48px;max-width:800px;margin:0 auto">

  <!-- EN-TÊTE CENTRÉ -->
  <div style="text-align:center;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #ccc">
    <h1 style="font-family:Arial,sans-serif;font-size:1.9rem;font-weight:700;color:#1a1a1a;margin:0 0 6px;letter-spacing:.04em">${sanitize(data.prenom)||''} ${(data.nom||'').toUpperCase()}</h1>
    <div style="font-size:.95rem;color:${navy};font-weight:600;margin-bottom:10px">${sanitize(data.titre)||''}</div>
    <div style="font-size:.8rem;color:#555;display:flex;justify-content:center;flex-wrap:wrap;gap:16px">
      ${data.tel?`<span>📞 ${sanitize(data.tel)}</span>`:''}
      ${data.email?`<span>✉ ${sanitize(data.email)}</span>`:''}
      ${data.adresse?`<span>📍 ${sanitize(data.adresse)}</span>`:''}
      ${data.web?`<span>🔗 ${sanitize(data.web)}</span>`:''}
    </div>
  </div>

  <!-- À PROPOS -->
  ${prfl ? `
  ${secCls(cvT('cv_about'))}
  <p style="font-size:.84rem;color:#333;line-height:1.75;margin-bottom:22px">${prfl}</p>
  ` : ''}

  <!-- COMPÉTENCES EN LIGNE -->
  ${skClsHTML ? `
  ${secCls(cvT('cv_general_skills'))}
  <p style="font-size:.83rem;color:#333;line-height:1.8;margin-bottom:22px">${skClsHTML}</p>
  ` : ''}

  <!-- EXPÉRIENCES -->
  ${expClsHTML ? `
  ${secCls(cvT('cv_experience'))}
  <div style="margin-bottom:22px">${expClsHTML}</div>
  ` : ''}

  <!-- FORMATION -->
  ${eduClsHTML ? `
  ${secCls(cvT('cv_education'))}
  <div style="margin-bottom:22px">${eduClsHTML}</div>
  ` : ''}

  <!-- LANGUES -->
  ${lgClsHTML ? `
  ${secCls(cvT('cv_languages'))}
  <p style="font-size:.83rem;color:#333;line-height:1.8;margin-bottom:22px">${lgClsHTML}</p>
  ` : ''}

  <!-- INTÉRÊTS -->
  ${data.interests ? `
  ${secCls(cvT('cv_interests'))}
  <p style="font-size:.83rem;color:#333;line-height:1.8">${sanitize(data.interests)}</p>
  ` : ''}

  <!-- PIED DE PAGE -->
  <div style="margin-top:32px;padding-top:14px;border-top:1px solid #ccc;text-align:center;font-size:.78rem;color:#777;font-weight:600">
    ${sanitize(data.prenom)||''} ${sanitize(data.nom)||''} · ${sanitize(data.tel)||''} · ${sanitize(data.email)||''}
  </div>
</div>`;
  }

  // Template Modern Pro (+ toutes variantes avec sidebar)
  return `
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet">
<div style="font-family:'DM Sans',sans-serif;color:#1a1a1a;margin:0;padding:0;background:#fff">

  <!-- EN-TÊTE -->
  <div style="background:#0F6E56;color:white;padding:40px;display:flex;align-items:center;gap:28px">
    <div style="width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.2);border:3px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:700;flex-shrink:0">${initials}</div>
    <div>
      <div style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;line-height:1.1">${(data.prenom||'').toUpperCase()} ${(data.nom||'').toUpperCase()}</div>
      <div style="font-size:1rem;opacity:.85;margin-top:6px">${sanitize(data.titre)||''}</div>
    </div>
    <div style="margin-left:auto;font-size:.82rem;opacity:.8;text-align:right;line-height:2">
      ${data.email?`<div>✉ ${sanitize(data.email)}</div>`:''}
      ${data.tel?`<div>📞 ${sanitize(data.tel)}</div>`:''}
      ${data.adresse?`<div>📍 ${sanitize(data.adresse)}</div>`:''}
    </div>
  </div>

  <!-- CORPS 2 COLONNES -->
  <div style="display:grid;grid-template-columns:260px 1fr;min-height:700px">

    <!-- SIDEBAR -->
    <div style="background:#f6f6f6;padding:28px;border-right:1px solid #eee">
      ${profil ? `${secTitle(cvT('cv_profile'))}<p style="font-size:.83rem;color:#444;line-height:1.7;margin-bottom:24px">${profil}</p>` : ''}
      ${skillsHTML ? `${secTitle(cvT('cv_skills'))}${skillsHTML}<br>` : ''}
      ${langsHTML ? `${secTitle(cvT('cv_languages'))}${langsHTML}<br>` : ''}
      ${data.interests ? `${secTitle(cvT('cv_interests'))}<p style="font-size:.82rem;color:#555;line-height:1.7">${sanitize(data.interests)}</p>` : ''}
      ${data.web ? `<br>${secTitle('Web')}<a href="${sanitize(data.web)}" style="font-size:.8rem;color:#0F6E56;word-break:break-all">${sanitize(data.web)}</a>` : ''}
    </div>

    <!-- CONTENU PRINCIPAL -->
    <div style="padding:28px">
      ${expHTML ? `${secTitle(cvT('cv_experience'))}${expHTML}<br>` : ''}
      ${eduHTML ? `${secTitle(cvT('cv_education'))}${eduHTML}` : ''}
    </div>
  </div>
</div>
`;
}

// Appel API IA
async function callClaude(formData) {
  // Load encrypted API key
  let key = '';
  try {
    const enc = localStorage.getItem('cvpro_api_key_enc');
    if (enc) { key = await _decryptKeyGlobal(enc); }
    else { key = localStorage.getItem('cvpro_api_key') || ''; } // fallback
  } catch { key = localStorage.getItem('cvpro_api_key') || ''; }

  // Use current language for CV generation
  const lang = (typeof LANG !== 'undefined') ? LANG : 'fr';
  const noDesc = lang === 'en' ? '(none provided)' : '(aucune)';
  const expsText = (formData.exps||[]).map((e,i) =>
    `${i+1}. ${sanitize(e.company)} | ${sanitize(e.role)} | ${sanitize(e.start)||''} - ${sanitize(e.end)||''}\n   ${lang === 'en' ? 'Description' : 'Description'}: ${e.desc||noDesc}`
  ).join('\n');

  // Get language-specific prompt template from i18n
  const promptTpl = (typeof t === 'function') ? t('ai_prompt_instruction') :
    (lang === 'en'
      ? `You are an expert HR consultant and professional CV writer. From the raw data below, generate enriched content for a professional CV in JSON format ONLY.\n\nCANDIDATE DATA:\nFull name: {name}\nTarget position: {titre}\nRaw profile: {profil}\n\nRAW EXPERIENCES:\n{exps}\n\nSTRICT INSTRUCTIONS:\n1. For each experience, write 3-4 HTML bullet points (<ul><li>...</li></ul>) describing the ROLE, RESPONSIBILITIES and measurable IMPACT. Use strong action verbs.\n2. Write a compelling 3-4 line professional summary.\n3. Reply ONLY with valid JSON, no markdown, no backticks.\n\nEXPECTED JSON FORMAT:\n{"profil": "...", "exps": [{"index": 0, "aiDesc": "<ul><li>...</li></ul>"}, ...]}`
      : `Tu es un expert RH et consultant en recrutement. À partir des données brutes ci-dessous, génère le contenu enrichi pour un CV professionnel au format JSON UNIQUEMENT.\n\nDONNÉES DU CANDIDAT:\nNom complet: {name}\nPoste visé: {titre}\nProfil brut: {profil}\n\nEXPÉRIENCES BRUTES:\n{exps}\n\nINSTRUCTIONS STRICTES:\n1. Pour chaque expérience, rédige une description enrichie de 3-4 bullet points HTML (<ul><li>...</li></ul>) décrivant le RÔLE, les RESPONSABILITÉS et l'IMPACT. Utilise des verbes d'action forts.\n2. Rédige un profil professionnel en 3-4 lignes percutantes.\n3. Réponds UNIQUEMENT avec du JSON valide, sans markdown ni backtick.\n\nFORMAT JSON ATTENDU:\n{"profil": "...", "exps": [{"index": 0, "aiDesc": "<ul><li>...</li></ul>"}, ...]}`
    );

  const prompt = promptTpl
    .replace('{name}', `${formData.prenom} ${formData.nom}`)
    .replace('{titre}', formData.titre || '')
    .replace('{profil}', formData.profil || noDesc)
    .replace('{exps}', expsText || noDesc);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  const text = data.content[0].text;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// Sélection de méthode de paiement
function selectPayMethod(btn, method) {
  document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  window._payMethod = method;
  const lbl = document.getElementById('payLabel');
  const inp = document.getElementById('payInput');
  if (!lbl || !inp) return;
  if (method === 'card') {
    lbl.textContent = 'Numéro de carte bancaire';
    inp.placeholder = '1234 5678 9012 3456';
  } else {
    lbl.textContent = 'Numéro de téléphone Mobile Money';
    inp.placeholder = '+225 07 XX XX XX XX';
  }
}

window._payMethod = 'orange';
