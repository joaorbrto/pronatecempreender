export function firstItem(items = []) {
  return items.length ? items[0] : null;
}

export function sumCounts(items = []) {
  return items.reduce((total, item) => total + Number(item.count || 0), 0);
}

export function countYes(items = []) {
  return items.reduce((total, item) => {
    const label = String(item.label || '').toLowerCase();
    return label.includes('sim') ? total + Number(item.count || 0) : total;
  }, 0);
}

export function percentFromYes(items = [], fallbackTotal) {
  const total = fallbackTotal || sumCounts(items);
  if (!total) return 0;
  return Math.round((countYes(items) / total) * 100);
}

export function sortAgeRanges(items = []) {
  const order = ['Até 17', 'Ate 17', '18 a 24', '25 a 34', '35 a 44', '45 a 59', '60+', 'Não informado', 'Nao informado'];

  return [...items].sort((a, b) => {
    const aIndex = order.indexOf(a.label);
    const bIndex = order.indexOf(b.label);
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });
}

export function sortRegions(items = []) {
  const order = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul', 'Não informado', 'Nao informado', 'Não identificado', 'Nao identificado'];

  return [...items].sort((a, b) => {
    const aIndex = order.indexOf(a.label);
    const bIndex = order.indexOf(b.label);
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });
}