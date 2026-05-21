import { formatNumber } from '../../utils/formatters';

export function MetricCard({ icon: Icon, label, value, detail = '', tone = 'neutral' }) {
  return (
    <article className={`metric-card ${tone}`}>
      <Icon size={22} aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{typeof value === 'number' ? formatNumber(value) : value}</strong>
        {detail ? <small>{detail}</small> : null}
      </div>
    </article>
  );
}