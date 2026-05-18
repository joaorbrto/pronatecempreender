export function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(Number(value || 0));
}

export function displayLabel(value) {
  const text = String(value || '').trim();
  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const replacements = {
    'nao informado': 'Não informado',
    'nao identificada': 'Não identificada',
    'nao identificado': 'Não identificado',
    'ate 17': 'Até 17',
    sim: 'Sim',
    nao: 'Não',
  };

  return replacements[normalized] || text;
}

export function compactCenterLabel(value) {
  const label = displayLabel(value);
  if (label.length <= 18) return label;
  return `${label.slice(0, 16).trim()}...`;
}