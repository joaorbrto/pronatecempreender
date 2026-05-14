# Portal Pronatec Empreender

Portal web em React/Vite para acompanhamento do Pronatec Empreender. O projeto começou como um validador público de CPF, mas evoluiu para uma interface com página inicial, consulta de interessados e dashboards administrativos alimentados por Google Planilhas via Google Apps Script.

## O que o portal faz

- Apresenta uma página inicial institucional do Pronatec Empreender.
- Permite consultar, sem login, se um CPF possui registro na planilha de respostas do Google Formulários.
- Exibe resultado positivo com nome parcial e curso escolhido.
- Exibe resultado negativo com link para o formulário oficial.
- Mostra um dashboard SETEC com indicadores agregados das inscrições.
- Mostra um dashboard Coordenação com dados agregados dos institutos/campi cadastrados.
- Publica o frontend no GitHub Pages por GitHub Actions.

## Áreas do portal

- **Início**: visão institucional, cursos, comunidade do WhatsApp e atalhos.
- **Consulta de Interessados**: consulta pública por CPF com reCAPTCHA v2.
- **SETEC**: dashboard administrativo da planilha de respostas do formulário.
- **Coordenação**: dashboard complementar da planilha dos institutos ofertantes.

## Arquitetura

O frontend é uma aplicação estática hospedável no GitHub Pages. Ele não acessa diretamente as planilhas. As consultas passam por Web Apps do Google Apps Script, que leem as planilhas como proprietário e retornam apenas os dados necessários.

Fluxo simplificado:

1. Usuário acessa o portal no navegador.
2. Frontend chama a URL `/exec` do Apps Script.
3. Apps Script valida captcha ou chave administrativa, conforme a tela.
4. Apps Script lê a planilha e devolve JSON.
5. Frontend renderiza resultado ou gráficos.

## Estrutura do projeto

- `frontend/`: aplicação React/Vite do portal.
- `.github/workflows/deploy-pages.yml`: workflow de build e publicação no GitHub Pages.
- `apps-script/`: códigos locais dos Web Apps do Apps Script. Esta pasta fica ignorada pelo Git e não é necessária no deploy do site.

## Configuração local

Entre na pasta do frontend:

```bash
cd frontend
npm install
```

Crie `frontend/.env` a partir de `frontend/.env.example`:

```env
VITE_BASE_PATH=/
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/SEU_DEPLOYMENT_ID/exec
VITE_SECONDARY_APPS_SCRIPT_URL=https://script.google.com/macros/s/SEU_DEPLOYMENT_ID_DA_SEGUNDA_PLANILHA/exec
VITE_RECAPTCHA_SITE_KEY=SUA_SITE_KEY_RECAPTCHA_V2
VITE_FORM_URL=https://docs.google.com/forms/d/e/1FAIpQLSdw12nttWOfb4chxPK_zeucc97I5Tf4wg6naV1AGBx9FwIe7g/viewform?usp=header
```

Rode o servidor local:

```bash
npm run dev
```

Abra:

```text
http://127.0.0.1:5173/
```

## Build de produção

Para gerar a versão estática usada pelo GitHub Pages:

```bash
npm run build
```

O resultado é criado em `frontend/dist/`.

## Variáveis no GitHub Pages

No GitHub, configure em:

`Settings > Secrets and variables > Actions > Variables`

Variáveis necessárias:

- `VITE_BASE_PATH`: use `/pronatecempreender/` para GitHub Pages em repositório de projeto, ou `/` para domínio próprio/repositório raiz.
- `VITE_APPS_SCRIPT_URL`: URL `/exec` do Apps Script da consulta de CPF e dashboard SETEC.
- `VITE_SECONDARY_APPS_SCRIPT_URL`: URL `/exec` do Apps Script do dashboard Coordenação.
- `VITE_RECAPTCHA_SITE_KEY`: site key pública do reCAPTCHA v2.
- `VITE_FORM_URL`: link do formulário oficial.

Após configurar as variáveis, basta fazer push na branch `main`. O workflow fará o build e publicará o site.

## Apps Script

O portal usa dois Web Apps do Google Apps Script:

- **Apps Script principal**: consulta CPF, valida reCAPTCHA e gera o dashboard SETEC.
- **Apps Script secundário**: gera o dashboard Coordenação a partir da planilha dos institutos/campi.

As chaves sensíveis devem ficar nas **Propriedades do script** do Apps Script, não no código e não no GitHub.

Propriedades esperadas:

- No Apps Script principal:
  - `RECAPTCHA_SECRET_KEY`
  - `ADMIN_ACCESS_KEY`
- No Apps Script secundário:
  - `ADMIN_ACCESS_KEY`

## Segurança

- A planilha não precisa ficar pública.
- O frontend não armazena secret keys.
- A consulta pública de CPF usa reCAPTCHA v2.
- Os dashboards exigem chave administrativa validada no Apps Script.
- Os dashboards retornam dados agregados, sem CPF, e-mail ou linhas individuais.
- Variáveis `VITE_*` são públicas no JavaScript final; nunca coloque secrets nelas.
- Para dados mais sensíveis, recomenda-se evoluir para login real e regras de acesso por usuário.

## Comportamento da consulta de CPF

- O CPF é normalizado e comparado apenas por números.
- Se houver mais de uma resposta para o mesmo CPF, retorna o registro mais recente.
- Quando encontra registro, mostra nome parcial e curso escolhido.
- Quando não encontra, orienta o usuário a responder o formulário oficial.

## Tecnologias

- React
- Vite
- Lucide React
- Google Apps Script
- Google Planilhas
- reCAPTCHA v2
- GitHub Pages
