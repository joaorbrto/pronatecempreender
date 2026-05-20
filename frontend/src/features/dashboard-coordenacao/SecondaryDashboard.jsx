import { AlertCircle, Database, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { SECONDARY_APPS_SCRIPT_URL } from '../../config/env';
import { DashboardSkeleton } from '../../components/dashboard/DashboardSkeleton';
import { StatePanel } from '../../components/feedback/StatePanel';
import { postToAppsScript } from '../../services/appsScriptClient';
import { getErrorMessage } from '../../utils/errorMessages';

import { SecondaryDashboardContent } from './SecondaryDashboardContent';
import { SecondaryDashboardSetup } from './SecondaryDashboardSetup';

export function SecondaryDashboard() {
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
            {status === 'loading' ? (
              <Loader2 className="spin" size={18} aria-hidden="true" />
            ) : (
              <Database size={18} aria-hidden="true" />
            )}
            Carregar
          </button>
        </div>

        <p>
          Este painel apresenta dados agregados sobre os institutos cadastrados, ajudando a coordenação a acompanhar
          vagas, cursos, regiões e cronograma do programa.
        </p>
      </form>

      {status === 'idle' ? <SecondaryDashboardSetup /> : null}
      {status === 'loading' ? <DashboardSkeleton /> : null}

      {status === 'error' ? (
        <StatePanel tone="danger" icon={AlertCircle} title="Dashboard indisponível" text={error} assertive />
      ) : null}

      {status === 'ready' && summary ? <SecondaryDashboardContent summary={summary} /> : null}
    </div>
  );
}