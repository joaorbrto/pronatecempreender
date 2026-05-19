import {
  BookOpen,
  Database,
  ExternalLink,
  Gauge,
  LayoutDashboard,
  MessageCircle,
  Rocket,
  Search,
} from 'lucide-react';

import { HOME_COURSES } from '../../data/homeCourses';

export function HomePage({ onNavigate }) {
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

        <a
          className="whatsapp-button"
          href="https://chat.whatsapp.com/BQucupAq2TNEfGKkrdkhRi"
          target="_blank"
          rel="noreferrer"
        >
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