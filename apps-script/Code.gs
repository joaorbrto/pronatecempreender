var CONFIG = {
  SPREADSHEET_ID: '1p8q1BQAgTk-_3TUBNEoLXXteM60NNwg5ePCFoze7tHk',
  SHEET_NAME: 'Respostas ao formulario 1',
  CPF_COLUMN: 'CPF (somente os numeros)',
  NAME_COLUMN: 'Nome Completo',
  COURSE_COLUMN: 'Para qual curso voce esta se inscrevendo?',
  RECAPTCHA_SECRET_KEY: 'COLE_AQUI_A_SECRET_KEY_RECAPTCHA_V2',
  ADMIN_ACCESS_KEY: 'COLE_AQUI_UMA_CHAVE_ADMIN',
  FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSdw12nttWOfb4chxPK_zeucc97I5Tf4wg6naV1AGBx9FwIe7g/viewform?usp=header'
};

function doPost(e) {
  try {
    var body = readJson_(e);
    if (!body || !body.action) return error_('invalid_request');
    if (body.action === 'dashboardSummary') return dashboardSummary_(body);
    if (body.action !== 'validateCpf') return error_('invalid_request');

    var cpf = onlyDigits_(body.cpf);
    if (cpf.length !== 11 || !body.captchaToken) return error_('invalid_request');
    if (!isCaptchaValid_(body.captchaToken)) return error_('invalid_captcha');

    var record = findRecord_(cpf);
    if (!record) return json_({ ok: true, found: false, formUrl: CONFIG.FORM_URL });
    return json_({ ok: true, found: true, data: { name: maskName_(record.name), course: record.course } });
  } catch (err) {
    console.error(err);
    return error_('server_error');
  }
}

function readJson_(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return null;
    return JSON.parse(e.postData.contents);
  } catch (err) {
    return null;
  }
}

function isCaptchaValid_(token) {
  if (!CONFIG.RECAPTCHA_SECRET_KEY || CONFIG.RECAPTCHA_SECRET_KEY.indexOf('COLE_AQUI') === 0) return false;
  var response = UrlFetchApp.fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'post',
    payload: { secret: CONFIG.RECAPTCHA_SECRET_KEY, response: token },
    muteHttpExceptions: true
  });
  var result = JSON.parse(response.getContentText() || '{}');
  return result.success === true;
}

function findRecord_(cpf) {
  var sheet = getSheet_();
  if (!sheet) throw new Error('Aba nao encontrada: ' + CONFIG.SHEET_NAME);

  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  if (lastRow < 2 || lastColumn < 1) return null;

  var headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
  var cpfCol = findColumn_(headers, CONFIG.CPF_COLUMN) + 1;
  var nameCol = findColumn_(headers, CONFIG.NAME_COLUMN) + 1;
  var courseCol = findColumn_(headers, CONFIG.COURSE_COLUMN) + 1;
  var cpfValues = sheet.getRange(2, cpfCol, lastRow - 1, 1).getDisplayValues();

  for (var i = cpfValues.length - 1; i >= 0; i--) {
    if (onlyDigits_(cpfValues[i][0]) === cpf) {
      var rowNumber = i + 2;
      return {
        name: sheet.getRange(rowNumber, nameCol).getDisplayValue() || '',
        course: sheet.getRange(rowNumber, courseCol).getDisplayValue() || ''
      };
    }
  }
  return null;
}

