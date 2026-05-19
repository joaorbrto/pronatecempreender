import { sumCounts } from '../../utils/chartUtils';
import { displayLabel } from '../../utils/formatters';

export function PiePanel({ title, icon: Icon, items = [] }) {
  const total = sumCounts(items);
  const colors = ['#1e6b46', '#93c94d', '#2a6f9f', '#b82543', '#c77b13', '#7d5bc2', '#c8dfb0'];
  let cursor = 0;

  const slices = items.slice(0, 7).map((item, index) => {
    const percent = total ? (Number(item.count || 0) / total) * 100 : 0;
    const start = cursor;
    cursor += percent;

    return {
      ...item,
      percent: Math.round(percent),
      color: colors[index % colors.length],
      start,
      end: cursor,
    };
  });

  const gradient = slices.length
    ? slices.map((slice) => `${slice.color} ${slice.start}% ${slice.end}%`).join(', ')
    : '#e3ebdf 0 100%';

  return (
    <article className="chart-panel compact-pie-panel">
      <header>
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
      </header>

      <div className="compact-pie-layout">
        <div className="compact-pie" style={{ '--pie-gradient': gradient }} />

        <div className="compact-pie-legend">
          {slices.map((slice) => (
            <div key={`${title}-${slice.label}`}>
              <span className="legend-dot" style={{ '--legend-color': slice.color }} />
              <span>{displayLabel(slice.label)}</span>
              <strong>{slice.percent}%</strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}