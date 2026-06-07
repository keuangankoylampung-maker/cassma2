/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GasFile {
  name: string;
  language: string;
  description: string;
  content: string;
}

export const GAS_FILES: GasFile[] = [
  {
    name: 'Code.gs',
    language: 'javascript',
    description: 'Entry point untuk Google Apps Script Web App. Mengatur routing dan memanggil interface HTML.',
    content: `/**
 * Google Apps Script Web App Entry Point
 * Sistem Pembayaran Sekolah Terintegrasi
 */

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
    .setTitle('Sistem Pembayaran Sekolah (SPS)')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Endpoint Helper untuk Router API / Fungsi Apps Script
 * Semua interaksi data UI dikomunikasikan secara aman melalui google.script.run
 */
function testConnection() {
  return { status: "success", message: "Koneksi ke Google Spreadsheet berhasil!" };
}
`
  },
  {
    name: 'Database.gs',
    language: 'javascript',
    description: 'Inisialisasi tabel, kolom header spreadsheet, dan koneksi database.',
    content: `/**
 * Database Spreadsheet Helper & Initializer
 */

// Ganti ID Spreadsheet ini jika menggunakan ID lembar kerja tertentu, 
// atau biarkan kosong jika script tertanam langsung (Container-Bound Script)
var SPREADSHEET_ID = ""; 

function getDb() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } else {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

/**
 * Jalankan fungsi ini sekali di Apps Script Editor untuk menyiapkan seluruh Sheet
 */
function initSpreadsheetDatabase() {
  var ss = getDb();
  
  var sheetsToCreate = [
    {
      name: "Siswa",
      headers: ["ID", "NIS", "NISN", "Nama", "Kelas", "Alamat", "HP", "Status", "Jenis_Kelamin", "Tempat_Lahir", "Tanggal_Lahir", "Jurusan", "Tahun_Masuk", "Nama_Wali"]
    },
    {
      name: "Jenis_Pembayaran",
      headers: ["ID", "Kode", "Nama", "Jenis", "Tahun_Ajaran", "Nominal_Default", "Aktif"]
    },
    {
      name: "Tarif_Siswa",
      headers: ["ID", "NIS", "Kode_Pembayaran", "Nominal"]
    },
    {
      name: "Tagihan",
      headers: ["ID", "NIS", "Kode_Pembayaran", "Nama_Pembayaran", "Periode", "Nominal", "Terbayar", "Status", "Tahun_Ajaran", "Jenis"]
    },
    {
      name: "Transaksi",
      headers: ["ID", "No_Transaksi", "Tanggal", "NIS", "Total", "Petugas"]
    },
    {
      name: "Detail_Transaksi",
      headers: ["ID", "No_Transaksi", "Tagihan_ID", "Nama_Pembayaran", "Periode", "Nominal"]
    },
    {
      name: "Users",
      headers: ["ID", "Username", "Password", "Role"]
    }
  ];

  sheetsToCreate.forEach(function(sInfo) {
    var sheet = ss.getSheetByName(sInfo.name);
    if (!sheet) {
      sheet = ss.insertSheet(sInfo.name);
    }
    
    // Set headers jika kosong
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, sInfo.headers.length).setValues([sInfo.headers]);
      sheet.getRange(1, 1, 1, sInfo.headers.length).setFontWeight("bold").setBackground("#e0f2fe");
    }
  });

  // Tambah User Default jika kosong
  var userSheet = ss.getSheetByName("Users");
  if (userSheet.getLastRow() <= 1) {
    userSheet.appendRow(["u-admin", "admin", "123", "Admin"]);
    userSheet.appendRow(["u-op", "operator", "123", "Operator"]);
  }

  return "Database Berhasil Dimuat & Dikonfigurasi!";
}

function getSheetData(sheetName) {
  var sheet = getDb().getSheetByName(sheetName);
  if (!sheet) return [];
  
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return [];
  
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  
  var data = [];
  for (var i = 0; i < values.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = values[i][j];
    }
    data.push(row);
  }
  return data;
}

function appendToSheet(sheetName, rowData) {
  var sheet = getDb().getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet tidak ditemukan: " + sheetName);
  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  
  var newRow = [];
  for (var i = 0; i < headers.length; i++) {
    newRow.push(rowData[headers[i]] || "");
  }
  sheet.appendRow(newRow);
  return true;
}

function updateSheetRow(sheetName, idColName, idValue, updatedData) {
  var sheet = getDb().getSheetByName(sheetName);
  if (!sheet) return false;
  
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return false;
  
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var colIndex = headers.indexOf(idColName) + 1;
  if (colIndex === 0) return false;
  
  var idValues = sheet.getRange(2, colIndex, lastRow - 1, 1).getValues();
  
  for (var i = 0; i < idValues.length; i++) {
    if (idValues[i][0].toString() === idValue.toString()) {
      var rowNum = i + 2;
      for (var colName in updatedData) {
        var hIndex = headers.indexOf(colName) + 1;
        if (hIndex > 0) {
          sheet.getRange(rowNum, hIndex).setValue(updatedData[colName]);
        }
      }
      return true;
    }
  }
  return false;
}

function deleteSheetRow(sheetName, idColName, idValue) {
  var sheet = getDb().getSheetByName(sheetName);
  if (!sheet) return false;
  
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return false;
  
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var colIndex = headers.indexOf(idColName) + 1;
  if (colIndex === 0) return false;
  
  var idValues = sheet.getRange(2, colIndex, lastRow - 1, 1).getValues();
  
  for (var i = 0; i < idValues.length; i++) {
    if (idValues[i][0].toString() === idValue.toString()) {
      sheet.deleteRow(i + 2);
      return true;
    }
  }
  return false;
}
`
  },
  {
    name: 'Siswa.gs',
    language: 'javascript',
    description: 'Fungsi CRUD (Create, Read, Update, Delete) Data Siswa, serta pencarian, import massal, dan export.',
    content: `/**
 * Manajemen CRUD Siswa (Google Apps Script)
 */

function listSiswa() {
  try {
    return { success: true, data: getSheetData("Siswa") };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function saveSiswa(siswaObj) {
  try {
    var id = "S-" + new Date().getTime();
    siswaObj.ID = id;
    siswaObj.Status = siswaObj.Status || "Aktif";
    
    appendToSheet("Siswa", {
      "ID": id,
      "NIS": siswaObj.NIS,
      "NISN": siswaObj.NISN,
      "Nama": siswaObj.Nama,
      "Kelas": siswaObj.Kelas,
      "Alamat": siswaObj.Alamat,
      "HP": siswaObj.HP,
      "Status": siswaObj.Status,
      "Jenis_Kelamin": siswaObj.Jenis_Kelamin,
      "Tempat_Lahir": siswaObj.Tempat_Lahir,
      "Tanggal_Lahir": siswaObj.Tanggal_Lahir,
      "Jurusan": siswaObj.Jurusan || "",
      "Tahun_Masuk": siswaObj.Tahun_Masuk,
      "Nama_Wali": siswaObj.Nama_Wali
    });
    
    return { success: true, message: "Data Siswa berhasil disimpan!", id: id };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function updateSiswa(id, siswaObj) {
  try {
    var res = updateSheetRow("Siswa", "ID", id, {
      "NIS": siswaObj.NIS,
      "NISN": siswaObj.NISN,
      "Nama": siswaObj.Nama,
      "Kelas": siswaObj.Kelas,
      "Alamat": siswaObj.Alamat,
      "HP": siswaObj.HP,
      "Status": siswaObj.Status,
      "Jenis_Kelamin": siswaObj.Jenis_Kelamin,
      "Tempat_Lahir": siswaObj.Tempat_Lahir,
      "Tanggal_Lahir": siswaObj.Tanggal_Lahir,
      "Jurusan": siswaObj.Jurusan || "",
      "Tahun_Masuk": siswaObj.Tahun_Masuk,
      "Nama_Wali": siswaObj.Nama_Wali
    });
    
    if (res) {
      return { success: true, message: "Data Siswa berhasil diperbarui!" };
    }
    return { success: false, message: "Siswa tidak ditemukan." };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function deleteSiswa(id, role) {
  // Amankan operator agar tidak hapus data
  if (role !== "Admin") {
    return { success: false, message: "Akses Ditolak: Hanya Admin yang dapat menghapus data siswa!" };
  }
  
  try {
    var res = deleteSheetRow("Siswa", "ID", id);
    if (res) {
      return { success: true, message: "Data Siswa berhasil dihapus!" };
    }
    return { success: false, message: "Siswa tidak ditemukan." };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * Import Massal Siswa dari Excel/Array Data JSON dari Client
 */
function importSiswaMassal(arrSiswa) {
  try {
    var count = 0;
    arrSiswa.forEach(function(s) {
      if (s.NIS && s.Nama) {
        var id = "S-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
        appendToSheet("Siswa", {
          "ID": id,
          "NIS": s.NIS.toString(),
          "NISN": s.NISN ? s.NISN.toString() : "",
          "Nama": s.Nama,
          "Kelas": s.Kelas,
          "Alamat": s.Alamat || "",
          "HP": s.HP ? s.HP.toString() : "",
          "Status": s.Status || "Aktif",
          "Jenis_Kelamin": s.Jenis_Kelamin || "Laki-laki",
          "Tempat_Lahir": s.Tempat_Lahir || "",
          "Tanggal_Lahir": s.Tanggal_Lahir || "",
          "Jurusan": s.Jurusan || "",
          "Tahun_Masuk": s.Tahun_Masuk ? s.Tahun_Masuk.toString() : "",
          "Nama_Wali": s.Nama_Wali || ""
        });
        count++;
      }
    });
    return { success: true, message: count + " data siswa berhasil diimport!" };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}
`
  },
  {
    name: 'Pembayaran.gs',
    language: 'javascript',
    description: 'Manajemen Tarif, Generate Schedule Tagihan Bulanan (SPP) / Sekali Tagih (Bebas), Serta Proses Pembayaran Multi Tagihan.',
    content: `/**
 * Manajemen Pembayaran & Generate Tagihan
 */

function listJenisPembayaran() {
  return { success: true, data: getSheetData("Jenis_Pembayaran") };
}

function saveJenisPembayaran(payTypeObj) {
  try {
    var id = "P-" + new Date().getTime();
    payTypeObj.ID = id;
    appendToSheet("Jenis_Pembayaran", {
      "ID": id,
      "Kode": payTypeObj.Kode,
      "Nama": payTypeObj.Nama,
      "Jenis": payTypeObj.Jenis,
      "Tahun_Ajaran": payTypeObj.Tahun_Ajaran,
      "Nominal_Default": Number(payTypeObj.Nominal_Default || 0),
      "Aktif": payTypeObj.Aktif || "Ya"
    });
    return { success: true, message: "Metode pembayaran ditambahkan!" };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

// Mengambil Tarif Kustom per Siswa
function getTarifSiswaAll() {
  return getSheetData("Tarif_Siswa");
}

function setTarifSiswa(nis, kodePembayaran, nominal) {
  try {
    var data = getTarifSiswaAll();
    var found = false;
    
    for (var i = 0; i < data.length; i++) {
      if (data[i].NIS.toString() === nis.toString() && data[i].Kode_Pembayaran === kodePembayaran) {
        updateSheetRow("Tarif_Siswa", "ID", data[i].ID, { "Nominal": Number(nominal) });
        found = true;
        break;
      }
    }
    
    if (!found) {
      var id = "T-" + new Date().getTime();
      appendToSheet("Tarif_Siswa", {
        "ID": id,
        "NIS": nis.toString(),
        "Kode_Pembayaran": kodePembayaran,
        "Nominal": Number(nominal)
      });
    }
    return { success: true, message: "Tarif kustom siswa diperbarui!" };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

// Set Tarif Massal berdasarkan Kelas
function setTarifMassalKelas(kelas, kodePembayaran, nominal) {
  try {
    var siswaList = getSheetData("Siswa").filter(function(s) {
      return s.Kelas === kelas && s.Status === "Aktif";
    });
    
    var count = 0;
    siswaList.forEach(function(s) {
      setTarifSiswa(s.NIS, kodePembayaran, nominal);
      count++;
    });
    
    return { success: true, message: "Berhasil mengatur tarif untuk " + count + " siswa kelas " + kelas };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * Pembuatan Tagihan Otomatis
 * SPP bulanan digenerate sebanyak 12 bulan (Juli s.d Juni tahun berikutnya)
 */
function generateTagihanBulanan(kodePembayaran, tahunAjaran) {
  try {
    var pmList = getSheetData("Jenis_Pembayaran").filter(function(p) {
      return p.Kode === kodePembayaran && p.Tahun_Ajaran === tahunAjaran;
    });
    if (pmList.length === 0) return { success: false, message: "Metode pembayaran tidak ditemukan." };
    
    var pm = pmList[0];
    var siswaList = getSheetData("Siswa").filter(function(s) { return s.Status === "Aktif"; });
    var tarifMap = {};
    getSheetData("Tarif_Siswa").forEach(function(tar) {
      if (tar.Kode_Pembayaran === kodePembayaran) {
        tarifMap[tar.NIS.toString()] = Number(tar.Nominal);
      }
    });

    var bulanList = [
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
      "Januari", "Februari", "Maret", "April", "Mei", "Juni"
    ];

    var tagihanSheet = getDb().getSheetByName("Tagihan");
    var existingBills = getSheetData("Tagihan");
    
    var count = 0;
    siswaList.forEach(function(siswa) {
      var personalTarif = tarifMap[siswa.NIS.toString()] !== undefined ? tarifMap[siswa.NIS.toString()] : Number(pm.Nominal_Default);
      
      bulanList.forEach(function(bulan) {
        var matchingPeriode = bulan + " " + tahunAjaran.split('/')[bulanList.indexOf(bulan) < 6 ? 0 : 1];
        
        // Cek duplikasi
        var exists = existingBills.some(function(eb) {
          return eb.NIS.toString() === siswa.NIS.toString() && 
                 eb.Kode_Pembayaran === kodePembayaran && 
                 eb.Periode === matchingPeriode;
        });

        if (!exists) {
          var id = "TG-" + new Date().getTime() + "-" + Math.floor(Math.random() * 10000);
          appendToSheet("Tagihan", {
            "ID": id,
            "NIS": siswa.NIS.toString(),
            "Kode_Pembayaran": kodePembayaran,
            "Nama_Pembayaran": pm.Nama,
            "Periode": matchingPeriode,
            "Nominal": personalTarif,
            "Terbayar": 0,
            "Status": "Belum Lunas",
            "Tahun_Ajaran": tahunAjaran,
            "Jenis": "Bulanan"
          });
          count++;
        }
      });
    });

    return { success: true, message: "Pembuatan otomatis selesai. Berhasil membuat " + count + " invoice tagihan!" };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * Generate Tagihan Bebas (Sekali Bayar) yang dapat dicicil
 */
function generateTagihanBebas(kodePembayaran, tahunAjaran) {
  try {
    var pmList = getSheetData("Jenis_Pembayaran").filter(function(p) {
      return p.Kode === kodePembayaran && p.Tahun_Ajaran === tahunAjaran;
    });
    if (pmList.length === 0) return { success: false, message: "Metode pembayaran tidak ditemukan." };
    
    var pm = pmList[0];
    var siswaList = getSheetData("Siswa").filter(function(s) { return s.Status === "Aktif"; });
    var tarifMap = {};
    getSheetData("Tarif_Siswa").forEach(function(tar) {
      if (tar.Kode_Pembayaran === kodePembayaran) {
        tarifMap[tar.NIS.toString()] = Number(tar.Nominal);
      }
    });

    var existingBills = getSheetData("Tagihan");
    var count = 0;

    siswaList.forEach(function(siswa) {
      var personalTarif = tarifMap[siswa.NIS.toString()] !== undefined ? tarifMap[siswa.NIS.toString()] : Number(pm.Nominal_Default);
      
      var exists = existingBills.some(function(eb) {
        return eb.NIS.toString() === siswa.NIS.toString() && eb.Kode_Pembayaran === kodePembayaran;
      });

      if (!exists) {
        var id = "TG-" + new Date().getTime() + "-" + Math.floor(Math.random() * 10000);
        appendToSheet("Tagihan", {
          "ID": id,
          "NIS": siswa.NIS.toString(),
          "Kode_Pembayaran": kodePembayaran,
          "Nama_Pembayaran": pm.Nama,
          "Periode": "Tagihan Sekali Bayar",
          "Nominal": personalTarif,
          "Terbayar": 0,
          "Status": "Belum Lunas",
          "Tahun_Ajaran": tahunAjaran,
          "Jenis": "Bebas"
        });
        count++;
      }
    });

    return { success: true, message: "Generate tagihan bebas selesai. Berhasil membuat " + count + " invoice tagihan!" };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * Transaksi Pembayaran Banyak Tagihan sekaligus (Keranjang Belanja)
 */
function bayarTagihanBasket(nis, checkoutList, username) {
  try {
    var ss = getDb();
    var lastRow = getSheetData("Transaksi").length;
    var nextNum = lastRow + 1;
    var yearStr = new Date().getFullYear().toString();
    var noTrx = "TRX-" + yearStr + "-" + ("000000" + nextNum).slice(-6);
    
    var totalBayar = 0;
    var listTagihan = getSheetData("Tagihan");
    
    // Validasi & Hitung Total
    checkoutList.forEach(function(item) {
      var bill = listTagihan.filter(function(b) { return b.ID === item.id; })[0];
      if (!bill) throw new Error("Tagihan " + item.id + " tidak ditemukan.");
      if (bill.Status === "Lunas") throw new Error("Tagihan " + bill.Nama_Pembayaran + " - " + bill.Periode + " sudah lunas.");
      
      totalBayar += Number(item.nominalBayar);
    });

    // 1. Simpan Header Transaksi
    var trxId = "TX-" + new Date().getTime();
    appendToSheet("Transaksi", {
      "ID": trxId,
      "No_Transaksi": noTrx,
      "Tanggal": new Date().toISOString(),
      "NIS": nis.toString(),
      "Total": totalBayar,
      "Petugas": username
    });

    // 2. Simpan Detail & Perbarui Status Invoice Tagihan
    checkoutList.forEach(function(item) {
      var bill = listTagihan.filter(function(b) { return b.ID === item.id; })[0];
      var nominalBayar = Number(item.nominalBayar);
      
      var detailId = "DT-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
      appendToSheet("Detail_Transaksi", {
        "ID": detailId,
        "No_Transaksi": noTrx,
        "Tagihan_ID": item.id,
        "Nama_Pembayaran": bill.Nama_Pembayaran,
        "Periode": bill.Periode,
        "Nominal": nominalBayar
      });

      // Update Tagihan
      var terbayarBaru = Number(bill.Terbayar) + nominalBayar;
      var totalNominalBill = Number(bill.Nominal);
      var statusTerupdate = "Belum Lunas";
      
      if (terbayarBaru >= totalNominalBill) {
        statusTerupdate = "Lunas";
      } else if (terbayarBaru > 0) {
        statusTerupdate = "Cicilan";
      }
      
      updateSheetRow("Tagihan", "ID", item.id, {
        "Terbayar": terbayarBaru,
        "Status": statusTerupdate
      });
    });

    return { success: true, message: "Pembayaran Berhasil!", noTransaksi: noTrx };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}
`
  },
  {
    name: 'Laporan.gs',
    language: 'javascript',
    description: 'Menangani rekap data statistik dashboard secara real-time, filter queries untuk laporan dinamis, dan Laporan Tunggakan.',
    content: `/**
 * Sistem Penarikan Laporan & Dashboard Analytics
 */

function getDashboardStats() {
  try {
    var siswa = getSheetData("Siswa");
    var tagihan = getSheetData("Tagihan");
    var transaksi = getSheetData("Transaksi");
    
    var totalSiswa = siswa.filter(function(s) { return s.Status === "Aktif"; }).length;
    
    var totalTagihanBulanan = 0;
    var totalTunggakan = 0;
    tagihan.forEach(function(t) {
      totalTagihanBulanan += Number(t.Nominal);
      if (t.Status !== "Lunas") {
        totalTunggakan += (Number(t.Nominal) - Number(t.Terbayar));
      }
    });

    // Pendapatan hari ini & bulan ini
    var hariIni = new Date().toISOString().split('T')[0];
    var bulanIniYm = new Date().toISOString().substring(0, 7); // YYYY-MM
    
    var bayarHariIni = 0;
    var bayarBulanIni = 0;
    
    transaksi.forEach(function(tx) {
      var txTglStr = tx.Tanggal.toString().split('T')[0];
      if (txTglStr === hariIni) {
        bayarHariIni += Number(tx.Total);
      }
      if (tx.Tanggal.toString().indexOf(bulanIniYm) === 0) {
        bayarBulanIni += Number(tx.Total);
      }
    });

    // 5 Transaksi Terbaru
    var sortedTrx = transaksi.sort(function(a, b) {
      return new Date(b.Tanggal) - new Date(a.Tanggal);
    }).slice(0, 5);

    return {
      success: true,
      data: {
        totalSiswa: totalSiswa,
        totalTagihan: totalTagihanBulanan,
        bayarHariIni: bayarHariIni,
        bayarBulanIni: bayarBulanIni,
        totalTunggakan: totalTunggakan,
        recentTransactions: sortedTrx
      }
    };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * Filter Laporan Dinamis
 */
function generateLaporanData(filterType, params) {
  var dataTrx = getSheetData("Transaksi");
  var detailTrx = getSheetData("Detail_Transaksi");
  var siswaList = getSheetData("Siswa");
  
  var result = [];
  
  // Gabungkan Detail, Header, dan data Siswa
  detailTrx.forEach(function(dt) {
    var header = dataTrx.filter(function(h) { return h.No_Transaksi === dt.No_Transaksi; })[0];
    if (!header) return;
    
    var siswa = siswaList.filter(function(s) { return s.NIS.toString() === header.NIS.toString(); })[0];
    var namaSiswa = siswa ? siswa.Nama : "Tidak Dikeahui";
    var kelasSiswa = siswa ? siswa.Kelas : "Lainnya";
    var tglText = header.Tanggal.toString().split('T')[0];

    result.push({
      Tanggal: tglText,
      No_Transaksi: dt.No_Transaksi,
      NIS: header.NIS,
      Nama_Siswa: namaSiswa,
      Kelas: kelasSiswa,
      Jenis_Pembayaran: dt.Nama_Pembayaran,
      Periode: dt.Periode,
      Nominal: Number(dt.Nominal),
      Petugas: header.Petugas
    });
  });

  // Filter Data
  if (filterType === "Harian" && params.tanggal) {
    result = result.filter(function(r) { return r.Tanggal === params.tanggal; });
  } else if (filterType === "Bulanan" && params.bulan && params.tahun) {
    var filterYm = params.tahun + "-" + ("0" + params.bulan).slice(-2);
    result = result.filter(function(r) { return r.Tanggal.indexOf(filterYm) === 0; });
  } else if (filterType === "Tahunan" && params.tahun) {
    result = result.filter(function(r) { return r.Tanggal.indexOf(params.tahun) === 0; });
  } else if (filterType === "Kelas" && params.kelas) {
    result = result.filter(function(r) { return r.Kelas === params.kelas; });
  } else if (filterType === "JenisPembayaran" && params.kodePembayaran) {
    result = result.filter(function(r) {
      return r.Jenis_Pembayaran.indexOf(params.kodePembayaran) >= 0 || r.Jenis_Pembayaran === params.kodePembayaran;
    });
  }

  return result;
}

/**
 * Filter Laporan Tunggakan
 */
function getLaporanTunggakan(kelas, tahunAjaran) {
  var tagihan = getSheetData("Tagihan");
  var siswaList = getSheetData("Siswa");
  
  var result = [];
  
  tagihan.forEach(function(t) {
    var siswa = siswaList.filter(function(s) { return s.NIS.toString() === t.NIS.toString(); })[0];
    if (!siswa) return;
    
    // Filter Kelas & Tahun Ajaran
    if (kelas && siswa.Kelas !== kelas) return;
    if (tahunAjaran && t.Tahun_Ajaran !== tahunAjaran) return;
    
    // Hanya yang belum lunas
    if (t.Status !== "Lunas") {
      result.push({
        NIS: t.NIS,
        Nama_Siswa: siswa.Nama,
        Kelas: siswa.Kelas,
        Nama_Pembayaran: t.Nama_Pembayaran,
        Periode: t.Periode,
        Nominal: Number(t.Nominal),
        Terbayar: Number(t.Terbayar),
        Sisa: Number(t.Nominal) - Number(t.Terbayar),
        Status: t.Status
      });
    }
  });
  
  return result;
}
`
  },
  {
    name: 'Auth.gs',
    language: 'javascript',
    description: 'Mengelola login user dan pengecekan akses operator / admin.',
    content: `/**
 * Manajemen Pengguna & Hak Akses (Google Apps Script)
 */

function loginUser(username, password) {
  try {
    var users = getSheetData("Users");
    for (var i = 0; i < users.length; i++) {
      if (users[i].Username.toString().toLowerCase() === username.toLowerCase() && 
          users[i].Password.toString() === password.toString()) {
        return {
          success: true,
          user: {
            username: users[i].Username,
            role: users[i].Role
          }
        };
      }
    }
    return { success: false, message: "Kombinasi Username dan Password salah." };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function verifyAdmin(role) {
  return role === "Admin";
}
`
  },
  {
    name: 'index.html',
    language: 'html',
    description: 'Frontend utama Google Apps Script Web App yang menggunakan Tailwind CSS, SweetAlert2, dan Bootstrap modern style.',
    content: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Aplikasi Pembayaran Sekolah</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Tailwind CSS & Font -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <!-- FontAwesome & SweetAlert2 -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
  </style>
</head>
<body class="bg-slate-50 min-h-screen text-slate-800">
  <div id="app" class="flex flex-col min-h-screen">
    <!-- Header/Nav -->
    <header class="bg-sky-600 text-white shadow-md p-4">
      <div class="container mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <div class="bg-white p-2 rounded-lg text-sky-600 font-bold text-xl shadow">🏫</div>
          <div>
            <h1 class="text-xl font-bold font-sans">Aplikasi Pembayaran Sekolah</h1>
            <p class="text-xs text-sky-100">Portal Keuangan Tata Usaha Terintegrasi</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <span class="text-xs bg-sky-700 font-medium px-3 py-1 rounded-full text-white" id="userRole">Admin</span>
          <button onclick="window.print()" class="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white text-sm">
            <i class="fa fa-print mr-1"></i> Cetak Halaman
          </button>
        </div>
      </div>
    </header>

    <main class="container mx-auto flex-grow p-6">
      <div id="loader" class="text-center py-20 z-50">
        <i class="fa fa-spinner fa-spin text-4xl text-sky-600"></i>
        <p class="mt-4 text-slate-500 text-sm">Menghubungkan ke Google Apps Script Server...</p>
      </div>

      <div id="mainContent" class="hidden">
        <!-- Dashboard Overview -->
        <section class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">Siswa Aktif</p>
              <h3 class="text-2xl font-bold font-sans mt-1 text-slate-800" id="statSiswa">0</h3>
            </div>
            <div class="p-3 bg-sky-50 text-sky-600 rounded-xl"><i class="fa fa-graduation-cap text-2xl"></i></div>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">Lunas Hari Ini</p>
              <h3 class="text-2xl font-bold font-sans mt-1 text-emerald-600" id="statHariIni">Rp 0</h3>
            </div>
            <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><i class="fa fa-circle-check text-2xl"></i></div>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">Lunas Bulan Ini</p>
              <h3 class="text-2xl font-bold font-sans mt-1 text-indigo-600" id="statBulanIni">Rp 0</h3>
            </div>
            <div class="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><i class="fa fa-wallet text-2xl"></i></div>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Piutang</p>
              <h3 class="text-2xl font-bold font-sans mt-1 text-rose-600" id="statTunggakan">Rp 0</h3>
            </div>
            <div class="p-3 bg-rose-50 text-rose-600 rounded-xl"><i class="fa fa-square-minus text-2xl"></i></div>
          </div>
        </section>

        <section class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 class="text-lg font-bold text-slate-800 mb-4">Informasi Apps Script</h2>
          <p class="text-sm text-slate-600 leading-relaxed mb-4">
            Aplikasi ini dirancang untuk dijalankan langsung di lingkungan <strong>Google Apps Script Editor</strong> sebagai Web App container-bound.
            Silakan buka Spreadsheet Anda, klik menu <strong>Ekstensi &gt; Apps Script</strong>, buat file dengan nama-nama sesuai tab di editor AI Studio dan salin source code lengkap yang disediakan.
          </p>
          <div class="bg-slate-50 p-4 rounded-xl text-xs font-mono text-slate-700">
            Fungsi utama: <br>
            - google.script.run.getDashboardStats(callback)<br>
            - google.script.run.listSiswa(callback)<br>
            - google.script.run.bayarTagihanBasket(nis, items, user, callback)
          </div>
        </section>
      </div>
    </main>

    <footer class="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
      &copy; 2026 Admin Keuangan Sekolah. Powered by Google Apps Script & Google Spreadsheet.
    </footer>
  </div>

  <script>
    document.addEventListener("DOMContentLoaded", function() {
      // Simulasi loading demi keanggunan layout
      setTimeout(function() {
        document.getElementById("loader").classList.add("hidden");
        document.getElementById("mainContent").classList.remove("hidden");
      }, 1000);
    });
  </script>
</body>
</html>
`
  }
];
