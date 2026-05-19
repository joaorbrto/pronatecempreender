import { useCallback, useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';

import { APPS_SCRIPT_URL, RECAPTCHA_SITE_KEY } from '../../config/env';
import { postToAppsScript } from '../../services/appsScriptClient';
import { formatCpf, onlyDigits } from '../../utils/cpf';
import { getErrorMessage } from '../../utils/errorMessages';

import { CaptchaBox } from './components/CaptchaBox';
import { CpfResult } from './components/CpfResult';

export function CpfValidator() {
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

    if (status !== 'loading') {
      setStatus('idle');
    }
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
      const payload = await postToAppsScript({
        action: 'validateCpf',
        cpf: digits,
        captchaToken,
      });

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
            {status === 'loading' ? (
              <Loader2 className="spin" size={18} aria-hidden="true" />
            ) : (
              <Search size={18} aria-hidden="true" />
            )}
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