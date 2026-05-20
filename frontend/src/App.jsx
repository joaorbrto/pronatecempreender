import { useState } from 'react';

import { AppShell } from './components/layout/AppShell';
import { CpfValidator } from './features/cpf-validation/CpfValidator';
import { Dashboard } from './features/dashboard-setec/Dashboard';
import { SecondaryDashboard } from './features/dashboard-coordenacao/SecondaryDashboard';
import { HomePage } from './features/home/HomePage';

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

export default App;