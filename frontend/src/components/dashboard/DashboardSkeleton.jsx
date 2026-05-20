import './DashboardSkeleton.css';

export function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton" aria-busy="true" aria-live="polite">
      <span className="muted" style={{ margin: 0 }}>
        Consolidando os dados da planilha...
      </span>

      <div className="metric-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="skeleton-card" key={`mc-${index}`}>
            <span className="skeleton skeleton-line md" />
            <span className="skeleton skeleton-line lg" />
            <span className="skeleton skeleton-line sm" />
          </div>
        ))}
      </div>

      <div className="insight-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="skeleton-panel" key={`ip-${index}`}>
            <span className="skeleton skeleton-line md" />
            <span className="skeleton" style={{ height: 120, width: '100%', borderRadius: 8 }} />
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="skeleton-panel" key={`dg-${index}`}>
            <span className="skeleton skeleton-line md" />
            <div className="skeleton-bars">
              <span className="skeleton skeleton-line" />
              <span className="skeleton skeleton-line" />
              <span className="skeleton skeleton-line" />
              <span className="skeleton skeleton-line" />
              <span className="skeleton skeleton-line" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}