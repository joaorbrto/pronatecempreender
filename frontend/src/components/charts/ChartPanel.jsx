import { ChartEmptyState } from '../feedback/ChartEmptyState';
import { sumCounts } from '../../utils/chartUtils';
import { displayLabel, formatNumber } from '../../utils/formatters';

export function ChartPanel({ title, icon: Icon, items = [], variant = 'bar' }) {
  const max = Math.max(...items.map((item) => item.count), 1);
  const total = sumCounts(items);

  return (
    <article className={`chart-panel ${variant}`}>
      <header>
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
      </header>

      {items.length ? (
        <div className={variant === 'column' ? 'column-list' : 'bar-list'}>
          {items.map((item) => {
            const percent = total ? Math.round((Number(item.count || 0) / total) * 100) : 0;
            const label = displayLabel(item.label);
            const tooltip = `${label}: ${formatNumber(item.count)} (${percent}%)`;

            return (
              <div
                className={variant === 'column' ? 'column-item' : 'bar-item'}
                key={`${title}-${item.label}`}
                title={tooltip}
                tabIndex={0}
                aria-label={tooltip}
              >
                <div className="bar-label">
                  <span>{label}</span>
                  <strong>{formatNumber(item.count)}</strong>
                </div>

                <div className={variant === 'column' ? 'column-track' : 'bar-track'}>
                  <span
                    style={
                      variant === 'column'
                        ? { '--bar-height': `${Math.max((item.count / max) * 100, 4)}%` }
                        : { width: `${Math.max((item.count / max) * 100, 4)}%` }
                    }
                  />
                </div>
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