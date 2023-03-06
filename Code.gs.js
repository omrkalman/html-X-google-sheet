const sheetName = 'Sheet1';
const scriptProp = PropertiesService.getScriptProperties();

const initialSetup = () => {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty('key', activeSpreadsheet.getId());
}

// handle GET
const doGet = (e) => {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    // setting up the sheet
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    const sheet = doc.getSheetByName(sheetName); 

    // getting the header (column name) from the GET request.
    const { header } = e.parameter;

    // getting the headers (column names) from the sheet.
    const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];

    // finding the correct column based on the header (column name).
    const column = headers.indexOf(header) + 1; // adding 1 because index is 0-based, and sheet is 1-based.

    // getting the values from the desired column.
    const dataRaw = sheet.getRange(2, column, sheet.getLastRow()-1, 1).getValues().map(item => item[0]);

    const data = Array.from(new Set(dataRaw));

    // returning
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', data }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', error }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// handle POST
const doPost = (e) => {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    // setting up the sheet
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    const sheet = doc.getSheetByName(sheetName); 

    // getting the headers (column names) from the sheet.
    const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];

    // creating a new row of values from the POST body.
    const newRow = headers.map((header) => {
      return header === 'Date' ? new Date() : e.parameter[header];
    });

    // inserting the new row.
    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    // returning
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', error }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}












