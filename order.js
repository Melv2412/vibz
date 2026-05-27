const form = document.getElementById('orderForm');
const sumSize = document.getElementById('sum-size');
const sumColors = document.getElementById('sum-colors');
const sumOccasion = document.getElementById('sum-occasion');
const sumChannel = document.getElementById('sum-channel');
const sumPrice = document.getElementById('sum-price');
const sumBalance = document.getElementById('sum-balance');
const toast = document.getElementById('toast');
const successOverlay = document.getElementById('successOverlay');
const previewImg = document.getElementById('previewImg');

const DEPOSIT = 2000;

// Theme previews
const THEMES = {
  'Violet': 'frame-nadia.png',
  'Jaune': 'frame-elsa.png',
  'Mélange doré': 'frame-daphne.png'
};

function fmt(n){return n.toLocaleString('fr-FR').replace(/,/g,' ')}

// Visual selection — radios (single)
function bindRadio(name) {
  document.querySelectorAll(`input[name="${name}"]`).forEach(input => {
    input.addEventListener('change', () => {
      document.querySelectorAll(`input[name="${name}"]`).forEach(i => i.closest('label').classList.remove('selected'));
      input.closest('label').classList.add('selected');
      updateSummary();
    });
  });
}
// Checkbox group
function bindCheck(name) {
  document.querySelectorAll(`input[name="${name}"]`).forEach(input => {
    input.addEventListener('change', () => {
      input.closest('label').classList.toggle('selected', input.checked);
      updateSummary();
    });
  });
}
bindRadio('size');
bindRadio('channel');
bindCheck('colors');
form.occasion.addEventListener('change', updateSummary);

function getSelectedColors(){
  return Array.from(document.querySelectorAll('input[name="colors"]:checked')).map(i=>i.value);
}

function updateSummary(){
  const size = document.querySelector('input[name="size"]:checked');
  const colors = getSelectedColors();
  const channel = document.querySelector('input[name="channel"]:checked');
  const occ = form.occasion.value;
  
  sumSize.textContent = size ? size.value : '—';
  sumColors.textContent = colors.length ? colors.join(' + ') : '—';
  sumOccasion.textContent = occ || '—';
  sumChannel.textContent = channel ? channel.value : '—';
  
  // Real-time validation for colors hint
  const colorHint = document.querySelector('[data-group="colors"]').previousElementSibling;
  if (colors.length > 0 && colors.length < 2) {
    colorHint.style.color = '#ff4b2b';
    colorHint.innerHTML = '⚠️ Choisis <b>au moins deux</b> couleurs.';
  } else {
    colorHint.style.color = '';
    colorHint.innerHTML = 'Choisis au moins <b>deux couleurs</b> (Violet, Jaune ou Mélange doré).';
  }

  // Update Preview Image
  if (colors.length > 0) {
    const mainTheme = colors[colors.length - 1]; // Prends la dernière couleur cochée comme thème principal
    const newSrc = THEMES[mainTheme];
    if (newSrc && previewImg.getAttribute('src') !== newSrc) {
      previewImg.classList.add('changing');
      setTimeout(() => {
        previewImg.src = newSrc;
        previewImg.classList.remove('changing');
      }, 400);
    }
  }

  if (size){
    const total = parseInt(size.dataset.price);
    sumPrice.textContent = `${fmt(total)} FCFA`;
    sumBalance.textContent = fmt(Math.max(0, total - DEPOSIT));
  } else {
    sumPrice.textContent = '— FCFA';
    sumBalance.textContent = '—';
  }
}

function buildMessage(d){
  return `NOUVELLE COMMANDE VIBZ

Client : ${d.firstname} ${d.lastname}
Contact : ${d.phone}

Format : ${d.size}
Couleurs : ${d.colors.join(' + ')}
Occasion : ${d.occasion}

Total : ${fmt(d.total)} FCFA
Acompte : ${fmt(DEPOSIT)} FCFA
Solde a la livraison : ${fmt(d.total - DEPOSIT)} FCFA

Texte sur le cadre :
"${d.message}"

Je vais joindre mes photos juste apres ce message dans cette conversation.

J'ai relu mes infos et accepte la politique de commande Vibz.`;
}

function redirectTo(channel, text){
  const enc = encodeURIComponent(text);
  if (channel === 'WhatsApp'){
    return `https://wa.me/2250505582856?text=${enc}`;
  }
  if (channel === 'Instagram'){
    return `https://ig.me/m/vibzcover.gift`;
  }
  if (channel === 'TikTok'){
    return `https://www.tiktok.com/@vibzcover.gift`;
  }
  return '#';
}

async function copyToClipboard(text){
  try { await navigator.clipboard.writeText(text); return true; } catch(e){ return false; }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const size = document.querySelector('input[name="size"]:checked');
  const colors = getSelectedColors();
  const channel = document.querySelector('input[name="channel"]:checked');
  const occasion = form.occasion.value;
  const firstname = form.firstname.value.trim();
  const lastname = form.lastname.value.trim();
  const phone = form.phone.value.trim();
  const message = form.message.value.trim();
  const confirmed = document.getElementById('confirm').checked;

  if (!size){ alert('Choisis un format (A4, A3 ou A2).'); return; }
  if (colors.length < 2){ alert('Choisis au moins 2 couleurs (Violet, Jaune ou Mélange).'); return; }
  if (!occasion){ alert('Sélectionne une occasion.'); return; }
  if (!channel){ alert('Choisis comment envoyer tes photos (WhatsApp, Instagram ou TikTok).'); return; }
  if (!firstname || !lastname || !phone){ alert('Remplis ton prénom, nom et numéro.'); return; }
  if (!message){ alert('Ajoute le texte à inscrire sur le cadre.'); return; }
  if (!confirmed){ alert('⚠️ Aucun remboursement après acompte. Vérifie tes photos et textes, puis coche la case de confirmation.'); return; }

  const total = parseInt(size.dataset.price);
  const text = buildMessage({
    firstname, lastname, phone,
    size: size.value, colors, occasion,
    total, message,
  });

  const url = redirectTo(channel.value, text);

  if (channel.value !== 'WhatsApp'){
    const ok = await copyToClipboard(text);
    alert(`📋 Ton message de commande ${ok ? 'a été copié' : 'va s\'afficher'}.\n\nColle-le dans le DM ${channel.value} qui va s'ouvrir, puis joins tes photos dans la même conversation.`);
    if (!ok) prompt('Copie ce message :', text);
  }

  // Premium Success Experience
  if (successOverlay) {
    successOverlay.classList.add('show');
    setTimeout(() => { 
      window.open(url, '_blank');
      // On laisse l'overlay un peu après l'ouverture de l'onglet
      setTimeout(() => { successOverlay.classList.remove('show'); }, 1500);
    }, 1800);
  } else {
    toast.classList.add('show');
    setTimeout(() => { window.open(url, '_blank'); toast.classList.remove('show'); }, 700);
  }
});

updateSummary();
