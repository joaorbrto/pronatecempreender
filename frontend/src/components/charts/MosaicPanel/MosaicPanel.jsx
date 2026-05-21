import { ChartEmptyState } from '../../feedback/ChartEmptyState';
import { sumCounts } from '../../../utils/chartUtils';
import { displayLabel, formatNumber } from '../../../utils/formatters';

import './MosaicPanel.css';

export function MosaicPanel({ title, icon: Icon, items = [] }) {
  const max = Math.max(...items.map((item) => item.count), 1);
  const total = sumCounts(items);

  return (
    <article className="chart-panel mosaic-panel">
      <header>
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
      </header>

      {items.length ? (
        <div className="mosaic-grid">
          {items.slice(0, 8).map((item) => {
            const percent = total ? Math.round((Number(item.count || 0) / total) * 100) : 0;
            const label = displayLabel(item.label);
            const tooltip = `${label}: ${formatNumber(item.count)} (${percent}%)`;

            return (
              <div
                className="mosaic-tile"
                key={`${title}-${item.label}`}
                style={{ '--tile-scale': 0.64 + (item.count / max) * 0.36 }}
                title={tooltip}
                tabIndex={0}
                aria-label={tooltip}
              >
                <strong>{formatNumber(item.count)}</strong>
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <ChartEmptyState />
      )}
    </article>
  );
}