import { ChartPanel } from '../ChartPanel/ChartPanel';
import { LookerDonutPanel } from '../LookerDonutPanel/LookerDonutPanel';
import { MosaicPanel } from '../MosaicPanel/MosaicPanel';
import { PiePanel } from '../PiePanel/PiePanel';
import { PillPanel } from '../PillPanel/PillPanel';
import { ScheduleColumnPanel } from '../ScheduleColumnPanel/ScheduleColumnPanel';
import { CHART_ICONS } from '../chartIcons';
import { CHART_HELP } from '../../../data/chartHelp';

export function GenericChartPanel({ chart, index }) {
  const Icon = CHART_ICONS[index % CHART_ICONS.length];
  const items = chart.items || [];
  const type = chart.type || 'bar';
  const help = chart.help || (chart.id === 'starts-by-month' ? CHART_HELP.secondaryStartsByMonth : CHART_HELP.secondaryGeneric);

  if (chart.id === 'starts-by-month') {
    return <ScheduleColumnPanel title={chart.title || 'Início das ofertas'} icon={Icon} items={items} help={help} />;
  }

  if (type === 'donut') {
    return <LookerDonutPanel title={chart.title || 'Indicador'} icon={Icon} items={items} help={help} />;
  }

  if (type === 'pie') {
    return <PiePanel title={chart.title || 'Indicador'} icon={Icon} items={items} help={help} />;
  }

  if (type === 'pill') {
    return <PillPanel title={chart.title || 'Indicador'} icon={Icon} items={items} help={help} />;
  }

  if (type === 'mosaic') {
    return <MosaicPanel title={chart.title || 'Indicador'} icon={Icon} items={items} help={help} />;
  }

  return (
    <ChartPanel
      title={chart.title || 'Indicador'}
      icon={Icon}
      items={items}
      variant={type === 'column' ? 'column' : 'bar'}
      help={help}
    />
  );
}
