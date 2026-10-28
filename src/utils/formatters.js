// src/utils/formatters.js

export function escaparHTML(texto) {
  if (texto === null || texto === undefined) return '';
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatearTelefonoWhatsApp(telefonoRaw) {
  let limpio = (telefonoRaw || '').replace(/\D/g, '');
  if (limpio.startsWith('0')) {
    limpio = '58' + limpio.slice(1);
  } else if (limpio.length === 10 && /^(412|414|424|416|426)/.test(limpio)) {
    limpio = '58' + limpio;
  }
  return limpio;
}