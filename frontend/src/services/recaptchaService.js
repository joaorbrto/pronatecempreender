let recaptchaPromise;

// Mantém uma única promessa de carregamento para evitar inserir o script do reCAPTCHA mais de uma vez.
export function loadRecaptcha() {
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  if (recaptchaPromise) return recaptchaPromise;

  recaptchaPromise = new Promise((resolve, reject) => {
    window.__cpfValidatorRecaptchaLoaded = () => resolve(window.grecaptcha);

    if (document.querySelector('script[data-recaptcha="cpf-validator"]')) return;

    const script = document.createElement('script');
    script.src =
      'https://www.google.com/recaptcha/api.js?onload=__cpfValidatorRecaptchaLoaded&render=explicit&hl=pt-BR';
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = 'cpf-validator';
    script.onerror = () => reject(new Error('recaptcha_load_failed'));

    document.head.appendChild(script);
  });

  return recaptchaPromise;
}