# Validador Publico de CPF

Projeto com frontend React/Vite e backend Apps Script para validar se um CPF existe na planilha de respostas de um Google Forms.

## Estrutura

- `frontend/`: pagina publica sem login, com mascara de CPF, reCAPTCHA v2 e retorno de encontrado/nao encontrado.
- `apps-script/`: Web App do Apps Script que valida o captcha e consulta a planilha.
- O portal tem dois modulos: validacao publica de CPF e dashboard administrativo agregado.

## Configuracao do frontend

1. Entre em `frontend/`.
2. Copie `.env.example` para `.env`.
3. Preencha:
   - `VITE_BASE_PATH`: use `/` para dominio proprio ou repositorio `usuario.github.io`; use `/<nome-do-repositorio>/` para GitHub Pages em `usuario.github.io/repositorio`.
   - `VITE_APPS_SCRIPT_URL`: URL `/exec` do Apps Script publicado.
   - `VITE_RECAPTCHA_SITE_KEY`: site key do reCAPTCHA v2.
   - `VITE_FORM_URL`: link do formulario, ja preenchido no exemplo.
4. Instale dependencias e rode:

```bash
npm install
npm run dev
```

## Configuracao do Apps Script

Veja `apps-script/README.md`.

## Publicacao no GitHub Pages

O projeto ja inclui o workflow `.github/workflows/deploy-pages.yml`.

1. Suba este projeto para um repositorio GitHub.
2. No GitHub, va em **Settings > Pages**.
3. Em **Build and deployment**, selecione **GitHub Actions**.
4. Em **Settings > Secrets and variables > Actions > Variables**, crie:
   - `VITE_BASE_PATH`: `/nome-do-repositorio/` se o site ficar em `https://usuario.github.io/nome-do-repositorio/`; use `/` para `https://usuario.github.io/` ou dominio proprio.
   - `VITE_APPS_SCRIPT_URL`: URL `/exec` do Apps Script.
   - `VITE_RECAPTCHA_SITE_KEY`: site key do reCAPTCHA v2.
   - `VITE_FORM_URL`: link do formulario.
5. Faca push na branch `main`.

Depois do deploy, adicione o dominio do GitHub Pages na configuracao do reCAPTCHA. Exemplo: `usuario.github.io`.

## Comportamento

- CPF e comparado usando apenas numeros.
- Se encontrar mais de uma resposta para o mesmo CPF, retorna a mais recente.
- Se encontrar, mostra nome parcial e curso escolhido.
- Se nao encontrar, mostra o link para responder o formulario.
- Dashboard exige `ADMIN_ACCESS_KEY` configurada no Apps Script e digitada na tela.
- Dashboard retorna apenas contagens agregadas, sem expor linhas individuais.
