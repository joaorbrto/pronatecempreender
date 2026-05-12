import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle2,
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

const FORM_URL =
  import.meta.env.VITE_FORM_URL ||
  'https://docs.google.com/forms/d/e/1FAIpQLSdw12nttWOfb4chxPK_zeucc97I5Tf4wg6naV1AGBx9FwIe7g/viewform?usp=header';
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || '';
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

let recaptchaPromise;

function loadRecaptcha() {
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  if (recaptchaPromise) return recaptchaPromise;

  recaptchaPromise = new Promise((resolve, reject) => {
    window.__cpfValidatorRecaptchaLoaded = () => resolve(window.grecaptcha);
    if (document.querySelector('script[data-recaptcha="cpf-validator"]')) return;

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=__cpfValidatorRecaptchaLoaded&render=explicit&hl=pt-BR';
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = 'cpf-validator';
    script.onerror = () => reject(new Error('recaptcha_load_failed'));
    document.head.appendChild(script);
  });

  return recaptchaPromise;
}

function onlyDigits(value) {
  return value.replace(/\D/g, '').slice(0, 11);
}

function formatCpf(value) {
  const digits = onlyDigits(value);
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 9);
  const part4 = digits.slice(9, 11);

  if (digits.length > 9) return `${part1}.${part2}.${part3}-${part4}`;
  if (digits.length > 6) return `${part1}.${part2}.${part3}`;
  if (digits.length > 3) return `${part1}.${part2}`;
  return part1;
}

function getErrorMessage(error) {
  const messages = {
    invalid_request: 'Confira os dados e tente novamente.',
    invalid_captcha: 'A verificacao expirou ou nao foi concluida. Resolva o captcha novamente.',
    request_timeout: 'A consulta demorou mais que o esperado. Tente novamente em alguns instantes.',
    unauthorized: 'Chave administrativa invalida.',
    server_error: 'Nao foi possivel consultar a planilha agora. Tente novamente em instantes.',
    configuration_error: 'A consulta ainda nao foi configurada. Verifique as variaveis do projeto.',
  };

  return messages[error] || 'Nao foi possivel concluir a consulta. Tente novamente.';
}

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

  return <div className="captcha" ref={containerRef} aria-label="Verificacao reCAPTCHA" />;
}