function dashboardSummary_(body) {
  if (!CONFIG.ADMIN_ACCESS_KEY || CONFIG.ADMIN_ACCESS_KEY.indexOf('COLE_AQUI') === 0) return error_('server_error');
  if (String(body.accessKey || '') !== CONFIG.ADMIN_ACCESS_KEY) return error_('unauthorized');

  var sheet = getSheet_();
  if (!sheet) throw new Error('Aba nao encontrada: ' + CONFIG.SHEET_NAME);

  var rows = sheet.getDataRange().getDisplayValues();
  if (rows.length < 2) return json_({ ok: true, summary: emptyDashboardSummary_() });

  var headers = rows[0];
  var indexes = getDashboardIndexes_(headers);
  var summary = emptyDashboardSummary_();
  summary.totalResponses = rows.length - 1;

  var cpfSeen = {};
  var duplicateCpfSeen = {};

  for (var rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    var row = rows[rowIndex];
    var cpf = onlyDigits_(getCell_(row, indexes.cpf));
    var city = firstNonEmpty_(row, indexes.city);
    var state = normalizeStateLabel_(getCell_(row, indexes.state));
    var source = firstNonEmpty_(row, indexes.source);
    var otherTraining = firstNonEmpty_(row, indexes.otherTraining);

    addCount_(summary.byCourse, getCell_(row, indexes.course));
    addCount_(summary.byCity, city);
    addCount_(summary.byState, state);
    addCount_(summary.byRegion, regionFromState_(state));
    addCount_(summary.byAgeRange, ageRange_(getCell_(row, indexes.age)));
    addCount_(summary.byGender, getCell_(row, indexes.gender));
    addCount_(summary.byEducation, getCell_(row, indexes.education));
    addCount_(summary.byOccupation, getCell_(row, indexes.occupation));
    addCount_(summary.byIncome, getCell_(row, indexes.income));
    addCount_(summary.byRace, getCell_(row, indexes.race));
    addCount_(summary.byZone, getCell_(row, indexes.zone));
    addCount_(summary.byStudentStatus, getCell_(row, indexes.studentStatus));
    addCount_(summary.byOfferingInstitution, getCell_(row, indexes.offeringInstitution));
    addCount_(summary.byChildren, getCell_(row, indexes.children));
    addCount_(summary.byBenefit, getCell_(row, indexes.benefit));
    addCount_(summary.byTraditionalCommunity, getCell_(row, indexes.traditionalCommunity));
    addCount_(summary.byDisability, getCell_(row, indexes.disability));
    addCount_(summary.byInternetAccess, getCell_(row, indexes.internetAccess));
    addCount_(summary.byInternetMode, getCell_(row, indexes.internetMode));
    addCount_(summary.byDeviceAccess, getCell_(row, indexes.deviceAccess));
    addCount_(summary.byOwnBusiness, getCell_(row, indexes.ownBusiness));
    addCount_(summary.byCnpj, getCell_(row, indexes.cnpj));
    addCount_(summary.byCompanySize, getCell_(row, indexes.companySize));
    addCount_(summary.byBusinessSector, getCell_(row, indexes.businessSector));
    addCount_(summary.bySalesChannel, getCell_(row, indexes.salesChannel));
    addCount_(summary.byBusinessAge, getCell_(row, indexes.businessAge));
    addCount_(summary.byRevenue, getCell_(row, indexes.revenue));
    addCount_(summary.byBusinessChallenge, getCell_(row, indexes.businessChallenge));
    addCount_(summary.bySource, source);
    addCount_(summary.byOtherTraining, otherTraining);

    addLevel_(summary.courseReadiness.entrepreneurship, getCell_(row, indexes.entrepreneurshipLevel));
    addLevel_(summary.courseReadiness.ai, getCell_(row, indexes.aiLevel));
    addLevel_(summary.courseReadiness.digitalTools, getCell_(row, indexes.digitalToolsLevel));
    addLevel_(summary.courseReadiness.drones, getCell_(row, indexes.droneExperience));
    addLevel_(summary.courseReadiness.apps, getCell_(row, indexes.appDevLevel));

    if (cpf) {
      summary.uniqueCpfs += cpfSeen[cpf] ? 0 : 1;
      if (cpfSeen[cpf]) duplicateCpfSeen[cpf] = true;
      cpfSeen[cpf] = true;
    } else {
      summary.quality.missingCpf += 1;
    }
    if (!getCell_(row, indexes.course)) summary.quality.missingCourse += 1;
    if (!city) summary.quality.missingCity += 1;
    if (!getCell_(row, indexes.email)) summary.quality.missingEmail += 1;
    if (!getCell_(row, indexes.phone)) summary.quality.missingPhone += 1;
  }

  summary.duplicateCpfs = objectKeyCount_(duplicateCpfSeen);
  trimSummaryLists_(summary);
  return json_({ ok: true, summary: summary });
}

