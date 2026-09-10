const SHEET_NAME = 'Pendaftar';
const MAX_CAPACITY = 20;

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['ID Tiket', 'Nama Lengkap', 'No HP', 'Waktu Pendaftaran']);
    sheet.setFrozenRows(1);
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { setup(); sheet = ss.getSheetByName(SHEET_NAME); }
  return sheet;
}

function ambilDaftarPeserta() {
  try {
    const rows = getSheet_().getDataRange().getValues();
    const data = rows.slice(1).filter(row => row[1]).map(row => ({
      id: String(row[0] || ''), name: String(row[1] || ''),
      phone: String(row[2] || ''), time: String(row[3] || '')
    }));
    return { success: true, data: data };
  } catch (err) { return { success: false, message: String(err), data: [] }; }
}

function simpanData(formObject) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const fullName = String(formObject.fullName || '').trim();
    const phoneNumber = String(formObject.phoneNumber || '').trim();
    if (!fullName || !phoneNumber) return { success: false, message: 'Nama dan Nomor HP wajib diisi!' };
    const sheet = getSheet_();
    const participants = sheet.getDataRange().getValues().slice(1).filter(row => row[1]);
    if (participants.length >= MAX_CAPACITY) return { success: false, message: 'Mohon maaf, kuota pendaftaran sudah penuh (20 orang)!' };
    if (participants.some(row => String(row[2] || '').trim() === phoneNumber)) return { success: false, message: 'Nomor WhatsApp ini sudah terdaftar sebelumnya!' };
    const ticketId = 'HPN-2026-' + String(participants.length + 1).padStart(3, '0');
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Makassar', 'dd-MM-yyyy HH:mm:ss');
    sheet.appendRow([ticketId, fullName, phoneNumber, timestamp]);
    return { success: true, ticketId: ticketId, fullName: fullName, phoneNumber: phoneNumber, message: 'Pendaftaran berhasil disimpan.' };
  } catch (err) { return { success: false, message: 'Terjadi kesalahan server: ' + String(err) }; }
  finally { if (lock.hasLock()) lock.releaseLock(); }
}

function json_(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }

function doGet(e) {
  if ((e.parameter.action || '') !== 'participants') return json_({ success: false, message: 'Endpoint aktif.' });
  return json_(ambilDaftarPeserta());
}

function doPost(e) {
  try { return json_(simpanData(JSON.parse((e.postData && e.postData.contents) || '{}'))); }
  catch (err) { return json_({ success: false, message: 'Format data tidak valid.' }); }
}
