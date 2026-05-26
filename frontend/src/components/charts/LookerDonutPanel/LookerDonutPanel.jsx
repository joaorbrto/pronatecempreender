import { useState } from 'react';

import { HelpTooltip } from '../../help/HelpTooltip';
import { sumCounts } from '../../../utils/chartUtils';
import { compactCenterLabel, displayLabel, formatNumber } from '../../../utils/formatters';

import './LookerDonutPanel.css';

export function LookerDonutPanel({ title, icon: Icon, items = [], help = {} }) {
  const total = sumCounts(items);
  const colors = ['#c22a4b', '#1f7a52', '#82c545', '#2a6f9f', '#d08112', '#b8c7b2', '#6f7d72'];
  const [activeIndex, setActiveIndex] = useState(0);

  let cursor = 0;

  const slices = items.map((item, index) => {
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

  const activeSlice = slices[activeIndex] || slices[0];
  const activeLabel = compactCenterLabel(activeSlice?.label);

  return (
    <article className="chart-panel looker-donut-panel">
      <header>
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
        <HelpTooltip {...help} />
      </header>

      <div className="looker-donut-layout">
        <svg
          className="looker-donut"
          viewBox="0 0 220 220"
          role="img"
          aria-label={`${title}. Passe o mouse nas fatias para ver percentuais.`}
        >
          <circle className="donut-bg" cx="110" cy="110" r="84" />

          {slices.map((slice, index) => (
            <circle
              className={`donut-slice ${index === activeIndex ? 'active' : ''}`}
              key={`${title}-${slice.label}`}
              cx="110"
              cy="110"
              r="84"
              pathLength="100"
              stroke={slice.color}
              strokeDasharray={`${slice.percent} ${100 - slice.percent}`}
              strokeDashoffset={-slice.start}
              transform  ="rotate(-90 110 110)"
              tabIndex={0}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
            >
              <title>{`${displayLabel(slice.label)}: ${slice.percent}% (${formatNumber(slice.count)})`}</title>
            </circle>
          ))}

          <text className="donut-center-value" x="110" y="104" textAnchor="middle">
            {activeSlice ? `${activeSlice.percent}%` : '0%'}
          </text>

          <text className="donut-center-label" x="110" y="130" textAnchor="middle">
            {activeLabel || 'Sem dados'}
          </text>
        </svg>

        <div className="looker-legend">
          {slices.map((slice, index) => (
            <div
              className={index === activeIndex ? 'active' : ''}
              key={`${title}-${slice.label}`}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              tabIndex={0}
            >
              <span className="legend-dot" style={{ '--legend-color': slice.color }} />
              <span>{displayLabel(slice.label)}</span>
              <strong>{formatNumber(slice.count)}</strong>
              <small>{slice.percent}%</small>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
