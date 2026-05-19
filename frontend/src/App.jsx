import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Database,
  ExternalLink,
  Gauge,
  GraduationCap,
  Home,
  LayoutDashboard,
  Loader2,
  MapPin,
  MessageCircle,
  Rocket,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  APPS_SCRIPT_URL,
  FORM_URL,
  RECAPTCHA_SITE_KEY,
  SECONDARY_APPS_SCRIPT_URL,
} from './config/env';

import { HOME_COURSES } from './data/homeCourses';
import { PAGE_COPY } from './data/pageCopy';
import { postToAppsScript } from './services/appsScriptClient';
import { loadRecaptcha } from './services/recaptchaService';

import { formatCpf, onlyDigits } from './utils/cpf';
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


function CaptchaBox({ siteKey, onTokenChange, onReady, onError, resetKey }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    if (!siteKey) {
      onError('configuration_error');
      return undefined;
    }

    loadRecaptcha()
      .then((grecaptcha) => {
        if (cancelled || !containerRef.current || widgetIdRef.current !== null) return;
        widgetIdRef.current = grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          callback: (token) => onTokenChange(token),
          'expired-callback': () => onTokenChange(''),
          'error-callback': () => onError('invalid_captcha'),
        });
        onReady();
      })
      .catch(() => onError('invalid_captcha'));

    return () => {
      cancelled = true;
    };
  }, [siteKey, onTokenChange, onReady, onError]);

  useEffect(() => {
    if (widgetIdRef.current !== null && window.grecaptcha?.reset) {
      window.grecaptcha.reset(widgetIdRef.current);
      onTokenChange('');
    }
  }, [resetKey, onTokenChange]);

  return <div className="captcha" ref={containerRef} aria-label="Verificação reCAPTCHA" />;
}



function App() {
  const [activeView, setActiveView] = useState('home');

  return (
    <main className="app-frame">
      <aside className="sidebar" aria-label="Navegação principal">
        <div className="brand-text">
          <strong>PRONATEC</strong>
          <span>Empreender</span>
        </div>

        <nav className="side-nav">
          <button className={activeView === 'home' ? 'active' : ''} type="button" onClick={() => setActiveView('home')}>
            <Home size={19} aria-hidden="true" />
            <span>Início</span>
          </button>
          <button className={activeView === 'validate' ? 'active' : ''} type="button" onClick={() => setActiveView('validate')}>
            <Search size={19} aria-hidden="true" />
            <span>Consulta de Interessados</span>
          </button>
          <button className={activeView === 'dashboard' ? 'active' : ''} type="button" onClick={() => setActiveView('dashboard')}>
            <LayoutDashboard size={19} aria-hidden="true" />
            <span>SETEC</span>
          </button>
          <button
            className={activeView === 'secondaryDashboard' ? 'active' : ''}
            type="button"
            onClick={() => setActiveView('secondaryDashboard')}
          >
            <Database size={19} aria-hidden="true" />
            <span>Coordenação</span>
          </button>
        </nav>

        <div className="sidebar-card">
          <span>Portal interno</span>
          <strong>Indicadores para decisão</strong>
          <p>Dados agregados das inscrições, sem exposição de registros individuais.</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <div>
            {PAGE_COPY[activeView].eyebrow ? (
              <div className="badge">
                <ShieldCheck size={18} aria-hidden="true" />
                {PAGE_COPY[activeView].eyebrow}
              </div>
            ) : null}
            <h1>{PAGE_COPY[activeView].title}</h1>
            <p>{PAGE_COPY[activeView].description}</p>
          </div>
        </header>

        {activeView === 'home' ? <HomePage onNavigate={setActiveView} /> : null}
        {activeView === 'validate' ? <CpfValidator /> : null}
        {activeView === 'dashboard' ? <Dashboard /> : null}
        {activeView === 'secondaryDashboard' ? <SecondaryDashboard /> : null}
      </section>
    </main>
  );
}

