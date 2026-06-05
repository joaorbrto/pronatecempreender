import { BarChart3, Gauge, GraduationCap, MapPin, ShieldCheck, Users } from 'lucide-react';

import { ChartPanel } from '../../components/charts/ChartPanel/ChartPanel';
import { DonutPanel } from '../../components/charts/DonutPanel/DonutPanel';
import { LookerDonutPanel } from '../../components/charts/LookerDonutPanel/LookerDonutPanel';
import { MosaicPanel } from '../../components/charts/MosaicPanel/MosaicPanel';
import { PillPanel } from '../../components/charts/PillPanel/PillPanel';
import { StackPanel } from '../../components/charts/StackPanel/StackPanel';
import { MetricCard } from '../../components/ui/MetricCard';
import { CHART_HELP } from '../../data/chartHelp';
import { firstItem, percentFromYes, sortAgeRanges, sortRegions } from '../../utils/chartUtils';
import { formatNumber } from '../../utils/formatters';

const PACTUATED_VACANCIES = 6900;

export function DashboardContent({ summary }) {
  const topCourse = firstItem(summary.byCourse);
  const topRegion = firstItem(summary.byRegion);

  const agreedVacancies =
    Number(summary.agreedVacancies) ||
    Number(summary.vagasAcertadas) ||
    Number(summary.vagasAprovadas) ||
    5975;

  const agreedVacanciesPercent = Math.round((agreedVacancies / PACTUATED_VACANCIES) * 100);

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
          icon={Gauge}
          label="Vagas acertadas / pactuadas"
          value={`${formatNumber(agreedVacancies)} / ${formatNumber(PACTUATED_VACANCIES)}`}
          detail={`${agreedVacanciesPercent}% do pactuado`}
        />

        <MetricCard
          icon={Gauge}
          label="Com negócio próprio"
          value={`${businessShare}%`}
          detail="Indicador empreendedor"
        />
      </section>

      <section className="insight-grid">
        <DonutPanel
          title="Acesso à internet"
          icon={ShieldCheck}
          items={summary.byInternetAccess}
          highlight={`${internetShare}%`}
          help={CHART_HELP.internetAccess}
        />

        <DonutPanel
          title="Recebe benefícios"
          icon={Users}
          items={summary.byBenefit}
          highlight={`${benefitShare}%`}
          help={CHART_HELP.benefit}
        />

        <DonutPanel
          title="Pessoa com deficiência"
          icon={Users}
          items={summary.byDisability}
          highlight={`${disabilityShare}%`}
          help={CHART_HELP.disability}
        />

        <StackPanel
          title="Inclusão produtiva"
          icon={Gauge}
          help={CHART_HELP.productiveInclusion}
          groups={[
            { label: 'Negócio próprio', items: summary.byOwnBusiness },
            { label: 'Possui CNPJ', items: summary.byCnpj },
            { label: 'Porte da empresa', items: summary.byCompanySize },
          ]}
        />
      </section>

      <section className="dashboard-grid">
        <ChartPanel
          title="Demanda por curso"
          icon={GraduationCap}
          items={summary.byCourse}
          variant="bar"
          help={CHART_HELP.demandByCourse}
        />

        <LookerDonutPanel
          title="Participação por região"
          icon={MapPin}
          items={sortRegions(summary.byRegion)}
          help={CHART_HELP.participationByRegion}
        />

        <ChartPanel
          title="Estados"
          icon={MapPin}
          items={summary.byState}
          variant="column"
          help={CHART_HELP.states}
        />

        <ChartPanel
          title="Cidades"
          icon={MapPin}
          items={summary.byCity}
          variant="ranking"
          help={CHART_HELP.cities}
        />

        <ChartPanel
          title="Faixa etária"
          icon={Users}
          items={sortAgeRanges(summary.byAgeRange)}
          variant="bar"
          help={CHART_HELP.ageRange}
        />

        <PillPanel
          title="Escolaridade"
          icon={GraduationCap}
          items={summary.byEducation}
          help={CHART_HELP.education}
        />

        <LookerDonutPanel
          title="Renda familiar"
          icon={Gauge}
          items={summary.byIncome}
          help={CHART_HELP.familyIncome}
        />

        <LookerDonutPanel
          title="Raça / cor"
          icon={Users}
          items={summary.byRace}
          help={CHART_HELP.race}
        />

        <ChartPanel
          title="Zona de residência"
          icon={MapPin}
          items={summary.byZone}
          variant="column"
          help={CHART_HELP.residenceZone}
        />

        <MosaicPanel
          title="Ocupação atual"
          icon={Users}
          items={summary.byOccupation}
          help={CHART_HELP.occupation}
        />

        <ChartPanel
          title="Como souberam do curso"
          icon={BarChart3}
          items={summary.bySource}
          variant="ranking"
          help={CHART_HELP.source}
        />

        <MosaicPanel
          title="Interesse em outras capacitações"
          icon={GraduationCap}
          items={summary.byOtherTraining}
          help={CHART_HELP.otherTraining}
        />

        <ChartPanel
          title="Canal de vendas/atendimento"
          icon={BarChart3}
          items={summary.bySalesChannel}
          variant="ranking"
          help={CHART_HELP.salesChannel}
        />

        <ChartPanel
          title="Desafios do negócio"
          icon={Gauge}
          items={summary.byBusinessChallenge}
          variant="bar"
          help={CHART_HELP.businessChallenge}
        />
      </section>

      <section className="dashboard-grid compact">
        <ChartPanel
          title="Nível em empreendedorismo"
          icon={Gauge}
          items={summary.courseReadiness?.entrepreneurship}
          variant="column"
          help={CHART_HELP.entrepreneurshipReadiness}
        />

        <ChartPanel
          title="Nível em IA"
          icon={Gauge}
          items={summary.courseReadiness?.ai}
          variant="column"
          help={CHART_HELP.aiReadiness}
        />

        <ChartPanel
          title="Ferramentas digitais"
          icon={Gauge}
          items={summary.courseReadiness?.digitalTools}
          variant="column"
          help={CHART_HELP.digitalToolsReadiness}
        />

        <ChartPanel
          title="Experiência com drones"
          icon={Gauge}
          items={summary.courseReadiness?.drones}
          variant="column"
          help={CHART_HELP.dronesReadiness}
        />

        <ChartPanel
          title="Apps / no-code"
          icon={Gauge}
          items={summary.courseReadiness?.apps}
          variant="column"
          help={CHART_HELP.appsReadiness}
        />

        <ChartPanel
          title="Modo de acesso à internet"
          icon={ShieldCheck}
          items={summary.byInternetMode}
          variant="bar"
          help={CHART_HELP.internetMode}
        />
      </section>
    </div>
  );
}