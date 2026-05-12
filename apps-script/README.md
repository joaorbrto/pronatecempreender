# Apps Script

Este codigo publica um Web App publico que valida um CPF contra a planilha de respostas do Google Forms.

## Configuracao

1. Crie ou abra um projeto no Apps Script.
2. Copie o conteudo de `Code.gs` para o arquivo principal do projeto.
3. Ajuste as constantes em `CONFIG`:
   - `SPREADSHEET_ID`: ID da planilha de respostas.
   - `SHEET_NAME`: nome exato da aba de respostas.
   - `CPF_COLUMN`: cabecalho da coluna que guarda o CPF.
   - `NAME_COLUMN`: cabecalho da coluna do nome.
   - `COURSE_COLUMN`: cabecalho da coluna do curso escolhido.
   - `RECAPTCHA_SECRET_KEY`: chave secreta do reCAPTCHA v2.
   - `ADMIN_ACCESS_KEY`: chave que sera digitada no portal para abrir o dashboard.
4. Copie `appsscript.json` para o manifesto do projeto, se voce usa o editor com manifest visivel.
5. Implante como **Web app**:
   - Executar como: **Eu**.
   - Quem tem acesso: **Qualquer pessoa**.
6. Use a URL terminada em `/exec` no `VITE_APPS_SCRIPT_URL` do frontend.

O endpoint espera `POST` com `Content-Type: text/plain;charset=utf-8` contendo JSON.

## Dashboard

O mesmo Web App tambem aceita a acao `dashboardSummary`.

Exemplo:

```json
{
  "action": "dashboardSummary",
  "accessKey": "sua_chave_admin"
}
```

Ele retorna apenas indicadores agregados, sem linhas individuais da planilha.

## Ler cabecalhos para o dashboard

Para planejar o portal sem expor CPFs ou respostas individuais:

1. Crie um novo arquivo `HeaderInspector.gs` no mesmo projeto Apps Script.
2. Copie o conteudo de `apps-script/HeaderInspector.gs`.
3. No seletor de funcoes do editor, escolha `listHeadersForDashboard`.
4. Clique em **Executar**.
5. Abra **Registro de execucao** e copie o JSON gerado.

Esse inspetor retorna apenas nome da aba, quantidade de respostas e cabecalhos.
