import { BarChart3, Gauge, GraduationCap, MapPin, ShieldCheck, Users } from 'lucide-react';

import { ChartPanel } from '../../components/charts/ChartPanel';
import { DonutPanel } from '../../components/charts/DonutPanel';
import { LookerDonutPanel } from '../../components/charts/LookerDonutPanel';
import { MosaicPanel } from '../../components/charts/MosaicPanel';
import { PillPanel } from '../../components/charts/PillPanel';
import { StackPanel } from '../../components/charts/StackPanel';
import { MetricCard } from '../../components/ui/MetricCard';
import { firstItem, percentFromYes, sortAgeRanges, sortRegions } from '../../utils/chartUtils';
import { formatNumber } from '../../utils/formatters';

export function DashboardContent({ summary }) {
  const topCourse = firstItem(summary.byCourse);
  const topRegion = firstItem(summary.byRegion);
  const businessShare = percentFromYes(summary.byOwnBusiness, summary.totalResponses);
  const internetShare = percentFromYes(summary.byInternetAccess, summary.totalResponses);
  const benefitShare = percentFromYes(summary.byBenefit, summary.totalResponses);
  const disabilityShare = percentFromYes(summary.byDisability, summary.totalResponses);

  return (
    <div className="dashboard-content">
      <section className="metric-grid">
        <MetricCard icon={Users} label="Inscrições analisadas" value={summary.totalResponses} />
        <MetricCard
          icon={GraduationCap}
          label="Curso com maior demanda"
          value={topCourse?.label || 'Sem dados'}
          detail={topCourse ? `${formatNumber(topCourse.count)} inscrições` : ''}
        />
        <MetricCard
          icon={MapPin}
          label="Região com maior procura"
          value={topRegion?.label || 'Sem dados'}
          detail={topRegion ? `${formatNumber(topRegion.count)} inscrições` : ''}
        />
        <MetricCard icon={Gauge} label="Com negócio próprio" value={`${businessShare}%`} detail="Indicador empreendedor" />
      </section>

      <section className="insight-grid">
        <DonutPanel title="Acesso à internet" icon={ShieldCheck} items={summary.byInternetAccess} highlight={`${internetShare}%`} />
        <DonutPanel title="Recebe benefícios" icon={Users} items={summary.byBenefit} highlight={`${benefitShare}%`} />
        <DonutPanel title="Pessoa com deficiência" icon={Users} items={summary.byDisability} highlight={`${disabilityShare}%`} />
        <StackPanel
          title="Inclusão produtiva"
          icon={Gauge}
          groups={[
            { label: 'Negócio próprio', items: summary.byOwnBusiness },
            { label: 'Possui CNPJ', items: summary.byCnpj },
            { label: 'Porte da empresa', items: summary.byCompanySize },
          ]}
        />
      </section>

      <section className="dashboard-grid">
        <ChartPanel title="Demanda por curso" icon={GraduationCap} items={summary.byCourse} variant="bar" />
        <LookerDonutPanel title="Participação por região" icon={MapPin} items={sortRegions(summary.byRegion)} />
        <ChartPanel title="Estados" icon={MapPin} items={summary.byState} variant="column" />
        <ChartPanel title="Cidades" icon={MapPin} items={summary.byCity} variant="ranking" />
        <ChartPanel title="Faixa etária" icon={Users} items={sortAgeRanges(summary.byAgeRange)} variant="bar" />
        <PillPanel title="Escolaridade" icon={GraduationCap} items={summary.byEducation} />
        <LookerDonutPanel title="Renda familiar" icon={Gauge} items={summary.byIncome} />
        <LookerDonutPanel title="Raça / cor" icon={Users} items={summary.byRace} />
        <ChartPanel title="Zona de residência" icon={MapPin} items={summary.byZone} variant="column" />
        <MosaicPanel title="Ocupação atual" icon={Users} items={summary.byOccupation} />
        <ChartPanel title="Como souberam do curso" icon={BarChart3} items={summary.bySource} variant="ranking" />
        <MosaicPanel title="Interesse em outras capacitações" icon={GraduationCap} items={summary.byOtherTraining} />
        <ChartPanel title="Canal de vendas/atendimento" icon={BarChart3} items={summary.bySalesChannel} variant="ranking" />
        <ChartPanel title="Desafios do negócio" icon={Gauge} items={summary.byBusinessChallenge} variant="bar" />
      </section>

      <section className="dashboard-grid compact">
        <ChartPanel title="Nível em empreendedorismo" icon={Gauge} items={summary.courseReadiness?.entrepreneurship} variant="column" />
        <ChartPanel title="Nível em IA" icon={Gauge} items={summary.courseReadiness?.ai} variant="column" />
        <ChartPanel title="Ferramentas digitais" icon={Gauge} items={summary.courseReadiness?.digitalTools} variant="column" />
        <ChartPanel title="Experiência com drones" icon={Gauge} items={summary.courseReadiness?.drones} variant="column" />
        <ChartPanel title="Apps / no-code" icon={Gauge} items={summary.courseReadiness?.apps} variant="column" />
        <ChartPanel title="Modo de acesso à internet" icon={ShieldCheck} items={summary.byInternetMode} variant="bar" />
      </section>
    </div>
  );
}