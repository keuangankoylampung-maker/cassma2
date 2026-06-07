/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GasFile {
  name: string;
  description: string;
  code: string;
}

export const GAS_FILES: GasFile[] = [
  {
    name: 'Code.gs',
    description: 'Main entry point of the Google Apps Script Web App, handling routing, CORS, and HTTP request routing (GET & POST).',
    code: `/**
 * ==========================================
 * Code.gs - Google Apps Script Web App Router
 * SIPES: Sistem Penerimaan Pembayaran Sekolah
 * ==========================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets.
 * 2. Click Extensions > Apps Script.
 * 3. Delete any default code and create files with matching names.
 * 4. Paste these codes.
 * 5. Deploy as Web App: Deploy > New Deployment > Select Type: Web App.
 *    - Execute as: Me (your-email@gmail.com)
 *    - Who has access: Anyone
 * 6. Copy the Web App URL and paste it in the SIPES app settings panel.
 */

// Handle HTTP GET Requests
function doGet(e) {
  var action = e.parameter.action;
  var response = {};
  
  try {
    // Initial connection handshake
    if (!action || action === "handshake") {
      response = {
        status: "success",
        connected: true,
        spreadsheetName: SpreadsheetApp.getActiveSpreadsheet().getName(),
        message: "Koneksi berhasil! Handshake terselesaikan."
      };
    } else {
      response = runGetAction(action, e.parameter);
    }
  } catch (error) {
    response = { status: "error", message: error.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle HTTP POST Requests
function doPost(e) {
  var response = {};
  
  try {
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    var action = payload.action;
    
    if (action === "initDatabase") {
      response = initDatabase();
    } else {
      response = runPostAction(action, payload);
    }
  } catch (error) {
    response = { status: "error", message: error.toString() };
  }
  
  // Set CORS headers for React Apps
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// Router for GET actions
function runGetAction(action, params) {
  switch (action) {
    case "getMetadata":
      return {
        status: "success",
        spreadsheetName: SpreadsheetApp.getActiveSpreadsheet().getName(),
        sheets: SpreadsheetApp.getActiveSpreadsheet().getSheets().map(s => s.getName())
      };
    case "pullDatabase":
      return {
        status: "success",
        siswa: getTableData("Siswa"),
        jenisPembayaran: getTableData("Jenis_Pembayaran"),
        tarifSiswa: getTableData("Tarif_Siswa"),
        tagihan: getTableData("Tagihan"),
        transaksi: getTableData("Transaksi"),
        detailTransaksi: getTableData("Detail_Transaksi"),
        users: getTableData("Users")
      };
    case "getDashboardStats":
      return getDashboardMetrics();
    default:
      return { status: "error", message: "Aksi GET '" + action + "' tidak dikenali." };
  }
}

// Router for POST actions
function runPostAction(action, payload) {
  switch (action) {
    case "pushDatabase":
      return pushFullDatabase(payload.data);
    case "syncSiswa":
      return syncSiswaTable(payload.siswa);
    case "addSiswa":
      return insertRow("Siswa", payload.data);
    case "editSiswa":
      return updateRow("Siswa", "ID", payload.id, payload.data);
    case "deleteSiswa":
      return deleteRow("Siswa", "ID", payload.id);
    case "addJenisPembayaran":
      return insertRow("Jenis_Pembayaran", payload.data);
    case "addTarif":
      return insertRow("Tarif_Siswa", payload.data);
    case "generateTagihan":
      return generateBilling(payload.nis, payload.kodePembayaran, payload.type, payload.periode, payload.nominal);
    case "commitTransaction":
      return processPaymentTransaction(payload.transaction, payload.details);
    case "deleteTransaction":
      return removeTransaction(payload.noTransaksi);
    case "verifyAuth":
      return verifyUserLogin(payload.username, payload.password);
    default:
      return { status: "error", message: "Aksi POST '" + action + "' tidak dikenali." };
  }
}
`
  },
  {
    name: 'Database.gs',
    description: 'Database engine functions that initialize Sheets, enforce auto-increment indices, and handle high-volume reads and writes.',
    code: `/**
 * ==========================================
 * Database.gs - Sheets Database Operations
 * ==========================================
 */

// Sheets configuration schemas
var SCHEMAS = {
  "Siswa": ["ID", "NIS", "NISN", "Nama", "Kelas", "Alamat", "HP", "Status"],
  "Jenis_Pembayaran": ["ID", "Kode", "Nama", "Jenis", "Tahun_Ajaran", "Aktif"],
  "Tarif_Siswa": ["ID", "NIS", "Kode_Pembayaran", "Nominal"],
  "Tagihan": ["ID", "NIS", "Kode_Pembayaran", "Periode", "Nominal", "Status", "Terbayar"],
  "Transaksi": ["ID", "No_Transaksi", "Tanggal", "NIS", "Total", "Petugas"],
  "Detail_Transaksi": ["ID", "No_Transaksi", "Tagihan_ID", "Nominal"],
  "Users": ["ID", "Username", "Password", "Role"]
};

// Initialize Google Spreadsheet Tables with Correct Columns
function initDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var log = [];
  
  for (var sheetName in SCHEMAS) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(SCHEMAS[sheetName]);
      log.push("Sheet '" + sheetName + "' berhasil dibuat.");
      
      // Auto formatting Header Row
      var headerRange = sheet.getRange(1, 1, 1, SCHEMAS[sheetName].length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#3b82f6"); // Royal Blue
      headerRange.setFontColor("#ffffff");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    } else {
      log.push("Sheet '" + sheetName + "' sudah ada.");
    }
  }
  
  // Create default admin user if sheet is empty
  var userSheet = ss.getSheetByName("Users");
  if (userSheet.getLastRow() <= 1) {
    userSheet.appendRow(["usr-1", "admin", "123", "Admin"]);
    userSheet.appendRow(["usr-2", "operator", "123", "Operator"]);
    log.push("Default users berhasil ditambahkan.");
  }
  
  return {
    status: "success",
    message: "Inisialisasi database selesai.",
    log: log
  };
}

// Convert Sheet into JSON Rows array
function getTableData(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  if (lastRow <= 1) return []; // Only header exists
  
  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
  
  var result = [];
  for (var i = 0; i < values.length; i++) {
    var item = {};
    for (var j = 0; j < headers.length; j++) {
      item[headers[j]] = values[i][j];
    }
    result.push(item);
  }
  return result;
}

// Push a full client-side database dump into Sheets (Resync)
function pushFullDatabase(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  for (var key in data) {
    var sheetName = mapClientKeyToSheetName(key);
    if (!sheetName) continue;
    
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) continue;
    
    // Clear everything except headers
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    
    var schema = SCHEMAS[sheetName];
    var dataRows = data[key];
    
    if (dataRows && dataRows.length > 0) {
      var rowsToWrite = [];
      for (var i = 0; i < dataRows.length; i++) {
        var rowJson = dataRows[i];
        var rowArr = [];
        for (var j = 0; j < schema.length; j++) {
          var field = schema[j];
          var rawVal = rowJson[mapSheetFieldToClientKey(field)];
          rowArr.push(rawVal !== undefined ? rawVal : "");
        }
        rowsToWrite.push(rowArr);
      }
      
      if (rowsToWrite.length > 0) {
        sheet.getRange(2, 1, rowsToWrite.length, schema.length).setValues(rowsToWrite);
      }
    }
  }
  
  return { status: "success", message: "Sinkronisasi balik ke Spreadsheet berhasil!" };
}

// Map frontend camelCase to Sheets snake_case/PascalCase
function mapClientKeyToSheetName(clientKey) {
  var mapping = {
    "siswa": "Siswa",
    "jenisPembayaran": "Jenis_Pembayaran",
    "tarifSiswa": "Tarif_Siswa",
    "tagihan": "Tagihan",
    "transaksi": "Transaksi",
    "detailTransaksi": "Detail_Transaksi",
    "users": "Users"
  };
  return mapping[clientKey] || null;
}

function mapSheetFieldToClientKey(field) {
  var mapping = {
    // Siswa
    "ID": "id", "NIS": "nis", "NISN": "nisn", "Nama": "nama", "Kelas": "kelas", "Alamat": "alamat", "HP": "noHp", "Status": "statusAktif",
    // Jenis_Pembayaran
    "Kode": "kode", "Jenis": "jenis", "Tahun_Ajaran": "tahunAjaran", "NominalDefault": "nominalDefault", "Aktif": "aktif",
    // Tarif_Siswa
    "Kode_Pembayaran": "kodePembayaran", "Nominal": "nominal",
    // Tagihan
    "Periode": "periode", "Terbayar": "terbayar",
    // Transaksi
    "No_Transaksi": "noTransaksi", "Tanggal": "tanggal", "Total": "total", "Petugas": "petugas",
    // Detail_Transaksi
    "Tagihan_ID": "tagihanId",
    // Users
    "Username": "username", "Password": "password", "Role": "role"
  };
  return mapping[field] || field.toLowerCase();
}
`
  },
  {
    name: 'Siswa.gs',
    description: 'Deploys CRUD wrappers specifically targeted at Student metadata registry, tracking actives/inactives, and parsing bulk imports.',
    code: `/**
 * ==========================================
 * Siswa.gs - Student CRUD Operations & Bulk Import
 * ==========================================
 */

// Insert dynamic row helper
function insertRow(sheetName, itemJson) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet '" + sheetName + "' tidak ditemukan.");
  
  var schema = SCHEMAS[sheetName];
  var rowData = [];
  
  for (var i = 0; i < schema.length; i++) {
    var field = schema[i];
    var clientKey = mapSheetFieldToClientKey(field);
    rowData.push(itemJson[clientKey] !== undefined ? itemJson[clientKey] : "");
  }
  
  sheet.appendRow(rowData);
  return { status: "success", message: "Data berhasil ditambahkan pada sheet " + sheetName, data: itemJson };
}

// Update specific row based on Primary Key
function updateRow(sheetName, pkField, pkVal, updateJson) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet '" + sheetName + "' tidak ditemukan.");
  
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  var colIdx = headers.indexOf(pkField) + 1;
  
  if (colIdx === 0) throw new Error("Primary key field '" + pkField + "' tidak ditemukan.");
  
  var pkValues = sheet.getRange(2, colIdx, lastRow - 1, 1).getValues();
  var rowToEdit = -1;
  
  for (var i = 0; i < pkValues.length; i++) {
    if (String(pkValues[i][0]) === String(pkVal)) {
      rowToEdit = i + 2; // Offset header and 0-indexing
      break;
    }
  }
  
  if (rowToEdit === -1) return { status: "error", message: "Data dengan key " + pkVal + " tidak ditemukan." };
  
  // Write specific values based on schema map
  for (var key in updateJson) {
    var sheetField = mapClientKeyToSheetField(key);
    var index = headers.indexOf(sheetField);
    if (index !== -1) {
      sheet.getRange(rowToEdit, index + 1).setValue(updateJson[key]);
    }
  }
  
  return { status: "success", message: "Data berhasil diupdate!" };
}

// Delete row helper
function deleteRow(sheetName, pkField, pkVal) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet '" + sheetName + "' tidak ditemukan.");
  
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  var colIdx = headers.indexOf(pkField) + 1;
  
  if (colIdx === 0) throw new Error("Key field tidak ditemukan.");
  
  var pkValues = sheet.getRange(2, colIdx, lastRow - 1, 1).getValues();
  
  for (var i = 0; i < pkValues.length; i++) {
    if (String(pkValues[i][0]) === String(pkVal)) {
      sheet.deleteRow(i + 2);
      return { status: "success", message: "Data baris berhasil dihapus dari " + sheetName };
    }
  }
  
  return { status: "error", message: "Data baris tidak ditemukan." };
}

function mapClientKeyToSheetField(clientKey) {
  var mapping = {
    "id": "ID", "nis": "NIS", "nisn": "NISN", "nama": "Nama", "kelas": "Kelas",
    "alamat": "Alamat", "noHp": "HP", "statusAktif": "Status",
    "kode": "Kode", "jenis": "Jenis", "tahunAjaran": "Tahun_Ajaran", "nominalDefault": "NominalDefault", "aktif": "Aktif"
  };
  return mapping[clientKey] || clientKey;
}
`
  },
  {
    name: 'Pembayaran.gs',
    description: 'Implements double-entry ledger logic for payments, auto-calculates partial/installments balance, and generates invoice receipts.',
    code: `/**
 * ==========================================
 * Pembayaran.gs - Invoices & Transaction Processing
 * ==========================================
 */

// Generate Billing records (Bulk SPP or Single UPP)
function generateBilling(nisList, kodePembayaran, type, periodeList, nominal) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Tagihan");
  if (!sheet) throw new Error("Sheet Tagihan belum diinisialisasi.");
  
  var existing = getTableData("Tagihan");
  var count = 0;
  
  for (var i = 0; i < nisList.length; i++) {
    var nis = nisList[i];
    
    for (var j = 0; j < periodeList.length; j++) {
      var period = periodeList[j];
      
      // Duplication Guard: Check if NIS + Kode + Periode already exists
      var exists = existing.some(function(t) {
        return String(t.NIS) === String(nis) && 
               String(t.Kode_Pembayaran) === String(kodePembayaran) && 
               String(t.Periode) === String(period);
      });
      
      if (!exists) {
        var id = "tag-" + Utilities.getUuid().substring(0, 8);
        sheet.appendRow([
          id,
          nis,
          kodePembayaran,
          period,
          nominal,
          "Belum Lunas",
          0
        ]);
        count++;
      }
    }
  }
  
  return { status: "success", message: count + " tagihan sukses dibuat otomatis." };
}

// Process Multi-Bill Payment Cart in clean transaction scope 
function processPaymentTransaction(trx, details) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var trxSheet = ss.getSheetByName("Transaksi");
  var detailSheet = ss.getSheetByName("Detail_Transaksi");
  var tagihanSheet = ss.getSheetByName("Tagihan");
  
  if (!trxSheet || !detailSheet || !tagihanSheet) {
    throw new Error("Layanan database billing tidak lengkap.");
  }
  
  // 1. Save Header Transaksi
  trxSheet.appendRow([
    trx.id,
    trx.noTransaksi,
    trx.tanggal,
    trx.nis,
    trx.total,
    trx.petugas
  ]);
  
  // 2. Loop and record detail rows & patch Invoice Statuses
  var tagihanRows = getTableData("Tagihan");
  var tagihanHeaders = trxSheet.getLastColumn(); // just for sizing references
  
  for (var i = 0; i < details.length; i++) {
    var d = details[i];
    
    // Write detail payment splits
    detailSheet.appendRow([
      d.id,
      d.noTransaksi,
      d.tagihanId,
      d.nominal
    ]);
    
    // Find billing record to modify in spreadsheet
    var tagihanRange = tagihanSheet.getRange(2, 1, tagihanSheet.getLastRow() - 1, 7);
    var tagRowsValues = tagihanRange.getValues();
    
    for (var k = 0; k < tagRowsValues.length; k++) {
      if (String(tagRowsValues[k][0]) === String(d.tagihanId)) {
        var currentNominal = Number(tagRowsValues[k][4]);
        var currentTerbayar = Number(tagRowsValues[k][6]) || 0;
        var incomingNominal = Number(d.nominal);
        
        var newTerbayar = currentTerbayar + incomingNominal;
        var newStatus = "Belum Lunas";
        if (newTerbayar >= currentNominal) {
          newStatus = "Lunas";
        } else if (newTerbayar > 0) {
          newStatus = "Cicilan";
        }
        
        // Col Index (Status is col 6, Terbayar is col 7 in Sheet column numbering)
        tagihanSheet.getRange(k + 2, 6).setValue(newStatus);
        tagihanSheet.getRange(k + 2, 7).setValue(newTerbayar);
        break;
      }
    }
  }
  
  return { status: "success", message: "Transaksi pembayaran multi-tagihan " + trx.noTransaksi + " sukses dibukukan!" };
}

// Void or Rollback transaction completely (Operator disabled)
function removeTransaction(noTrx) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var trxSheet = ss.getSheetByName("Transaksi");
  var dtlSheet = ss.getSheetByName("Detail_Transaksi");
  var tagSheet = ss.getSheetByName("Tagihan");
  
  // Get all details to subtract payments from bills
  var details = getTableData("Detail_Transaksi").filter(function(d) {
    return String(d.No_Transaksi) === String(noTrx);
  });
  
  // Update back the Bill states
  var tagihanValues = tagSheet.getRange(2, 1, tagSheet.getLastRow() - 1, 7).getValues();
  for (var i = 0; i < details.length; i++) {
    var dtl = details[i];
    for (var k = 0; k < tagihanValues.length; k++) {
      if (String(tagihanValues[k][0]) === String(dtl.Tagihan_ID)) {
        var curTerbayar = Number(tagihanValues[k][6]) || 0;
        var deducted = curTerbayar - Number(dtl.Nominal);
        
        var nextStatus = "Belum Lunas";
        if (deducted <= 0) {
          deducted = 0;
          nextStatus = "Belum Lunas";
        } else {
          nextStatus = "Cicilan";
        }
        
        tagSheet.getRange(k + 2, 6).setValue(nextStatus);
        tagSheet.getRange(k + 2, 7).setValue(deducted);
      }
    }
  }
  
  // Delete ledger Rows
  deleteMatchingRows(trxSheet, "No_Transaksi", noTrx);
  deleteMatchingRows(dtlSheet, "No_Transaksi", noTrx);
  
  return { status: "success", message: "Transaksi " + noTrx + " dibatalkan secara permanen." };
}

function deleteMatchingRows(sheet, colName, matchVal) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idx = headers.indexOf(colName);
  if (idx === -1) return;
  
  var rows = sheet.getLastRow();
  for (var i = rows; i >= 2; i--) {
    var cellVal = sheet.getRange(i, idx + 1).getValue();
    if (String(cellVal) === String(matchVal)) {
      sheet.deleteRow(i);
    }
  }
}
`
  },
  {
    name: 'Laporan.gs',
    description: 'Generates reports matching user selections and filters, including class-specific summaries, monthly reports, and dynamic billing matrices.',
    code: `/**
 * ==========================================
 * Laporan.gs - Financial Reports & Analytics
 * ==========================================
 */

// Aggregate stats on gas execution to return to Cas Dashboard
function getDashboardMetrics() {
  var siswa = getTableData("Siswa");
  var tagihan = getTableData("Tagihan");
  var transaksi = getTableData("Transaksi");
  
  var activeStudents = siswa.filter(s => s.Status === "Aktif").length;
  
  var totalTunggakan = 0;
  var totalTagihan = 0;
  tagihan.forEach(function(t) {
    totalTagihan += Number(t.Nominal);
    var sisa = Number(t.Nominal) - (Number(t.Terbayar) || 0);
    totalTunggakan += sisa;
  });
  
  // Today's total (YYYY-MM-DD compared)
  var todayText = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
  var paidToday = 0;
  var paidMonth = 0;
  
  var curMonthYear = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM");
  
  transaksi.forEach(function(trx) {
    var dateStr = String(trx.Tanggal); // "YYYY-MM-DD HH:MM:SS" or dynamic format
    if (dateStr.substring(0, 10) === todayText) {
      paidToday += Number(trx.Total);
    }
    if (dateStr.substring(0, 7) === curMonthYear) {
      paidMonth += Number(trx.Total);
    }
  });
  
  return {
    status: "success",
    metrics: {
      siswaCount: activeStudents,
      tagihanCount: totalTagihan,
      todayTotal: paidToday,
      monthTotal: paidMonth,
      tunggakanTotal: totalTunggakan
    }
  };
}
`
  },
  {
    name: 'Auth.gs',
    description: 'User access role verifier that validates cashiers roles, limits operator permissions, and handles user creation operations.',
    code: `/**
 * ==========================================
 * Auth.gs - Users & Handshake Verification
 * ==========================================
 */

// Verify username and password safely
function verifyUserLogin(username, password) {
  var users = getTableData("Users");
  
  var matched = users.find(function(u) {
    return String(u.Username).toLowerCase() === String(username).toLowerCase() && 
           String(u.Password) === String(password);
  });
  
  if (matched) {
    return {
      status: "success",
      user: {
        id: matched.ID,
        username: matched.Username,
        role: matched.Role
      }
    };
  } else {
    return {
      status: "error",
      message: "Username atau Password salah!"
    };
  }
}
`
  }
];

