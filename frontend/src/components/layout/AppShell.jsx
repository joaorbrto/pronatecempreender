import { Database, Home, LayoutDashboard, Search, ShieldCheck } from 'lucide-react';

import { PAGE_COPY } from '../../data/pageCopy';

import './AppShell.css';

export function AppShell({ activeView, onNavigate, children }) {
  return (
    <main className="app-frame">
      <aside className="sidebar" aria-label="Navegação principal">
        <div className="brand-text">
          <strong>PRONATEC</strong>
          <span>Empreender</span>
        </div>

        <nav className="side-nav">
          <button
            className={activeView === 'home' ? 'active' : ''}
            type="button"
            onClick={() => onNavigate('home')}
          >
            <Home size={19} aria-hidden="true" />
            <span>Início</span>
          </button>

          <button
            className={activeView === 'validate' ? 'active' : ''}
            type="button"
            onClick={() => onNavigate('validate')}
          >
            <Search size={19} aria-hidden="true" />
            <span>Consulta de Interessados</span>
          </button>

          <button
            className={activeView === 'dashboard' ? 'active' : ''}
            type="button"
            onClick={() => onNavigate('dashboard')}
          >
            <LayoutDashboard size={19} aria-hidden="true" />
            <span>SETEC</span>
          </button>

          <button
            className={activeView === 'secondaryDashboard' ? 'active' : ''}
            type="button"
            onClick={() => onNavigate('secondaryDashboard')}
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

        {children}
      </section>
    </main>
  );
}