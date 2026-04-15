/**
 * Google Apps Script - Quiz Webhook
 * Copy this file content to Extensões → Apps Script in your Google Sheet.
 * Sheet: Row 1 = Timestamp | Nome | Email | WhatsApp | Nível | Pontuação | Q1 | Q2 | ... | Q18
 *        Row 2 = (empty for first 6 cols) | question text for Q1-Q18
 */

// ============ CONFIGURATION ============
var OWNER_EMAIL = 'karla@example.com'; // <-- Update with Karla's real email address

var QUESTIONS = [
  'Eu acordo já me sentindo cansada, mesmo após uma noite de sono.',
  'Minha mente continua ativa mesmo quando tento descansar.',
  'Sinto culpa quando tiro tempo para mim.',
  'Tenho dificuldade de dizer "não", mesmo quando já estou sobrecarregada.',
  'Sinto que estou sempre correndo, mas nunca finalizando tudo.',
  'Percebo irritação ou impaciência maior do que gostaria.',
  'Sinto que ninguém percebe o quanto eu estou sustentando.',
  'Adio autocuidado básico (alimentação, pausas, consultas).',
  'Tenho a sensação de que, se eu parar, tudo desorganiza.',
  'Me comparo com outras mulheres e sinto que estou ficando para trás.',
  'Choro com mais facilidade ou fico emocionalmente mais sensível.',
  'Sinto que perdi parte da minha identidade fora das minhas obrigações.',
  'Tenho dificuldade de relaxar sem estar produzindo algo.',
  'Sinto tensão física frequente (mandíbula, ombros, cabeça).',
  'Penso que deveria dar conta melhor do que estou dando.',
  'Sinto que estou vivendo no automático.',
  'Tenho dificuldade de sentir prazer nas coisas simples.',
  'Já pensei que não aguento manter esse ritmo por muito tempo.',
];

function setupHeaders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();

  if (lastRow === 0) {
    var headerRow1 = ['Timestamp', 'Nome', 'Email', 'WhatsApp', 'Nível', 'Pontuação'];
    for (var i = 1; i <= 18; i++) {
      headerRow1.push('Q' + i);
    }
    sheet.getRange(1, 1, 1, headerRow1.length).setValues([headerRow1]);

    var headerRow2 = ['', '', '', '', '', ''];
    QUESTIONS.forEach(function (q) {
      headerRow2.push(q);
    });
    sheet.getRange(2, 1, 1, headerRow2.length).setValues([headerRow2]);
    return;
  }

  if (lastRow === 1) {
    var headerRow2 = ['', '', '', '', '', ''];
    QUESTIONS.forEach(function (q) {
      headerRow2.push(q);
    });
    sheet.getRange(2, 1, 1, headerRow2.length).setValues([headerRow2]);
  }
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() < 2) {
    setupHeaders();
  }
  var data = JSON.parse(e.postData.contents);

  // Save to sheet
  var respostas = data.respostas || [];
  var row = [
    data.timestamp || new Date().toISOString(),
    data.nome || '',
    data.email || '',
    data.whatsapp || '',
    data.nivel || '',
    data.pontuacao || ''
  ];
  row = row.concat(respostas);
  sheet.appendRow(row);

  // Send result email to user
  if (data.email) {
    var firstName = (data.nome || '').trim().split(/\s+/)[0] || '';
    var userSubject = 'Seu resultado: Escala de Cansaço Emocional Feminino';
    var userBody =
      'Olá ' + firstName + ',\n\n' +
      'Obrigada por responder o diagnóstico. Aqui está o seu resultado:\n\n' +
      '🔹 Nível: ' + (data.nivel || '') + '\n' +
      '🔹 Pontuação: ' + (data.pontuacao || '') + ' / 72\n\n' +
      '---\n\n' +
      (data.devolutiva || '') + '\n\n' +
      '---\n\n' +
      'Karla Arantes\n' +
      'Psicóloga Clínica • CRP 04/71970';

    MailApp.sendEmail({
      to: data.email,
      subject: userSubject,
      body: userBody
    });
  }

  // Notify owner of new submission
  if (OWNER_EMAIL) {
    var ownerSubject = 'Nova resposta no quiz — ' + (data.nome || 'Sem nome');
    var ownerBody =
      'Nova submissão recebida:\n\n' +
      'Nome: ' + (data.nome || '') + '\n' +
      'Email: ' + (data.email || '') + '\n' +
      'WhatsApp: ' + (data.whatsapp || '') + '\n' +
      'Nível: ' + (data.nivel || '') + '\n' +
      'Pontuação: ' + (data.pontuacao || '') + ' / 72\n' +
      'Data/hora: ' + (data.timestamp || '') + '\n\n' +
      'Acesse a planilha para ver todas as respostas.';

    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: ownerSubject,
      body: ownerBody
    });
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
