import {
  BarChart3,
  Database,
  Gauge,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { useState } from 'react';

import { SECONDARY_APPS_SCRIPT_URL } from './config/env';

import { AppShell } from './components/layout/AppShell';
import { HomePage } from './features/home/HomePage';
import { postToAppsScript } from './services/appsScriptClient';

import { CpfValidator } from './features/cpf-validation/CpfValidator';

import { Dashboard } from './features/dashboard-setec/Dashboard';

import { getErrorMessage } from './utils/errorMessages';
import { formatNumber } from './utils/formatters';
import { firstItem, percentFromYes, sortAgeRanges, sortRegions } from './utils/chartUtils';

import { DashboardSkeleton } from './components/dashboard/DashboardSkeleton';
import { StatePanel } from './components/feedback/StatePanel';
import { MetricCard } from './components/ui/MetricCard';

import { ChartPanel } from './components/charts/ChartPanel';
import { DonutPanel } from './components/charts/DonutPanel';
import { MosaicPanel } from './components/charts/MosaicPanel';
import { PiePanel } from './components/charts/PiePanel';
import { PillPanel } from './components/charts/PillPanel';
import { StackPanel } from './components/charts/StackPanel';
import { GenericChartPanel } from './components/charts/GenericChartPanel';
import { LookerDonutPanel } from './components/charts/LookerDonutPanel';
import { ScheduleColumnPanel } from './components/charts/ScheduleColumnPanel';


function App() {
  const [activeView, setActiveView] = useState('home');

  return (
    <AppShell activeView={activeView} onNavigate={setActiveView}>
      {activeView === 'home' ? <HomePage onNavigate={setActiveView} /> : null}
      {activeView === 'validate' ? <CpfValidator /> : null}
      {activeView === 'dashboard' ? <Dashboard /> : null}
      {activeView === 'secondaryDashboard' ? <SecondaryDashboard /> : null}
    </AppShell>
  );
}


function SecondaryDashboard() {
  const [accessKey, setAccessKey] = useState('');
  const [status, setStatus] = useState('idle');
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!accessKey.trim()) {
      setError(getErrorMessage('invalid_request'));
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      // Esta aba usa outro Web App porque a base de coordenação vem de uma segunda planilha.
      const payload = await postToAppsScript(
        {
          action: 'secondaryDashboardSummary',
          accessKey: accessKey.trim(),
        },
        45000,
        SECONDARY_APPS_SCRIPT_URL,
      );

      if (!payload.ok) {
        setError(getErrorMessage(payload.error));
        setStatus('error');
        return;
      }

      setSummary(payload.summary);
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError?.message || 'server_error'));
      setStatus('error');
    }
  }

  return (
    <div className="dashboard-layout">
      <form className="panel admin-panel" onSubmit={handleSubmit}>
        <label htmlFor="secondary-access-key">Chave administrativa</label>
        <div className="input-row">
          <input
            id="secondary-access-key"
            type="password"
            autoComplete="off"
            value={accessKey}
            onChange={(event) => setAccessKey(event.target.value)}
            placeholder="Digite a chave do dashboard"
          />
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? <Loader2 className="spin" size={18} aria-hidden="true" /> : <Database size={18} aria-hidden="true" />}
            Carregar
          </button>
        </div>
        <p>Este painel apresenta dados agregados sobre os institutos cadastrados, ajudando a coordenação a acompanhar vagas, cursos, regiões e cronograma do programa.</p>
      </form>

      {status === 'idle' ? <SecondaryDashboardSetup /> : null}
      {status === 'loading' ? <DashboardSkeleton /> : null}
      {status === 'error' ? <StatePanel tone="danger" icon={AlertCircle} title="Dashboard indisponível" text={error} assertive /> : null}
      {status === 'ready' && summary ? <SecondaryDashboardContent summary={summary} /> : null}
    </div>
  );
}

function SecondaryDashboardSetup() {
  return (
    <section className="setup-panel panel">
      <div>
        <span className="section-kicker">Acompanhamento da coordenação</span>
        <h2>Indicadores dos institutos cadastrados</h2>
        <p>
          Use este painel para acompanhar a distribuição de vagas, cursos, instituições participantes, regiões atendidas
          e situação do cronograma informado pelos institutos.
        </p>
      </div>
      <div className="setup-grid">
        <div>
          <Database size={20} aria-hidden="true" />
          <strong>Fonte</strong>
          <span>Tabela principal de institutos, campi, cursos e vagas</span>
        </div>
        <div>
          <ShieldCheck size={20} aria-hidden="true" />
          <strong>Acesso</strong>
          <span>Consulta administrativa protegida por chave</span>
        </div>
        <div>
          <BarChart3 size={20} aria-hidden="true" />
          <strong>Indicadores</strong>
          <span>Cards, rankings, roscas, barras e distribuições</span>
        </div>
      </div>
    </section>
  );
}

function SecondaryDashboardContent({ summary }) {
  const metrics = summary.metrics || [];
  const charts = summary.charts || [];
  // O gráfico de início das ofertas é destacado porque orienta o acompanhamento do cronograma.
  const scheduleChart = charts.find((chart) => chart.id === 'starts-by-month');
  const otherCharts = charts.filter((chart) => chart.id !== 'starts-by-month');
  const totalRecords = summary.totalRecords || summary.totalResponses || 0;
  const primaryMetric = firstItem(metrics);
  const secondaryMetric = metrics[1];
  const tertiaryMetric = metrics[2];

  return (
    <div className="dashboard-content">
      <section className="metric-grid">
        <MetricCard icon={Database} label="Registros analisados" value={totalRecords} />
        <MetricCard icon={Gauge} label={primaryMetric?.label || 'Indicador principal'} value={primaryMetric?.value || 'A definir'} />
        <MetricCard icon={Users} label={secondaryMetric?.label || 'Público observado'} value={secondaryMetric?.value || 'A definir'} />
        <MetricCard icon={MapPin} label={tertiaryMetric?.label || 'Recorte territorial'} value={tertiaryMetric?.value || 'A definir'} />
      </section>

      {scheduleChart ? (
        <section className="dashboard-feature-grid">
          <ScheduleColumnPanel title={scheduleChart.title || 'Início das ofertas'} icon={BarChart3} items={scheduleChart.items || []} featured />
        </section>
      ) : null}

      {otherCharts.length ? (
        <section className="dashboard-grid">
          {otherCharts.map((chart, index) => (
            <GenericChartPanel chart={chart} index={index} key={chart.id || chart.title || index} />
          ))}
        </section>
      ) : (
        <StatePanel
          tone="neutral"
          icon={BarChart3}
          title="Sem indicadores configurados"
          text="A conexão respondeu, mas ainda não trouxe gráficos para esta planilha de acompanhamento."
        />
      )}
    </div>
  );
}

export default App;
