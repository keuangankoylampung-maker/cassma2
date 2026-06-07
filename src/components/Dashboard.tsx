/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Siswa, Tagihan, Transaksi } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, FileText, CheckCircle, Wallet, ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react';

interface DashboardProps {
  siswa: Siswa[];
  tagihan: Tagihan[];
  transaksi: Transaksi[];
  onNavigateToPayment: (nis: string) => void;
  theme?: 'light' | 'dark';
}

export default function Dashboard({ siswa, tagihan, transaksi, onNavigateToPayment, theme = 'light' }: DashboardProps) {
  // 1. KPI Calculations
  const totalSiswa = useMemo(() => {
    return siswa.filter((s) => s.statusAktif === 'Aktif').length;
  }, [siswa]);

  const totalTagihanAktifVal = useMemo(() => {
    return tagihan.reduce((acc, curr) => acc + curr.nominal, 0);
  }, [tagihan]);

  const totalTunggakan = useMemo(() => {
    return tagihan.reduce((acc, curr) => {
      if (curr.status !== 'Lunas') {
        return acc + (curr.nominal - curr.terbayar);
      }
      return acc;
    }, 0);
  }, [tagihan]);

  const rawToday = new Date().toISOString().substring(0, 10);
  const rawMonthYM = new Date().toISOString().substring(0, 7);

  const statsToday = useMemo(() => {
    return transaksi.reduce((acc, curr) => {
      const txDateStr = curr.tanggal.substring(0, 10);
      if (txDateStr === rawToday) {
        return acc + curr.total;
      }
      return acc;
    }, 0);
  }, [transaksi, rawToday]);

  const statsMonth = useMemo(() => {
    return transaksi.reduce((acc, curr) => {
      const txMonthStr = curr.tanggal.substring(0, 7);
      if (txMonthStr === rawMonthYM) {
        return acc + curr.total;
      }
      return acc;
    }, 0);
  }, [transaksi, rawMonthYM]);

  // 2. Format Cash Flow Data for Chart (Group by month name in Indonesia)
  const chartData = useMemo(() => {
    const monthsName = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    // Group receipts by Month-Year
    const groups: { [key: string]: number } = {};
    
    // Seed groups for past 6 months to make chart look professional
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = d.toISOString().substring(0, 7);
      groups[ym] = 0;
    }

    transaksi.forEach((tx) => {
      const ym = tx.tanggal.substring(0, 7);
      if (groups[ym] !== undefined) {
        groups[ym] += tx.total;
      } else {
        groups[ym] = tx.total;
      }
    });

    return Object.keys(groups).sort().map((key) => {
      const [year, month] = key.split('-');
      const mIdx = parseInt(month, 10) - 1;
      return {
        periode: `${monthsName[mIdx]} ${year}`,
        penerimaan: groups[key]
      };
    });
  }, [transaksi]);

  // Indonesian Rupiah Formatter
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Get 5 recent transactions
  const recentTx = useMemo(() => {
    return [...transaksi]
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
      .slice(0, 5);
  }, [transaksi]);

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Siswa */}
        <div id="kpi_siswa" className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800/80 border-l-4 border-l-sky-600 flex items-center justify-between transition-colors duration-200">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Siswa Aktif</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{totalSiswa} <span className="text-xs font-normal text-slate-450 dark:text-slate-550">anak</span></h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
              Siswa terdaftar aktif
            </p>
          </div>
          <div className="bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 p-3.5 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Penerimaan Hari Ini */}
        <div id="kpi_today" className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800/80 border-l-4 border-l-sky-600 flex items-center justify-between transition-colors duration-200">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Penerimaan Hari Ini</span>
            <h3 className="text-2xl font-black text-sky-600 dark:text-sky-400 tracking-tight">{formatRupiah(statsToday)}</h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-600" />
              Kas masuk hari ini
            </p>
          </div>
          <div className="bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 p-3.5 rounded-2xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Penerimaan Bulan Ini */}
        <div id="kpi_month" className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800/80 border-l-4 border-l-indigo-600 flex items-center justify-between transition-colors duration-200">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Penerimaan Bulan Ini</span>
            <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{formatRupiah(statsMonth)}</h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              Total kas bulanan buku
            </p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 p-3.5 rounded-2xl">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Total Tunggakan */}
        <div id="kpi_tunggakan" className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800/80 border-l-4 border-l-indigo-600 flex items-center justify-between transition-colors duration-200">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Tunggakan</span>
            <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{formatRupiah(totalTunggakan)}</h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-indigo-600" />
              Piutang belum tertagih
            </p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 p-3.5 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Stats Chart & Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800/60 space-y-4 transition-colors duration-200">
          <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Grafik Penerimaan Kas Sekolah</h4>
              <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Histori buku penerimaan kas 6 bulan terakhir</p>
            </div>
            <div className="text-xs bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-xs">
              <TrendingUp className="w-3 h-3" /> Rupiah (IDR)
            </div>
          </div>
          
          <div className="h-68">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="penerimaanId" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={theme === 'dark' ? 0.4 : 0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="periode" stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} fontSize={10} tickLine={false} />
                <YAxis stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} fontSize={10} tickLine={false} tickFormatter={(val) => `Rp${val / 1000}k`} />
                <Tooltip 
                  formatter={(value: any) => [formatRupiah(Number(value)), 'Jumlah Bayar']}
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', 
                    borderRadius: '12px', 
                    border: '1px solid ' + (theme === 'dark' ? '#334155' : '#e2e8f0'),
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a'
                  }}
                />
                <Area type="monotone" dataKey="penerimaan" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#penerimaanId)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions Column */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800/60 flex flex-col justify-between transition-colors duration-200">
          <div className="space-y-4">
            <div className="border-b border-slate-150 dark:border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Riwayat Terakhir</h4>
                <p className="text-xs text-slate-450 dark:text-slate-400">Transaksi masuk terbaru hari ini</p>
              </div>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-850 text-slate-650 dark:text-slate-350 px-2 py-0.5 rounded font-mono font-bold tracking-wider">5 LATEST</span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-64 pr-1">
              {recentTx.length === 0 ? (
                <div className="text-center py-10 text-slate-400 dark:text-slate-550 text-xs">Belum ada aktivitas transaksi.</div>
              ) : (
                recentTx.map((tx) => (
                  <div 
                    key={tx.id} 
                    onClick={() => onNavigateToPayment(tx.nis)}
                    className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-800/80 transition cursor-pointer"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-350">{tx.namaSiswa}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 font-mono px-1 rounded">{tx.noTransaksi}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(tx.tanggal).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">+{formatRupiah(tx.total)}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500">Oleh: {tx.petugas}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-relaxed">
              Sistem kasir tersinkronisasi otomatis dengan server Google Spreadsheet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
