import './feedback.css';

export function StatePanel({
  tone,
  icon: Icon,
  title,
  text,
  spinning = false,
  assertive = false,
}) {
  return (
    <section className={`result-panel ${tone}`} aria-live={assertive ? 'assertive' : 'polite'}>
      <Icon className={spinning ? 'spin' : ''} size={24} aria-hidden="true" />
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </section>
  );
}