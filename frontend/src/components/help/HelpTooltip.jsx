import { HelpCircle } from 'lucide-react';

import './HelpTooltip.css';

export function HelpTooltip({ question, description, interpretation }) {
  if (!question && !description && !interpretation) return null;

  return (
    <div className="help-tooltip">
      <button
        className="help-tooltip-trigger"
        type="button"
        aria-label="Ajuda sobre este gráfico"
      >
        <HelpCircle size={18} aria-hidden="true" />
      </button>

      <div className="help-tooltip-content" role="tooltip">
        {question ? (
          <div>
            <strong>Pergunta ou campo de origem</strong>
            <p>{question}</p>
          </div>
        ) : null}

        {description ? (
          <div>
            <strong>O que este gráfico mostra</strong>
            <p>{description}</p>
          </div>
        ) : null}

        {interpretation ? (
          <div>
            <strong>Como interpretar</strong>
            <p>{interpretation}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}