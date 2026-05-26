import { useState } from 'react';

import { ChartEmptyState } from '../../feedback/ChartEmptyState';
import { HelpTooltip } from '../../help/HelpTooltip';
import { sumCounts } from '../../../utils/chartUtils';
import { displayLabel, formatNumber } from '../../../utils/formatters';

import './ScheduleColumnPanel.css';

export function ScheduleColumnPanel({ title, icon: Icon, items = [], featured = false, help = {} }) {
  const max = Math.max(...items.map((item) => item.count), 1);
  const total = sumCounts(items);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] || items[0];
  const activeDetails = activeItem?.details || [];

  return (
    <article className={`chart-panel column schedule-panel ${featured ? 'featured' : ''}`}>
      <header>
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
        <HelpTooltip {...help} />
      </header>

      {items.length ? (
        <>
          <div className="column-list schedule-column-list">
            {items.map((item, index) => {
              const percent = total ? Math.round((Number(item.count || 0) / total) * 100) : 0;
              const label = displayLabel(item.label);
              const detailNames = (item.details || [])
                .map((detail) => detail.campus)
                .filter(Boolean)
                .slice(0, 6);

              const tooltip = `${label}: ${formatNumber(item.count)} (${percent}%)${
                detailNames.length ? ` - ${detailNames.join('; ')}` : ''
              }`;

              return (
                <div
                  className={`column-item ${index === activeIndex ? 'active' : ''}`}
                  key={`${title}-${item.label}`}
                  title={tooltip}
                  tabIndex={0}
                  aria-label={tooltip}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                >
                  <div className="bar-label">
                    <span>{label}</span>
                    <strong>{formatNumber(item.count)}</strong>
                  </div>

                  <div className="column-track">
                    <span style={{ '--bar-height': `${Math.max((item.count / max) * 100, 4)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="schedule-details" aria-live="polite">
            <div className="schedule-details-head">
              <strong>{displayLabel(activeItem?.label) || 'Sem data'}</strong>
              <span>
                {formatNumber(activeItem?.count)} oferta{Number(activeItem?.count || 0) === 1 ? '' : 's'}
              </span>
            </div>

            {activeDetails.length ? (
              <ul>
                {activeDetails.slice(0, 8).map((detail, index) => (
                  <li key={`${activeItem.label}-${detail.campus}-${detail.course}-${index}`}>
                    <strong>{detail.campus || 'Campus não informado'}</strong>
                    <span>{detail.course || 'Curso não informado'}</span>
                    {detail.institution ? <small>{detail.institution}</small> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum campus informado para esta data.</p>
            )}

            {activeDetails.length > 8 ? (
              <p>+ {formatNumber(activeDetails.length - 8)} outros campi nesta data.</p>
            ) : null}
          </div>
        </>
      ) : (
        <ChartEmptyState />
      )}
    </article>
  );
}
