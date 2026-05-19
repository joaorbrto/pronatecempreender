import { ChartPanel } from './ChartPanel';
import { LookerDonutPanel } from './LookerDonutPanel';
import { MosaicPanel } from './MosaicPanel';
import { PiePanel } from './PiePanel';
import { PillPanel } from './PillPanel';
import { ScheduleColumnPanel } from './ScheduleColumnPanel';
import { CHART_ICONS } from './chartIcons';

export function GenericChartPanel({ chart, index }) {
  const Icon = CHART_ICONS[index % CHART_ICONS.length];
  const items = chart.items || [];
  const type = chart.type || 'bar';

  if (chart.id === 'starts-by-month') {
    return <ScheduleColumnPanel title={chart.title || 'Início das ofertas'} icon={Icon} items={items} />;
  }

  if (type === 'donut') {
    return <LookerDonutPanel title={chart.title || 'Indicador'} icon={Icon} items={items} />;
  }

  if (type === 'pie') {
    return <PiePanel title={chart.title || 'Indicador'} icon={Icon} items={items} />;
  }

  if (type === 'pill') {
    return <PillPanel title={chart.title || 'Indicador'} icon={Icon} items={items} />;
  }

  if (type === 'mosaic') {
    return <MosaicPanel title={chart.title || 'Indicador'} icon={Icon} items={items} />;
  }

  return (
    <ChartPanel
      title={chart.title || 'Indicador'}
      icon={Icon}
      items={items}
      variant={type === 'column' ? 'column' : 'bar'}
    />
  );
}