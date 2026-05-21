import { useEffect, useRef } from 'react';

import { loadRecaptcha } from '../../../services/recaptchaService';

export function CaptchaBox({ siteKey, onTokenChange, onReady, onError, resetKey }) {
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

  return <div className="captcha" ref={containerRef} aria-label="Verificação reCAPTCHA" />;
}