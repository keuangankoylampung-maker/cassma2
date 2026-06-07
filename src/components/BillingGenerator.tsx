/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { JenisPembayaran, Tagihan } from '../types';
import { Sparkles, Calendar, CheckSquare, Zap, Eye, Filter, CheckCircle2, XCircle } from 'lucide-react';

interface BillingGeneratorProps {
  types: JenisPembayaran[];
  tagihanList: Tagihan[];
  onGenerateBulanan: (kodePembayaran: string, tahunAjaran: string) => void;
  onGenerateBebas: (kodePembayaran: string, tahunAjaran: string) => void;
}

export default function BillingGenerator({
  types,
  tagihanList,
  onGenerateBulanan,
  onGenerateBebas
}: BillingGeneratorProps) {
  const [selectedKode, setSelectedKode] = useState('');
  const [tahunAjaran, setTahunAjaran] = useState('2025/2026');
  const [statusFilter, setStatusFilter] = useState('Semua');

  React.useEffect(() => {
    if (types.length > 0 && !selectedKode) {
      setSelectedKode(types[0].kode);
    }
  }, [types, selectedKode]);

  const activeType = useMemo(() => {
    return types.find((t) => t.kode === selectedKode);
  }, [types, selectedKode]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKode || !tahunAjaran) return;

    if (activeType?.jenis === 'Bulanan') {
      onGenerateBulanan(selectedKode, tahunAjaran);
    } else {
      onGenerateBebas(selectedKode, tahunAjaran);
    }
  };

  const filteredTagihan = useMemo(() => {
    return tagihanList.filter((t) => {
      const matchKode = !selectedKode || t.kodePembayaran === selectedKode;
      const matchStatus = statusFilter === 'Semua' || t.status === statusFilter;
      return matchKode && matchStatus;
    });
  }, [tagihanList, selectedKode, statusFilter]);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">Pembuat Tagihan Otomatis</h2>
          <p className="text-xs text-slate-400">Generate invoice tagihan untuk seluruh siswa aktif sekaligus berdasarkan tarif yang telah disesuaikan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Generation parameters */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6 lg:h-fit">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-slate-800">
            <Zap className="text-sky-600 w-5 h-5" />
            <h3 className="text-sm font-bold">Parameter Invoice</h3>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs font-sans">
            {/* Payment category */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Pilih Jenis Pembayaran</label>
              <select 
                value={selectedKode}
                onChange={(e) => setSelectedKode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-white font-bold text-slate-700"
              >
                {types.map((t) => (
                  <option key={t.id} value={t.kode}>{t.kode} - {t.nama} ({t.jenis})</option>
                ))}
              </select>
            </div>

            {/* Info Badge */}
            {activeType && (
              <div className={`p-4 rounded-xl border space-y-1.5 ${
                activeType.jenis === 'Bulanan' 
                  ? 'bg-sky-50/50 border-sky-100 text-sky-800' 
                  : 'bg-indigo-50/50 border-indigo-100 text-indigo-800'
              }`}>
                <div className="flex items-center gap-1 font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Karakteristik POS: {activeType.jenis}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  {activeType.jenis === 'Bulanan' 
                    ? `Sistem akan otomatis menerbitkan 12 baris invoice (periode Juli s/d Juni tahun ajaran berikutnya) untuk setiap siswa aktif dengan nominal ${formatRupiah(activeType.nominalDefault)} atau sebesar tarif kustom personal siswa.`
                    : `Sistem akan menerbitkan 1 baris akumulatif tagihan bebas komitmen untuk setiap siswa aktif sebesar total kewajiban ${formatRupiah(activeType.nominalDefault)} (atau tarif kustom siswa). Siswa dapat mencicil invoice ini secara bebas.`
                  }
                </p>
              </div>
            )}

            {/* Tahun Ajaran */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tahun Ajaran Aktif</label>
              <input 
                type="text" 
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                placeholder="Contoh: 2025/2026"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-bold"
              />
            </div>

            {/* Trigger Button */}
            <button 
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Zap className="w-4 h-4" /> Proses Tagihan Otomatis
            </button>
          </form>
        </div>

        {/* Right Side: Generated billing ledger */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Daftar Invoice Terbit ({filteredTagihan.length})</h3>
                <p className="text-[10px] text-slate-400">Arsip seluruh lembar tagihan aktif yang tersimpan di dalam database.</p>
              </div>
              
              {/* Filter */}
              <div className="flex items-center gap-1.5 self-stretch sm:self-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 focus:outline-none"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Belum Lunas">Belum Lunas</option>
                  <option value="Cicilan">Cicilan</option>
                  <option value="Lunas">Lunas</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto max-h-120">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                    <th className="py-2.5 px-4">Nama Siswa / NIS</th>
                    <th className="py-2.5 px-4">POS Pembayaran</th>
                    <th className="py-2.5 px-4">Periode</th>
                    <th className="py-2.5 px-4">Tagihan</th>
                    <th className="py-2.5 px-4">Terbayar</th>
                    <th className="py-2.5 px-4">Sisa</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {filteredTagihan.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                        Belum ada tagihan tergenerate untuk POS atau Filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredTagihan.map((t) => {
                      const sisa = t.nominal - t.terbayar;
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-2 px-4">
                            <div className="font-semibold text-slate-700">Siswa (NIS: {t.nis})</div>
                          </td>
                          <td className="py-2 px-4">
                            <span className="font-mono font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded text-[10px]">
                              {t.kodePembayaran}
                            </span>
                          </td>
                          <td className="py-2 px-4 font-semibold text-slate-500">{t.periode}</td>
                          <td className="py-2 px-4 font-mono text-slate-700">{formatRupiah(t.nominal)}</td>
                          <td className="py-2 px-4 font-mono text-emerald-600">+{formatRupiah(t.terbayar)}</td>
                          <td className="py-2 px-4 font-mono text-rose-600 font-bold">{formatRupiah(Math.max(0, sisa))}</td>
                          <td className="py-2 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                              t.status === 'Lunas' 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                : t.status === 'Cicilan'
                                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                : 'bg-rose-50 text-rose-600 border border-rose-200'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
