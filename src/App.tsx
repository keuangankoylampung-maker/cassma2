/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Siswa, JenisPembayaran, TarifSiswa, Tagihan, Transaksi, DetailTransaksi, User, ConsoleLog, AppSettings, SchoolConfig } from './types';
import { loadDatabase, saveDatabase, DEFAULT_USERS } from './data/mockData';

// Subcomponents import
import ConsoleTerminal from './components/ConsoleTerminal';
import InvoiceReceipt from './components/InvoiceReceipt';
import GsCodeCenter from './components/GsCodeCenter';
import SiswaPage from './components/SiswaPage';
import TarifPage from './components/TarifPage';
import LaporanPage from './components/LaporanPage';

// Lucide icons
import {
  LayoutDashboard, Users, CreditCard, Coins, CalendarDays,
  ShoppingCart, History, FileBarChart2, UserCheck, Database,
  Code, LogOut, Radio, Key, ListFilter, Activity, Trash, School
} from 'lucide-react';

const DEFAULT_SCHOOL_CONFIG: SchoolConfig = {
  nama: 'SMA ADI LUHUR SIDOARJO',
  alamat: 'Jl. Pendidikan No. 102, Sidoarjo, Jawa Timur',
  subHeader: 'SIPP: 421.5/901/105.02/2024 | NPSN: 20231908',
  inisial: 'SP',
  npsn: '20231908',
  statusKwitansi: 'KWITANSI PEMBAYARAN RESMI',
  logoUrl: '',
  telepon: '(031) 8921102',
  email: 'info@smaadiluhur-sda.sch.id',
  bendahara: 'Sri Wahyuni, S.Pd.',
  kepalaSekolah: 'Drs. H. M. Yusuf, M.Pd.'
};

