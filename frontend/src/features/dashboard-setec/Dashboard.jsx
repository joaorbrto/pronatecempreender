import { AlertCircle, BarChart3, Gauge, Loader2 } from 'lucide-react';
import { useState } from 'react';

import './DashboardSetec.css';

import { DashboardSkeleton } from '../../components/dashboard/DashboardSkeleton';
import { StatePanel } from '../../components/feedback/StatePanel';
import { postToAppsScript } from '../../services/appsScriptClient';
import { getErrorMessage } from '../../utils/errorMessages';

import { DashboardContent } from './DashboardContent';

export function Dashboard() {
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
        { action: 'dashboardSummary', accessKey: accessKey.trim() },
        45000,
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
            {status === 'loading' ? (
              <Loader2 className="spin" size={18} aria-hidden="true" />
            ) : (
              <BarChart3 size={18} aria-hidden="true" />
            )}
            Carregar
          </button>
        </div>

        <p>O dashboard usa apenas dados agregados da planilha.</p>
      </form>

      {status === 'idle' ? (
        <StatePanel
          tone="neutral"
          icon={Gauge}
          title="Pronto para carregar"
          text="Informe a chave administrativa para buscar os indicadores."
        />
      ) : null}

      {status === 'loading' ? <DashboardSkeleton /> : null}

      {status === 'error' ? (
        <StatePanel tone="danger" icon={AlertCircle} title="Dashboard indisponível" text={error} assertive />
      ) : null}

      {status === 'ready' && summary ? <DashboardContent summary={summary} /> : null}
    </div>
  );
}