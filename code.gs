function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Pendaftaran Audiens TVRI - Hari Pangan Nasional 2026')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function simpanData(formObject) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Jika sheet masih kosong, buatkan header
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Waktu Daftar', 'Kode Tiket', 'Nama Lengkap', 'No HP / WA']);
    }
    
    // Hitung jumlah pendaftar
    var totalPendaftar = sheet.getLastRow() - 1; // Kurangi baris header
    var maxKuota = 20;
    
    if (totalPendaftar >= maxKuota) {
      return { success: false, message: 'Mohon maaf, kuota 20 pendaftar sudah penuh!' };
    }
    
    // Buat ID Tiket otomatis (misal: HPN-2026-015)
    var newNumber = totalPendaftar + 1;
    var ticketId = 'HPN-2026-' + ("00" + newNumber).slice(-3);
    var timestamp = new Date();
    
    // Simpan baris ke Google Sheets
    sheet.appendRow([
      timestamp,
      ticketId,
      formObject.fullName,
      "'" + formObject.phoneNumber // Tanda petik agar angka 0 di awal tidak hilang
    ]);
    
    return { 
      success: true, 
      ticketId: ticketId,
      fullName: formObject.fullName,
      phoneNumber: formObject.phoneNumber,
      message: 'Pendaftaran berhasil!' 
    };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function ambilDaftarPeserta() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var list = [];
    
    // Ambil data mulai dari baris ke-2 (mengabaikan header)
    for (var i = 1; i < data.length; i++) {
      list.push({
        time: data[i][0],
        id: data[i][1],
        name: data[i][2],
        phone: data[i][3]
      });
    }
    return { success: true, data: list };
  } catch (e) {
    return { success: false, data: [] };
  }
}