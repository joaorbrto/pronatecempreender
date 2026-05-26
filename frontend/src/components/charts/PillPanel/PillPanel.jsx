import { ChartEmptyState } from '../../feedback/ChartEmptyState';
import { HelpTooltip } from '../../help/HelpTooltip';
import { sumCounts } from '../../../utils/chartUtils';
import { displayLabel, formatNumber } from '../../../utils/formatters';

import './PillPanel.css';

export function PillPanel({ title, icon: Icon, items = [], help = {} }) {
  const total = sumCounts(items);

  return (
    <article className="chart-panel pill-panel">
      <header>
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
        <HelpTooltip {...help} />
      </header>

      {items.length ? (
        <div className="pill-list">
          {items.slice(0, 8).map((item) => {
            const percent = total ? Math.round((Number(item.count || 0) / total) * 100) : 0;
            const label = displayLabel(item.label);
            const tooltip = `${label}: ${formatNumber(item.count)} (${percent}%)`;

            return (
              <div
                className="pill-row"
                key={`${title}-${item.label}`}
                title={tooltip}
                tabIndex={0}
                aria-label={tooltip}
              >
                <span>{label}</span>
                <strong>{percent}%</strong>

                <div className="pill-meter">
                  <span style={{ width: `${Math.max(percent, 3)}%` }} />
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