export const INSTALLATION_GUIDE = `
# DOKUMENTASI INSTALASI & MENYAMBUNGKAN KE SPREADSHEET

Sistem SIPES (Sistem Informasi Pembayaran Sekolah) menggunakan arsitektur dual-mode: **Offline Sandbox Simulator** untuk operasi mandiri tanpa setup, atau **Google Apps Script Live Integration** untuk operasional cloud sesungguhnya menggunakan Google Spreadsheet sebagai database utama sekolah Anda.

---

## 📋 LANGKAH 1: MENYIAPKAN GOOGLE SPREADSHEET

1. Buka Google Drive ([drive.google.com](https://drive.google.com)) menggunakan akun Google Anda.
2. Buat sebuah **Google spreadsheet baru** (atau gunakan file Spreadsheet yang sudah ada).
3. Salin **tautan URL Spreadsheet** dari address bar browser Anda.
Contoh: \`https://docs.google.com/spreadsheets/d/1A2B3C4D5E_XYZ.../edit\`
4. Biarkan Spreadsheet kosong atau kosongkan sheet-sheet lama (Sistem kami akan menata struktur kolom lembar kerja secara otomatis pada Langkah 3).

---

## 🛠️ LANGKAH 2: MEMBUAT GOOGLE APPS SCRIPT WEB APP

1. Buka File Spreadsheet yang Anda persiapkan di atas.
2. Di toolbar atas, pilih menu **Ekstensi (Extensions)** > **Apps Script**.
3. Editor Google Apps Script akan terbuka di tab baru.
4. Strukturkan script script di panel sebelah kiri Editor:
   - Klik ikon **Tambah File (+)** di samping tulisan **File** dan buat 6 berkas Script berikut secara bergantian:
     * \`Code.gs\`
     * \`Database.gs\`
     * \`Siswa.gs\`
     * \`Pembayaran.gs\`
     * \`Laporan.gs\`
     * \`Auth.gs\`
5. Buka tab **Apps Script Code Center** di aplikasi SIPES ini.
6. Salin satu-persatu source code dari masing-masing tab file yang telah kami sediakan, lalu tempelkan (paste) ke berkas yang sesuai di Google Apps Script Editor Anda.
7. Simpan seluruh file dengan menekan tombol **Simpan (Ikon Disket)** atau pintasan tombol \`Ctrl + S\` / \`Cmd + S\`.

---

## 🚀 LANGKAH 3: MENERBITKAN GOOGLE APPS SCRIPT SEBAGAI WEB API (DEPLOYMENT)

Aplikasi SIPES membutuhkan izin akses Web API Apps Script agar dapat terhubung. Anda wajib mendeploy berkas script tersebut:

1. Di pojok kanan atas Editor Apps Script, klik tombol biru **Terapkan (Deploy)** > **Terapkan Baru (New Deployment)**.
2. Klik ikon gerigi pengaturan di samping tulisan "Pilih jenis", lalu pilih **Aplikasi Web (Web App)**.
3. Konfigurasikan form:
   - **Deskripsi**: Tulis \`SIPES V1 Production API\`
   - **Jalankan sebagai (Execute as)**: Pilih **Saya (email_anda@gmail.com)**
   - **Siapa yang memiliki akses (Who has access)**: **Wajib** pilih **Siapa saja (Anyone)**.
4. Klik tombol **Terapkan (Deploy)**.
5. Google akan meminta persetujuan akses keamanan akun:
   - Klik **Berikan Akses (Authorize Access)**.
   - Pilih Akun Gmail Anda.
   - Akan muncul peringatan "Google hasn't verified this app" (Google belum memverifikasi aplikasi ini). Jangan khawatir, ini aman karena ini adalah kode script buatan Anda sendiri.
   - Klik **Lanjutan (Advanced)** di pojok bawah, lalu klik **Buka [Nama Spreadsheet] (tidak aman)** atau **Go to [Project Name] (unsafe)**.
   - Klik **Izinkan (Allow)** pada halaman persetujuan akhir.
6. Deployment Sukses! Layar akan menampilkan daftar detail tautan API:
   - Cari baris **URL Aplikasi Web (Web App URL)**.
   - Salin URL tersebut yang berformat: \`https://script.google.com/macros/s/AKfycb.../exec\`.
   - **PENTING**: Simpan URL ini baik-baik.

---

## 🔌 LANGKAH 4: MENGHUBUNGKAN APLIKASI SIPES KE API SPREADSHEET

Kembali ke aplikasi Web SIPES ini, lalu buka tab **Integrasi Apps Script** di menu navigasi:

1. Tempelkan URL Google Spreadsheet Anda ke dalam kolom **Google Spreadsheet URL**.
2. Tempelkan URL Aplikasi Web Apps Script yang Anda salin dari Langkah 3 ke dalam kolom **Web App URL**.
3. Klik tombol **Hubungkan & Mulai Handshake (Connect Spreadsheet)**.
4. Sistem akan mengirim sinyal inisiasi jabat tangan (HTTP GET API Call) ke Apps Script.
5. Setelah terhubung, klik tombol **Inisialisasi Database** yang muncul di Console Monitor untuk menginstruksikan server Apps Script agar secara otomatis membangun 7 lembar kerja database utama di Google Sheets Anda:
   - *Siswa*, *Jenis_Pembayaran*, *Tarif_Siswa*, *Tagihan*, *Transaksi*, *Detail_Transaksi*, dan *Users*.
6. Selesai! Indikator di pojok kanan atas akan berubah menjadi hijau **🟢 Connected (SPREADSHEET: [Nama Spreadsheet Anda])**.
7. Sekarang, Anda dapat menekan **Tarik Data (PULL)** untuk mengambil data perdana, atau melakukan pencatatan transaksi yang otomatis langsung menyinkronkan sel database di Google Spreadsheet Google Drive Anda secara real-time!
`;
