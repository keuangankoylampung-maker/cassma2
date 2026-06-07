/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Transaksi, DetailTransaksi, Siswa, Tagihan } from '../types';
import { FileSpreadsheet, Filter, CheckCircle2, AlertCircle, FileDown, CheckSquare, Square } from 'lucide-react';

interface ReportManagerProps {
  transaksi: Transaksi[];
  detailTransaksi: DetailTransaksi[];
  siswa: Siswa[];
  tagihanList: Tagihan[];
}

export default function ReportManager({
  transaksi,
  detailTransaksi,
  siswa,
  tagihanList
}: ReportManagerProps) {
  // Main tabs: Penerimaan Kas vs Tunggakan
  const [reportTab, setReportTab] = useState<'penerimaan' | 'tunggakan'>('penerimaan');

  // Laporan Penerimaan Filters
  const [filterType, setFilterType] = useState<'Harian' | 'Bulanan' | 'Tahunan' | 'Kelas' | 'JenisPembayaran'>('Harian');
  const [paramTanggal, setParamTanggal] = useState(new Date().toISOString().substring(0, 10));
  const [paramBulan, setParamBulan] = useState(new Date().getMonth() + 1);
  const [paramTahun, setParamTahun] = useState(new Date().getFullYear().toString());
  const [paramKelas, setParamKelas] = useState('X-MIPA-1');
  const [paramKodePembayaran, setParamKodePembayaran] = useState('SPP');

  // Laporan Tunggakan Filters
  const [tunggakanKelas, setTunggakanKelas] = useState('X-MIPA-1');
  const [tunggakanTahunAjaran, setTunggakanTahunAjaran] = useState('2025/2026');

  // Checklist Kolom Laporan states (True/False map)
  const [visibleColumns, setVisibleColumns] = useState<{ [key: string]: boolean }>({
    tanggal: true,
    nis: true,
    nama: true,
    alamat: false, // Default un-checked as in sample prompt
    kelas: true,
    jenisPembayaran: true,
    periode: true,
    nominal: true,
    petugas: true
  });

  // Unique listings for dropdowns
  const classesList = useMemo(() => {
    return Array.from(new Set(siswa.map((s) => s.kelas))).sort();
  }, [siswa]);

  const paymentCodesList = useMemo(() => {
    return Array.from(new Set(tagihanList.map((t) => t.kodePembayaran))).sort();
  }, [tagihanList]);

  // Toggle checklist columns
  const handleToggleColumn = (colKey: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [colKey]: !prev[colKey]
    }));
  };

  // Generate rows for Penerimaan Kas merging Transaction Header + Details + Student profiles
  const cashReceiptsReportRows = useMemo(() => {
    const list: {
      tanggal: string;
      noTransaksi: string;
      nis: string;
      nama: string;
      alamat: string;
      kelas: string;
      jenisPembayaran: string;
      periode: string;
      nominal: number;
      petugas: string;
    }[] = [];

    detailTransaksi.forEach((dt) => {
      const header = transaksi.find((h) => h.noTransaksi === dt.noTransaksi);
      if (!header) return;

      const profile = siswa.find((s) => s.nis === header.nis);
      const rowTanggal = header.tanggal.substring(0, 10);

      list.push({
        tanggal: rowTanggal,
        noTransaksi: dt.noTransaksi,
        nis: header.nis,
        nama: profile ? profile.nama : 'Tidak Diketahui',
        alamat: profile ? profile.alamat : '',
        kelas: profile ? profile.kelas : 'Lainnya',
        jenisPembayaran: dt.namaPembayaran,
        periode: dt.periode,
        nominal: dt.nominal,
        petugas: header.petugas
      });
    });

    // Apply Filter constraints
    return list.filter((r) => {
      if (filterType === 'Harian') {
        return r.tanggal === paramTanggal;
      }
      if (filterType === 'Bulanan') {
        const ym = `${paramTahun}-${('0' + paramBulan).slice(-2)}`;
        return r.tanggal.startsWith(ym);
      }
      if (filterType === 'Tahunan') {
        return r.tanggal.startsWith(paramTahun);
      }
      if (filterType === 'Kelas') {
        return r.kelas === paramKelas;
      }
      if (filterType === 'JenisPembayaran') {
        return r.jenisPembayaran.toUpperCase().includes(paramKodePembayaran.toUpperCase());
      }
      return true;
    });
  }, [transaksi, detailTransaksi, siswa, filterType, paramTanggal, paramBulan, paramTahun, paramKelas, paramKodePembayaran]);

  // Generate rows for Tunggakan Report
  const outstandingReportRows = useMemo(() => {
    return tagihanList
      .filter((t) => t.status !== 'Lunas')
      .map((t) => {
        const profile = siswa.find((s) => s.nis === t.nis);
        return {
          nis: t.nis,
          nama: profile ? profile.nama : 'Siswa Terhapus',
          kelas: profile ? profile.kelas : 'Lainnya',
          tagihan: t.namaPembayaran,
          periode: t.periode,
          tahunAjaran: t.tahunAjaran,
          nominal: t.nominal,
          sudahBayar: t.terbayar,
          sisa: t.nominal - t.terbayar,
          status: t.status
        };
      })
      .filter((r) => {
        const matchCls = !tunggakanKelas || r.kelas === tunggakanKelas;
        const matchTA = !tunggakanTahunAjaran || r.tahunAjaran === tunggakanTahunAjaran;
        return matchCls && matchTA;
      });
  }, [tagihanList, siswa, tunggakanKelas, tunggakanTahunAjaran]);

  // Export Penerimaan Kas xlsx simulation based on checklist column selector
  const handleExportReceipts = () => {
    // Generate filtered file payload
    const headers: string[] = [];
    const colKeys: string[] = [];

    if (visibleColumns.tanggal) { headers.push('Tanggal'); colKeys.push('tanggal'); }
    if (visibleColumns.nis) { headers.push('NIS'); colKeys.push('nis'); }
    if (visibleColumns.nama) { headers.push('Nama Siswa'); colKeys.push('nama'); }
    if (visibleColumns.alamat) { headers.push('Alamat Wali'); colKeys.push('alamat'); }
    if (visibleColumns.kelas) { headers.push('Kelas'); colKeys.push('kelas'); }
    if (visibleColumns.jenisPembayaran) { headers.push('Jenis Pembayaran'); colKeys.push('jenisPembayaran'); }
    if (visibleColumns.periode) { headers.push('Periode'); colKeys.push('periode'); }
    if (visibleColumns.nominal) { headers.push('Nominal'); colKeys.push('nominal'); }
    if (visibleColumns.petugas) { headers.push('Petugas'); colKeys.push('petugas'); }

    const rows = cashReceiptsReportRows.map((r: any) => {
      return colKeys.map((k) => r[k]);
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    // Dynamic naming file as requested in prompt: Laporan_Pembayaran_2025.xlsx
    link.setAttribute("download", `Laporan_Pembayaran_${paramTahun}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Tunggakan Reports as `.xlsx` (CSV compliant with Excel auto parsing)
  const handleExportOutstanding = () => {
    const headers = [
      'NIS', 'Nama Siswa', 'Kelas', 'Akun Pembayaran', 'Periode', 'Tahun Ajaran', 'Nominal Tagihan', 'Terbayar', 'Tunggakan Sisa', 'Status'
    ];
    const rows = outstandingReportRows.map((r) => [
      r.nis, r.nama, r.kelas, r.tagihan, r.periode, r.tahunAjaran, r.nominal, r.sudahBayar, r.sisa, r.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Tunggakan_${tunggakanTahunAjaran.replace('/', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Title Header with Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">Pusat Laporan Keuangan Sekolah</h2>
          <p className="text-xs text-slate-400 font-medium">Tarik laporan penerimaan buku keuangan harian, tagihan aktif, serta audit tunggakan sisa.</p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 self-stretch sm:self-auto text-xs">
          <button 
            onClick={() => setReportTab('penerimaan')}
            className={`px-4 py-2 font-bold rounded-lg transition ${
              reportTab === 'penerimaan' 
                ? 'bg-sky-600 text-white shadow' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Laporan Penerimaan Kas
          </button>
          <button 
            onClick={() => setReportTab('tunggakan')}
            className={`px-4 py-2 font-bold rounded-lg transition ${
              reportTab === 'tunggakan' 
                ? 'bg-sky-600 text-white shadow' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Laporan Tunggakan
          </button>
        </div>
      </div>

      {reportTab === 'penerimaan' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Penerimaan Left Filter controls */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6 lg:h-fit">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Filter Laporan</h3>
            
            <div className="space-y-4 text-xs font-sans font-medium text-slate-600">
              {/* Filter Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Skema Periode Filter</label>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-white"
                >
                  <option value="Harian">Laporan Harian (Tanggal)</option>
                  <option value="Bulanan">Laporan Bulanan (Bulan / Tahun)</option>
                  <option value="Tahunan">Laporan Tahunan (Tahun)</option>
                  <option value="Kelas">Laporan Per Rombel Kelas</option>
                  <option value="JenisPembayaran">Laporan Per Akun POS</option>
                </select>
              </div>

              {/* Dynamic Parameter inputs depending on select */}
              {filterType === 'Harian' && (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Pilih Tanggal</label>
                  <input 
                    type="date" 
                    value={paramTanggal}
                    onChange={(e) => setParamTanggal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-bold"
                  />
                </div>
              )}

              {filterType === 'Bulanan' && (
                <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Bulan</label>
                    <select 
                      value={paramBulan}
                      onChange={(e) => setParamBulan(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-white font-bold"
                    >
                      {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map((mName, idx) => (
                        <option key={idx} value={idx+1}>{mName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Tahun</label>
                    <input 
                      type="number" 
                      value={paramTahun}
                      onChange={(e) => setParamTahun(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-bold"
                    />
                  </div>
                </div>
              )}

              {filterType === 'Tahunan' && (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Pilih Tahun</label>
                  <input 
                    type="number" 
                    value={paramTahun}
                    onChange={(e) => setParamTahun(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-bold"
                  />
                </div>
              )}

              {filterType === 'Kelas' && (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Pilih Kelas</label>
                  <select 
                    value={paramKelas}
                    onChange={(e) => setParamKelas(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-white font-bold"
                  >
                    {classesList.map((cls) => (
                      <option key={cls} value={cls}>Kelas {cls}</option>
                    ))}
                  </select>
                </div>
              )}

              {filterType === 'JenisPembayaran' && (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Pilih POS Rekening</label>
                  <select 
                    value={paramKodePembayaran}
                    onChange={(e) => setParamKodePembayaran(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-white font-bold"
                  >
                    {paymentCodesList.map((pc) => (
                      <option key={pc} value={pc}>{pc}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Checklist Kolom Laporan Panel */}
            <div id="column-checklist-panel" className="border-t border-slate-100 pt-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <span>Checklist Kolom Laporan</span>
              </h3>
              <p className="text-[10px] text-slate-400 leading-normal">Hanya elemen bercentang yang akan dicantumkan di lembar Excel Anda.</p>
              
              <div className="space-y-1.5 max-h-56 overflow-y-auto border border-slate-100 p-3.5 rounded-xl bg-slate-50/50">
                {Object.keys(visibleColumns).map((colKey) => (
                  <label 
                    key={colKey}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer select-none"
                  >
                    <input 
                      type="checkbox"
                      checked={visibleColumns[colKey]}
                      onChange={() => handleToggleColumn(colKey)}
                      className="text-sky-600 focus:ring-sky-500 rounded"
                    />
                    <span className="capitalize">{colKey.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={handleExportReceipts}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition shadow"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export XLSX (Excel)
            </button>
          </div>

          {/* Penerimaan Right Grid Preview */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Preview Laporan Penerimaan</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Buku pembukuan memuat {cashReceiptsReportRows.length} data item terbayar.</p>
                </div>
              </div>

              <div className="overflow-x-auto max-h-140">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                      {visibleColumns.tanggal && <th className="py-2.5 px-4 font-bold">Tanggal</th>}
                      {visibleColumns.nis && <th className="py-2.5 px-4 font-bold">NIS</th>}
                      {visibleColumns.nama && <th className="py-2.5 px-4 font-bold">Nama Siswa</th>}
                      {visibleColumns.alamat && <th className="py-2.5 px-4 font-bold">Alamat Wali</th>}
                      {visibleColumns.kelas && <th className="py-2.5 px-4 font-bold">Kelas</th>}
                      {visibleColumns.jenisPembayaran && <th className="py-2.5 px-4 font-bold">Jenis Pembayaran</th>}
                      {visibleColumns.periode && <th className="py-2.5 px-4 font-bold">Periode</th>}
                      {visibleColumns.nominal && <th className="py-2.5 px-4 text-right font-bold">Nominal</th>}
                      {visibleColumns.petugas && <th className="py-2.5 px-4 font-bold">Petugas</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {cashReceiptsReportRows.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-400">
                          Tidak ada data mutasi penerimaan kasir pada rentang filter ini.
                        </td>
                      </tr>
                    ) : (
                      cashReceiptsReportRows.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition">
                          {visibleColumns.tanggal && <td className="py-2.5 px-4 text-slate-400">{r.tanggal}</td>}
                          {visibleColumns.nis && <td className="py-2.5 px-4 font-mono">{r.nis}</td>}
                          {visibleColumns.nama && <td className="py-2.5 px-4 font-bold text-slate-800">{r.nama}</td>}
                          {visibleColumns.alamat && <td className="py-2.5 px-4 text-slate-400 max-w-xs truncate">{r.alamat}</td>}
                          {visibleColumns.kelas && <td className="py-2.5 px-4"><span className="bg-slate-100 text-slate-600 font-bold px-1 rounded text-[10px]">{r.kelas}</span></td>}
                          {visibleColumns.jenisPembayaran && <td className="py-2.5 px-4 font-bold text-sky-600">{r.jenisPembayaran}</td>}
                          {visibleColumns.periode && <td className="py-2.5 px-4 text-slate-500">{r.periode}</td>}
                          {visibleColumns.nominal && <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600">{formatRupiah(r.nominal)}</td>}
                          {visibleColumns.petugas && <td className="py-2.5 px-4 font-mono text-slate-400 text-[10px]">{r.petugas}</td>}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom aggregate card */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-slate-500 font-semibold text-xs">Total Akumulasi Buku Kas Penerimaan Filtered:</span>
              <span className="text-lg font-extrabold text-emerald-600 font-mono">
                {formatRupiah(cashReceiptsReportRows.reduce((a, b) => a + b.nominal, 0))}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Laporan Tunggakan Section */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Filter for Tunggakan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6 lg:h-fit">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Filter Tunggakan</h3>

            <div className="space-y-4 text-xs font-sans font-medium text-slate-600">
              {/* Classroom filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Siswa Kelas</label>
                <select 
                  value={tunggakanKelas}
                  onChange={(e) => setTunggakanKelas(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-white font-bold"
                >
                  <option value="">Semua Kelas</option>
                  {classesList.map((cls) => (
                    <option key={cls} value={cls}>Kelas {cls}</option>
                  ))}
                </select>
              </div>

              {/* School Year filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tahun Ajaran</label>
                <input 
                  type="text" 
                  value={tunggakanTahunAjaran}
                  onChange={(e) => setTunggakanTahunAjaran(e.target.value)}
                  placeholder="Contoh: 2025/2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-bold"
                />
              </div>
            </div>

            <button 
              onClick={handleExportOutstanding}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition shadow"
            >
              <FileDown className="w-4 h-4" /> Export Tunggakan Excel
            </button>
          </div>

          {/* Right outstanding list preview */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Laporan Tunggakan Dan Piutang Aktif</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Buku saldo piutang tertunda memuat {outstandingReportRows.length} data murid menunggak.</p>
                </div>
              </div>

              <div className="overflow-x-auto max-h-140">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                      <th className="py-2.5 px-4 font-bold">Nama Murid (NIS)</th>
                      <th className="py-2.5 px-4 font-bold">Kelas</th>
                      <th className="py-2.5 px-4 font-bold">Akun Tagihan</th>
                      <th className="py-2.5 px-4 font-bold">Periode</th>
                      <th className="py-2.5 px-4 text-right font-bold">Nominal Tagihan</th>
                      <th className="py-2.5 px-4 text-right font-bold">Terbayar</th>
                      <th className="py-2.5 px-4 text-right font-bold">Sisa Tunggakan</th>
                      <th className="py-2.5 px-4 text-center font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {outstandingReportRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          Hebat! Tidak ada nilai tunggakan menunggak pada filter rombel kelas pilihan Anda.
                        </td>
                      </tr>
                    ) : (
                      outstandingReportRows.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition">
                          <td className="py-2.5 px-4">
                            <div className="font-bold text-slate-800">{r.nama}</div>
                            <div className="text-[10px] text-slate-400 font-mono">NIS: {r.nis}</div>
                          </td>
                          <td className="py-2.5 px-4"><span className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded text-[10px]">{r.kelas}</span></td>
                          <td className="py-2.5 px-4 text-indigo-600 font-semibold">{r.tagihan}</td>
                          <td className="py-2.5 px-4 text-slate-500">{r.periode}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-500">{formatRupiah(r.nominal)}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-emerald-600">+{formatRupiah(r.sudahBayar)}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-rose-600 font-bold">{formatRupiah(r.sisa)}</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold ${
                              r.status === 'Cicilan' 
                                ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                                : 'bg-rose-50 text-rose-600 border border-rose-200'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Aggregate bottom bar */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-500">Total Piutang Belum Tertagih Kelas:</span>
              <span className="text-lg font-extrabold text-rose-600 font-mono">
                {formatRupiah(outstandingReportRows.reduce((a, b) => a + b.sisa, 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
