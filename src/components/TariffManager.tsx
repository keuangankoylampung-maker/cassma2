/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { Siswa, JenisPembayaran, TarifSiswa } from '../types';
import { Settings, Save, Sparkles, Sliders, Users, FileUp, Info, HelpCircle } from 'lucide-react';

interface TariffManagerProps {
  siswa: Siswa[];
  types: JenisPembayaran[];
  tariffs: TarifSiswa[];
  onSetTariff: (nis: string, kodePembayaran: string, nominal: number) => void;
  onSetMassTariff: (kelas: string, kodePembayaran: string, nominal: number) => void;
  onImportTariffs: (list: { nis: string; kodePembayaran: string; nominal: number }[]) => void;
}

export default function TariffManager({
  siswa,
  types,
  tariffs,
  onSetTariff,
  onSetMassTariff,
  onImportTariffs
}: TariffManagerProps) {
  // Tabs: Individual, Mass Kelas, Import
  const [activeSubTab, setActiveSubTab] = useState<'individual' | 'mass' | 'import'>('individual');

  // Individual Form State
  const [selectedNis, setSelectedNis] = useState('');
  const [selectedPayKode, setSelectedPayKode] = useState('');
  const [individualNominal, setIndividualNominal] = useState(150000);

  // Mass Form State
  const [massKelas, setMassKelas] = useState('X-MIPA-1');
  const [massPayKode, setMassPayKode] = useState('');
  const [massNominal, setMassNominal] = useState(150000);

  // File Import Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto set first options in select elements
  React.useEffect(() => {
    if (siswa.length > 0 && !selectedNis) {
      setSelectedNis(siswa[0].nis);
    }
  }, [siswa, selectedNis]);

  React.useEffect(() => {
    if (types.length > 0) {
      if (!selectedPayKode) setSelectedPayKode(types[0].kode);
      if (!massPayKode) setMassPayKode(types[0].kode);
    }
  }, [types, selectedPayKode, massPayKode]);

  // Unique list of classes
  const classesList = useMemo(() => {
    return Array.from(new Set(siswa.map((s) => s.kelas))).sort();
  }, [siswa]);

  // Combined records for easy viewing: show every student + payment POS + customized tariff vs defaults
  const tariffViews = useMemo(() => {
    const list: {
      nis: string;
      nama: string;
      kelas: string;
      kodePembayaran: string;
      namaPembayaran: string;
      nominalDefault: number;
      nominalTarifCustom: number;
      isCustom: boolean;
    }[] = [];

    siswa.forEach((s) => {
      types.forEach((t) => {
        // Look up customized tariff
        const custRef = tariffs.find((tr) => tr.nis === s.nis && tr.kodePembayaran === t.kode);
        list.push({
          nis: s.nis,
          nama: s.nama,
          kelas: s.kelas,
          kodePembayaran: t.kode,
          namaPembayaran: t.nama,
          nominalDefault: t.nominalDefault,
          nominalTarifCustom: custRef ? custRef.nominal : t.nominalDefault,
          isCustom: !!custRef
        });
      });
    });

    return list;
  }, [siswa, types, tariffs]);

  const handleSaveIndividual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNis || !selectedPayKode) return;
    onSetTariff(selectedNis, selectedPayKode, individualNominal);
    alert('Tarif khusus siswa berhasil disimpan!');
  };

  const handleSaveMass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!massKelas || !massPayKode) return;
    onSetMassTariff(massKelas, massPayKode, massNominal);
    alert(`Berhasil mengatur tarif serentak untuk seluruh siswa kelas ${massKelas}!`);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const importedTariffs: { nis: string; kodePembayaran: string; nominal: number }[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(/[;,]/).map((c) => c.replace(/^["']|["']$/g, '').trim());
        if (cols.length >= 3 && cols[0]) {
          importedTariffs.push({
            nis: cols[0],
            kodePembayaran: cols[1].toUpperCase(),
            nominal: Number(cols[2] || 0)
          });
        }
      }

      if (importedTariffs.length > 0) {
        onImportTariffs(importedTariffs);
        alert(`Berhasil mengimpor ${importedTariffs.length} baris tarif khusus siswa!`);
      } else {
        alert('Format kolom file tidak valid.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadTemplate = () => {
    const headers = ['NIS', 'Kode_Pembayaran', 'Nominal'];
    const row1 = ['10001', 'SPP', '100000'];
    const row2 = ['10002', 'SPP', '150000'];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), row1.join(','), row2.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Template_Tarif.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formattedRupiah = (num: number) => {
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
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">Konfigurasi Tarif Siswa</h2>
          <p className="text-xs text-slate-400">Atur besaran tagihan kustom SPP per siswa karena beasiswa, prestasi, atau rombongan belajar.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Setup Forms */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6 lg:h-fit">
          {/* Sub Navigation tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
            <button 
              onClick={() => setActiveSubTab('individual')}
              className={`py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition ${
                activeSubTab === 'individual' 
                  ? 'bg-white text-sky-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              1. Individual
            </button>
            <button 
              onClick={() => setActiveSubTab('mass')}
              className={`py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition ${
                activeSubTab === 'mass' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              2. Massal Kelas
            </button>
            <button 
              onClick={() => setActiveSubTab('import')}
              className={`py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition ${
                activeSubTab === 'import' 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              3. Import CSV
            </button>
          </div>

          {/* Tab 1: Individual Setup */}
          {activeSubTab === 'individual' && (
            <form onSubmit={handleSaveIndividual} className="space-y-4">
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex gap-2 text-xs text-sky-700">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Format tarif ini akan menggantikan besaran nominal default saat tagihan otomatis digenerate.</span>
              </div>

              {/* Student */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Pilih Siswa</label>
                <select 
                  value={selectedNis}
                  onChange={(e) => setSelectedNis(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 bg-white font-medium text-slate-700"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {siswa.map((s) => (
                    <option key={s.id} value={s.nis}>{s.nis} - {s.nama} ({s.kelas})</option>
                  ))}
                </select>
              </div>

              {/* Payment Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Akun Pembayaran</label>
                <select 
                  value={selectedPayKode}
                  onChange={(e) => setSelectedPayKode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 bg-white font-medium text-slate-700"
                >
                  {types.map((t) => (
                    <option key={t.id} value={t.kode}>{t.kode} - {t.nama} ({t.jenis})</option>
                  ))}
                </select>
              </div>

              {/* Nominal */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tarif Khusus Personal (IDR)</label>
                <input 
                  type="number" 
                  value={individualNominal}
                  onChange={(e) => setIndividualNominal(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-mono font-bold"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Save className="w-4 h-4" /> Terapkan Tarif Personal
              </button>
            </form>
          )}

          {/* Tab 2: Mass Classroom Setup */}
          {activeSubTab === 'mass' && (
            <form onSubmit={handleSaveMass} className="space-y-4">
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-2 text-xs text-indigo-700">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Atur tarif seketika untuk <strong>seluruh murid aktif</strong> di suatu kelas pilihan sekaligus. Sangat cepat!</span>
              </div>

              {/* Classroom selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Pilih Kelas Sasaran</label>
                <select 
                  value={massKelas}
                  onChange={(e) => setMassKelas(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 bg-white font-bold text-indigo-700"
                >
                  {classesList.map((cls) => (
                    <option key={cls} value={cls}>Kelas {cls}</option>
                  ))}
                </select>
              </div>

              {/* Payment Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Akun Pembayaran</label>
                <select 
                  value={massPayKode}
                  onChange={(e) => setMassPayKode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 bg-white font-medium text-slate-700"
                >
                  {types.map((t) => (
                    <option key={t.id} value={t.kode}>{t.kode} - {t.nama} ({t.jenis})</option>
                  ))}
                </select>
              </div>

              {/* Nominal */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tarif Flat Massal (IDR)</label>
                <input 
                  type="number" 
                  value={massNominal}
                  onChange={(e) => setMassNominal(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Users className="w-4 h-4" /> Terapkan Massal Kelas
              </button>
            </form>
          )}

          {/* Tab 3: CSV Import Setup */}
          {activeSubTab === 'import' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-2 text-xs text-emerald-700">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Gunakan form ini untuk mengupload ribuan tarif khusus siswa dari file Excel Anda.</span>
              </div>

              <div className="space-y-2 border-2 border-dashed border-slate-200 p-4 rounded-xl text-center">
                <FileUp className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 font-medium font-sans">Pilih / Drag-drop file CSV Tarif Anda!</p>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImportCSV} 
                  accept=".csv,.txt" 
                  className="hidden" 
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition"
                >
                  Upload File
                </button>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <button 
                  onClick={handleDownloadTemplate}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <HelpCircle className="w-4 h-4" /> Download Template CSV
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Tariff Table Matrix */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Matriks Tarif Terkonfigurasi</h3>
                <p className="text-[10px] text-slate-400">Dua jenis tarif: <span className="bg-emerald-100 text-emerald-700 font-bold px-1 rounded">Kustom Personal</span> dan <span className="bg-slate-100 text-slate-600 font-bold px-1 rounded">Tarif Default POS</span></p>
              </div>
            </div>

            <div className="overflow-x-auto max-h-120">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                    <th className="py-2.5 px-4">Siswa (NIS)</th>
                    <th className="py-2.5 px-4">Kelas</th>
                    <th className="py-2.5 px-4">Kode Akun</th>
                    <th className="py-2.5 px-4">Tarif Default</th>
                    <th className="py-2.5 px-4">Tarif Berlaku</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {tariffViews.map((tv, idx) => (
                    <tr key={`${tv.nis}-${tv.kodePembayaran}-${idx}`} className="hover:bg-slate-50/50 transition">
                      <td className="py-2 px-4">
                        <div className="font-semibold text-slate-800">{tv.nama}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NIS: {tv.nis}</div>
                      </td>
                      <td className="py-2 px-4">
                        <span className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded text-[10px]">
                          {tv.kelas}
                        </span>
                      </td>
                      <td className="py-2 px-4 font-mono font-bold text-sky-600">{tv.kodePembayaran}</td>
                      <td className="py-2 px-4 font-mono text-slate-400">{formattedRupiah(tv.nominalDefault)}</td>
                      <td className="py-2 px-4 font-mono font-bold text-slate-800">
                        {formattedRupiah(tv.nominalTarifCustom)}
                      </td>
                      <td className="py-2 px-4 text-center">
                        {tv.isCustom ? (
                          <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-full inline-block border border-emerald-200">
                            Custom
                          </span>
                        ) : (
                          <span className="bg-slate-50 text-slate-400 text-[9px] font-medium px-2 py-0.5 rounded-full inline-block border border-slate-200">
                            Default
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
