export function getErrorMessage(error) {
  const messages = {
    invalid_request: 'Confira os dados e tente novamente.',
    invalid_captcha: 'A verificação expirou ou não foi concluída. Resolva o captcha novamente.',
    request_timeout: 'A consulta demorou mais que o esperado. Tente novamente em alguns instantes.',
    unauthorized: 'Chave administrativa inválida.',
    server_error: 'Não foi possível consultar a planilha agora. Tente novamente em instantes.',
    configuration_error: 'A consulta ainda não foi configurada. Verifique as variáveis do projeto.',
  };

  return messages[error] || 'Não foi possível concluir a consulta. Tente novamente.';
}