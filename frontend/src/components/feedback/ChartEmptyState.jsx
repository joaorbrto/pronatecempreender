import { BarChart3 } from 'lucide-react';

export function ChartEmptyState() {
  return (
    <div className="chart-empty">
      <BarChart3 size={20} aria-hidden="true" />
      <strong>Sem dados</strong>
      <span>Nenhuma resposta encontrada para este indicador.</span>
    </div>
  );
}