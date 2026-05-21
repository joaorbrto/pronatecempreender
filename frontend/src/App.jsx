import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import { AppShell } from './components/layout/AppShell';
import { CpfValidator } from './features/cpf-validation/CpfValidator';
import { Dashboard } from './features/dashboard-setec/Dashboard';
import { SecondaryDashboard } from './features/dashboard-coordenacao/SecondaryDashboard';
import { HomePage } from './features/home/HomePage';

const VIEW_PATHS = {
  home: '/',
  validate: '/consulta',
  dashboard: '/setec',
  secondaryDashboard: '/coordenacao',
};

function App() {
  const navigate = useNavigate();

  function handleNavigate(view) {
    navigate(VIEW_PATHS[view] || '/');
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />
        <Route path="/consulta" element={<CpfValidator />} />
        <Route path="/setec" element={<Dashboard />} />
        <Route path="/coordenacao" element={<SecondaryDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default App;