function HomePage({ onNavigate }) {
  return (
    <div className="home-page">
      <section className="home-hero panel">
        <div className="home-hero-copy">
          <span className="section-kicker">Educação profissional, tecnologia e inclusão produtiva</span>
          <h2>Formação conectada à economia digital e ao empreendedorismo.</h2>
          <p>
            O Pronatec Empreender apoia ofertas de qualificação profissional em áreas estratégicas, fortalecendo a
            gestão pedagógica, a permanência dos estudantes e a empregabilidade.
          </p>
          <div className="home-actions">
            <button type="button" onClick={() => onNavigate('validate')}>
              <Search size={18} aria-hidden="true" />
              Consulta de interessados
            </button>
            <button className="secondary-action" type="button" onClick={() => onNavigate('dashboard')}>
              <LayoutDashboard size={18} aria-hidden="true" />
              Acessar SETEC
            </button>
            <button className="secondary-action" type="button" onClick={() => onNavigate('secondaryDashboard')}>
              <Database size={18} aria-hidden="true" />
              Coordenação
            </button>
          </div>
        </div>
        <div className="home-visual" aria-hidden="true">
          <div className="orbit-card main">
            <Rocket size={28} />
            <strong>Economia digital</strong>
          </div>
          <div className="orbit-card one">IA</div>
          <div className="orbit-card two">3D</div>
          <div className="orbit-card three">Apps</div>
        </div>
      </section>

      <section className="home-stats">
        <HomeStat value="2025" label="ciclo de lançamento" />
        <HomeStat value="3" label="cursos apoiados" />
        <HomeStat value="30" label="instituições contempladas" />
        <HomeStat value="6.900" label="vagas aprovadas" />
      </section>

      <section className="home-grid">
        <article className="home-panel panel">
          <header>
            <BookOpen size={20} aria-hidden="true" />
            <h2>Cursos do programa</h2>
          </header>
          <div className="course-list">
          {HOME_COURSES.map((course) => (
              <div className="course-card" key={course.title}>
                <strong>{course.title}</strong>
                <p>{course.text}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="home-panel panel">
          <header>
            <Gauge size={20} aria-hidden="true" />
            <h2>Leitura para gestão pública</h2>
          </header>
          <div className="policy-list">
            <div>
              <span>01</span>
              <p>Mapear demanda por cursos e território para apoiar a expansão de ofertas.</p>
            </div>
            <div>
              <span>02</span>
              <p>Observar inclusão digital, renda, ocupação e perfil empreendedor dos inscritos.</p>
            </div>
            <div>
              <span>03</span>
              <p>Orientar ações para públicos vulneráveis, participação regional e permanência.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="community-card panel">
        <div>
          <span className="section-kicker">Comunidade</span>
          <h2>Entre na comunidade do WhatsApp</h2>
          <p>
            A comunidade concentra avisos, comunicados e orientações relacionadas ao Pronatec Empreender, facilitando o
            acompanhamento das informações pelos participantes.
          </p>
        </div>
        <a className="whatsapp-button" href="https://chat.whatsapp.com/BQucupAq2TNEfGKkrdkhRi" target="_blank" rel="noreferrer">
          <MessageCircle size={18} aria-hidden="true" />
          Entrar na comunidade
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      </section>

      <section className="source-note">
        <p>
          Informações institucionais resumidas a partir do site oficial do Pronatec Empreender.
          <a href="https://empreender.pronatec.ifce.edu.br/" target="_blank" rel="noreferrer">
            Abrir fonte
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </p>
      </section>
    </div>
  );
}

function HomeStat({ value, label }) {
  return (
    <article className="home-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function CpfValidator() {
  const [cpf, setCpf] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaReady, setCaptchaReady] = useState(false);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const digits = useMemo(() => onlyDigits(cpf), [cpf]);
  // O envio público só é liberado quando CPF e captcha estão completos.
  const canSubmit = digits.length === 11 && Boolean(captchaToken) && status !== 'loading';

  function resetResult() {
    setResult(null);
    setError('');
    if (status !== 'loading') setStatus('idle');
  }

  function handleCpfChange(event) {
    setCpf(formatCpf(event.target.value));
    resetResult();
  }

  const handleCaptchaError = useCallback((code) => {
    setError(getErrorMessage(code));
    setStatus('error');
  }, []);

  const handleCaptchaReady = useCallback(() => {
    setCaptchaReady(true);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!APPS_SCRIPT_URL || !RECAPTCHA_SITE_KEY) {
      setError(getErrorMessage('configuration_error'));
      setStatus('error');
      return;
    }

    if (digits.length !== 11 || !captchaToken) {
      setError(getErrorMessage('invalid_request'));
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError('');
    setResult(null);

    try {
      const payload = await postToAppsScript({ action: 'validateCpf', cpf: digits, captchaToken });

      if (!payload.ok) {
        setError(getErrorMessage(payload.error));
        setStatus('error');
        return;
      }

      setResult(payload);
      setStatus(payload.found ? 'found' : 'notFound');
    } catch (requestError) {
      setError(getErrorMessage(requestError?.message || 'server_error'));
      setStatus('error');
    } finally {
      setCaptchaResetKey((current) => current + 1);
    }
  }

  return (
    <div className="single-column">
      <form className="panel form-panel" onSubmit={handleSubmit}>
        <label htmlFor="cpf">CPF</label>
        <div className="input-row">
          <input
            id="cpf"
            inputMode="numeric"
            autoComplete="off"
            value={cpf}
            onChange={handleCpfChange}
            placeholder="000.000.000-00"
            maxLength={14}
            aria-describedby="cpf-help"
          />
          <button type="submit" disabled={!canSubmit}>
            {status === 'loading' ? <Loader2 className="spin" size={18} aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
            Consultar
          </button>
        </div>
        <p id="cpf-help">Digite os 11 números do CPF. A pontuação é aplicada automaticamente.</p>

        <CaptchaBox
          siteKey={RECAPTCHA_SITE_KEY}
          resetKey={captchaResetKey}
          onTokenChange={setCaptchaToken}
          onReady={handleCaptchaReady}
          onError={handleCaptchaError}
        />

        {!captchaReady && RECAPTCHA_SITE_KEY ? <p className="muted">Carregando verificação...</p> : null}
      </form>

      <CpfResult status={status} result={result} error={error} />
    </div>
  );
}

function CpfResult({ status, result, error }) {
  if (status === 'idle') {
    return null;
  }

  if (status === 'loading') {
    return <StatePanel tone="neutral" icon={Loader2} title="Consultando" text="Estamos verificando a planilha de respostas." spinning />;
  }

  if (status === 'found' && result?.data) {
    return (
      <section className="result-panel success" aria-live="polite">
        <CheckCircle2 size={24} aria-hidden="true" />
        <div>
          <h2>Registro encontrado</h2>
          <dl>
            <div>
              <dt>Nome</dt>
              <dd>{result.data.name}</dd>
            </div>
            <div>
              <dt>Curso escolhido</dt>
              <dd>{result.data.course}</dd>
            </div>
          </dl>
        </div>
      </section>
    );
  }

  if (status === 'notFound') {
    return (
      <section className="result-panel warning" aria-live="polite">
        <XCircle size={24} aria-hidden="true" />
        <div>
          <h2>CPF não encontrado</h2>
          <p>Não localizamos uma resposta para este CPF. Responda o formulário para registrar suas informações.</p>
          <a className="link-button" href={result?.formUrl || FORM_URL} target="_blank" rel="noreferrer">
            Abrir formulário
            <ExternalLink size={17} aria-hidden="true" />
          </a>
        </div>
      </section>
    );
  }

  return <StatePanel tone="danger" icon={AlertCircle} title="Consulta indisponível" text={error} assertive />;
}

function Dashboard() {
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
      // O Apps Script principal consolida os dados da planilha de respostas do formulário.
      const payload = await postToAppsScript({ action: 'dashboardSummary', accessKey: accessKey.trim() }, 45000);
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
        <label htmlFor="access-key">Chave administrativa</label>
        <div className="input-row">
          <input
            id="access-key"
            type="password"
            autoComplete="off"
            value={accessKey}
            onChange={(event) => setAccessKey(event.target.value)}
            placeholder="Digite a chave do dashboard"
          />
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? <Loader2 className="spin" size={18} aria-hidden="true" /> : <BarChart3 size={18} aria-hidden="true" />}
            Carregar
          </button>
        </div>
        <p>O dashboard usa apenas dados agregados da planilha.</p>
      </form>

      {status === 'idle' ? <StatePanel tone="neutral" icon={Gauge} title="Pronto para carregar" text="Informe a chave administrativa para buscar os indicadores." /> : null}
      {status === 'loading' ? <DashboardSkeleton /> : null}
      {status === 'error' ? <StatePanel tone="danger" icon={AlertCircle} title="Dashboard indisponível" text={error} assertive /> : null}
      {status === 'ready' && summary ? <DashboardContent summary={summary} /> : null}
    </div>
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

function DashboardContent({ summary }) {
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
        <MetricCard icon={GraduationCap} label="Curso com maior demanda" value={topCourse?.label || 'Sem dados'} detail={topCourse ? `${formatNumber(topCourse.count)} inscrições` : ''} />
        <MetricCard icon={MapPin} label="Região com maior procura" value={topRegion?.label || 'Sem dados'} detail={topRegion ? `${formatNumber(topRegion.count)} inscrições` : ''} />
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

export default App;