function emptyDashboardSummary_() {
  return {
    totalResponses: 0,
    uniqueCpfs: 0,
    duplicateCpfs: 0,
    byCourse: [],
    byCity: [],
    byState: [],
    byRegion: [],
    byAgeRange: [],
    byGender: [],
    byEducation: [],
    byOccupation: [],
    byIncome: [],
    byRace: [],
    byZone: [],
    byStudentStatus: [],
    byOfferingInstitution: [],
    byChildren: [],
    byBenefit: [],
    byTraditionalCommunity: [],
    byDisability: [],
    byInternetAccess: [],
    byInternetMode: [],
    byDeviceAccess: [],
    byOwnBusiness: [],
    byCnpj: [],
    byCompanySize: [],
    byBusinessSector: [],
    bySalesChannel: [],
    byBusinessAge: [],
    byRevenue: [],
    byBusinessChallenge: [],
    bySource: [],
    byOtherTraining: [],
    courseReadiness: {
      entrepreneurship: [],
      ai: [],
      digitalTools: [],
      drones: [],
      apps: []
    },
    quality: {
      missingCpf: 0,
      missingCourse: 0,
      missingCity: 0,
      missingEmail: 0,
      missingPhone: 0
    }
  };
}

function getDashboardIndexes_(headers) {
  return {
    email: findColumnLoose_(headers, ['endereco de e-mail', 'email']),
    cpf: findColumnLoose_(headers, [CONFIG.CPF_COLUMN, 'cpf']),
    course: findColumnLoose_(headers, [CONFIG.COURSE_COLUMN, 'para qual curso']),
    name: findColumnLoose_(headers, [CONFIG.NAME_COLUMN, 'nome completo']),
    gender: findColumnLoose_(headers, ['sexo']),
    age: findColumnExactOrLoose_(headers, ['idade']),
    phone: findColumnLoose_(headers, ['telefone']),
    education: findColumnLoose_(headers, ['qual sua escolaridade']),
    occupation: findColumnLoose_(headers, ['ocupacao atual']),
    income: findColumnLoose_(headers, ['renda familiar']),
    zone: findColumnLoose_(headers, ['voce reside em qual zona']),
    state: findColumnLoose_(headers, ['estado']),
    race: findColumnLoose_(headers, ['raca / cor', 'raca']),
    studentStatus: findColumnLoose_(headers, ['atualmente e estudante de alguma instituicao']),
    offeringInstitution: findColumnLoose_(headers, ['voce estuda na instituicao que esta oferecendo']),
    children: findColumnLoose_(headers, ['voce tem filhos']),
    benefit: findColumnLoose_(headers, ['voce recebe algum beneficio']),
    traditionalCommunity: findColumnLoose_(headers, ['voce pertence a algum povo ou comunidade tradicional']),
    disability: findColumnLoose_(headers, ['voce e uma pessoa com deficiencia']),
    internetAccess: findColumnLoose_(headers, ['voce tem acesso a internet']),
    internetMode: findColumnLoose_(headers, ['como voce acessa a internet']),
    deviceAccess: findColumnLoose_(headers, ['voce possui acesso a algum equipamento']),
    ownBusiness: findColumnLoose_(headers, ['voce possui negocio proprio']),
    cnpj: findColumnLoose_(headers, ['seu negocio possui cnpj']),
    companySize: findColumnLoose_(headers, ['porte da sua empresa']),
    businessSector: findColumnLoose_(headers, ['ramo de atividade principal']),
    salesChannel: findColumnLoose_(headers, ['onde voce realiza suas vendas']),
    businessAge: findColumnLoose_(headers, ['tempo de existencia do seu negocio']),
    revenue: findColumnLoose_(headers, ['faturamento mensal']),
    businessChallenge: findColumnLoose_(headers, ['areas do seu negocio voce encontra mais dificuldades']),
    source: findAllColumnsLoose_(headers, ['como ficou sabendo do curso']),
    otherTraining: findAllColumnsLoose_(headers, ['outras capacitacoes']),
    city: findAllColumnsLoose_(headers, ['cidade:']),
    entrepreneurshipLevel: findColumnLoose_(headers, ['conhecimento previo em empreendedorismo']),
    aiLevel: findColumnLoose_(headers, ['conhecimento sobre inteligencia artificial']),
    digitalToolsLevel: findColumnLoose_(headers, ['uso de ferramentas digitais']),
    droneExperience: findColumnLoose_(headers, ['experiencia previa com drones']),
    appDevLevel: findColumnLoose_(headers, ['conhecimento previo em desenvolvimento de aplicativos'])
  };
}

