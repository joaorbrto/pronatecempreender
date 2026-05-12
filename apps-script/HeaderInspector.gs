function listHeadersForDashboard() {
  var spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = getSheetForInspector_(spreadsheet);
  if (!sheet) throw new Error('Aba nao encontrada: ' + CONFIG.SHEET_NAME);

  var lastColumn = sheet.getLastColumn();
  var lastRow = sheet.getLastRow();
  var headers = lastColumn > 0 ? sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0] : [];

  var result = {
    spreadsheetId: CONFIG.SPREADSHEET_ID,
    sheetName: sheet.getName(),
    responseCount: Math.max(lastRow - 1, 0),
    headerCount: headers.length,
    headers: headers
  };

  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function getSheetForInspector_(spreadsheet) {
  var sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  if (sheet) return sheet;

  var expectedName = normalizeText_(CONFIG.SHEET_NAME);
  var sheets = spreadsheet.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (normalizeText_(sheets[i].getName()) === expectedName) return sheets[i];
  }
  return null;
}
