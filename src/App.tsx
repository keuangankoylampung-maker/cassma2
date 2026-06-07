/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Siswa, JenisPembayaran, TarifSiswa, Tagihan, Transaksi, DetailTransaksi, User } from './types';
import { initiateLocalDatabase } from './data/initialData';
import Dashboard from './components/Dashboard';
import StudentManager from './components/StudentManager';
import PaymentTypeManager from './components/PaymentTypeManager';
import TariffManager from './components/TariffManager';
import BillingGenerator from './components/BillingGenerator';
import PaymentTransaction from './components/PaymentTransaction';
import HistoryManager from './components/HistoryManager';
import ReportManager from './components/ReportManager';
import UserManager from './components/UserManager';
import GasIntegration from './components/GasIntegration';

// Icons
import { 
  LayoutDashboard, Users, CreditCard, History, 
  Layers, Sliders, Zap, FileSpreadsheet, Shield, 
  Network, LogOut, ChevronDown, UserCircle,
  Sun, Moon
} from 'lucide-react';

export default function App() {
  // 1. Core States
  const [db, setDb] = useState<ReturnType<typeof initiateLocalDatabase> | null>(null);
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Theme support
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('school_admin_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  // Deep link support from dashboard to payment checkout
  const [selectedPaymentNis, setSelectedPaymentNis] = useState<string>('');

  // Toggle dark/light class on document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('school_admin_theme', theme);
  }, [theme]);

  // Loads local storage database
  useEffect(() => {
    const database = initiateLocalDatabase();
    setDb(database);
    
    const loggedUser = localStorage.getItem('current_user');
    if (loggedUser) {
      setCurrentUser(JSON.parse(loggedUser));
    } else if (database.users.length > 0) {
      setCurrentUser(database.users[0]);
    }
  }, []);

  if (!db || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Menginisialisasi Database Sekolah...</p>
        </div>
      </div>
    );
  }

  // Helper persistence writer
  const writeDb = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
    setDb((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [key.replace('db_', '')]: data
      };
    });
  };

  // 2. User Authentication Controls
  const handleSwitchUser = (user: User) => {
    localStorage.setItem('current_user', JSON.stringify(user));
    setCurrentUser(user);
    alert(`Berhasil berpindah peran sebagai: ${user.username} (${user.role})`);
  };

  // 3. Student Action Callbacks
  const handleAddStudent = (newData: Omit<Siswa, 'id'>) => {
    const id = 'S-' + Date.now();
    const s: Siswa = { id, ...newData };
    const updated = [...db.siswa, s];
    writeDb('db_siswa', updated);
  };

  const handleEditStudent = (id: string, updatedData: Partial<Siswa>) => {
    const updated = db.siswa.map((s) => (s.id === id ? { ...s, ...updatedData } : s));
    writeDb('db_siswa', updated);
  };

  const handleDeleteStudent = (id: string) => {
    const updated = db.siswa.filter((s) => s.id !== id);
    writeDb('db_siswa', updated);
  };

  const handleImportStudents = (list: Omit<Siswa, 'id'>[]) => {
    const newStudents = list.map((item, idx) => ({
      id: `S-${Date.now()}-${idx}-${Math.floor(Math.random() * 100)}`,
      ...item
    }));
    const updated = [...db.siswa, ...newStudents];
    writeDb('db_siswa', updated);
  };

  // 4. Payment Types Action Callbacks
  const handleAddType = (newData: Omit<JenisPembayaran, 'id'>) => {
    const id = 'P-' + Date.now();
    const t: JenisPembayaran = { id, ...newData };
    const updated = [...db.jenisPembayaran, t];
    writeDb('db_jenis_pembayaran', updated);
  };

  const handleEditType = (id: string, updatedData: Partial<JenisPembayaran>) => {
    const updated = db.jenisPembayaran.map((t) => (t.id === id ? { ...t, ...updatedData } : t));
    writeDb('db_jenis_pembayaran', updated);
  };

  const handleDeleteType = (id: string) => {
    const updated = db.jenisPembayaran.filter((t) => t.id !== id);
    writeDb('db_jenis_pembayaran', updated);
  };

  // 5. Tariff Action Callbacks
  const handleSetTariff = (nis: string, kodePembayaran: string, nominal: number) => {
    const existingIndex = db.tarifSiswa.findIndex((t) => t.nis === nis && t.kodePembayaran === kodePembayaran);
    let updated = [...db.tarifSiswa];
    
    if (existingIndex > -1) {
      updated[existingIndex] = { ...updated[existingIndex], nominal };
    } else {
      updated.push({
        id: 'T-' + Date.now(),
        nis,
        kodePembayaran,
        nominal
      });
    }
    writeDb('db_tarif_siswa', updated);
  };

  const handleSetMassTariff = (kelas: string, kodePembayaran: string, nominal: number) => {
    const targets = db.siswa.filter((s) => s.kelas === kelas && s.statusAktif === 'Aktif');
    let updated = [...db.tarifSiswa];

    targets.forEach((s) => {
      const idx = updated.findIndex((t) => t.nis === s.nis && t.kodePembayaran === kodePembayaran);
      if (idx > -1) {
        updated[idx] = { ...updated[idx], nominal };
      } else {
        updated.push({
          id: `T-${Date.now()}-${s.nis}`,
          nis: s.nis,
          kodePembayaran,
          nominal
        });
      }
    });

    writeDb('db_tarif_siswa', updated);
  };

  const handleImportTariffs = (list: { nis: string; kodePembayaran: string; nominal: number }[]) => {
    let updated = [...db.tarifSiswa];
    list.forEach((item) => {
      const idx = updated.findIndex((t) => t.nis === item.nis && t.kodePembayaran === item.kodePembayaran);
      if (idx > -1) {
        updated[idx] = { ...updated[idx], nominal: item.nominal };
      } else {
        updated.push({
          id: `T-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          ...item
        });
      }
    });
    writeDb('db_tarif_siswa', updated);
  };

  // 6. Billing Automated Generator Callbacks
  const handleGenerateBulanan = (kodePembayaran: string, tahunAjaran: string) => {
    const pm = db.jenisPembayaran.find((p) => p.kode === kodePembayaran);
    if (!pm) return;

    const activeSiswa = db.siswa.filter((s) => s.statusAktif === 'Aktif');
    const months = [
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'
    ];

    let updatedBills = [...db.tagihan];
    let countGenerated = 0;

    activeSiswa.forEach((s) => {
      // Find customized tariff, fallback to default
      const tariff = db.tarifSiswa.find((t) => t.nis === s.nis && t.kodePembayaran === kodePembayaran);
      const nominalBill = tariff ? tariff.nominal : pm.nominalDefault;

      months.forEach((month, mIdx) => {
        // Formulated Year split
        const [y1, y2] = tahunAjaran.split('/');
        const activeYear = mIdx < 6 ? y1 : y2;
        const periodKey = `${month} ${activeYear}`;

        // Duplicate Check
        const exists = updatedBills.some(
          (ub) => ub.nis === s.nis && ub.kodePembayaran === kodePembayaran && ub.periode === periodKey
        );

        if (!exists) {
          updatedBills.push({
            id: `TG-${Date.now()}-${s.nis}-${mIdx}`,
            nis: s.nis,
            kodePembayaran,
            namaPembayaran: pm.nama,
            periode: periodKey,
            nominal: nominalBill,
            terbayar: 0,
            status: 'Belum Lunas',
            tahunAjaran,
            jenis: 'Bulanan'
          });
          countGenerated++;
        }
      });
    });

    writeDb('db_tagihan', updatedBills);
    alert(`Sukses! Berhasil menerbitkan ${countGenerated} lembar invoice tagihan bulanan.`);
  };

  const handleGenerateBebas = (kodePembayaran: string, tahunAjaran: string) => {
    const pm = db.jenisPembayaran.find((p) => p.kode === kodePembayaran);
    if (!pm) return;

    const activeSiswa = db.siswa.filter((s) => s.statusAktif === 'Aktif');
    let updatedBills = [...db.tagihan];
    let countGenerated = 0;

    activeSiswa.forEach((s) => {
      const tariff = db.tarifSiswa.find((t) => t.nis === s.nis && t.kodePembayaran === kodePembayaran);
      const nominalBill = tariff ? tariff.nominal : pm.nominalDefault;

      const exists = updatedBills.some(
        (ub) => ub.nis === s.nis && ub.kodePembayaran === kodePembayaran && ub.periode === 'Tagihan Sekali Bayar'
      );

      if (!exists) {
        updatedBills.push({
          id: `TG-${Date.now()}-${s.nis}-bebas`,
          nis: s.nis,
          kodePembayaran,
          namaPembayaran: pm.nama,
          periode: 'Tagihan Sekali Bayar',
          nominal: nominalBill,
          terbayar: 0,
          status: 'Belum Lunas',
          tahunAjaran,
          jenis: 'Bebas'
        });
        countGenerated++;
      }
    });

    writeDb('db_tagihan', updatedBills);
    alert(`Sukses! Berhasil menerbitkan ${countGenerated} lembar invoice tagihan bebas once-off.`);
  };

  // 7. Transaction Processing checkout
  const handleProcessPayment = (
    nis: string, 
    checkoutList: { id: string; nominalBayar: number }[],
    username: string
  ) => {
    try {
      const year = new Date().getFullYear();
      const nextNum = db.transaksi.length + 1;
      const noTrx = `TRX-${year}-${('000000' + nextNum).slice(-6)}`;
      
      let totalValue = 0;
      
      // Calculate Total
      checkoutList.forEach((chk) => {
        totalValue += chk.nominalBayar;
      });

      const matchedStudent = db.siswa.find((s) => s.nis === nis);
      if (!matchedStudent) throw new Error('Siswa tidak ditemukan.');

      // 1. Create Header Transaksi
      const newTrx: Transaksi = {
        id: 'TX-' + Date.now(),
        noTransaksi: noTrx,
        tanggal: new Date().toISOString(),
        nis,
        namaSiswa: matchedStudent.nama,
        kelas: matchedStudent.kelas,
        total: totalValue,
        petugas: username
      };

      // 2. Create details & Update Bill Statuses
      const newDetails: DetailTransaksi[] = [];
      let updatedBills = [...db.tagihan];

      checkoutList.forEach((chk, idx) => {
        const targetBillIdx = updatedBills.findIndex((b) => b.id === chk.id);
        if (targetBillIdx === -1) return;

        const b = updatedBills[targetBillIdx];
        
        // Write Detail Log
        newDetails.push({
          id: `DT-${Date.now()}-${idx}`,
          noTransaksi: noTrx,
          tagihanId: chk.id,
          namaPembayaran: b.namaPembayaran,
          periode: b.periode,
          nominal: chk.nominalBayar
        });

        // Update Tagihan amount Paid
        const newPaidAccum = b.terbayar + chk.nominalBayar;
        let newStatus: 'Belum Lunas' | 'Cicilan' | 'Lunas' = 'Belum Lunas';
        
        if (newPaidAccum >= b.nominal) {
          newStatus = 'Lunas';
        } else if (newPaidAccum > 0) {
          newStatus = 'Cicilan';
        }

        updatedBills[targetBillIdx] = {
          ...b,
          terbayar: newPaidAccum,
          status: newStatus
        };
      });

      // Write changes
      writeDb('db_tagihan', updatedBills);
      writeDb('db_transaksi', [...db.transaksi, newTrx]);
      writeDb('db_detail_transaksi', [...db.detailTransaksi, ...newDetails]);

      return { success: true, message: 'Pembayaran berhasil disimpan!', noTransaksi: noTrx };
    } catch (e: any) {
      return { success: false, message: e.message || 'Kemungkinan ada kegagalan internal.' };
    }
  };

  // 8. Undo/Refund transaction (Rollbacks invoice totals) - Admin only!
  const handleDeleteTransaction = (txId: string) => {
    const rx = db.transaksi.find((t) => t.id === txId);
    if (!rx) return;

    // Get child logs
    const details = db.detailTransaksi.filter((dt) => dt.noTransaksi === rx.noTransaksi);
    let updatedBills = [...db.tagihan];

    // Rollback payments
    details.forEach((det) => {
      const idx = updatedBills.findIndex((b) => b.id === det.tagihanId);
      if (idx > -1) {
        const b = updatedBills[idx];
        const rolledPaid = b.terbayar - det.nominal;
        let rolledStatus: 'Belum Lunas' | 'Cicilan' | 'Lunas' = 'Belum Lunas';

        if (rolledPaid >= b.nominal) {
          rolledStatus = 'Lunas';
        } else if (rolledPaid > 0) {
          rolledStatus = 'Cicilan';
        }

        updatedBills[idx] = {
          ...b,
          terbayar: rolledPaid,
          status: rolledStatus
        };
      }
    });

    // Save to local storage
    const nextTrxs = db.transaksi.filter((t) => t.id !== txId);
    const nextDetails = db.detailTransaksi.filter((dt) => dt.noTransaksi !== rx.noTransaksi);

    writeDb('db_tagihan', updatedBills);
    writeDb('db_transaksi', nextTrxs);
    writeDb('db_detail_transaksi', nextDetails);

    alert(`Sukses! Pembukuan kuitansi ${rx.noTransaksi} dibatalkan, tagihan siswa terupdate.`);
  };

  // 9. Users credential setup
  const handleAddUser = (data: Omit<User, 'id'>) => {
    const id = 'U-' + Date.now();
    const updated = [...db.users, { id, ...data }];
    writeDb('db_users', updated);
  };

  const handleDeleteUser = (id: string) => {
    const updated = db.users.filter((u) => u.id !== id);
    writeDb('db_users', updated);
  };

  // Supporting direct redirect from dashboard recent records to payment checkout
  const handleNavigateToPayment = (nis: string) => {
    setSelectedPaymentNis(nis);
    setActiveTab('transaksi');
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-68 bg-slate-900 dark:bg-slate-925 text-slate-400 shrink-0 hidden md:flex flex-col justify-between border-r border-slate-800 dark:border-slate-850/85">
        <div className="space-y-6 py-6">
          
          {/* Logo / Title */}
          <div className="px-6 flex items-center gap-3">
            <div className="bg-sky-600 text-white font-black p-2.5 rounded-xl text-lg shadow">🏫</div>
            <div>
              <h2 className="text-white text-sm font-black leading-tight uppercase font-sans tracking-wide">SPS-ADMIN</h2>
              <p className="text-[10px] text-sky-400 font-extrabold tracking-wider">Portal Tata Usaha</p>
            </div>
          </div>

          <div className="border-t border-slate-800/80 px-3 pt-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest">
            Sistem Sekolah
          </div>

          {/* Menus List */}
          <nav className="space-y-1.5 px-3">
            {[
              { id: 'dashboard', label: '1. Dashboard Overview', icon: LayoutDashboard },
              { id: 'siswa', label: '2. Data Siswa CRUD', icon: Users },
              { id: 'jenis', label: '3. Master Jenis Bayar', icon: Layers },
              { id: 'tarif', label: '4. Tarif Per Siswa', icon: Sliders },
              { id: 'generate', label: '5. Automate Tagihan', icon: Zap },
              { id: 'transaksi', label: '6. Kasir Pembayaran', icon: CreditCard },
              { id: 'riwayat', label: '7. Riwayat Transaksi', icon: History },
              { id: 'laporan', label: '8. Laporan & Tunggakan', icon: FileSpreadsheet },
              { id: 'user', label: '9. Manajemen User', icon: Shield },
              { id: 'gas', label: '10. Integrasi Apps Script', icon: Network }
            ].map((m) => {
              const Icon = m.icon;
              const isActive = activeTab === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveTab(m.id);
                    if (m.id !== 'transaksi') setSelectedPaymentNis('');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition duration-200 group ${
                    isActive 
                      ? 'bg-sky-600 text-white shadow-md scale-[1.02]' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100 hover:translate-x-1'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition duration-200 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-100'}`} />
                  {m.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/20">
          <div className="flex items-center gap-2.5 bg-slate-850 p-2.5 rounded-xl border border-slate-800/80">
            <div className="bg-sky-905 text-sky-400 p-1.5 rounded-lg"><UserCircle className="w-4 h-4" /></div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-300 capitalize">{currentUser.username}</p>
              <p className="text-[9px] text-sky-400 font-black tracking-wider uppercase">{currentUser.role}</p>
            </div>
          </div>
          <p className="text-[9px] text-slate-600 text-center font-bold font-mono uppercase tracking-wider">v1.1.4 (Spreadsheet Sync)</p>
        </div>
      </aside>

      {/* MAIN CONTAINER LAYOUT */}
      <div className="flex-grow flex flex-col min-h-screen">
        
        {/* TOP WORKSPACE NAVIGATION STATUSBAR */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/60 px-6 py-4 flex items-center justify-between shadow-xs shrink-0 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <span className="text-xl md:hidden font-sans">🏫</span>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider hidden sm:inline-block">
              Google Apps Script Simulator
            </span>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition border border-slate-200 dark:border-slate-705 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-350 shadow-xs cursor-pointer font-bold text-xs"
              title={theme === 'light' ? 'Nyalakan Mode Gelap (Sore)' : 'Nyalakan Mode Terang (Pagi)'}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Mode Gelap</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                  <span className="hidden sm:inline">Mode Terang</span>
                </>
              )}
            </button>
          </div>

          {/* User switcher simulation / Active role info */}
          <div className="flex items-center gap-3 text-xs">
            {/* Switcer selection dropdown */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl px-3 py-1.5 font-sans">
              <span className="text-[10px] text-slate-450 dark:text-slate-400 font-bold uppercase">Pihak TU:</span>
              <select 
                value={currentUser.id}
                onChange={(e) => {
                  const targetUser = db.users.find((u) => u.id === e.target.value);
                  if (targetUser) handleSwitchUser(targetUser);
                }}
                className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer capitalize"
              >
                {db.users.map((u) => (
                  <option key={u.id} value={u.id} className="dark:bg-slate-900">{u.username} ({u.role})</option>
                ))}
              </select>
            </div>

            {/* Simulated Live Connection indicators */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/50 font-bold hidden sm:flex items-center gap-1.5 text-[10px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              SPREADSHEET LIVE CONNECTED
            </div>
          </div>
        </header>

        {/* WORKSPACE ACTIVE SUB-PAGE CONTAINER */}
        <main className="flex-grow p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/40">
          {activeTab === 'dashboard' && (
            <Dashboard 
              siswa={db.siswa}
              tagihan={db.tagihan}
              transaksi={db.transaksi}
              onNavigateToPayment={handleNavigateToPayment}
              theme={theme}
            />
          )}

          {activeTab === 'siswa' && (
            <StudentManager 
              siswa={db.siswa}
              currentUser={currentUser}
              onAddStudent={handleAddStudent}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
              onImportStudents={handleImportStudents}
            />
          )}

          {activeTab === 'jenis' && (
            <PaymentTypeManager 
              types={db.jenisPembayaran}
              currentUser={currentUser}
              onAddType={handleAddType}
              onEditType={handleEditType}
              onDeleteType={handleDeleteType}
            />
          )}

          {activeTab === 'tarif' && (
            <TariffManager 
              siswa={db.siswa}
              types={db.jenisPembayaran}
              tariffs={db.tarifSiswa}
              onSetTariff={handleSetTariff}
              onSetMassTariff={handleSetMassTariff}
              onImportTariffs={handleImportTariffs}
            />
          )}

          {activeTab === 'generate' && (
            <BillingGenerator 
              types={db.jenisPembayaran}
              tagihanList={db.tagihan}
              onGenerateBulanan={handleGenerateBulanan}
              onGenerateBebas={handleGenerateBebas}
            />
          )}

          {activeTab === 'transaksi' && (
            <PaymentTransaction 
              siswa={db.siswa}
              tagihanList={db.tagihan}
              currentUser={currentUser}
              onProcessPayment={handleProcessPayment}
              preSelectedNis={selectedPaymentNis}
            />
          )}

          {activeTab === 'riwayat' && (
            <HistoryManager 
              transaksi={db.transaksi}
              detailTransaksi={db.detailTransaksi}
              siswa={db.siswa}
              currentUser={currentUser}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'laporan' && (
            <ReportManager 
              transaksi={db.transaksi}
              detailTransaksi={db.detailTransaksi}
              siswa={db.siswa}
              tagihanList={db.tagihan}
            />
          )}

          {activeTab === 'user' && (
            <UserManager 
              users={db.users}
              currentUser={currentUser}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'gas' && <GasIntegration />}
        </main>

        {/* WORKSPACE MAIN FOOTER */}
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-4 text-center text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide transition-colors duration-200">
          &copy; {new Date().getFullYear()} SPS-ADMIN Suite. Premium Google Apps Script &amp; Google Spreadsheet Engine.
        </footer>
      </div>
    </div>
  );
}