function findColumnLoose_(headers, names) {
  var indexes = findAllColumnsLoose_(headers, names);
  return indexes.length ? indexes[0] : -1;
}

function findColumnExactOrLoose_(headers, names) {
  for (var i = 0; i < headers.length; i++) {
    var header = normalizeText_(headers[i]);
    for (var j = 0; j < names.length; j++) {
      if (header === normalizeText_(names[j])) return i;
    }
  }
  return findColumnLoose_(headers, names);
}

function findAllColumnsLoose_(headers, names) {
  var indexes = [];
  for (var i = 0; i < headers.length; i++) {
    var header = normalizeText_(headers[i]);
    for (var j = 0; j < names.length; j++) {
      if (header.indexOf(normalizeText_(names[j])) !== -1) {
        indexes.push(i);
        break;
      }
    }
  }
  return indexes;
}

function getCell_(row, index) {
  if (index === -1 || index === null || index === undefined) return '';
  return String(row[index] || '').replace(/^\s+|\s+$/g, '');
}

function firstNonEmpty_(row, indexes) {
  for (var i = 0; i < indexes.length; i++) {
    var value = getCell_(row, indexes[i]);
    if (value) return value;
  }
  return '';
}

function addCount_(list, value) {
  var label = String(value || '').replace(/^\s+|\s+$/g, '');
  if (!label) label = 'Nao informado';
  label = label.replace(/\s+/g, ' ');
  for (var i = 0; i < list.length; i++) {
    if (list[i].label === label) {
      list[i].count += 1;
      return;
    }
  }
  list.push({ label: label, count: 1 });
}

function addLevel_(list, value) {
  if (value) addCount_(list, value);
}

function ageRange_(value) {
  var text = String(value || '').replace(',', '.');
  var match = text.match(/\d{1,3}(\.\d+)?/);
  var age = match ? Math.floor(Number(match[0])) : 0;
  if (!age || age < 10 || age > 110) return 'Nao informado';
  if (age <= 17) return 'Ate 17';
  if (age <= 24) return '18 a 24';
  if (age <= 34) return '25 a 34';
  if (age <= 44) return '35 a 44';
  if (age <= 59) return '45 a 59';
  return '60+';
}

function normalizeStateLabel_(value) {
  var text = normalizeText_(value).toUpperCase();
  if (!text) return '';

  var states = stateMap_();
  if (states[text]) return text + ' - ' + states[text].name;

  for (var key in states) {
    if (states.hasOwnProperty(key) && text.indexOf(normalizeText_(states[key].name).toUpperCase()) !== -1) {
      return key + ' - ' + states[key].name;
    }
  }

  return String(value || '').replace(/^\s+|\s+$/g, '');
}

function regionFromState_(stateLabel) {
  var text = normalizeText_(stateLabel).toUpperCase();
  if (!text) return 'Nao informado';

  var states = stateMap_();
  var uf = text.length >= 2 ? text.substring(0, 2) : text;
  if (states[uf]) return states[uf].region;

  for (var key in states) {
    if (states.hasOwnProperty(key) && text.indexOf(normalizeText_(states[key].name).toUpperCase()) !== -1) {
      return states[key].region;
    }
  }

  return 'Nao identificado';
}

