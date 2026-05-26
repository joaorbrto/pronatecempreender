import { percentFromYes } from '../../../utils/chartUtils';
import { displayLabel } from '../../../utils/formatters';
import { HelpTooltip } from '../../help/HelpTooltip';

import './StackPanel.css';

export function StackPanel({ title, icon: Icon, groups, help = {} }) {
  return (
    <article className="chart-panel stack-panel">
      <header>
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
        <HelpTooltip {...help} />
      </header>

      <div className="stack-list">
        {groups.map((group) => (
          <div className="stack-row" key={group.label}>
            <div className="bar-label">
              <span>{displayLabel(group.label)}</span>
              <strong>{percentFromYes(group.items)}%</strong>
            </div>

            <div className="stack-track">
              <span style={{ width: `${percentFromYes(group.items)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
