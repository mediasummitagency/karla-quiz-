# Escala de Cansaço Emocional Feminino

Quiz funnel de captação de leads para psicóloga. Experiência premium, acolhedora e clinicamente credível.

## Configuração

Edite as constantes no topo de `src/App.jsx`:

- **WEBHOOK_URL**: URL do webhook para receber os dados (nome, WhatsApp, nível, pontuação, respostas). Deixe `""` para desativar.
- **WHATSAPP_PHONE**: Número com DDI (ex: `5511999999999`) para o botão "Quero conversar com a Contessa".

## Desenvolvimento

```bash
npm install
npm run dev
```

Acesse http://localhost:5173

## Build para produção

```bash
npm run build
```

Os arquivos estarão em `dist/`. **Para deploy, envie apenas o conteúdo da pasta `dist/`** (index.html + pasta assets). Os outros arquivos (src/, package.json, etc.) são para desenvolvimento e build.

---

## Google Apps Script (planilha)

O quiz envia os dados via POST para uma Web App do Google Apps Script. Para configurar:

1. Crie uma planilha no Google Sheets.
2. Extensões → Apps Script.
3. Cole o código abaixo (ou use o arquivo `scripts/Code.gs` deste repositório).
4. Implantar → Nova implantação → Tipo: Aplicativo da Web.
5. **Execute como**: Eu | **Quem tem acesso**: Qualquer pessoa.
6. Copie a URL gerada e use como `WEBHOOK_URL` em `src/App.jsx`.

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  const respostas = data.respostas || [];
  const row = [
    data.timestamp || new Date().toISOString(),
    data.nome || '',
    data.whatsapp || '',
    data.nivel || '',
    data.pontuacao || '',
    ...respostas  // Q1, Q2, ..., Q18 as separate columns
  ];
  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**Importante**: O retorno com `ContentService` e `setMimeType(JSON)` evita erros de CORS. Sem isso, o navegador pode bloquear a requisição.

Na primeira linha da planilha, adicione os cabeçalhos: `Timestamp` | `Nome` | `WhatsApp` | `Nível` | `Pontuação` | `Q1` | `Q2` | `Q3` | ... | `Q18`. Cada coluna Q1–Q18 armazena o valor numérico da resposta (0=Nunca, 1=Raramente, 2=Às vezes, 3=Frequentemente, 4=Sempre).
# karla-quiz