function stateMap_() {
  return {
    AC: { name: 'Acre', region: 'Norte' },
    AL: { name: 'Alagoas', region: 'Nordeste' },
    AP: { name: 'Amapa', region: 'Norte' },
    AM: { name: 'Amazonas', region: 'Norte' },
    BA: { name: 'Bahia', region: 'Nordeste' },
    CE: { name: 'Ceara', region: 'Nordeste' },
    DF: { name: 'Distrito Federal', region: 'Centro-Oeste' },
    ES: { name: 'Espirito Santo', region: 'Sudeste' },
    GO: { name: 'Goias', region: 'Centro-Oeste' },
    MA: { name: 'Maranhao', region: 'Nordeste' },
    MT: { name: 'Mato Grosso', region: 'Centro-Oeste' },
    MS: { name: 'Mato Grosso do Sul', region: 'Centro-Oeste' },
    MG: { name: 'Minas Gerais', region: 'Sudeste' },
    PA: { name: 'Para', region: 'Norte' },
    PB: { name: 'Paraiba', region: 'Nordeste' },
    PR: { name: 'Parana', region: 'Sul' },
    PE: { name: 'Pernambuco', region: 'Nordeste' },
    PI: { name: 'Piaui', region: 'Nordeste' },
    RJ: { name: 'Rio de Janeiro', region: 'Sudeste' },
    RN: { name: 'Rio Grande do Norte', region: 'Nordeste' },
    RS: { name: 'Rio Grande do Sul', region: 'Sul' },
    RO: { name: 'Rondonia', region: 'Norte' },
    RR: { name: 'Roraima', region: 'Norte' },
    SC: { name: 'Santa Catarina', region: 'Sul' },
    SP: { name: 'Sao Paulo', region: 'Sudeste' },
    SE: { name: 'Sergipe', region: 'Nordeste' },
    TO: { name: 'Tocantins', region: 'Norte' }
  };
}

function objectKeyCount_(object) {
  var count = 0;
  for (var key in object) {
    if (object.hasOwnProperty(key)) count += 1;
  }
  return count;
}

function trimSummaryLists_(summary) {
  var fields = ['byCourse', 'byCity', 'byState', 'byRegion', 'byAgeRange', 'byGender', 'byEducation', 'byOccupation', 'byIncome', 'byRace', 'byZone', 'byStudentStatus', 'byOfferingInstitution', 'byChildren', 'byBenefit', 'byTraditionalCommunity', 'byDisability', 'byInternetAccess', 'byInternetMode', 'byDeviceAccess', 'byOwnBusiness', 'byCnpj', 'byCompanySize', 'byBusinessSector', 'bySalesChannel', 'byBusinessAge', 'byRevenue', 'byBusinessChallenge', 'bySource', 'byOtherTraining'];
  for (var i = 0; i < fields.length; i++) {
    summary[fields[i]] = topCounts_(summary[fields[i]], 12);
  }
  summary.courseReadiness.entrepreneurship = topCounts_(summary.courseReadiness.entrepreneurship, 8);
  summary.courseReadiness.ai = topCounts_(summary.courseReadiness.ai, 8);
  summary.courseReadiness.digitalTools = topCounts_(summary.courseReadiness.digitalTools, 8);
  summary.courseReadiness.drones = topCounts_(summary.courseReadiness.drones, 8);
  summary.courseReadiness.apps = topCounts_(summary.courseReadiness.apps, 8);
}

function topCounts_(list, limit) {
  list.sort(function(a, b) {
    return b.count - a.count;
  });
  return list.slice(0, limit);
}

function getSheet_() {
  var spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  if (sheet) return sheet;

  var expectedName = normalizeText_(CONFIG.SHEET_NAME);
  var sheets = spreadsheet.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (normalizeText_(sheets[i].getName()) === expectedName) return sheets[i];
  }
  return null;
}

function findColumn_(headers, columnName) {
  var expected = normalizeText_(columnName);
  for (var i = 0; i < headers.length; i++) {
    if (normalizeText_(headers[i]) === expected) return i;
  }
  throw new Error('Coluna nao encontrada: ' + columnName);
}

function onlyDigits_(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 11);
}

function normalizeText_(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
}

function maskName_(name) {
  var parts = String(name || '').replace(/^\s+|\s+$/g, '').split(/\s+/);
  if (!parts.length || !parts[0]) return '';
  for (var i = 1; i < parts.length; i++) parts[i] = parts[i].charAt(0).toUpperCase() + '.';
  return parts.join(' ');
}

function error_(code) {
  return json_({ ok: false, error: code });
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
