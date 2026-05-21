import { Database, Home, LayoutDashboard, Search, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { PAGE_COPY } from '../../data/pageCopy';

import './AppShell.css';

const NAV_ITEMS = [
  { view: 'home', path: '/', label: 'Início', icon: Home },
  { view: 'validate', path: '/consulta', label: 'Consulta de Interessados', icon: Search },
  { view: 'dashboard', path: '/setec', label: 'SETEC', icon: LayoutDashboard },
  { view: 'secondaryDashboard', path: '/coordenacao', label: 'Coordenação', icon: Database },
];

function getActiveView(pathname) {
  if (pathname.startsWith('/consulta')) return 'validate';
  if (pathname.startsWith('/setec')) return 'dashboard';
  if (pathname.startsWith('/coordenacao')) return 'secondaryDashboard';

  return 'home';
}

export function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeView = getActiveView(location.pathname);
  const pageCopy = PAGE_COPY[activeView];

  return (
    <main className="app-frame">
      <aside className="sidebar" aria-label="Navegação principal">
        <div className="brand-text">
          <strong>PRONATEC</strong>
          <span>Empreender</span>
        </div>

        <nav className="side-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <button
                className={activeView === item.view ? 'active' : ''}
                type="button"
                onClick={() => navigate(item.path)}
                key={item.view}
              >
                <Icon size={19} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
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
            {pageCopy.eyebrow ? (
              <div className="badge">
                <ShieldCheck size={18} aria-hidden="true" />
                {pageCopy.eyebrow}
              </div>
            ) : null}

            <h1>{pageCopy.title}</h1>
            <p>{pageCopy.description}</p>
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}