async function postToAppsScript(payload, timeoutMs = 30000) {
  if (!APPS_SCRIPT_URL) throw new Error('configuration_error');

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return JSON.parse(await response.text());
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('request_timeout');
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function App() {
  const [activeView, setActiveView] = useState('home');
  const pageCopy = {
    home: {
      eyebrow: 'Pronatec Empreender',
      title: 'Portal de acompanhamento das inscricoes',
      description: 'Uma entrada unica para consulta publica, indicadores de gestao e leitura territorial das ofertas.',
    },
    validate: {
      eyebrow: '',
      title: 'Consulta de interessados',
      description: 'Informe o CPF para consultar a pesquisa de interesse.',
    },
    dashboard: {
      eyebrow: 'Gestao e politicas publicas',
      title: 'Dashboard administrativo',
      description: 'Indicadores agregados para orientar oferta, territorio, inclusao digital e inclusao produtiva.',
    },
  };

  return (
    <main className="app-frame">
      <aside className="sidebar" aria-label="Navegacao principal">
        <div className="brand-text">
          <strong>PRONATEC</strong>
          <span>Empreender</span>
        </div>

        <nav className="side-nav">
          <button className={activeView === 'home' ? 'active' : ''} type="button" onClick={() => setActiveView('home')}>
            <Home size={19} aria-hidden="true" />
            <span>Inicio</span>
          </button>
          <button className={activeView === 'validate' ? 'active' : ''} type="button" onClick={() => setActiveView('validate')}>
            <Search size={19} aria-hidden="true" />
            <span>Consulta de Interessados</span>
          </button>
          <button className={activeView === 'dashboard' ? 'active' : ''} type="button" onClick={() => setActiveView('dashboard')}>
            <LayoutDashboard size={19} aria-hidden="true" />
            <span>SETEC</span>
          </button>
        </nav>

        <div className="sidebar-card">
          <span>Portal interno</span>
          <strong>Indicadores para decisao</strong>
          <p>Dados agregados das inscricoes, sem exposicao de registros individuais.</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <div>
            {pageCopy[activeView].eyebrow ? (
              <div className="badge">
                <ShieldCheck size={18} aria-hidden="true" />
                {pageCopy[activeView].eyebrow}
              </div>
            ) : null}
            <h1>{pageCopy[activeView].title}</h1>
            <p>{pageCopy[activeView].description}</p>
          </div>
        </header>

        {activeView === 'home' ? <HomePage onNavigate={setActiveView} /> : null}
        {activeView === 'validate' ? <CpfValidator /> : null}
        {activeView === 'dashboard' ? <Dashboard /> : null}
      </section>
    </main>
  );
}

function HomePage({ onNavigate }) {
  const courses = [
    {
      title: 'Negocios Inovadores Apoiados por IA',
      text: 'Formacao voltada ao uso de inteligencia artificial em processos, solucoes e oportunidades de negocio.',
    },
    {
      title: 'Drones e Impressoras 3D',
      text: 'Operacao, manutencao, prototipagem digital, impressao 3D e aplicacoes com drones.',
    },
    {
      title: 'App Clicks',
      text: 'Construcao rapida de aplicativos para midias digitais, com foco em empreendedorismo digital e no-code.',
    },
  ];

  return (
    <div className="home-page">
      <section className="home-hero panel">
        <div className="home-hero-copy">
          <span className="section-kicker">Educacao profissional, tecnologia e inclusao produtiva</span>
          <h2>Formacao conectada a economia digital e ao empreendedorismo.</h2>
          <p>
            O Pronatec Empreender apoia ofertas de qualificacao profissional em areas estrategicas, fortalecendo a
            gestao pedagogica, a permanencia dos estudantes e a empregabilidade.
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
        <HomeStat value="2025" label="ciclo de lancamento" />
        <HomeStat value="3" label="cursos apoiados" />
        <HomeStat value="30" label="instituicoes contempladas" />
        <HomeStat value="6.900" label="vagas aprovadas" />
      </section>

      <section className="home-grid">
        <article className="home-panel panel">
          <header>
            <BookOpen size={20} aria-hidden="true" />
            <h2>Cursos do programa</h2>
          </header>
          <div className="course-list">
            {courses.map((course) => (
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
            <h2>Leitura para gestao publica</h2>
          </header>
          <div className="policy-list">
            <div>
              <span>01</span>
              <p>Mapear demanda por cursos e territorio para apoiar expansao de ofertas.</p>
            </div>
            <div>
              <span>02</span>
              <p>Observar inclusao digital, renda, ocupacao e perfil empreendedor dos inscritos.</p>
            </div>
            <div>
              <span>03</span>
              <p>Orientar acoes para publicos vulneraveis, participacao regional e permanencia.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="community-card panel">
        <div>
          <span className="section-kicker">Comunidade</span>
          <h2>Entre na comunidade do WhatsApp</h2>
          <p>
            A comunidade concentra avisos, comunicados e orientacoes relacionadas ao Pronatec Empreender, facilitando o
            acompanhamento das informacoes pelos participantes.
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
          Informacoes institucionais resumidas a partir do site oficial do Pronatec Empreender.
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
        <p id="cpf-help">Digite os 11 numeros do CPF. A pontuacao e aplicada automaticamente.</p>

        <CaptchaBox
          siteKey={RECAPTCHA_SITE_KEY}
          resetKey={captchaResetKey}
          onTokenChange={setCaptchaToken}
          onReady={handleCaptchaReady}
          onError={handleCaptchaError}
        />

        {!captchaReady && RECAPTCHA_SITE_KEY ? <p className="muted">Carregando verificacao...</p> : null}
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
          <h2>CPF nao encontrado</h2>
          <p>Nao localizamos uma resposta para este CPF. Responda o formulario para registrar suas informacoes.</p>
          <a className="link-button" href={result?.formUrl || FORM_URL} target="_blank" rel="noreferrer">
            Abrir formulario
            <ExternalLink size={17} aria-hidden="true" />
          </a>
        </div>
      </section>
    );
  }

  return <StatePanel tone="danger" icon={AlertCircle} title="Consulta indisponivel" text={error} assertive />;
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
      {status === 'loading' ? <StatePanel tone="neutral" icon={Loader2} title="Carregando dashboard" text="Estamos consolidando os dados da planilha." spinning /> : null}
      {status === 'error' ? <StatePanel tone="danger" icon={AlertCircle} title="Dashboard indisponivel" text={error} assertive /> : null}
      {status === 'ready' && summary ? <DashboardContent summary={summary} /> : null}
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
        <MetricCard icon={Users} label="Inscricoes analisadas" value={summary.totalResponses} />
        <MetricCard icon={GraduationCap} label="Curso com maior demanda" value={topCourse?.label || 'Sem dados'} detail={topCourse ? `${formatNumber(topCourse.count)} inscricoes` : ''} />
        <MetricCard icon={MapPin} label="Regiao com maior procura" value={topRegion?.label || 'Sem dados'} detail={topRegion ? `${formatNumber(topRegion.count)} inscricoes` : ''} />
        <MetricCard icon={Gauge} label="Com negocio proprio" value={`${businessShare}%`} detail="Indicador empreendedor" />
      </section>

      <section className="insight-grid">
        <DonutPanel title="Acesso a internet" icon={ShieldCheck} items={summary.byInternetAccess} highlight={`${internetShare}%`} />
        <DonutPanel title="Recebe beneficios" icon={Users} items={summary.byBenefit} highlight={`${benefitShare}%`} />
        <DonutPanel title="Pessoa com deficiencia" icon={Users} items={summary.byDisability} highlight={`${disabilityShare}%`} />
        <StackPanel
          title="Inclusao produtiva"
          icon={Gauge}
          groups={[
            { label: 'Negocio proprio', items: summary.byOwnBusiness },
            { label: 'Possui CNPJ', items: summary.byCnpj },
            { label: 'Porte da empresa', items: summary.byCompanySize },
          ]}
        />
      </section>

      <section className="dashboard-grid">
        <ChartPanel title="Demanda por curso" icon={GraduationCap} items={summary.byCourse} variant="bar" />
        <LookerDonutPanel title="Participacao por regiao" icon={MapPin} items={sortRegions(summary.byRegion)} />
        <ChartPanel title="Estados" icon={MapPin} items={summary.byState} variant="column" />
        <ChartPanel title="Cidades" icon={MapPin} items={summary.byCity} variant="ranking" />
        <ChartPanel title="Faixa etaria" icon={Users} items={sortAgeRanges(summary.byAgeRange)} variant="bar" />
        <PillPanel title="Escolaridade" icon={GraduationCap} items={summary.byEducation} />
        <DonutPanel title="Renda familiar" icon={Gauge} items={summary.byIncome} highlight={firstItem(summary.byIncome)?.label || 'Renda'} centerLabel="maior grupo" primaryCount={firstItem(summary.byIncome)?.count} />
        <PiePanel title="Raca / cor" icon={Users} items={summary.byRace} />
        <ChartPanel title="Zona de residencia" icon={MapPin} items={summary.byZone} variant="column" />
        <MosaicPanel title="Ocupacao atual" icon={Users} items={summary.byOccupation} />
        <ChartPanel title="Como souberam do curso" icon={BarChart3} items={summary.bySource} variant="ranking" />
        <MosaicPanel title="Interesse em outras capacitacoes" icon={GraduationCap} items={summary.byOtherTraining} />
        <ChartPanel title="Canal de vendas/atendimento" icon={BarChart3} items={summary.bySalesChannel} variant="ranking" />
        <ChartPanel title="Desafios do negocio" icon={Gauge} items={summary.byBusinessChallenge} variant="bar" />
      </section>

      <section className="dashboard-grid compact">
        <ChartPanel title="Nivel empreendedorismo" icon={Gauge} items={summary.courseReadiness?.entrepreneurship} variant="column" />
        <ChartPanel title="Nivel IA" icon={Gauge} items={summary.courseReadiness?.ai} variant="column" />
        <ChartPanel title="Ferramentas digitais" icon={Gauge} items={summary.courseReadiness?.digitalTools} variant="column" />
        <ChartPanel title="Experiencia com drones" icon={Gauge} items={summary.courseReadiness?.drones} variant="column" />
        <ChartPanel title="Apps / no-code" icon={Gauge} items={summary.courseReadiness?.apps} variant="column" />
        <ChartPanel title="Modo de acesso a internet" icon={ShieldCheck} items={summary.byInternetMode} variant="bar" />
      </section>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail = '', tone = 'neutral' }) {
  return (
    <article className={`metric-card ${tone}`}>
      <Icon size={22} aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{typeof value === 'number' ? formatNumber(value) : value}</strong>
        {detail ? <small>{detail}</small> : null}
      </div>
    </article>
  );
}

function ChartPanel({ title, icon: Icon, items = [], variant = 'bar' }) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <article className={`chart-panel ${variant}`}>
      <header>
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
      </header>
      {items.length ? (
        <div className={variant === 'column' ? 'column-list' : 'bar-list'}>
          {items.map((item) => (
            <div className={variant === 'column' ? 'column-item' : 'bar-item'} key={`${title}-${item.label}`}>
              <div className="bar-label">
                <span>{item.label}</span>
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
          ))}
        </div>
      ) : (
        <p className="empty-chart">Sem dados para este indicador.</p>
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
            return (
              <div className="pill-row" key={`${title}-${item.label}`}>
                <span>{item.label}</span>
                <strong>{percent}%</strong>
                <div className="pill-meter">
                  <span style={{ width: `${Math.max(percent, 3)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="empty-chart">Sem dados para este indicador.</p>
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
              <span>{item.label}</span>
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
              <span>{group.label}</span>
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

  return (
    <article className="chart-panel mosaic-panel">
      <header>
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
      </header>
      {items.length ? (
        <div className="mosaic-grid">
          {items.slice(0, 8).map((item) => (
            <div className="mosaic-tile" key={`${title}-${item.label}`} style={{ '--tile-scale': 0.64 + (item.count / max) * 0.36 }}>
              <strong>{formatNumber(item.count)}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-chart">Sem dados para este indicador.</p>
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
              <span>{slice.label}</span>
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
              <title>{`${slice.label}: ${slice.percent}% (${formatNumber(slice.count)})`}</title>
            </circle>
          ))}
          <text className="donut-center-value" x="110" y="104" textAnchor="middle">
            {activeSlice ? `${activeSlice.percent}%` : '0%'}
          </text>
          <text className="donut-center-label" x="110" y="130" textAnchor="middle">
            {activeSlice?.label || 'Sem dados'}
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
              <span>{slice.label}</span>
              <strong>{formatNumber(slice.count)}</strong>
              <small>{slice.percent}%</small>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function StatePanel({ tone, icon: Icon, title, text, spinning = false, assertive = false }) {
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

function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(Number(value || 0));
}

function firstItem(items = []) {
  return items.length ? items[0] : null;
}

function sumCounts(items = []) {
  return items.reduce((total, item) => total + Number(item.count || 0), 0);
}

function countYes(items = []) {
  return items.reduce((total, item) => {
    const label = String(item.label || '').toLowerCase();
    return label.includes('sim') ? total + Number(item.count || 0) : total;
  }, 0);
}

function percentFromYes(items = [], fallbackTotal) {
  const total = fallbackTotal || sumCounts(items);
  if (!total) return 0;
  return Math.round((countYes(items) / total) * 100);
}

function sortAgeRanges(items = []) {
  const order = ['Ate 17', '18 a 24', '25 a 34', '35 a 44', '45 a 59', '60+', 'Nao informado'];
  return [...items].sort((a, b) => {
    const aIndex = order.indexOf(a.label);
    const bIndex = order.indexOf(b.label);
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });
}

function sortRegions(items = []) {
  const order = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul', 'Nao informado', 'Nao identificado'];
  return [...items].sort((a, b) => {
    const aIndex = order.indexOf(a.label);
    const bIndex = order.indexOf(b.label);
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });
}

export default App;