export default function App() {
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // School identity config state
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(DEFAULT_SCHOOL_CONFIG);

  // Logs terminal state
  const [logs, setLogs] = useState<ConsoleLog[]>([
    { id: '1', timestamp: '13:59:35', type: 'info', message: 'Sistem SIPES v1.0 Online. Menyiapkan driver database local...' },
    { id: '2', timestamp: '13:59:36', type: 'success', message: 'Database lokal (localStorage) berhasil dimuat dengan data prapendaftar.' },
    { id: '3', timestamp: '13:59:37', type: 'info', message: 'Mode Simulator aktif. Hubungkan Google Spreadsheet untuk live synchronizer.' }
  ]);

  const logAction = (type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        timestamp: timeStr,
        type,
        message
      }
    ]);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  // Database states
  const [students, setStudents] = useState<Siswa[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<JenisPembayaran[]>([]);
  const [tariffs, setTariffs] = useState<TarifSiswa[]>([]);
  const [bills, setBills] = useState<Tagihan[]>([]);
  const [transactions, setTransactions] = useState<Transaksi[]>([]);
  const [detailTransactions, setDetailTransactions] = useState<DetailTransaksi[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Integration Settings
  const [settings, setSettings] = useState<AppSettings>({
    spreadsheetUrl: '',
    webAppUrl: '',
    connectionStatus: 'offline',
    spreadsheetName: 'MODE SIMULATOR OFFLINE',
    currentUser: null // Persistent login simulation
  });

  // Login form fields
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Cart/Cashier cashier screen state
  const [cartStudentNis, setCartStudentNis] = useState('');
  const [cartCheckedBills, setCartCheckedBills] = useState<{ [billId: string]: boolean }>({});
  const [cartBebasAmounts, setCartBebasAmounts] = useState<{ [billId: string]: number }>({});

  // Active Receipt viewer modal state
  const [activeReceipt, setActiveReceipt] = useState<{ transaction: Transaksi; details: DetailTransaksi[] } | null>(null);

  // Bill Generation page fields
  const [genNisOption, setGenNisOption] = useState<'all' | 'class' | 'individual'>('all');
  const [genClass, setGenClass] = useState('X-IPA-1');
  const [genIndividualNis, setGenIndividualNis] = useState('');
  const [genPaymentKode, setGenPaymentKode] = useState('');

  // Master Payment form fields
  const [payKode, setPayKode] = useState('');
  const [payNama, setPayNama] = useState('');
  const [payJenis, setPayJenis] = useState<'Bulanan' | 'Bebas'>('Bulanan');
  const [payTahun, setPayTahun] = useState('2025/2026');
  const [payNominal, setPayNominal] = useState<number>(0);

  // Load configuration and database on mount
  useEffect(() => {
    const db = loadDatabase();
    setStudents(db.siswa);
    setPaymentTypes(db.jenisPembayaran);
    setTariffs(db.tarifSiswa);
    setBills(db.tagihan);
    setTransactions(db.transaksi);
    setDetailTransactions(db.detailTransaksi);
    setUsers(db.users);

    const savedSettings = localStorage.getItem('sipes_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (err) {
        // use defaults
      }
    }

    const savedSchoolConfig = localStorage.getItem('sipes_school_config');
    if (savedSchoolConfig) {
      try {
        const parsedSchool = JSON.parse(savedSchoolConfig);
        setSchoolConfig(parsedSchool);
      } catch (err) {
        // use defaults
      }
    }
  }, []);

  // Save backend triggers on changes
  const updateStudents = (newS: Siswa[]) => {
    setStudents(newS);
    saveDatabase({ siswa: newS });
  };
  const updateTariffs = (newT: TarifSiswa[]) => {
    setTariffs(newT);
    saveDatabase({ tarifSiswa: newT });
  };
  const updateBills = (newB: Tagihan[]) => {
    setBills(newB);
    saveDatabase({ tagihan: newB });
  };
  const updateTransactions = (newTrx: Transaksi[], newDtl: DetailTransaksi[]) => {
    setTransactions(newTrx);
    setDetailTransactions(newDtl);
    saveDatabase({ transaksi: newTrx, detailTransaksi: newDtl });
  };

  // Switch spreadsheet link / connection handshake handler
  const handleConnectSpreadsheet = async () => {
    if (!settings.spreadsheetUrl) {
      logAction('error', 'Masukkan URL Google Spreadsheet yang valid!');
      alert('Masukkan URL Google Spreadsheet terlebih dahulu!');
      return;
    }
    if (!settings.webAppUrl) {
      logAction('error', 'Masukkan URL Web App Apps Script untuk memulai sinkronisasi cloud!');
      alert('Masukkan Web App Deployment URL terlebih dahulu!');
      return;
    }

    setSettings(prev => ({ ...prev, connectionStatus: 'connecting' }));
    logAction('info', 'Menginisiasi HTTP GET Handshake ke google Apps Script Web App...');

    try {
      // Extract Spreadsheet Name and ID
      const match = settings.spreadsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      const ssId = match ? match[1] : 'Unknown';
      
      const url = settings.webAppUrl.includes('?') 
        ? `${settings.webAppUrl}&action=handshake` 
        : `${settings.webAppUrl}?action=handshake`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Koneksi HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      const resData = await response.json();
      if (resData.status === 'success' || resData.connected === true) {
        const spreadsheetName = resData.spreadsheetName || 'Linked Spreadsheet';
        const newSettings: AppSettings = {
          ...settings,
          connectionStatus: 'connected',
          spreadsheetName: spreadsheetName
        };

        setSettings(newSettings);
        localStorage.setItem('sipes_settings', JSON.stringify(newSettings));
        
        logAction('success', `🟢 Connected! Berhasil jabat tangan dengan Google Sheet: "${spreadsheetName}". ID: ${ssId.substring(0, 15)}...`);
        logAction('info', `Ditemukan tabel aktif pada Spreadsheet. Handshake berhasil!`);
        alert(`Koneksi berhasil! Berhasil ber-handshake dengan Spreadsheet: ${spreadsheetName}`);
      } else {
        throw new Error(resData.message || 'Respons server tidak mengindikasikan koneksi sukses.');
      }
    } catch (err: any) {
      setSettings(prev => ({ ...prev, connectionStatus: 'offline' }));
      logAction('error', `❌ Gagal Handshake dengan Apps Script: ${err.message || err}`);
      alert(`Gagal Handshake: ${err.message || err}\n\nPastikan:\n1. URL Web App Apps Script sudah benar.\n2. Google Apps Script Anda telah dideploy dengan "Who has access: Anyone" (Siapa Saja).\n3. Spreadsheet bersangkutan tidak terhapus.`);
    }
  };

  const handleDisconnectSpreadsheet = () => {
    const newSettings: AppSettings = {
      ...settings,
      connectionStatus: 'offline',
      spreadsheetName: 'MODE SIMULATOR OFFLINE'
    };
    setSettings(newSettings);
    localStorage.setItem('sipes_settings', JSON.stringify(newSettings));
    logAction('warning', 'Memutus koneksi Spreadsheet ke cloud. Kembali ke Offline Sandbox Simulator.');
  };

  // Push Local DB data back to Google Sheets
  const handlePushCloudData = async () => {
    if (!settings.webAppUrl) {
      logAction('error', 'Masukkan URL Web App Apps Script terlebih dahulu!');
      alert('Masukkan Web App Deployment URL terlebih dahulu!');
      return;
    }
    
    logAction('info', 'Menghubungi Web API Apps Script [PUSH] untuk mengunggah database lokal...');
    
    try {
      const payload = {
        action: 'pushDatabase',
        data: {
          siswa: students,
          jenisPembayaran: paymentTypes,
          tarifSiswa: tariffs,
          tagihan: bills,
          transaksi: transactions,
          detailTransaksi: detailTransactions,
          users: users
        }
      };

      const response = await fetch(settings.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8' // Avoid CORS preflight options blocks on GAS Web App
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      const resData = await response.json();
      if (resData.status === 'success') {
        logAction('success', '🟢 [SYNC OK] Data siswa, tipe pembayaran, tarif, tagihan, dan histori transaksi berhasil di-push ke Google Spreadsheet!');
        alert('Push Sinkronisasi Berhasil! Semua tabel di Google Sheet telah diperbarui.');
      } else {
        throw new Error(resData.message || 'Sinkronisasi gagal.');
      }
    } catch (err: any) {
      logAction('error', `❌ Gagal sinkronisasi PUSH ke Google Sheet: ${err.message || err}`);
      alert(`Gagal PUSH data: ${err.message || err}`);
    }
  };

  // Pull spreadsheet data down to localStorage
  const handlePullCloudData = async () => {
    if (!settings.webAppUrl) {
      logAction('error', 'Masukkan URL Web App Apps Script terlebih dahulu!');
      alert('Masukkan Web App Deployment URL terlebih dahulu!');
      return;
    }

    logAction('info', 'Menghubungi Web API Apps Script [PULL] untuk mengunduh snapshot data cloud...');

    try {
      const url = settings.webAppUrl.includes('?') 
        ? `${settings.webAppUrl}&action=pullDatabase` 
        : `${settings.webAppUrl}?action=pullDatabase`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const resData = await response.json();
      if (resData.status === 'success') {
        // Safe mapping with defaults
        const pulledSiswa = resData.siswa || [];
        const pulledJenisPembayaran = resData.jenisPembayaran || [];
        const pulledTarifSiswa = resData.tarifSiswa || [];
        const pulledTagihan = resData.tagihan || [];
        const pulledTransaksi = resData.transaksi || [];
        const pulledDetailTransaksi = resData.detailTransaksi || [];
        const pulledUsers = resData.users || [];

        // Update React application states
        setStudents(pulledSiswa);
        setPaymentTypes(pulledJenisPembayaran);
        setTariffs(pulledTarifSiswa);
        setBills(pulledTagihan);
        setTransactions(pulledTransaksi);
        setDetailTransactions(pulledDetailTransaksi);
        if (pulledUsers.length > 0) {
          setUsers(pulledUsers);
        }

        // Cache update directly to localStorage
        localStorage.setItem('sipes_siswa', JSON.stringify(pulledSiswa));
        localStorage.setItem('sipes_jenis_pembayaran', JSON.stringify(pulledJenisPembayaran));
        localStorage.setItem('sipes_tarif_siswa', JSON.stringify(pulledTarifSiswa));
        localStorage.setItem('sipes_tagihan', JSON.stringify(pulledTagihan));
        localStorage.setItem('sipes_transaksi', JSON.stringify(pulledTransaksi));
        localStorage.setItem('sipes_detail_transaksi', JSON.stringify(pulledDetailTransaksi));
        if (pulledUsers.length > 0) {
          localStorage.setItem('sipes_users', JSON.stringify(pulledUsers));
        }

        logAction('success', `🟢 [PULL OK] Berhasil mengambil: ${pulledSiswa.length} Siswa, ${pulledJenisPembayaran.length} Jenis Pembayaran, ${pulledTagihan.length} Tagihan, ${pulledTransaksi.length} Transaksi.`);
        alert('Tarik (PULL) Data Spreadsheet Berhasil! Data lokal telah diperbarui.');
      } else {
        throw new Error(resData.message || 'Penarikan data dari server gagal.');
      }
    } catch (err: any) {
      logAction('error', `❌ Gagal sinkronisasi PULL dari Google Sheet: ${err.message || err}`);
      alert(`Gagal PULL data: ${err.message || err}`);
    }
  };

  // Init tables directly in Google Sheets
  const handleInitGoogleSheetsDatabase = async () => {
    if (!settings.webAppUrl) {
      logAction('error', 'Masukkan URL Web App Apps Script terlebih dahulu!');
      alert('Masukkan Web App Deployment URL terlebih dahulu!');
      return;
    }

    logAction('info', 'Mengirim skema inisialisasi tabel skema database Google Sheets...');

    try {
      const response = await fetch(settings.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8' // GAS Bypasses CORS blocks
        },
        body: JSON.stringify({ action: 'initDatabase' })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const resData = await response.json();
      if (resData.status === 'success') {
        logAction('success', `🟢 [INIT DB OK] ${resData.message || 'Skema database Google Sheets berhasil dibangun!'}`);
        if (resData.log && Array.isArray(resData.log)) {
          resData.log.forEach((line: string) => logAction('info', `Sheet Init: ${line}`));
        }
        alert('Database Google Sheets Berhasil Dibuat & Diinisialisasi!');
      } else {
        throw new Error(resData.message || 'Inisialisasi tabel gagal.');
      }
    } catch (err: any) {
      logAction('error', `❌ Gagal menginisialisasi Google Sheet database: ${err.message || err}`);
      alert(`Gagal Inisialisasi Database: ${err.message || err}`);
    }
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = users.find(u => u.username.toLowerCase() === usernameInput.toLowerCase() && u.password === passwordInput);
    if (matched) {
      const nextSettings = { ...settings, currentUser: matched };
      setSettings(nextSettings);
      localStorage.setItem('sipes_settings', JSON.stringify(nextSettings));
      logAction('success', `Cashier Login: ${matched.username} masuk sebagai role ${matched.role}`);
      setLoginError('');
    } else {
      setLoginError('Username atau Password yang Anda ketik salah!');
    }
  };

  const handleLogout = () => {
    const nextSettings = { ...settings, currentUser: null };
    setSettings(nextSettings);
    localStorage.setItem('sipes_settings', JSON.stringify(nextSettings));
    logAction('info', 'Kasir keluar dari sistem.');
  };

  // CRUD Students
  const handleAddSiswa = (s: Siswa) => {
    updateStudents([...students, s]);
  };
  const handleEditSiswa = (s: Siswa) => {
    updateStudents(students.map(item => item.id === s.id ? s : item));
  };
  const handleDeleteSiswa = (id: string) => {
    updateStudents(students.filter(item => item.id !== id));
    // Cascade delete pupil bills
    const s = students.find(item=>item.id === id);
    if (s) {
      updateBills(bills.filter(b => b.nis !== s.nis));
    }
  };

  // Add customized billing rates
  const handleAddTariff = (t: TarifSiswa) => {
    updateTariffs([...tariffs, t]);
  };
  const handleMassTariff = (payload: { kelas: string; kodePembayaran: string; nominal: number }) => {
    // Filter matching class students and set tariff
    const classStudents = students.filter(s => s.kelas === payload.kelas && s.statusAktif === 'Aktif');
    const newTariffs = [...tariffs];
    
    classStudents.forEach((student) => {
      const idx = newTariffs.findIndex(t => t.nis === student.nis && t.kodePembayaran === payload.kodePembayaran);
      if (idx !== -1) {
        newTariffs[idx].nominal = payload.nominal;
      } else {
        newTariffs.push({
          id: 'ts-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          nis: student.nis,
          kodePembayaran: payload.kodePembayaran,
          nominal: payload.nominal
        });
      }
    });
    updateTariffs(newTariffs);
  };
  const handleDeleteTariff = (id: string) => {
    updateTariffs(tariffs.filter(t => t.id !== id));
  };

  // Add new school program/fee type (Master Pembayaran)
  const handleAddPaymentType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payKode || !payNama) {
      alert('Harap isi kode dan nama pembayaran!');
      return;
    }

    const exists = paymentTypes.some(p => p.kode === payKode.toUpperCase());
    if (exists) {
      alert('Kode pembayaran sudah digunakan!');
      return;
    }

    const newPay: JenisPembayaran = {
      id: 'jp-' + Date.now(),
      kode: payKode.toUpperCase(),
      nama: payNama,
      jenis: payJenis,
      tahunAjaran: payTahun,
      nominalDefault: payJenis === 'Bulanan' ? Number(payNominal) : Number(payNominal),
      aktif: true
    };

    const nextList = [...paymentTypes, newPay];
    setPaymentTypes(nextList);
    saveDatabase({ jenisPembayaran: nextList });
    logAction('success', `Menambahkan Master Pembayaran: ${payKode.toUpperCase()} - ${payNama} (${payJenis})`);
    
    setPayKode('');
    setPayNama('');
    setPayNominal(0);
  };

  // Toggle Master Pembayaran active status
  const handleTogglePaymentType = (id: string) => {
    const list = paymentTypes.map(p => {
      if (p.id === id) {
        logAction('info', `Mengubah status keaktifan jenis pembayaran ${p.kode} menjadi ${!p.aktif ? 'Aktif' : 'Nonaktif'}`);
        return { ...p, aktif: !p.aktif };
      }
      return p;
    });
    setPaymentTypes(list);
    saveDatabase({ jenisPembayaran: list });
  };

  // GENERATE BILLINGS (TAGIHAN AUTOMATION)
  const handleGenerateInvoices = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genPaymentKode) {
      alert('Mohon pilih jenis pembayaran yang ingin ditagihkan!');
      return;
    }

    const payType = paymentTypes.find(p => p.kode === genPaymentKode);
    if (!payType) return;

    // Filter target students
    let targets: Siswa[] = [];
    if (genNisOption === 'all') {
      targets = students.filter(s => s.statusAktif === 'Aktif');
    } else if (genNisOption === 'class') {
      targets = students.filter(s => s.kelas === genClass && s.statusAktif === 'Aktif');
    } else {
      const matchS = students.find(s => s.nis === genIndividualNis && s.statusAktif === 'Aktif');
      if (matchS) targets = [matchS];
    }

    if (targets.length === 0) {
      alert('Tidak ada siswa aktif yang cocok dengan kriteria generate!');
      return;
    }

    const periodList = payType.jenis === 'Bulanan'
      ? ['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni']
      : ['Sekali Tagih'];

    let addedBillsCount = 0;
    const nextBills = [...bills];
    let billIdCounter = Date.now();

    targets.forEach((student) => {
      // Find personalized rate or assign default
      const customT = tariffs.find(t => t.nis === student.nis && t.kodePembayaran === genPaymentKode);
      const targetNominal = customT ? customT.nominal : payType.nominalDefault;

      periodList.forEach((period) => {
        // Double payment security guard check
        const exists = nextBills.some(b => b.nis === student.nis && b.kodePembayaran === genPaymentKode && b.periode === period);
        if (!exists) {
          nextBills.push({
            id: 'tag-' + (billIdCounter++),
            nis: student.nis,
            kodePembayaran: genPaymentKode,
            periode: period,
            nominal: targetNominal,
            status: 'Belum Lunas',
            terbayar: 0
          });
          addedBillsCount++;
        }
      });
    });

    if (addedBillsCount === 0) {
      alert('Pemberitahuan: Tagihan untuk siswa dan periode ini sudah ter-generate sebelumnya!');
      return;
    }

    updateBills(nextBills);
    logAction('success', `Berhasil meng-generate ${addedBillsCount} invoice tagihan ${genPaymentKode} untuk ${targets.length} siswa.`);
    alert(`Sukses meng-generate ${addedBillsCount} record tagihan otomatis!`);
    setGenIndividualNis('');
  };

  // CHECKOUT BASKET TRANSACTION (Pencatatan Pembayaran Multi-Tagihan)
  const cartStudentProfile = useMemo(() => {
    return students.find(s => s.nis === cartStudentNis);
  }, [students, cartStudentNis]);

  const cartStudentUnpaidBills = useMemo(() => {
    return bills.filter(b => b.nis === cartStudentNis && b.status !== 'Lunas');
  }, [bills, cartStudentNis]);

  const handleSelectCartStudent = (nis: string) => {
    setCartStudentNis(nis);
    setCartCheckedBills({});
    setCartBebasAmounts({});
    logAction('info', `Kasir memilih siswa NIS: ${nis} untuk mencatatkan setoran kasir...`);
  };

  const handleToggleCartItem = (billId: string) => {
    setCartCheckedBills(prev => {
      const nextVal = !prev[billId];
      // If it is Checked and type is Bebas, initialize temporary pay amount
      if (nextVal) {
        const bill = bills.find(b => b.id === billId);
        if (bill) {
          const payType = paymentTypes.find(p => p.kode === bill.kodePembayaran);
          if (payType && payType.jenis === 'Bebas') {
            const maxPay = bill.nominal - bill.terbayar;
            setCartBebasAmounts(b => ({ ...b, [billId]: maxPay }));
          }
        }
      }
      return { ...prev, [billId]: nextVal };
    });
  };

  const cartCalculatedTotal = useMemo(() => {
    let sum = 0;
    Object.entries(cartCheckedBills).forEach(([billId, checked]) => {
      if (!checked) return;
      const bill = bills.find(b => b.id === billId);
      if (!bill) return;

      const payType = paymentTypes.find(p => p.kode === bill.kodePembayaran);
      if (payType && payType.jenis === 'Bebas') {
        const customAmt = cartBebasAmounts[billId] || 0;
        sum += customAmt;
      } else {
        sum += bill.nominal;
      }
    });
    return sum;
  }, [cartCheckedBills, cartBebasAmounts, bills, paymentTypes]);

  const handleCheckoutCart = () => {
    const checkedBillIds = Object.entries(cartCheckedBills).filter(([_, checked]) => checked).map(([id]) => id);
    if (checkedBillIds.length === 0) {
      alert('Keranjang belanja kosong! Silakan centang tagihan yang ingin dibayar.');
      return;
    }

    if (cartCalculatedTotal <= 0) {
      alert('Total pembayaran harus di atas Rp 0!');
      return;
    }

    logAction('info', `Kasir memvalidasi transaksi checkout: ${checkedBillIds.length} tagihan tercentang...`);

    // Auto generate transaction number (Format: TRX-2026-000001, incremental relative to transaction lists length)
    const nextTrxSeqNum = String(transactions.length + 1).padStart(6, '0');
    const trxNo = `TRX-2026-${nextTrxSeqNum}`;
    const todayStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newTrxHeader: Transaksi = {
      id: 'trx-' + Date.now(),
      noTransaksi: trxNo,
      tanggal: todayStr,
      nis: cartStudentNis,
      total: cartCalculatedTotal,
      petugas: settings.currentUser ? settings.currentUser.username : 'admin'
    };

    const newDetails: DetailTransaksi[] = [];
    let dtlIdSeed = Date.now();
    const updatedBills = [...bills];

    checkedBillIds.forEach((billId) => {
      const bIdx = updatedBills.findIndex(b => b.id === billId);
      if (bIdx === -1) return;

      const billItem = updatedBills[bIdx];
      const payType = paymentTypes.find(p => p.kode === billItem.kodePembayaran);
      
      let payAmount = billItem.nominal;
      if (payType && payType.jenis === 'Bebas') {
        payAmount = cartBebasAmounts[billId] || (billItem.nominal - billItem.terbayar);
      }

      // Security validation check (cannot exceed sisa obligation)
      const sisa = billItem.nominal - billItem.terbayar;
      if (payAmount > sisa) {
        payAmount = sisa; // clip to max
      }

      newDetails.push({
        id: 'dtl-' + (dtlIdSeed++),
        noTransaksi: trxNo,
        tagihanId: billId,
        nominal: payAmount
      });

      // Patch core bill values
      const nextTerbayar = billItem.terbayar + payAmount;
      let nextStatus: 'Belum Lunas' | 'Cicilan' | 'Lunas' = 'Belum Lunas';
      if (nextTerbayar >= billItem.nominal) {
        nextStatus = 'Lunas';
      } else if (nextTerbayar > 0) {
        nextStatus = 'Cicilan';
      }

      updatedBills[bIdx] = {
        ...billItem,
        terbayar: nextTerbayar,
        status: nextStatus
      };
    });

    // Save records
    updateBills(updatedBills);
    updateTransactions([...transactions, newTrxHeader], [...detailTransactions, ...newDetails]);

    logAction('success', `🟢 [Checkout Sukses] Transaksi kasir ${trxNo} bernominal Rp ${cartCalculatedTotal.toLocaleString()} berhasil dibukukan!`);
    
    // Clear cart
    setCartCheckedBills({});
    setCartBebasAmounts({});
    setCartStudentNis('');

    // Open Printable receipt modal instantly!
    setActiveReceipt({
      transaction: newTrxHeader,
      details: newDetails
    });
  };

  // Void/Delete single transaction receipt (restricted to Admin)
  const handleDeleteTransaction = (trx: Transaksi) => {
    if (settings.currentUser?.role !== 'Admin') {
      alert('Hak akses ditolak! Hanya Admin yang berwenang membatalkan / menghapus riwayat transaksi.');
      logAction('warning', `Percobaan pembatalan transaksi ${trx.noTransaksi} oleh Operator ditolak.`);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin MEMBATALKAN transaksi ${trx.noTransaksi} senilai Rp ${trx.total.toLocaleString()}? Status lunas tagihan-tagihan terkait akan dikembalikan ke sedia kala secara rollback.`)) {
      logAction('info', `Membatalkan transaksi ${trx.noTransaksi}...`);

      const associatedDetails = detailTransactions.filter(d => d.noTransaksi === trx.noTransaksi);
      // Restore bill statuses
      const restoredBills = bills.map((b) => {
        const matchDtl = associatedDetails.find(d => d.tagihanId === b.id);
        if (matchDtl) {
          const restoredTerbayar = b.terbayar - matchDtl.nominal;
          let nextStatus: 'Belum Lunas' | 'Cicilan' | 'Lunas' = 'Belum Lunas';
          if (restoredTerbayar <= 0) {
            nextStatus = 'Belum Lunas';
          } else {
            nextStatus = 'Cicilan';
          }
          return { ...b, terbayar: restoredTerbayar < 0 ? 0 : restoredTerbayar, status: nextStatus };
        }
        return b;
      });

      updateBills(restoredBills);
      setTransactions(transactions.filter(t => t.id !== trx.id));
      setDetailTransactions(detailTransactions.filter(d => d.noTransaksi !== trx.noTransaksi));
      saveDatabase({
        transaksi: transactions.filter(t => t.id !== trx.id),
        detailTransaksi: detailTransactions.filter(d => d.noTransaksi !== trx.noTransaksi),
        tagihan: restoredBills
      });

      logAction('error', `🚫 Transaksi ${trx.noTransaksi} dibatalkan secara permanen dari ledger oleh Admin.`);
      alert(`Transaksi ${trx.noTransaksi} berhasil di-rollback!`);
    }
  };

  // Switch to see a specific receipt
  const openReceiptViewer = (trx: Transaksi) => {
    const associatedDetails = detailTransactions.filter(d => d.noTransaksi === trx.noTransaksi);
    setActiveReceipt({
      transaction: trx,
      details: associatedDetails
    });
  };

  // Format monetary display
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Stats computed on data lists for quick dash metrics
  const activeStudentsCount = useMemo(() => students.filter(s => s.statusAktif === 'Aktif').length, [students]);
  
  const totalArrearsValue = useMemo(() => {
    let sum = 0;
    bills.forEach(b => {
      if (b.status !== 'Lunas') sum += (b.nominal - b.terbayar);
    });
    return sum;
  }, [bills]);

  const statsTodayReceival = useMemo(() => {
    const today = new Date().toISOString().substring(0, 10);
    return transactions.filter(t => t.tanggal.substring(0, 10) === today).reduce((acc, curr) => acc + curr.total, 0);
  }, [transactions]);

  const statsMonthReceival = useMemo(() => {
    const month = new Date().toISOString().substring(0, 7);
    return transactions.filter(t => t.tanggal.substring(0, 7) === month).reduce((acc, curr) => acc + curr.total, 0);
  }, [transactions]);

  const totalOutstandingObligations = useMemo(() => {
    return bills.reduce((acc, curr) => acc + curr.nominal, 0);
  }, [bills]);

  // Unique classes for listings
  const classesList = useMemo(() => {
    const s = new Set<string>();
    students.forEach(item => s.add(item.kelas));
    return Array.from(s).sort();
  }, [students]);

  // Map students by NIS for O(1) details fetching
  const getStudentInfoMap = useMemo(() => {
    const map: { [nis: string]: { nama: string; kelas: string; alamat: string } } = {};
    students.forEach(s => {
      map[s.nis] = { nama: s.nama, kelas: s.kelas, alamat: s.alamat };
    });
    return map;
  }, [students]);

  // Toggle checkout quick all bill select
  const handleSelectAllArrearsInCart = () => {
    const nextChecked: { [billId: string]: boolean } = {};
    cartStudentUnpaidBills.forEach((b) => {
      nextChecked[b.id] = true;
      const payType = paymentTypes.find(p => p.kode === b.kodePembayaran);
      if (payType && payType.jenis === 'Bebas') {
        setCartBebasAmounts(prev => ({ ...prev, [b.id]: b.nominal - b.terbayar }));
      }
    });
    setCartCheckedBills(nextChecked);
    logAction('info', `Kasir men-check seluruh tunggakan (${cartStudentUnpaidBills.length} item) sekaligus.`);
  };

  // Render Login view if user is null
  if (!settings.currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 font-sans selection:bg-blue-600 selection:text-white">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Logo Heading Header */}
          <div className="bg-blue-600 text-white px-8 py-8 text-center relative">
            {schoolConfig.logoUrl ? (
              <img 
                src={schoolConfig.logoUrl} 
                alt="Logo Sekolah" 
                referrerPolicy="no-referrer"
                className="h-14 w-14 rounded-2xl border border-white/20 object-contain bg-white/10 mx-auto mb-4"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const fb = document.getElementById('login-logo-fallback');
                  if (fb) fb.classList.remove('hidden');
                }}
              />
            ) : null}
            <div 
              id="login-logo-fallback"
              className={`h-14 w-14 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center font-black tracking-widest text-2xl mx-auto mb-4 font-sans ${schoolConfig.logoUrl ? 'hidden' : ''}`}
            >
              {schoolConfig.inisial || 'SP'}
            </div>
            <h1 className="text-xl font-extrabold tracking-tight uppercase">SISTEM KEUANGAN</h1>
            <p className="text-sm font-bold text-blue-100 uppercase tracking-wide mt-1">{schoolConfig.nama}</p>
            <p className="text-[11px] text-blue-105 mt-1 font-semibold uppercase tracking-wider">Penerimaan Pembayaran Uang Sekolah</p>
            <div className="absolute top-1 right-2 text-[10px] font-mono text-blue-200 uppercase">v1.2</div>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-600"></span>
                {loginError}
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">NAMA PETUGAS (KASIR) *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full text-xs font-bold font-mono uppercase bg-slate-50 border border-slate-350 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 pl-4 focus:outline-none"
                  placeholder="admin atau operator"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">KATA SANDI / PASSWORD *</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-350 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 pl-4 focus:outline-none"
                placeholder="isikan: 123"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-lg transition-colors shadow-lg"
            >
              Uji Coba Hubungkan Kasir
            </button>

            <div className="text-center pt-2">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">AKSES LOGIN BAWAAN UNTUK TESTING:</span>
              <div className="flex gap-4 justify-center text-[11px] text-slate-500 mt-1 font-mono">
                <div>User: <span className="font-bold text-blue-600">admin</span> (Pass: 123)</div>
                <div>User: <span className="font-bold text-slate-600">operator</span> (Pass: 123)</div>
              </div>
            </div>
          </form>
        </div>
        <p className="text-[10px] text-slate-550 font-mono mt-4">Sistem Penerimaan Sekolah Terintegrasi Google Spreadsheet Web API</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white print:bg-white print:text-black">
      {/* Top Banner Control Panel (Hidden during native print) */}
      <header className="bg-blue-600 font-sans text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-b border-blue-500 shadow-sm shrink-0 no-print">
        <div className="flex items-center gap-3">
          {schoolConfig.logoUrl ? (
            <img 
              src={schoolConfig.logoUrl} 
              alt="Logo" 
              referrerPolicy="no-referrer"
              className="h-10 w-10 rounded-xl border border-white/20 object-contain bg-white/5"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
                const fb = document.getElementById('header-logo-fallback');
                if (fb) fb.classList.remove('hidden');
              }}
            />
          ) : null}
          <div 
            id="header-logo-fallback"
            className={`h-10 w-10 bg-white/10 rounded-xl border border-white/20 font-black tracking-widest text-lg flex items-center justify-center ${schoolConfig.logoUrl ? 'hidden' : ''}`}
          >
            {schoolConfig.inisial || 'SP'}
          </div>
          <div>
            <h1 className="font-extrabold tracking-tight text-base sm:text-lg uppercase">SIPES - {schoolConfig.nama}</h1>
            {/* Live indicator layout switcher */}
            <div className="flex items-center gap-2 mt-0.5">
              {settings.connectionStatus === 'connected' ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-100 uppercase tracking-widest">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  🟢 CONNECTED (SPREADSHEET: {settings.spreadsheetName})
                </span>
              ) : settings.connectionStatus === 'connecting' ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-200 uppercase tracking-widest">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce"></span>
                  🟡 CONNECTING (MENYAMBUNGKAN SPREADSHEET...)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                  ⚪ OFFLINE (MODE SIMULATOR LOKAL)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cashier profile toggles row */}
        <div className="flex items-center gap-3 mt-4 sm:mt-0 font-sans">
          <div className="text-right text-xs">
            <p className="font-bold uppercase tracking-wider">{settings.currentUser.username}</p>
            <p className="text-[10px] text-blue-105 font-semibold bg-blue-700/60 p-0.5 px-2 rounded-full border border-blue-400 mt-0.5 inline-block">
              Role: {settings.currentUser.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-blue-100 hover:text-white hover:bg-blue-700 rounded-lg transition"
            title="Keluar / Ganti Akun"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Framework Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar Drawer (Hidden during print) */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 hidden md:flex no-print font-sans">
          <div className="p-4 space-y-7 overflow-y-auto max-h-[80vh]">
            <span className="text-[10px] font-black tracking-widest text-slate-400 block uppercase">Navigasi Utama</span>
            
            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'siswa', label: 'Data Siswa', icon: Users },
                { id: 'pembayaran_master', label: 'Master Pembayaran', icon: CreditCard },
                { id: 'tarif', label: 'Tarif Per Siswa', icon: Coins },
                { id: 'generate_tagihan', label: 'Generate Tagihan', icon: CalendarDays },
                { id: 'transaksi', label: 'Transaksi Penerimaan', icon: ShoppingCart },
                { id: 'riwayat', label: 'Riwayat Transaksi', icon: History }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <span className="text-[10px] font-black tracking-widest text-slate-400 block uppercase mt-6">Laporan & Audit</span>
            <nav className="space-y-1">
              {[
                { id: 'laporan', label: 'Laporan Penerimaan', icon: FileBarChart2 },
                { id: 'profil_sekolah', label: 'Identitas Sekolah', icon: School },
                { id: 'user_management', label: 'Manajemen User', icon: UserCheck },
                { id: 'integrasi', label: 'Integrasi Google Sheets', icon: Database },
                { id: 'gas_code', label: 'Kode Apps Script (.gs)', icon: Code }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-100 text-center bg-slate-50/50">
            <span className="text-[10px] font-mono text-slate-450 block uppercase tracking-wider">SIPES SCHOOL LEDGER</span>
            <p className="text-[9px] text-slate-400 mt-1 font-mono">Running Port: 3000 | localhost</p>
          </div>
        </aside>

        {/* View Layout Base */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* ===================== DASHBOARD ===================== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fade-in no-print">
                {/* Header widget */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 leading-none">Selamat Datang di SIPES</h2>
                    <p className="text-xs text-slate-500 mt-1.5">Sistem Penerimaan Pembayaran Uang Sekolah {schoolConfig.nama}.</p>
                  </div>
                  <div className="text-[11px] font-mono font-medium text-slate-500 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs self-start md:self-center">
                    Hari ini: <strong>{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</strong>
                  </div>
                </div>

                {/* Dashboard Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Jumlah Siswa Aktif', value: activeStudentsCount, color: 'text-blue-600' },
                    { label: 'Total Tagihan Aktif', value: formatIDR(totalOutstandingObligations), color: 'text-indigo-600' },
                    { label: 'Setoran Kas Hari Ini', value: formatIDR(statsTodayReceival), color: 'text-emerald-600 font-black' },
                    { label: 'Setoran Kas Bulan Ini', value: formatIDR(statsMonthReceival), color: 'text-blue-800 font-black' },
                    { label: 'Total Tunggakan Aktif', value: formatIDR(totalArrearsValue), color: 'text-red-600' }
                  ].map((card, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-snug">{card.label}</span>
                      <p className={`text-lg sm:text-xl font-mono mt-2 font-bold ${card.color}`}>{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Graphics SVG intake & Recent Transactions History */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left SVG Charts */}
                  <div className="col-span-1 lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200 h-[380px] flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider">Grafik Intake Penerimaan Kas (Pekan Ini)</h3>
                      <p className="text-[11px] text-slate-400">Total setoran harian yang lolos rekayasa validasi kasir.</p>
                    </div>

                    {/* SVG Graphic mockup bar chart */}
                    <div className="flex-1 flex items-end justify-between h-48 px-10 pt-8 border-b border-slate-100">
                      {[
                        { day: 'Sen', val: '45%', amt: '3.4jt' },
                        { day: 'Sel', val: '72%', amt: '5.6jt' },
                        { day: 'Rab', val: '28%', amt: '2.1jt' },
                        { day: 'Kam', val: '92%', amt: '7.8jt' },
                        { day: 'Jum', val: '15%', amt: '1.2jt' },
                        { day: 'Sab', val: '60%', amt: '4.8jt' },
                        { day: 'Min', val: '5%', amt: '200rb' }
                      ].map((item, id) => (
                        <div key={id} className="flex flex-col items-center gap-2 group cursor-pointer relative">
                          <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-900 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition absolute -top-8 shrink-0">{item.amt}</span>
                          <div className="w-8 sm:w-12 bg-blue-600 hover:bg-blue-700 hover:shadow-xs transition-all rounded-t-md" style={{ height: item.val }}></div>
                          <span className="text-[10px] text-slate-500 font-bold">{item.day}</span>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-[10px] text-slate-400 text-right font-mono italic mt-2">Dianalisis secara periodik sesuai timestamps spreadsheet.</p>
                  </div>

                  {/* Right Recent Transaction lists */}
                  <div className="col-span-1 bg-white p-5 rounded-lg border border-slate-200 h-[380px] flex flex-col justify-between overflow-hidden">
                    <div>
                      <h3 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider">Penerimaan Kas Terbaru</h3>
                      <p className="text-[11px] text-slate-400">Paling mutakhir jam kerja hari ini.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto my-4 space-y-3 font-sans">
                      {transactions.length === 0 ? (
                        <div className="text-center text-slate-400 text-xs py-12">Belum ada transaksi hari ini</div>
                      ) : (
                        transactions.slice(-5).reverse().map((t) => (
                          <div key={t.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-100 cursor-pointer hover:bg-slate-100/50" onClick={() => openReceiptViewer(t)}>
                            <div className="text-xs">
                              <p className="font-bold font-mono text-blue-700">{t.noTransaksi}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{getStudentInfoMap[t.nis]?.nama || 'Siswa'}</p>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-900 text-right">{formatIDR(t.total)}</span>
                          </div>
                        ))
                      )}
                    </div>

                    <button
                      onClick={() => setActiveTab('riwayat')}
                      className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition"
                    >
                      Buka Riwayat Kas Lengkap
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== DATA SISWA ===================== */}
            {activeTab === 'siswa' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-none">Manajemen Biodata Siswa</h2>
                  <p className="text-xs text-slate-500 mt-1.5">Kelola data primer siswa sekolah, rekam beasiswa, atau lakukan massal impor dari Excel.</p>
                </div>
                <SiswaPage
                  students={students}
                  onAddStudent={handleAddSiswa}
                  onEditStudent={handleEditSiswa}
                  onDeleteStudent={handleDeleteSiswa}
                  userRole={settings.currentUser.role}
                  logAction={logAction}
                />
              </div>
            )}

            {/* ===================== MASTER JENIS PEMBAYARAN ===================== */}
            {activeTab === 'pembayaran_master' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in no-print bg-slate-50">
                {/* Left Form */}
                <div className="col-span-1 bg-white p-5 rounded-lg border border-slate-200 space-y-4">
                  <h3 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider text-blue-800">Tambah Jenis Pembayaran</h3>
                  <p className="text-xs text-slate-500">Mendukung Pembayaran Bulanan (SPP, Ekskul) dan Pembayaran Bebas (Uang Pangkal, Seragam yang dapat dicicil).</p>

                  <form onSubmit={handleAddPaymentType} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Kode Pembayaran * (Singkat)</label>
                      <input
                        type="text"
                        required
                        value={payKode}
                        onChange={(e) => setPayKode(e.target.value)}
                        className="w-full text-xs font-bold font-mono uppercase bg-slate-50 p-2.5 border border-slate-300 rounded"
                        placeholder="Contoh: SPP, UPP, GDG"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Nama Program Pembayaran *</label>
                      <input
                        type="text"
                        required
                        value={payNama}
                        onChange={(e) => setPayNama(e.target.value)}
                        className="w-full text-xs font-bold p-2.5 border border-slate-300 rounded"
                        placeholder="Contoh: SPP Bulanan Kelas X"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Jenis Program</label>
                        <select
                          value={payJenis}
                          onChange={(e) => setPayJenis(e.target.value as any)}
                          className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
                        >
                          <option value="Bulanan">Bulanan</option>
                          <option value="Bebas">Bebas</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Tahun Ajaran</label>
                        <select
                          value={payTahun}
                          onChange={(e) => setPayTahun(e.target.value)}
                          className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white font-mono"
                        >
                          <option value="2025/2026">2025/2026</option>
                          <option value="2026/2027">2026/2027</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Nominal Baku Default (Rp) *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={payNominal || ''}
                        onChange={(e) => setPayNominal(Number(e.target.value))}
                        className="w-full text-xs font-mono font-bold p-2.5 border border-slate-300 rounded text-slate-800"
                        placeholder="Rp. 150,000"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded transition-all shadow-sm uppercase tracking-wider"
                    >
                      Daftarkan Jenis Program
                    </button>
                  </form>
                </div>

                {/* Right Lists */}
                <div className="col-span-1 lg:col-span-2 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col h-[460px]">
                  <div className="px-4 py-3 border-b bg-slate-50 border-slate-200">
                    <h3 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider leading-none">Daftar Jenis Pembayaran Aktif</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Jenis program yang didefinisikan sekolah untuk murid.</p>
                  </div>

                  <div className="overflow-y-auto flex-1 h-full font-sans">
                    <table className="w-full text-xs text-left text-slate-650">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-700 tracking-wider">
                        <tr>
                          <th className="px-4 py-3 text-center">Kode</th>
                          <th className="px-4 py-3">Nama Pembayaran</th>
                          <th className="px-4 py-3">Jenis</th>
                          <th className="px-4 py-3">Tahun Ajaran</th>
                          <th className="px-4 py-3 text-right">Nominal Default</th>
                          <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {paymentTypes.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3.5 text-center font-mono font-black text-blue-700">{p.kode}</td>
                            <td className="px-4 py-3.5 font-bold text-slate-900">{p.nama}</td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-block border text-[10px] rounded px-2 py-0.5 ${
                                p.jenis === 'Bulanan' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {p.jenis}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-mono">{p.tahunAjaran}</td>
                            <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">{formatIDR(p.nominalDefault)}</td>
                            <td className="px-4 py-3.5 text-center">
                              <button
                                onClick={() => handleTogglePaymentType(p.id)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition ${
                                  p.aktif ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                }`}
                              >
                                {p.aktif ? 'Aktif' : 'Nonaktif'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== TARIF PER SISWA ===================== */}
            {activeTab === 'tarif' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-none">Konfigurasi Tarif Biaya Per Siswa</h2>
                  <p className="text-xs text-slate-500 mt-1.5">Lakukan penyimpangan tarif khusus untuk menyembelih uang sekolah anak yatim/beasiswa.</p>
                </div>
                <TarifPage
                  students={students}
                  tariffs={tariffs}
                  paymentTypes={paymentTypes}
                  onAddTariff={handleAddTariff}
                  onMassTariff={handleMassTariff}
                  onDeleteTariff={handleDeleteTariff}
                  logAction={logAction}
                />
              </div>
            )}

            {/* ===================== GENERATE INVOICES (TAGIHAN AUTOMATION) ===================== */}
            {activeTab === 'generate_tagihan' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in bg-slate-50">
                {/* Left generator */}
                <div className="col-span-1 bg-white p-5 rounded-lg border border-slate-200 space-y-4 shadow-2xs">
                  <h3 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider text-blue-800">Mesin Pembuat Tagihan Otomatis</h3>
                  <p className="text-xs text-slate-500">Sistem akan secara instan memecah 12 bulan baris (Juli s.d Juni) untuk program Bulanan, atau mendaftarkan satu nominal lunas cicilan untuk pembayaran Bebas.</p>

                  <form onSubmit={handleGenerateInvoices} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Pilih Program Pembayaran *</label>
                      <select
                        required
                        value={genPaymentKode}
                        onChange={(e) => setGenPaymentKode(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 rounded font-bold uppercase bg-white"
                      >
                        <option value="">-- Pilih Program --</option>
                        {paymentTypes.filter(p=>p.aktif).map(p => (
                          <option key={p.id} value={p.kode}>{p.kode} - {p.nama} ({p.jenis})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1.5">Target Distribusi Siswa</label>
                      <div className="space-y-1.5 pt-1">
                        <label className="text-xs flex items-center gap-2 font-medium text-slate-700">
                          <input
                            type="radio"
                            name="gen_opt"
                            checked={genNisOption === 'all'}
                            onChange={() => setGenNisOption('all')}
                            className="accent-blue-600"
                          />
                          Seluruh Siswa Aktif ({activeStudentsCount} siswa)
                        </label>
                        <label className="text-xs flex items-center gap-2 font-medium text-slate-700">
                          <input
                            type="radio"
                            name="gen_opt"
                            checked={genNisOption === 'class'}
                            onChange={() => setGenNisOption('class')}
                            className="accent-blue-600"
                          />
                          Berdasarkan Satu Kelas
                        </label>
                        <label className="text-xs flex items-center gap-2 font-medium text-slate-700">
                          <input
                            type="radio"
                            name="gen_opt"
                            checked={genNisOption === 'individual'}
                            onChange={() => setGenNisOption('individual')}
                            className="accent-blue-600"
                          />
                          Satu Siswa Tertentu (NIS)
                        </label>
                      </div>
                    </div>

                    {genNisOption === 'class' && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Pilih Kelas Target *</label>
                        <select
                          required
                          value={genClass}
                          onChange={(e) => setGenClass(e.target.value)}
                          className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
                        >
                          {classesList.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {genNisOption === 'individual' && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Ketik NIS Siswa Target *</label>
                        <select
                          required
                          value={genIndividualNis}
                          onChange={(e) => setGenIndividualNis(e.target.value)}
                          className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white font-mono"
                        >
                          <option value="">-- Pilih NIS --</option>
                          {students.filter(s=>s.statusAktif==='Aktif').map(s=>(
                            <option key={s.id} value={s.nis}>{s.nis} - {s.nama}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded transition-all uppercase shadow-lg"
                    >
                      Pancarkan Tagihan Murid
                    </button>
                  </form>
                </div>

                {/* Right Preview stats table */}
                <div className="col-span-1 lg:col-span-2 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col h-[460px]">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
                    <div>
                      <h3 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider leading-none">Daftar Tagihan (Invoices) Terbit</h3>
                      <p className="text-[10px] text-slate-500 mt-1">Daftar lembar pertanggungjawaban pembayaran tercatat.</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                      {bills.length} Tagihan Terdaftar
                    </span>
                  </div>

                  <div className="overflow-y-auto flex-1 font-sans">
                    <table className="w-full text-xs text-left text-slate-650">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-700 tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Siswa (NIS)</th>
                          <th className="px-4 py-3">Kode Program</th>
                          <th className="px-4 py-3">Periode</th>
                          <th className="px-4 py-3 text-right">Target Tagihan</th>
                          <th className="px-4 py-3 text-right">Sudah Bayar</th>
                          <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {bills.slice(-20).reverse().map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2.5">
                              <p className="font-mono text-[10px] text-slate-500">{b.nis}</p>
                              <p className="font-bold text-slate-900 leading-none truncate max-w-[150px] uppercase mt-0.5">{getStudentInfoMap[b.nis]?.nama || 'Belum Lunas'}</p>
                            </td>
                            <td className="px-4 py-2.5 font-mono font-bold text-blue-700">{b.kodePembayaran}</td>
                            <td className="px-4 py-2.5 font-semibold text-slate-800">{b.periode}</td>
                            <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">{formatIDR(b.nominal)}</td>
                            <td className="px-4 py-2.5 text-right font-mono text-emerald-600">{formatIDR(b.terbayar)}</td>
                            <td className="px-4 py-2.5 text-center">
                              <span className={`inline-block text-[9px] font-bold rounded-full px-2 py-0.5 ${
                                b.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : b.status === 'Cicilan' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-850'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== TRANSAKSI KASIR (CHECKOUT CART) ===================== */}
            {activeTab === 'transaksi' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in bg-slate-50 no-print">
                {/* Left search & cart list */}
                <div className="col-span-1 lg:col-span-2 space-y-4">
                  {/* Select student */}
                  <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">LANGKAH 1: CARI & SELEKSI SISWA</span>
                    <select
                      value={cartStudentNis}
                      onChange={(e) => handleSelectCartStudent(e.target.value)}
                      className="w-full text-xs font-bold p-3 border border-slate-350 rounded-lg bg-white"
                    >
                      <option value="">-- Cari NIS atau Nama Siswa --</option>
                      {students.filter(s=>s.statusAktif === 'Aktif').map(s => (
                        <option key={s.id} value={s.nis}>{s.nis} - {s.nama} ({s.kelas})</option>
                      ))}
                    </select>

                    {cartStudentProfile && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 font-sans text-xs text-blue-900 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest leading-none">Ahmad Sujak</p>
                          <p className="font-extrabold text-blue-900 uppercase mt-1 leading-none">{cartStudentProfile.nama}</p>
                          <p className="mt-1 font-mono text-[10px] leading-none">Kelas: {cartStudentProfile.kelas} | Wali: {cartStudentProfile.namaWali}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest leading-none">Nomor HP</p>
                          <p className="font-mono mt-1 leading-none">{cartStudentProfile.noHp}</p>
                          <p className="text-[9px] text-slate-400 mt-1 leading-none">{cartStudentProfile.alamat}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Student active bill lists */}
                  {cartStudentProfile && (
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col min-h-[300px]">
                      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
                        <div>
                          <h3 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider">LANGKAH 2: CENTANG OBLIGASI YANG INGIN DIBAYAR</h3>
                          <p className="text-[10px] text-slate-500">Tersaring murni tagihan yang berstatus "Belum Lunas" atau "Cicilan".</p>
                        </div>
                        <button
                          onClick={handleSelectAllArrearsInCart}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200 rounded transition font-sans"
                        >
                          PILIH SEMUA TUNGGAKAN
                        </button>
                      </div>

                      <div className="overflow-y-auto max-h-[350px] font-sans">
                        <table className="w-full text-xs text-left text-slate-650">
                          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-700 tracking-wider">
                            <tr>
                              <th className="px-4 py-3 text-center w-12">Pilih</th>
                              <th className="px-4 py-3">Kode Program</th>
                              <th className="px-4 py-3">Periode</th>
                              <th className="px-4 py-3 text-right">Target Tagihan</th>
                              <th className="px-4 py-3 text-right">Sudah Dibayar</th>
                              <th className="px-4 py-3 text-right">Sisa Tunggakan</th>
                              <th className="px-4 py-3 text-center">Nominal Bayar Sekarang (Kustom)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {cartStudentUnpaidBills.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-slate-400 italic">
                                  Hebat! Semua tagihan murid ini berstatus Lunas. Tidak ada tunggakan terdeteksi.
                                </td>
                              </tr>
                            ) : (
                              cartStudentUnpaidBills.map((b) => {
                                const payType = paymentTypes.find(p => p.kode === b.kodePembayaran);
                                const isBebas = payType?.jenis === 'Bebas';
                                const sisa = b.nominal - b.terbayar;
                                const isChecked = !!cartCheckedBills[b.id];

                                return (
                                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3.5 text-center">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleToggleCartItem(b.id)}
                                        className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                                      />
                                    </td>
                                    <td className="px-4 py-3.5 font-mono font-bold text-blue-700">{b.kodePembayaran}</td>
                                    <td className="px-4 py-3.5 font-semibold text-slate-800">{b.periode}</td>
                                    <td className="px-4 py-3.5 text-right font-mono">{formatIDR(b.nominal)}</td>
                                    <td className="px-4 py-3.5 text-right font-mono text-emerald-600">{formatIDR(b.terbayar)}</td>
                                    <td className="px-4 py-3.5 text-right font-mono font-bold text-red-650">{formatIDR(sisa)}</td>
                                    <td className="px-4 py-3 text-center">
                                      {isBebas && isChecked ? (
                                        <input
                                          type="number"
                                          min={1}
                                          max={sisa}
                                          value={cartBebasAmounts[b.id] || ''}
                                          onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setCartBebasAmounts(prev => ({ ...prev, [b.id]: val }));
                                          }}
                                          className="text-center text-xs font-mono font-bold border border-blue-400 p-1 rounded w-28 bg-blue-50/50"
                                        />
                                      ) : isBebas ? (
                                        <span className="text-slate-400 text-[10px] italic">Centang untuk cicilan</span>
                                      ) : (
                                        <span className="text-emerald-600 font-mono font-bold font-sans">Full {formatIDR(b.nominal)}</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right basket checkout column */}
                <div className="col-span-1 bg-white p-5 rounded-lg border border-slate-200 h-[480px] flex flex-col justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">LANGKAH 3: KASIR CHECKOUT</span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">Daftar Setoran</h3>
                  </div>

                  <div className="flex-1 overflow-y-auto my-6 space-y-2 border-y border-slate-100 py-4 font-sans">
                    {Object.entries(cartCheckedBills).filter(([_, checked]) => checked).length === 0 ? (
                      <div className="text-slate-400 italic text-xs py-12 text-center">Masukan setoran belum tertera.</div>
                    ) : (
                      Object.entries(cartCheckedBills).map(([billId, checked]) => {
                        if (!checked) return null;
                        const b = bills.find(item => item.id === billId);
                        if (!b) return null;

                        const payType = paymentTypes.find(p => p.kode === b.kodePembayaran);
                        let finalVal = b.nominal;
                        if (payType?.jenis === 'Bebas') {
                          finalVal = cartBebasAmounts[billId] || (b.nominal - b.terbayar);
                        }

                        return (
                          <div key={billId} className="flex justify-between items-center text-xs bg-slate-50 p-2 border border-slate-150 rounded">
                            <div>
                              <p className="font-bold text-slate-800">{b.kodePembayaran} ({b.periode})</p>
                              <p className="text-[9px] text-slate-400 uppercase mt-0.5">Siswa: {getStudentInfoMap[b.nis]?.nama || 'Belum Lunas'}</p>
                            </div>
                            <span className="font-mono font-bold text-slate-900">{formatIDR(finalVal)}</span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-3 rounded-lg text-blue-900">
                      <span className="text-xs font-bold uppercase tracking-wider">TOTAL TERDAPAT:</span>
                      <span className="text-xl font-mono font-black">{formatIDR(cartCalculatedTotal)}</span>
                    </div>

                    <button
                      onClick={handleCheckoutCart}
                      disabled={cartCalculatedTotal <= 0}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-extrabold text-white text-xs rounded-lg transition shadow-lg uppercase tracking-wider"
                    >
                      CETAK & BAYAR SEKARANG
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== RIWAYAT TRANSAKSI ===================== */}
            {activeTab === 'riwayat' && (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs animate-fade-in no-print bg-slate-50">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider leading-none">LEDGER RIWAYAT KASIR SEKOLAH</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Daftar mutasi penerimaan tunai, pencurian/pembatalan kwitansi hanya berlaku hak penuh Admin.</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded border border-blue-200">
                    {transactions.length} Transaksi Terhitung
                  </span>
                </div>

                <div className="overflow-x-auto font-sans">
                  <table className="w-full text-xs text-left text-slate-650">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-750 tracking-wider">
                      <tr>
                        <th className="px-4 py-3">No Transaksi (Kwitansi)</th>
                        <th className="px-4 py-3">Waktu Pencatatan</th>
                        <th className="px-4 py-3">Siswa (NIS)</th>
                        <th className="px-4 py-3">Nama Siswa</th>
                        <th className="px-4 py-3">Total Setoran</th>
                        <th className="px-4 py-3">Kasir Pencatat</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">Belum ada aktivitas mutasi yang tercatat.</td>
                        </tr>
                      ) : (
                        transactions.slice().reverse().map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3.5 font-mono font-bold text-blue-700">{t.noTransaksi}</td>
                            <td className="px-4 py-3.5 font-mono text-slate-500">{t.tanggal}</td>
                            <td className="px-4 py-3.5 font-mono">{t.nis}</td>
                            <td className="px-4 py-3.5 font-bold uppercase text-slate-900">{getStudentInfoMap[t.nis]?.nama || 'Siswa Nonaktif'}</td>
                            <td className="px-4 py-3.5 font-mono font-semibold text-slate-900">{formatIDR(t.total)}</td>
                            <td className="px-4 py-3.5"><span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono text-[10px]">{t.petugas}</span></td>
                            <td className="px-4 py-3 text-right">
                              <div className="inline-flex gap-1">
                                <button
                                  onClick={() => openReceiptViewer(t)}
                                  className="px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold hover:bg-blue-100 transitions"
                                >
                                  Cetak Kwitansi
                                </button>
                                <button
                                  onClick={() => handleDeleteTransaction(t)}
                                  className="p-1 px-2.5 hover:bg-red-50 text-red-650 rounded text-[10px] font-bold shadow-2xs"
                                  title="Batalkan mutasi / Rollback"
                                >
                                  Rollback (Void)
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===================== LAPORAN PENERIMAAN / TUNGGAKAN ===================== */}
            {activeTab === 'laporan' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-none">Pusat Laporan & Analitik Keuangan</h2>
                  <p className="text-xs text-slate-500 mt-1.5">Kustomisasi kolom ekspor, cetak rekap kas harian, bulanan, tahunan, atau klasifikasi grid tunggakan sekolah.</p>
                </div>
                <LaporanPage
                  students={students}
                  transactions={transactions}
                  details={detailTransactions}
                  bills={bills}
                  paymentTypes={paymentTypes}
                  logAction={logAction}
                />
              </div>
            )}

            {/* ===================== IDENTITAS / PROFILE SEKOLAH ===================== */}
            {activeTab === 'profil_sekolah' && (
              <div className="space-y-6 animate-fade-in no-print">
                {/* Header title */}
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-none">Profil & Identitas Sekolah</h2>
                  <p className="text-xs text-slate-500 mt-1.5">Sesuaikan identitas, inisial monogram, logo raster, legalitas kementerian, serta nama pejabat penandatangan utama kwitansi SIPES Anda.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Form Settings */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 space-y-6">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <School className="h-5 w-5 text-blue-600" />
                        <h3 className="font-extrabold text-slate-950 text-xs sm:text-sm uppercase tracking-wider">Formulir Identitas</h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">SIPES CONFIG</span>
                    </div>

                    {/* Presets Row */}
                    <div className="bg-blue-50/50 rounded-lg p-3.5 border border-blue-100 space-y-2">
                      <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-widest block">Templat Identitas Instan</span>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setSchoolConfig({
                              nama: 'SMA NEGERI 1 SIDOARJO',
                              alamat: 'Jl. Jenggolo No. 1, Sidoarjo, Jawa Timur',
                              subHeader: 'SIP: 421.1/912/101.05/2025 | NPSN: 20201010',
                              inisial: 'SMAN1',
                              npsn: '20201010',
                              statusKwitansi: 'KWITANSI PEMBAYARAN RESMI',
                              logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
                              telepon: '(031) 8941012',
                              email: 'info@sman1sidoarjo.sch.id',
                              bendahara: 'Hj. Siti Aminah, S.E.',
                              kepalaSekolah: 'Dr. Hari Wibowo, M.Pd.'
                            });
                            logAction('info', 'Kasir memuat Preset Sektor Pendidikan: SMA Negeri 1 Sidoarjo.');
                          }}
                          className="px-2.5 py-1.5 bg-white border border-blue-200 hover:border-blue-400 text-blue-700 rounded-md font-medium transition cursor-pointer"
                        >
                          🏛️ SMA Negeri Preset
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSchoolConfig({
                              nama: 'MADRASAH ALIYAH AL-MAARIF',
                              alamat: 'Jl. Sunan Kalijaga No. 45, Sidoarjo, Jawa Timur',
                              subHeader: 'Kemenag RI: MA/102/421.2/2024 | NSM: 131235150005',
                              inisial: 'MA-AL',
                              npsn: '20235612',
                              statusKwitansi: 'BUKTI SETORAN KEUANGAN MADRASAH',
                              logoUrl: '',
                              telepon: '(031) 8967011',
                              email: 'ma_al_maarif@yayasan.org',
                              bendahara: 'M. Nur Cholish, S.E.I.',
                              kepalaSekolah: 'K.H. Ahmad Dahlan, M.Ag.'
                            });
                            logAction('info', 'Kasir memuat Preset Sektor Keagamaan: Madrasah Aliyah Al-Maarif.');
                          }}
                          className="px-2.5 py-1.5 bg-white border border-blue-200 hover:border-blue-400 text-blue-700 rounded-md font-medium transition cursor-pointer"
                        >
                          🕌 Madrasah Aliyah Preset
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSchoolConfig({
                              nama: 'SMK ADI LUHUR TERPADU',
                              alamat: 'Jl. Industri Kedungturi No. 99, Taman, Sidoarjo',
                              subHeader: 'Sertifikat ISO 9001:2015 | NPSN: 60124982',
                              inisial: 'SMK-AL',
                              npsn: '60124982',
                              statusKwitansi: 'RESI PEMBAYARAN SPP RESMI',
                              logoUrl: '',
                              telepon: '(031) 7892301',
                              email: 'hubmas@smkadiluhur.sch.id',
                              bendahara: 'Diana Lestari, A.Md.Ak.',
                              kepalaSekolah: 'Ir. Baskoro Wijoyo, M.T.'
                            });
                            logAction('info', 'Kasir memuat Preset Sektor Vokasi: SMK Adi Luhur Terpadu.');
                          }}
                          className="px-2.5 py-1.5 bg-white border border-blue-200 hover:border-blue-400 text-blue-700 rounded-md font-medium transition cursor-pointer"
                        >
                          ⚙️ SMK Vokasional Preset
                        </button>
                      </div>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      localStorage.setItem('sipes_school_config', JSON.stringify(schoolConfig));
                      logAction('success', `🟢 Berhasil memperbarui konfigurasi sekolah! Sekarang kop surat di Kwitansi, Laporan dan Header mengindikasikan: ${schoolConfig.nama}`);
                      alert('Identitas sekolah berhasil diperbarui secara permanen di cache lokal!');
                    }} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">NAMA RESMI SEKOLAH *</label>
                        <input
                          type="text"
                          required
                          value={schoolConfig.nama}
                          onChange={(e) => setSchoolConfig(prev => ({ ...prev, nama: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">INISIAL MONOGRAM LOGO (Max 6 Huruf)</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={schoolConfig.inisial}
                          onChange={(e) => setSchoolConfig(prev => ({ ...prev, inisial: e.target.value.toUpperCase() }))}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none uppercase font-mono"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">ALAMAT RESMI SEKOLAH *</label>
                        <input
                          type="text"
                          required
                          value={schoolConfig.alamat}
                          onChange={(e) => setSchoolConfig(prev => ({ ...prev, alamat: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">SUB-HEADER RESMI (KOP / NO IJIN / SIPP)</label>
                        <input
                          type="text"
                          value={schoolConfig.subHeader || ''}
                          onChange={(e) => setSchoolConfig(prev => ({ ...prev, subHeader: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">NOMOR POKOK SEKOLAH NASIONAL (NPSN)</label>
                        <input
                          type="text"
                          value={schoolConfig.npsn || ''}
                          onChange={(e) => setSchoolConfig(prev => ({ ...prev, npsn: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block font-semibold text-blue-700">LOGO SEKOLAH (URL GAMBAR)</label>
                        <input
                          type="url"
                          placeholder="https://domain.com/path-ke-gambar.png"
                          value={schoolConfig.logoUrl || ''}
                          onChange={(e) => setSchoolConfig(prev => ({ ...prev, logoUrl: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none text-blue-900"
                        />
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                          Gunakan URL gambar online (e.g. gambar publik dari website sekolah). Jika dibiarkan kosong, sistem otomatis memakai initial monogram sekolah yang diinput di atas.
                        </p>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">LABEL STATUS KWITANSI</label>
                        <input
                          type="text"
                          required
                          value={schoolConfig.statusKwitansi}
                          onChange={(e) => setSchoolConfig(prev => ({ ...prev, statusKwitansi: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">TELEPON SEKOLAH</label>
                        <input
                          type="text"
                          value={schoolConfig.telepon || ''}
                          onChange={(e) => setSchoolConfig(prev => ({ ...prev, telepon: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block font-semibold text-slate-500">PEJABAT BENDAHARA SEKOLAH (TANDA TANGAN)</label>
                        <input
                          type="text"
                          placeholder="Sri Wahyuni, S.Pd."
                          value={schoolConfig.bendahara || ''}
                          onChange={(e) => setSchoolConfig(prev => ({ ...prev, bendahara: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block font-semibold text-slate-500">NAMA KEPALA SEKOLAH (MENGETAHUI)</label>
                        <input
                          type="text"
                          placeholder="Drs. H. M. Yusuf, M.Pd."
                          value={schoolConfig.kepalaSekolah || ''}
                          onChange={(e) => setSchoolConfig(prev => ({ ...prev, kepalaSekolah: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2 pt-4 flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Apakah Anda yakin ingin menyetel ulang identitas sekolah ke setelan bawaan?')) {
                              setSchoolConfig(DEFAULT_SCHOOL_CONFIG);
                              localStorage.removeItem('sipes_school_config');
                              logAction('warning', 'Setelan identitas sekolah di-reset ke bawaan SMA Adi Luhur Sidoarjo.');
                              alert('Berhasil di-reset ke setelan template SMAN Adi Luhur Sidoarjo!');
                            }
                          }}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition cursor-pointer"
                        >
                          Reset Default
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow transition-all cursor-pointer"
                        >
                          Simpan Permanen Profil
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Live Header Preview Card */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Model Pratinjau Kertas Kwitansi</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Kop Surat berikut di bawah ini akan di-render otomatis dengan data yang Anda inputkan di formulir sebelah kiri ketika kasir mencetak kwitansi pembayaran siswa.
                    </p>

                    {/* Live Sim Box */}
                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 shadow-inner font-sans text-left space-y-4">
                      <div className="bg-white p-4 rounded-md border border-slate-150 shadow-xs space-y-4">
                        {/* Headers */}
                        <div className="flex justify-between items-center border-b border-slate-900 pb-3 gap-2">
                          <div className="flex items-center gap-2">
                            {schoolConfig.logoUrl ? (
                              <img
                                src={schoolConfig.logoUrl}
                                alt="Logo"
                                referrerPolicy="no-referrer"
                                className="h-8 w-8 rounded-md object-contain border bg-slate-50 border-slate-200"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                  const fallback = document.getElementById('preview-logo-fallback');
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div 
                              id="preview-logo-fallback"
                              className={`h-8 w-8 bg-blue-600/10 text-blue-700 text-[10px] font-black tracking-widest rounded-md border border-blue-200 flex items-center justify-center font-sans uppercase shrink-0 ${schoolConfig.logoUrl ? 'hidden' : ''}`}
                            >
                              {schoolConfig.inisial || 'SP'}
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="text-xs font-black text-slate-900 uppercase truncate leading-none">{schoolConfig.nama || 'Silakan Isi Nama'}</h4>
                              <p className="text-[8px] text-slate-500 truncate mt-0.5 leading-none">{schoolConfig.alamat || 'Silakan Isi Alamat'}</p>
                              <p className="text-[7px] text-slate-400 font-mono inline-block truncate mt-0.5 leading-none">{schoolConfig.subHeader || 'SIPP / Legalitas'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Middle Info */}
                        <div className="flex justify-between text-[8px] border-b border-dashed border-slate-200 pb-2">
                          <div>
                            <p className="text-slate-400 uppercase font-bold tracking-wide text-[6px]">Penerima Kas</p>
                            <p className="text-slate-800 font-semibold mt-0.5">Andi Saputra (X-IPA-1)</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[7px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1 py-0.5 rounded uppercase font-sans">
                              {schoolConfig.statusKwitansi}
                            </span>
                            <p className="font-mono text-slate-900 mt-1 font-bold">#TRX-00125</p>
                          </div>
                        </div>

                        {/* Signatures */}
                        <div className="grid grid-cols-2 gap-4 pt-1 text-[8px]">
                          <div className="text-center space-y-6">
                            <p className="text-slate-405 font-bold uppercase tracking-wider text-[6px]">Siswa</p>
                            <p className="font-bold border-b border-slate-200 pb-0.5 text-slate-700 uppercase leading-none mx-2">Andi S.</p>
                            {schoolConfig.kepalaSekolah && (
                              <p className="text-[6px] text-slate-500 leading-none truncate font-semibold">KS: {schoolConfig.kepalaSekolah}</p>
                            )}
                          </div>
                          <div className="text-center space-y-6">
                            <p className="text-slate-405 font-bold uppercase tracking-wider text-[6px]">Bendahara / Kasir</p>
                            <p className="font-bold border-b border-slate-200 pb-0.5 text-slate-700 uppercase leading-none truncate mx-2">
                              {schoolConfig.bendahara || 'Petugas'}
                            </p>
                            {schoolConfig.bendahara && (
                              <p className="text-[6px] text-slate-500 leading-none italic">Verified Treasurer</p>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Pro Tips */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[10px] tracking-wide">💡 Tips Branding Hebat</h4>
                      <p className="text-[11px]">
                        1. **Inisial Singkat**: Sesuaikan monogram misal "MTsN", "YPM", "SMK" agar logo retro di panel samping dan cetakan terlihat presisi.
                      </p>
                      <p className="text-[11px]">
                        2. **NPSN Keamanan**: Menambahkan NPSN memastikan kuitansi yang dicetak memiliki integritas dan terdaftar di database kementerian.
                      </p>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* ===================== USER MANAGEMENT ===================== */}
            {activeTab === 'user_management' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in bg-slate-50 no-print">
                <div className="col-span-1 bg-white p-5 rounded-lg border border-slate-200 space-y-4">
                  <h3 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider text-blue-800">Ulasan Hak Akses Kasir (Roles)</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sistem SIPES memiliki 2 pilar peranan kognitif yang memagari operasional guna melindungi data kas sekolah:
                  </p>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="p-3 bg-blue-50/50 rounded border border-blue-100 border-l-4 border-blue-600">
                      <p className="font-bold text-blue-900 uppercase tracking-wide">Role: Admin</p>
                      <p className="text-slate-500 mt-1 leading-relaxed">Berwenang penuh atas sistem. Diijinkan melakukan rollback pembatalan transaksi, menghapus data murid, menyeting besaran tarif, dan mendeploy pemicu spreadsheet.</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded border border-slate-305 border-l-4 border-slate-600">
                      <p className="font-bold text-slate-900 uppercase tracking-wide">Role: Operator</p>
                      <p className="text-slate-500 mt-1 leading-relaxed">Merupakan petugas garis depan kasir. Hanya berwenang melayani transaksi murid, mendaftarkan tagihan, dan melihat visualisasi laporan. Dilarang mendelete atau merollback data.</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 lg:col-span-2 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col h-[400px]">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
                    <h3 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider">Registry User Aktif</h3>
                    <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-800 px-2 py-0.5 border border-blue-250 rounded">
                      {users.length} Kasir terdaftar
                    </span>
                  </div>

                  <div className="overflow-y-auto flex-1 font-sans">
                    <table className="w-full text-xs text-left text-slate-650">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-705 tracking-wider">
                        <tr>
                          <th className="px-4 py-3">ID Kasir</th>
                          <th className="px-4 py-3">Nama Pengguna (Username)</th>
                          <th className="px-4 py-3">Password (Kunci)</th>
                          <th className="px-4 py-3">Peranan (Privileges)</th>
                          <th className="px-4 py-3 text-center">Deskripsi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3.5 font-mono">{u.id}</td>
                            <td className="px-4 py-3.5 font-bold uppercase text-slate-900">{u.username}</td>
                            <td className="px-4 py-3.5 font-mono select-all text-slate-500">{u.password}</td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-block font-bold text-[10px] roundedpx-2.5 py-0.5 rounded px-2 ${
                                u.role === 'Admin' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-800'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-slate-450 italic font-normal text-[11px]">{u.role === 'Admin' ? 'Authorized Supervisor' : 'Frontline Ticket Cashier'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== INTEGRASI GOOGLE SHEET ===================== */}
            {activeTab === 'integrasi' && (
              <div className="space-y-6 animate-fade-in no-print bg-slate-50">
                <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-4">
                  <h3 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider text-blue-800">
                    Panel Pengaturan & Koneksi Spreadsheet (Google Drive)
                  </h3>
                  <p className="text-xs text-slate-500">
                    SIPES dirancang bekerja dalam dualisme. Anda dapat menggunakan offline simulator atau memasukkan deploy Web API Apps Script di bawah ini agar data disinkronisasikan secara real-time ke lembar Google Sheets Anda.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Google Spreadsheet URL *</label>
                      <input
                        type="text"
                        value={settings.spreadsheetUrl}
                        onChange={(e) => setSettings(prev => ({ ...prev, spreadsheetUrl: e.target.value }))}
                        className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 text-slate-800"
                        placeholder="https://docs.google.com/spreadsheets/d/1A2B3C.../edit"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Web App Deployment URL (Apps Script API)</label>
                      <input
                        type="text"
                        value={settings.webAppUrl}
                        onChange={(e) => setSettings(prev => ({ ...prev, webAppUrl: e.target.value }))}
                        className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 text-slate-800"
                        placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {settings.connectionStatus === 'connected' ? (
                      <button
                        onClick={handleDisconnectSpreadsheet}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded transition-colors"
                      >
                        Putuskan Sinyal Spreadsheet
                      </button>
                    ) : (
                      <button
                        onClick={handleConnectSpreadsheet}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Radio className="h-3 w-3 animate-ping" />
                        Hubungkan & Mulai Handshake
                      </button>
                    )}

                    {settings.connectionStatus === 'connected' && (
                      <>
                        <button
                          onClick={handleInitGoogleSheetsDatabase}
                          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-bold text-xs text-slate-700 border border-slate-300 rounded transition-colors"
                        >
                          Inisialisasi Database Sheet
                        </button>
                        <button
                          onClick={handlePullCloudData}
                          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 font-bold text-xs text-blue-700 border border-blue-250 rounded transition-all"
                        >
                          Tarik Data (PULL)
                        </button>
                        <button
                          onClick={handlePushCloudData}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-extrabold text-xs text-white rounded transition shadow-sm"
                        >
                          Kirim Data (PUSH)
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Console view is integrated underneath */}
                <ConsoleTerminal logs={logs} onClear={handleClearLogs} />
              </div>
            )}

            {/* ===================== APPS SCRIPT CODE EXPLORER ===================== */}
            {activeTab === 'gas_code' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-none">Apps Script Deployment Center</h2>
                  <p className="text-xs text-slate-500 mt-1.5">Salin kode di bawah ke ekstensi Google Sheets Anda agar API sinkronisasi SIPES berjalan cloud secara live.</p>
                </div>
                <GsCodeCenter />
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Kwitansi Printable Overlay Modal */}
      {activeReceipt && (
        <InvoiceReceipt
          transaction={activeReceipt.transaction}
          details={activeReceipt.details}
          student={students.find(s => s.nis === activeReceipt.transaction.nis) || students[0]}
          allBills={bills}
          allPaymentTypes={paymentTypes}
          schoolConfig={schoolConfig}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
}
