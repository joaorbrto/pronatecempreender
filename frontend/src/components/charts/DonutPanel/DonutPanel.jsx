import { countYes, sumCounts } from '../../../utils/chartUtils';
import { displayLabel, formatNumber } from '../../../utils/formatters';
import { HelpTooltip } from '../../help/HelpTooltip';

import './DonutPanel.css';

export function DonutPanel({ title, icon: Icon, items = [], highlight, centerLabel = 'Sim', primaryCount, help = {} }) {
  const yes = countYes(items);
  const total = sumCounts(items);
  const currentPrimaryCount = Number(primaryCount || yes || items[0]?.count || 0);
  const percent = total ? Math.round((currentPrimaryCount / total) * 100) : 0;

  return (
    <article className="chart-panel donut-panel">
      <header>
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
        <HelpTooltip {...help} />
      </header>

      <div className="donut-wrap">
        <div className="donut" style={{ '--percent': `${percent}%` }}>
          <strong>{highlight || `${percent}%`}</strong>
          <span>{centerLabel}</span>
        </div>

        <div className="donut-legend">
          {(items || []).slice(0, 4).map((item) => (
            <div key={`${title}-${item.label}`}>
              <span>{displayLabel(item.label)}</span>
              <strong>{formatNumber(item.count)}</strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
