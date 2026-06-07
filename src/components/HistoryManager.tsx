/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Transaksi, DetailTransaksi, User, Siswa } from '../types';
import { 
  History, Calendar, Filter, FileText, 
  Trash2, Printer, Search, ArrowRight, Ban, X, Check 
} from 'lucide-react';

interface HistoryManagerProps {
  transaksi: Transaksi[];
  detailTransaksi: DetailTransaksi[];
  siswa: Siswa[];
  currentUser: User;
  onDeleteTransaction: (id: string) => void;
}

export default function HistoryManager({
  transaksi,
  detailTransaksi,
  siswa,
  currentUser,
  onDeleteTransaction
}: HistoryManagerProps) {
  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [classFilter, setClassFilter] = useState('Semua');
  const [typeFilter, setTypeFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Transaction for Details Pop-up
  const [viewingTx, setViewingTx] = useState<Transaksi | null>(null);
  
  // Inside details view
  const viewingTxDetails = useMemo(() => {
    if (!viewingTx) return [];
    return detailTransaksi.filter((dt) => dt.noTransaksi === viewingTx.noTransaksi);
  }, [detailTransaksi, viewingTx]);

  // Unique lists for filtering
  const classesList = useMemo(() => {
    const list = new Set(siswa.map((s) => s.kelas));
    return ['Semua', ...Array.from(list)].sort();
  }, [siswa]);

  const paymentTypesList = useMemo(() => {
    const list = new Set(detailTransaksi.map((dt) => dt.namaPembayaran));
    return ['Semua', ...Array.from(list)];
  }, [detailTransaksi]);

  // Combined and filtered transactions list
  const filteredTransaksi = useMemo(() => {
    return transaksi.filter((tx) => {
      // Search mapping
      const matchSearch = 
        tx.namaSiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.noTransaksi.includes(searchQuery) ||
        tx.nis.includes(searchQuery);

      // Date match
      const tglStr = tx.tanggal.substring(0, 10);
      const matchDate = !dateFilter || tglStr === dateFilter;

      // Class match
      const matchClass = classFilter === 'Semua' || tx.kelas === classFilter;

      // Payment type match
      let matchType = true;
      if (typeFilter !== 'Semua') {
        // Find if this transaction contains this type
        const matchesType = detailTransaksi.some(
          (dt) => dt.noTransaksi === tx.noTransaksi && dt.namaPembayaran === typeFilter
        );
        matchType = matchesType;
      }

      return matchSearch && matchDate && matchClass && matchType;
    });
  }, [transaksi, detailTransaksi, searchQuery, dateFilter, classFilter, typeFilter]);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Export transactions ledger as excel/csv formatted
  const handleExportCSV = () => {
    const headers = [
      'ID Transaksi', 'Nomor Transaksi', 'Tanggal', 'NIS', 'Nama Siswa', 'Kelas', 'Total Bayar', 'Petugas'
    ];
    const rows = filteredTransaksi.map((tx) => [
      tx.id, tx.noTransaksi, new Date(tx.tanggal).toLocaleString('id-ID'), tx.nis, tx.namaSiswa, tx.kelas, tx.total, tx.petugas
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Riwayat_Transaksi_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isOperator = currentUser.role === 'Operator';

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">Riwayat Pembayaran Uang Sekolah</h2>
          <p className="text-xs text-slate-400">Arsip pencatatan mutasi kasir pembayaran lengkap se-sekolah terbitan otomatis.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2 border border-slate-200 rounded-xl flex items-center gap-1.5 transition"
        >
          <History className="w-4 h-4" /> Export Ledger Transaksi
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
        {/* Quick Search */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pencarian Siswa / No Trx</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari NIS, Nama, TRX-..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold text-slate-700"
            />
          </div>
        </div>

        {/* Date Filter */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Filter Tanggal Bayar</label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 font-bold text-slate-600 appearance-none pointer-events-auto"
            />
          </div>
        </div>

        {/* Classroom Filter */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Filter Kelas</label>
          <select 
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white font-semibold text-slate-600"
          >
            {classesList.map((cls) => (
              <option key={cls} value={cls}>{cls === 'Semua' ? 'Semua Kelas' : `Kelas ${cls}`}</option>
            ))}
          </select>
        </div>

        {/* Account Fee types Filter */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Filter Jenis Pembayaran</label>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white font-semibold text-slate-600"
          >
            {paymentTypesList.map((pt) => (
              <option key={pt} value={pt}>{pt === 'Semua' ? 'Semua Pembayaran' : pt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction Records datatable list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                <th className="py-3 px-4">No Transaksi</th>
                <th className="py-3 px-4">Tanggal Pembayaran</th>
                <th className="py-3 px-4">Nama Siswa / NIS</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4 text-right">Total Nominal</th>
                <th className="py-3 px-4">Petugas</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
              {filteredTransaksi.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold text-xs">
                    Tidak ada riwayat pembukuan kasir ditemukan untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredTransaksi.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                        {tx.noTransaksi}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(tx.tanggal).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{tx.namaSiswa}</div>
                      <div className="text-[10px] text-slate-400 font-mono">NIS: {tx.nis}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-sky-50 text-sky-600 font-bold px-1.5 py-0.5 rounded text-[10px]">
                        {tx.kelas}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      {formatRupiah(tx.total)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">{tx.petugas}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex gap-2">
                        <button 
                          onClick={() => setViewingTx(tx)}
                          title="Lihat Rincian Item Kwitansi"
                          className="bg-slate-50 hover:bg-sky-50 border border-slate-200 text-slate-500 hover:text-sky-600 p-1.5 rounded-lg transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        <button 
                          onClick={() => {
                            if (isOperator) {
                              alert('Akses Ditolak: Role Operator tidak diizinkan membatalkan pembukuan transaksi!');
                            } else {
                              if (confirm(`Apakah Anda yakin ingin MEMBATALKAN/MENGHAPUS kuitansi ${tx.noTransaksi}? Saldo tagihan siswa terkait akan dikembalikan ke status belum lunas.`)) {
                                onDeleteTransaction(tx.id);
                              }
                            }
                          }}
                          disabled={isOperator}
                          className={`p-1.5 border rounded-lg transition ${
                            isOperator 
                              ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed' 
                              : 'bg-slate-50 hover:bg-rose-50 border-slate-200 text-slate-500 hover:text-rose-600'
                          }`}
                        >
                          {isOperator ? <Ban className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
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

      {/* DETAILED LEDGER VIEW OVERLAY */}
      {viewingTx && (
        <div id="tx_details_modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Detail Transaksi {viewingTx.noTransaksi}</h3>
                <p className="text-[10px] text-slate-400">Pembayaran disahkan tanggal {new Date(viewingTx.tanggal).toLocaleString('id-ID')}</p>
              </div>
              <button 
                onClick={() => setViewingTx(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl font-medium">
                <div>
                  <span className="text-slate-400 text-[10px]">Nama Siswa:</span>
                  <p className="font-bold text-slate-800">{viewingTx.namaSiswa}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">NIS / Rombel:</span>
                  <p className="font-bold text-slate-800 font-mono">{viewingTx.nis} / {viewingTx.kelas}</p>
                </div>
              </div>

              <div className="space-y-1.5 font-medium">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Alokasi Kas Pembayaran</p>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] text-slate-400 border-b border-slate-100">
                        <th className="py-2 px-4">Item Pembayaran</th>
                        <th className="py-2 px-4 text-center">Periode</th>
                        <th className="py-2 px-4 text-right">Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {viewingTxDetails.map((det) => (
                        <tr key={det.id}>
                          <td className="py-2.5 px-4 font-bold text-slate-700">{det.namaPembayaran}</td>
                          <td className="py-2.5 px-4 text-center text-slate-400">{det.periode}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-800">{formatRupiah(det.nominal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stamp and Total */}
              <div className="border-t border-slate-100 pt-4 flex justify-between items-center bg-slate-50/50 -m-6 mt-6 p-6">
                <span className="text-[10px] text-slate-400 font-medium">Diinput oleh: <strong>{viewingTx.petugas}</strong></span>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Total Pembayaran</p>
                  <p className="text-lg font-extrabold text-emerald-600 font-mono">{formatRupiah(viewingTx.total)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
