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
import { compactCenterLabel, displayLabel, formatNumber } from './utils/formatters';
import {
  countYes,
  firstItem,
  percentFromYes,
  sortAgeRanges,
  sortRegions,
  sumCounts,
} from './utils/chartUtils';

import { DashboardSkeleton } from './components/dashboard/DashboardSkeleton';
import { ChartEmptyState } from './components/feedback/ChartEmptyState';
import { StatePanel } from './components/feedback/StatePanel';
import { MetricCard } from './components/ui/MetricCard';


const CHART_ICONS = [BarChart3, MapPin, Users, Gauge, GraduationCap, ShieldCheck];

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

function GenericChartPanel({ chart, index }) {
  const Icon = CHART_ICONS[index % CHART_ICONS.length];
  const items = chart.items || [];
  const type = chart.type || 'bar';

  // O Apps Script informa o tipo de gráfico; este componente escolhe o visual correspondente.
  if (chart.id === 'starts-by-month') return <ScheduleColumnPanel title={chart.title || 'Início das ofertas'} icon={Icon} items={items} />;
  if (type === 'donut') return <LookerDonutPanel title={chart.title || 'Indicador'} icon={Icon} items={items} />;
  if (type === 'pie') return <PiePanel title={chart.title || 'Indicador'} icon={Icon} items={items} />;
  if (type === 'pill') return <PillPanel title={chart.title || 'Indicador'} icon={Icon} items={items} />;
  if (type === 'mosaic') return <MosaicPanel title={chart.title || 'Indicador'} icon={Icon} items={items} />;

  return <ChartPanel title={chart.title || 'Indicador'} icon={Icon} items={items} variant={type === 'column' ? 'column' : 'bar'} />;
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

function ChartPanel({ title, icon: Icon, items = [], variant = 'bar' }) {
  const max = Math.max(...items.map((item) => item.count), 1);
  const total = sumCounts(items);

  // Componente base para rankings, barras horizontais e colunas simples.
  return (
    <article className={`chart-panel ${variant}`}>
      <header>
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
      </header>
      {items.length ? (
        <div className={variant === 'column' ? 'column-list' : 'bar-list'}>
          {items.map((item) => {
            const percent = total ? Math.round((Number(item.count || 0) / total) * 100) : 0;
            const label = displayLabel(item.label);
            const tooltip = `${label}: ${formatNumber(item.count)} (${percent}%)`;
            return (
              <div
                className={variant === 'column' ? 'column-item' : 'bar-item'}
                key={`${title}-${item.label}`}
                title={tooltip}
                tabIndex={0}
                aria-label={tooltip}
              >
                <div className="bar-label">
                  <span>{label}</span>
                  <strong>{formatNumber(item.count)}</strong>
                </div>
                <div className={variant === 'column' ? 'column-track' : 'bar-track'}>
                  <span
                    style={
                      variant === 'column'
                        ? { '--bar-height': `${Math.max((item.count / max) * 100, 4)}%` }
                        : { width: `${Math.max((item.count / max) * 100, 4)}%` }
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <ChartEmptyState />
      )}
    </article>
  );
}

function ScheduleColumnPanel({ title, icon: Icon, items = [], featured = false }) {
  const max = Math.max(...items.map((item) => item.count), 1);
  const total = sumCounts(items);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] || items[0];
  const activeDetails = activeItem?.details || [];

  // Ao passar o mouse ou focar uma coluna, os campi daquela data aparecem abaixo do gráfico.
  return (
    <article className={`chart-panel column schedule-panel ${featured ? 'featured' : ''}`}>
      <header>
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
      </header>
      {items.length ? (
        <>
          <div className="column-list schedule-column-list">
            {items.map((item, index) => {
              const percent = total ? Math.round((Number(item.count || 0) / total) * 100) : 0;
              const label = displayLabel(item.label);
              const detailNames = (item.details || []).map((detail) => detail.campus).filter(Boolean).slice(0, 6);
              const tooltip = `${label}: ${formatNumber(item.count)} (${percent}%)${detailNames.length ? ` - ${detailNames.join('; ')}` : ''}`;

              return (
                <div
                  className={`column-item ${index === activeIndex ? 'active' : ''}`}
                  key={`${title}-${item.label}`}
                  title={tooltip}
                  tabIndex={0}
                  aria-label={tooltip}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                >
                  <div className="bar-label">
                    <span>{label}</span>
                    <strong>{formatNumber(item.count)}</strong>
                  </div>
                  <div className="column-track">
                    <span style={{ '--bar-height': `${Math.max((item.count / max) * 100, 4)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="schedule-details" aria-live="polite">
            <div className="schedule-details-head">
              <strong>{displayLabel(activeItem?.label) || 'Sem data'}</strong>
              <span>{formatNumber(activeItem?.count)} oferta{Number(activeItem?.count || 0) === 1 ? '' : 's'}</span>
            </div>
            {activeDetails.length ? (
              <ul>
                {activeDetails.slice(0, 8).map((detail, index) => (
                  <li key={`${activeItem.label}-${detail.campus}-${detail.course}-${index}`}>
                    <strong>{detail.campus || 'Campus não informado'}</strong>
                    <span>{detail.course || 'Curso não informado'}</span>
                    {detail.institution ? <small>{detail.institution}</small> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum campus informado para esta data.</p>
            )}
            {activeDetails.length > 8 ? <p>+ {formatNumber(activeDetails.length - 8)} outros campi nesta data.</p> : null}
          </div>
        </>
      ) : (
        <ChartEmptyState />
      )}
    </article>
  );
}

function PillPanel({ title, icon: Icon, items = [] }) {
  const total = sumCounts(items);

  return (
    <article className="chart-panel pill-panel">
      <header>
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
      </header>
      {items.length ? (
        <div className="pill-list">
          {items.slice(0, 8).map((item) => {
            const percent = total ? Math.round((Number(item.count || 0) / total) * 100) : 0;
            const label = displayLabel(item.label);
            const tooltip = `${label}: ${formatNumber(item.count)} (${percent}%)`;
            return (
              <div
                className="pill-row"
                key={`${title}-${item.label}`}
                title={tooltip}
                tabIndex={0}
                aria-label={tooltip}
              >
                <span>{label}</span>
                <strong>{percent}%</strong>
                <div className="pill-meter">
                  <span style={{ width: `${Math.max(percent, 3)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <ChartEmptyState />
      )}
    </article>
  );
}

function DonutPanel({ title, icon: Icon, items = [], highlight, centerLabel = 'Sim', primaryCount }) {
  const yes = countYes(items);
  const total = sumCounts(items);
  const currentPrimaryCount = Number(primaryCount || yes || items[0]?.count || 0);
  const percent = total ? Math.round((currentPrimaryCount / total) * 100) : 0;

  return (
    <article className="chart-panel donut-panel">
      <header>
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
      </header>
      <div className="donut-wrap">
        <div className="donut" style={{ '--percent': `${percent}%` }}>
          <strong>{highlight || `${percent}%`}</strong>
          <span>{centerLabel}</span>
        </div>
        <div className="donut-legend">
          {(items || []).slice(0, 4).map((item) => (
            <div key={`${title}-${item.label}`}>
              <span>{displayLabel(item.label)}</span>
              <strong>{formatNumber(item.count)}</strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function StackPanel({ title, icon: Icon, groups }) {
  return (
    <article className="chart-panel stack-panel">
      <header>
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
      </header>
      <div className="stack-list">
        {groups.map((group) => (
          <div className="stack-row" key={group.label}>
            <div className="bar-label">
              <span>{displayLabel(group.label)}</span>
              <strong>{percentFromYes(group.items)}%</strong>
            </div>
            <div className="stack-track">
              <span style={{ width: `${percentFromYes(group.items)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function MosaicPanel({ title, icon: Icon, items = [] }) {
  const max = Math.max(...items.map((item) => item.count), 1);
  const total = sumCounts(items);

  return (
    <article className="chart-panel mosaic-panel">
      <header>
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
      </header>
      {items.length ? (
        <div className="mosaic-grid">
          {items.slice(0, 8).map((item) => {
            const percent = total ? Math.round((Number(item.count || 0) / total) * 100) : 0;
            const label = displayLabel(item.label);
            const tooltip = `${label}: ${formatNumber(item.count)} (${percent}%)`;
            return (
              <div
                className="mosaic-tile"
                key={`${title}-${item.label}`}
                style={{ '--tile-scale': 0.64 + (item.count / max) * 0.36 }}
                title={tooltip}
                tabIndex={0}
                aria-label={tooltip}
              >
                <strong>{formatNumber(item.count)}</strong>
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <ChartEmptyState />
      )}
    </article>
  );
}

function PiePanel({ title, icon: Icon, items = [] }) {
  const total = sumCounts(items);
  const colors = ['#1e6b46', '#93c94d', '#2a6f9f', '#b82543', '#c77b13', '#7d5bc2', '#c8dfb0'];
  let cursor = 0;
  const slices = items.slice(0, 7).map((item, index) => {
    const percent = total ? (Number(item.count || 0) / total) * 100 : 0;
    const start = cursor;
    cursor += percent;
    return { ...item, percent: Math.round(percent), color: colors[index % colors.length], start, end: cursor };
  });
  const gradient = slices.length ? slices.map((slice) => `${slice.color} ${slice.start}% ${slice.end}%`).join(', ') : '#e3ebdf 0 100%';

  return (
    <article className="chart-panel compact-pie-panel">
      <header>
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
      </header>
      <div className="compact-pie-layout">
        <div className="compact-pie" style={{ '--pie-gradient': gradient }} />
        <div className="compact-pie-legend">
          {slices.map((slice) => (
            <div key={`${title}-${slice.label}`}>
              <span className="legend-dot" style={{ '--legend-color': slice.color }} />
              <span>{displayLabel(slice.label)}</span>
              <strong>{slice.percent}%</strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function LookerDonutPanel({ title, icon: Icon, items = [] }) {
  const total = sumCounts(items);
  const colors = ['#c22a4b', '#1f7a52', '#82c545', '#2a6f9f', '#d08112', '#b8c7b2', '#6f7d72'];
  const [activeIndex, setActiveIndex] = useState(0);
  let cursor = 0;
  const slices = items.map((item, index) => {
    const percent = total ? (Number(item.count || 0) / total) * 100 : 0;
    const start = cursor;
    cursor += percent;
    return {
      ...item,
      percent: Math.round(percent),
      color: colors[index % colors.length],
      start,
      end: cursor,
    };
  });
  const activeSlice = slices[activeIndex] || slices[0];
  const activeLabel = compactCenterLabel(activeSlice?.label);

  // Rosca interativa no estilo Looker Studio: legenda e fatias controlam o percentual central.
  return (
    <article className="chart-panel looker-donut-panel">
      <header>
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
      </header>
      <div className="looker-donut-layout">
        <svg className="looker-donut" viewBox="0 0 220 220" role="img" aria-label={`${title}. Passe o mouse nas fatias para ver percentuais.`}>
          <circle className="donut-bg" cx="110" cy="110" r="84" />
          {slices.map((slice, index) => (
            <circle
              className={`donut-slice ${index === activeIndex ? 'active' : ''}`}
              key={`${title}-${slice.label}`}
              cx="110"
              cy="110"
              r="84"
              pathLength="100"
              stroke={slice.color}
              strokeDasharray={`${slice.percent} ${100 - slice.percent}`}
              strokeDashoffset={-slice.start}
              tabIndex={0}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
            >
              <title>{`${displayLabel(slice.label)}: ${slice.percent}% (${formatNumber(slice.count)})`}</title>
            </circle>
          ))}
          <text className="donut-center-value" x="110" y="104" textAnchor="middle">
            {activeSlice ? `${activeSlice.percent}%` : '0%'}
          </text>
          <text className="donut-center-label" x="110" y="130" textAnchor="middle">
            {activeLabel || 'Sem dados'}
          </text>
        </svg>
        <div className="looker-legend">
          {slices.map((slice, index) => (
            <div
              className={index === activeIndex ? 'active' : ''}
              key={`${title}-${slice.label}`}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              tabIndex={0}
            >
              <span className="legend-dot" style={{ '--legend-color': slice.color }} />
              <span>{displayLabel(slice.label)}</span>
              <strong>{formatNumber(slice.count)}</strong>
              <small>{slice.percent}%</small>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default App;
