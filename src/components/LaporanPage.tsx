/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Siswa, Transaksi, DetailTransaksi, Tagihan, JenisPembayaran } from '../types';
import { FileSpreadsheet, Download, Filter, Eye, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface LaporanPageProps {
  students: Siswa[];
  transactions: Transaksi[];
  details: DetailTransaksi[];
  bills: Tagihan[];
  paymentTypes: JenisPembayaran[];
  logAction: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
}

// Columns choice schema
interface ColumnChoice {
  id: string;
  label: string;
  checked: boolean;
}

export default function LaporanPage({
  students,
  transactions,
  details,
  bills,
  paymentTypes,
  logAction
}: LaporanPageProps) {
  const [reportType, setReportType] = useState<'penerimaan' | 'tunggakan'>('penerimaan');

  // Receival filter states
  const [filterMode, setFilterMode] = useState<'harian' | 'bulanan' | 'tahunan' | 'kelas' | 'pembayaran'>('harian');
  const [filterDate, setFilterDate] = useState('2026-06-07');
  const [filterMonth, setFilterMonth] = useState('06');
  const [filterYear, setFilterYear] = useState('2026');
  const [filterClass, setFilterClass] = useState('X-IPA-1');
  const [filterKode, setFilterKode] = useState('');

  // Arrears filter states
  const [arrearsClass, setArrearsClass] = useState('Semua');
  const [arrearsKode, setArrearsKode] = useState('Semua');

  // Column choices checklist
  const [columns, setColumns] = useState<ColumnChoice[]>([
    { id: 'tanggal', label: 'Tanggal', checked: true },
    { id: 'noTransaksi', label: 'No_Transaksi', checked: true },
    { id: 'nis', label: 'NIS', checked: true },
    { id: 'nama', label: 'Nama Siswa', checked: true },
    { id: 'kelas', label: 'Kelas', checked: true },
    { id: 'kodePembayaran', label: 'Jenis Pembayaran', checked: true },
    { id: 'nominal', label: 'Nominal', checked: true },
    { id: 'petugas', label: 'Petugas', checked: true },
    { id: 'alamat', label: 'Alamat', checked: false }
  ]);

  const activeClasses = useMemo(() => {
    const list = new Set<string>();
    students.forEach(s => list.add(s.kelas));
    return Array.from(list).sort();
  }, [students]);

  const toggleColumn = (id: string) => {
    setColumns(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const getStudentInfoMap = useMemo(() => {
    const map: { [nis: string]: { nama: string; kelas: string; alamat: string } } = {};
    students.forEach(s => {
      map[s.nis] = { nama: s.nama, kelas: s.kelas, alamat: s.alamat };
    });
    return map;
  }, [students]);

  // Compiled Receival Report list rows
  const compiledRows = useMemo(() => {
    const rows: Array<{
      tanggal: string;
      noTransaksi: string;
      nis: string;
      nama: string;
      kelas: string;
      alamat: string;
      kodePembayaran: string;
      nominal: number;
      petugas: string;
    }> = [];

    // Loop through detail transactions
    details.forEach(det => {
      const parentTrx = transactions.find(t => t.noTransaksi === det.noTransaksi);
      if (!parentTrx) return;

      const studentMeta = getStudentInfoMap[parentTrx.nis] || { nama: 'Siswa Nonaktif', kelas: 'N/A', alamat: '-' };
      const bill = bills.find(b => b.id === det.tagihanId);
      const paymentCode = bill ? bill.kodePembayaran : 'Lainnya';

      // APPLY dynamic filters
      const trxDate = parentTrx.tanggal; // YYYY-MM-DD HH:mm:ss
      const ymd = trxDate.substring(0, 10);
      const year = trxDate.substring(0, 4);
      const month = trxDate.substring(5, 7);

      if (filterMode === 'harian' && ymd !== filterDate) return;
      if (filterMode === 'bulanan' && (year !== filterYear || month !== filterMonth)) return;
      if (filterMode === 'tahunan' && year !== filterYear) return;
      if (filterMode === 'kelas' && studentMeta.kelas !== filterClass) return;
      if (filterMode === 'pembayaran' && filterKode && paymentCode !== filterKode) return;

      rows.push({
        tanggal: ymd,
        noTransaksi: det.noTransaksi,
        nis: parentTrx.nis,
        nama: studentMeta.nama,
        kelas: studentMeta.kelas,
        alamat: studentMeta.alamat,
        kodePembayaran: paymentCode + (bill ? ` (${bill.periode})` : ''),
        nominal: det.nominal,
        petugas: parentTrx.petugas
      });
    });

    return rows.sort((a, b) => b.noTransaksi.localeCompare(a.noTransaksi));
  }, [transactions, details, bills, filterMode, filterDate, filterMonth, filterYear, filterClass, filterKode, getStudentInfoMap]);

  // Compiled Arrears dataset
  const arrearsRows = useMemo(() => {
    const rows: Array<{
      nis: string;
      nama: string;
      kelas: string;
      kodePembayaran: string;
      periode: string;
      nominal: number;
      terbayar: number;
      sisa: number;
      status: string;
    }> = [];

    bills.forEach(b => {
      // Tunggakan means status is Belum Lunas or Cicilan
      if (b.status === 'Lunas') return;

      const studentMeta = getStudentInfoMap[b.nis];
      if (!studentMeta) return; // Skip deleted or missing student

      if (arrearsClass !== 'Semua' && studentMeta.kelas !== arrearsClass) return;
      if (arrearsKode !== 'Semua' && b.kodePembayaran !== arrearsKode) return;

      rows.push({
        nis: b.nis,
        nama: studentMeta.nama,
        kelas: studentMeta.kelas,
        kodePembayaran: b.kodePembayaran,
        periode: b.periode,
        nominal: b.nominal,
        terbayar: b.terbayar,
        sisa: b.nominal - b.terbayar,
        status: b.status
      });
    });

    return rows.sort((a,b) => a.kelas.localeCompare(b.kelas) || a.nama.localeCompare(b.nama));
  }, [bills, arrearsClass, arrearsKode, getStudentInfoMap]);

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Header based on active columns checklists
    const activeHeaders = columns.filter(c => c.checked);
    const headerLabels = activeHeaders.map(h => h.label);
    csvContent += headerLabels.join(',') + '\n';

    if (reportType === 'penerimaan') {
      compiledRows.forEach((r: any) => {
        const rowVals: string[] = [];
        activeHeaders.forEach((col) => {
          let val = r[col.id];
          if (col.id === 'nominal') {
            val = String(val);
          } else if (col.id === 'alamat') {
            val = `"${val.replace(/"/g, '""')}"`;
          } else {
            val = `"${val}"`;
          }
          rowVals.push(val);
        });
        csvContent += rowVals.join(',') + '\n';
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Laporan_Penerimaan_Kas_${filterYear}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      logAction('info', `Mengekspor Laporan Penerimaan Kas sebanyak ${compiledRows.length} baris`);
    } else {
      // Arrears
      let csvTunggakan = 'data:text/csv;charset=utf-8,';
      csvTunggakan += 'NIS,Nama Siswa,Kelas,Jenis Pembayaran,Periode,Total Tagihan,Sudah Dibayar,Sisa Tunggakan,Status\n';
      arrearsRows.forEach((r) => {
        csvTunggakan += `"${r.nis}","${r.nama}","${r.kelas}","${r.kodePembayaran}","${r.periode}",${r.nominal},${r.terbayar},${r.sisa},"${r.status}"\n`;
      });
      const encodedUri = encodeURI(csvTunggakan);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Laporan_Tunggakan_Sekolah_2026.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      logAction('info', `Mengekspor Laporan Tunggakan Siswa sebanyak ${arrearsRows.length} baris`);
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const totalNominalPenerimaan = useMemo(() => {
    return compiledRows.reduce((acc, curr) => acc + curr.nominal, 0);
  }, [compiledRows]);

  const totalTunggakanOutstanding = useMemo(() => {
    return arrearsRows.reduce((acc, curr) => acc + curr.sisa, 0);
  }, [arrearsRows]);

  return (
    <div className="space-y-6 animate-fade-in" id="laporan-komprehensif-page">
      {/* Category Toggle Top Header */}
      <div className="bg-white p-1.5 rounded-lg border border-slate-200 flex gap-1 w-full max-w-sm">
        <button
          onClick={() => setReportType('penerimaan')}
          className={`flex-1 text-center py-2 rounded-md font-bold text-xs transition-all ${
            reportType === 'penerimaan' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Laporan Penerimaan Kas
        </button>
        <button
          onClick={() => setReportType('tunggakan')}
          className={`flex-1 text-center py-2 rounded-md font-bold text-xs transition-all ${
            reportType === 'tunggakan' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Laporan Tunggakan
        </button>
      </div>

      {reportType === 'penerimaan' ? (
        /* ================== CASH RECEIVAL VIEW =================== */
        <div className="space-y-6">
          {/* Quick Config Row */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* 1. Filter Type Toggle */}
            <div className="space-y-1.5 col-span-1 border-r border-slate-200 pr-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Metode Filter Laporan</span>
              <div className="flex flex-col gap-1">
                {(['harian', 'bulanan', 'tahunan', 'kelas', 'pembayaran'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={`w-full text-left px-3 py-1.5 rounded text-xs font-semibold capitalize transition ${
                      filterMode === mode ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Filter {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Custom Filter Parameters */}
            <div className="space-y-1.5 col-span-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Parameter Filter</span>
              
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center min-h-[100px]">
                {filterMode === 'harian' && (
                  <div className="w-full">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Tanggal Transaksi:</label>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full text-xs font-mono font-bold p-2.5 bg-white border border-slate-300 rounded"
                    />
                  </div>
                )}

                {filterMode === 'bulanan' && (
                  <div className="w-full grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Pilih Bulan:</label>
                      <select
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="w-full text-xs font-bold p-2.5 bg-white border border-slate-300 rounded"
                      >
                        {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
                          <option key={m} value={m}>{new Date(2025, parseInt(m)-1).toLocaleString('id-ID', { month: 'long' })}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Pilih Tahun:</label>
                      <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                        className="w-full text-xs font-bold p-2.5 bg-white border border-slate-300 rounded"
                      >
                        {['2024', '2025', '2026', '2027'].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {filterMode === 'tahunan' && (
                  <div className="w-full">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Pilih Tahun:</label>
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 bg-white border border-slate-300 rounded"
                    >
                      {['2024', '2025', '2026', '2027'].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                )}

                {filterMode === 'kelas' && (
                  <div className="w-full">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Pilih Kelas:</label>
                    <select
                      value={filterClass}
                      onChange={(e) => setFilterClass(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 bg-white border border-slate-300 rounded"
                    >
                      {activeClasses.map(c => (
                        <option key={c} value={c}>Kelas {c}</option>
                      ))}
                    </select>
                  </div>
                )}

                {filterMode === 'pembayaran' && (
                  <div className="w-full">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Pilih Jenis Pembayaran:</label>
                    <select
                      value={filterKode}
                      onChange={(e) => setFilterKode(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 bg-white border border-slate-300 rounded"
                    >
                      <option value="">-- Semua Jenis (Bebas / Bulanan) --</option>
                      {paymentTypes.map(p => (
                        <option key={p.id} value={p.kode}>{p.kode} - {p.nama}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Export Excel Side Button */}
            <div className="space-y-1.5 col-span-1 flex flex-col justify-end">
              <button
                onClick={handleExportCSV}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <FileSpreadsheet className="h-4.5 w-4.5" />
                Download Spreadsheet (.csv)
              </button>
            </div>
          </div>

          {/* Checklist Columns Configuration block */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              <span>SISTEM CHECKLIST KOLOM LAPORAN YANG DI-EKSPOR</span>
            </div>
            <p className="text-xs text-slate-500 italic">Centang kolom di bawah ini untuk mengatur layout file hasil ekspor. Hanya kolom yang dicentang yang akan diunduh.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {columns.map((col) => (
                <button
                  key={col.id}
                  onClick={() => toggleColumn(col.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 font-semibold ${
                    col.checked
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={col.checked}
                    readOnly
                    className="h-3 w-3 accent-blue-500 rounded hidden"
                  />
                  {col.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Financial widget */}
          <div className="bg-blue-600 text-white p-6 rounded-lg flex flex-col sm:flex-row justify-between items-center shadow-md">
            <div>
              <span className="text-xs font-bold text-blue-105 uppercase tracking-widest">TOTAL PENERIMAAN KAS DATA FILTER</span>
              <p className="text-3xl font-mono font-black mt-1">{formatIDR(totalNominalPenerimaan)}</p>
            </div>
            <div className="mt-4 sm:mt-0 font-mono text-xs bg-blue-700/60 p-2.5 rounded border border-blue-400">
              Jumlah Rekod Transaksi: {compiledRows.length} baris
            </div>
          </div>

          {/* Table display */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase">PRATINJAU LEDGER PENERIMAAN KAS</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-650">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-700 tracking-wider">
                  <tr>
                    {columns.filter(c => c.checked).map((head) => (
                      <th key={head.id} className="px-4 py-3">{head.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {compiledRows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.filter(c => c.checked).length} className="px-4 py-12 text-center text-slate-400 italic">
                        Tidak ada transaksi kas terdaftar dengan filter ini.
                      </td>
                    </tr>
                  ) : (
                    compiledRows.map((row: any, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        {columns.filter(c => c.checked).map((col) => (
                          <td key={col.id} className="px-4 py-3.5 font-sans leading-none">
                            {col.id === 'nominal' ? (
                              <span className="font-mono font-bold text-slate-900">{formatIDR(row[col.id])}</span>
                            ) : col.id === 'noTransaksi' ? (
                              <span className="font-mono font-bold text-blue-700">{row[col.id]}</span>
                            ) : col.id === 'nis' ? (
                              <span className="font-mono">{row[col.id]}</span>
                            ) : col.id === 'nama' ? (
                              <span className="font-bold text-slate-900 uppercase">{row[col.id]}</span>
                            ) : (
                              row[col.id]
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ================== ARREARS VIEW =================== */
        <div className="space-y-6">
          {/* Quick Filters */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Filter Kelas:</label>
              <select
                value={arrearsClass}
                onChange={(e) => setArrearsClass(e.target.value)}
                className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-350 rounded-lg bg-white"
              >
                <option value="Semua">Semua Kelas</option>
                {activeClasses.map(c => (
                  <option key={c} value={c}>Kelas {c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Filter Jenis Pembayaran:</label>
              <select
                value={arrearsKode}
                onChange={(e) => setArrearsKode(e.target.value)}
                className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-350 rounded-lg bg-white"
              >
                <option value="Semua">Semua Program</option>
                {paymentTypes.map(p => (
                  <option key={p.id} value={p.kode}>{p.kode} - {p.nama}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <button
                onClick={handleExportCSV}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition"
              >
                <Download className="h-4 w-4" />
                Download Daftar Tunggakan (.csv)
              </button>
            </div>
          </div>

          {/* Arrears Total widget */}
          <div className="bg-red-600 text-white p-6 rounded-lg shadow flex flex-col sm:flex-row justify-between items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-red-105">TOTAL TUNGGAKAN AKTIF (BELUM LUNAS)</span>
              <p className="text-3xl font-mono font-black mt-1">{formatIDR(totalTunggakanOutstanding)}</p>
            </div>
            <div className="mt-4 sm:mt-0 font-mono text-xs bg-red-700/60 p-2.5 rounded border border-red-400">
              Siswa Ber-tunggakan: {arrearsRows.length} invoice
            </div>
          </div>

          {/* Arrears Database table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase">DAFTAR INVOICE TUNGGAKAN SISWA SEKOLAH</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-650">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-700 tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Siswa (NIS)</th>
                    <th className="px-4 py-3">Kelas</th>
                    <th className="px-4 py-3">Kode Program</th>
                    <th className="px-4 py-3">Periode</th>
                    <th className="px-4 py-3 text-right">Target Tagihan</th>
                    <th className="px-4 py-3 text-right">Terbayar</th>
                    <th className="px-4 py-3 text-right">Tunggakan (Sisa)</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {arrearsRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-slate-400 italic">
                        Luar biasa! Tidak ada data tunggakan sekolah yang terdeteksi dengan parameter ini.
                      </td>
                    </tr>
                  ) : (
                    arrearsRows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="font-mono text-[10px] text-slate-400">{row.nis}</p>
                          <p className="font-bold text-slate-900 mt-0.5 uppercase leading-none">{row.nama}</p>
                        </td>
                        <td className="px-4 py-3.5"><span className="bg-slate-100 text-slate-800 font-bold text-[10px] px-1.5 py-0.5 rounded">{row.kelas}</span></td>
                        <td className="px-4 py-3.5 font-mono text-blue-700 font-bold">{row.kodePembayaran}</td>
                        <td className="px-4 py-3.5 font-medium">{row.periode}</td>
                        <td className="px-4 py-3.5 text-right font-mono">{formatIDR(row.nominal)}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-emerald-600">{formatIDR(row.terbayar)}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-red-650 font-bold">{formatIDR(row.sisa)}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-block text-[10px] font-bold rounded-full px-2 py-0.5 ${
                            row.status === 'Cicilan' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
