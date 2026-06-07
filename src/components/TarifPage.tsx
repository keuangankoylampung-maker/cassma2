/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Siswa, TarifSiswa, JenisPembayaran } from '../types';
import { Plus, Trash2, Edit, Save, Shuffle, AlertCircle, HelpCircle } from 'lucide-react';

interface TarifPageProps {
  students: Siswa[];
  tariffs: TarifSiswa[];
  paymentTypes: JenisPembayaran[];
  onAddTariff: (tariff: TarifSiswa) => void;
  onMassTariff: (payload: { kelas: string; kodePembayaran: string; nominal: number }) => void;
  onDeleteTariff: (id: string) => void;
  logAction: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
}

export default function TarifPage({
  students,
  tariffs,
  paymentTypes,
  onAddTariff,
  onMassTariff,
  onDeleteTariff,
  logAction
}: TarifPageProps) {
  const [activeTab, setActiveTab] = useState<'individual' | 'massal'>('individual');

  // Individual form state
  const [selectedNis, setSelectedNis] = useState('');
  const [selectedKode, setSelectedKode] = useState('');
  const [nominal, setNominal] = useState<number>(0);

  // Mass form state
  const [massKelas, setMassKelas] = useState('');
  const [massKode, setMassKode] = useState('');
  const [massNominal, setMassNominal] = useState<number>(0);

  // Excel copy paste state
  const [pasteTariff, setPasteTariff] = useState('');

  // Find student name based on NIS
  const getStudentName = (nis: string) => {
    const s = students.find(item => item.nis === nis);
    return s ? s.nama : 'Siswa Tidak Dikenal';
  };

  const getStudentClass = (nis: string) => {
    const s = students.find(item => item.nis === nis);
    return s ? s.kelas : '';
  };

  const activeClasses = useMemo(() => {
    const list = new Set<string>();
    students.forEach(s => list.add(s.kelas));
    return Array.from(list).sort();
  }, [students]);

  const handleAddIndividual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNis || !selectedKode || nominal <= 0) {
      alert('Mohon isi NIS, Jenis Pembayaran, dan nominal tarif!');
      return;
    }

    // Checking if already exists
    const duplicateIdx = tariffs.findIndex(t => t.nis === selectedNis && t.kodePembayaran === selectedKode);
    if (duplicateIdx !== -1) {
      const confirmed = confirm(`Tarif ${selectedKode} untuk siswa ini sudah disetting. Apakah Anda ingin memperbaharuinya?`);
      if (confirmed) {
        onDeleteTariff(tariffs[duplicateIdx].id);
      } else {
        return;
      }
    }

    const t: TarifSiswa = {
      id: 'ts-' + Date.now(),
      nis: selectedNis,
      kodePembayaran: selectedKode,
      nominal: Number(nominal)
    };

    onAddTariff(t);
    logAction('success', `Mengkonfigurasi tarif khusus siswa ${selectedNis} - ${selectedKode} sebesar Rp ${nominal.toLocaleString()}`);
    setSelectedNis('');
    setNominal(0);
  };

  const handleApplyMass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!massKelas || !massKode || massNominal <= 0) {
      alert('Lengkapi seluruh field input massal!');
      return;
    }

    const confirmed = confirm(`Apakah Anda yakin ingin menetapkan tarif massal ${massKode} sebesar Rp ${massNominal.toLocaleString()} untuk SEMUA SISWA di kelas ${massKelas}?`);
    if (confirmed) {
      onMassTariff({
        kelas: massKelas,
        kodePembayaran: massKode,
        nominal: Number(massNominal)
      });
      logAction('success', `Menetapkan tarif massal ${massKode} kelas ${massKelas} sebesar Rp ${massNominal.toLocaleString()}`);
      alert(`Tarif massal berhasil ditetapkan ke seluruh siswa kelas ${massKelas}!`);
      setMassKelas('');
      setMassNominal(0);
    }
  };

  const handleImportTariffText = () => {
    if (!pasteTariff.trim()) {
      alert('Pemberitahuan: Tempelkan teks TSV salinan dari Excel!');
      return;
    }

    const lines = pasteTariff.trim().split('\n');
    let count = 0;

    lines.forEach(line => {
      const cols = line.split('\t');
      if (cols.length >= 3) {
        const pNis = cols[0].trim();
        const pKode = cols[1].trim().toUpperCase();
        const pNominal = Number(cols[2].trim().replace(/[^0-9]/g, ''));

        // Header guard list row
        if (pNis.toLowerCase() === 'nis' || isNaN(pNominal) || pNominal <= 0) return;

        // Verify Student exists
        const sExists = students.some(s => s.nis === pNis);
        if (!sExists) return;

        // Duplicate guard (Delete existing first)
        const dupIdx = tariffs.findIndex(t => t.nis === pNis && t.kodePembayaran === pKode);
        if (dupIdx !== -1) {
          onDeleteTariff(tariffs[dupIdx].id);
        }

        onAddTariff({
          id: 'ts-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          nis: pNis,
          kodePembayaran: pKode,
          nominal: pNominal
        });
        count++;
      }
    });

    logAction('success', `Mengimpor ${count} baris konfigurasi tarif khusus dari Excel.`);
    alert(`Sukses mengimpor ${count} tarif khusus siswa!`);
    setPasteTariff('');
  };

  const handleRemove = (id: string, nis: string, kode: string) => {
    if (confirm('Hapus tarif khusus ini dan kembalikan ke nominal bawan default?')) {
      onDeleteTariff(id);
      logAction('error', `Menghapus tarif khusus siswa ${nis} - ${kode}`);
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="tarif-siswa-page">
      {/* Left Form Panel */}
      <div className="col-span-1 space-y-4">
        {/* Tab switcher */}
        <div className="bg-white p-1.5 rounded-lg border border-slate-200 flex gap-1">
          <button
            onClick={() => setActiveTab('individual')}
            className={`flex-1 text-center py-2 rounded-md font-bold text-xs transition-all ${
              activeTab === 'individual'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tarif Per Siswa
          </button>
          <button
            onClick={() => setActiveTab('massal')}
            className={`flex-1 text-center py-2 rounded-md font-bold text-xs transition-all ${
              activeTab === 'massal'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tarif Massal Kelas
          </button>
        </div>

        {activeTab === 'individual' ? (
          <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-800">Set Tarif Khas Siswa</h3>
            <p className="text-xs text-slate-500">Gunakan untuk merekatkan nominal biaya khusus per siswa yang diijinkan menyimpang dari nominal baku (misalnya penerima beasiswa).</p>
            
            <form onSubmit={handleAddIndividual} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Pilih Siswa *</label>
                <select
                  required
                  value={selectedNis}
                  onChange={(e) => setSelectedNis(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-350 rounded-lg bg-white font-medium"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.filter(s=>s.statusAktif === 'Aktif').map(s => (
                    <option key={s.id} value={s.nis}>{s.nis} - {s.nama} ({s.kelas})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Pilih Jenis Pembayaran *</label>
                <select
                  required
                  value={selectedKode}
                  onChange={(e) => setSelectedKode(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-350 rounded-lg bg-white font-medium"
                >
                  <option value="">-- Pilih Jenis Pembayaran --</option>
                  {paymentTypes.filter(p => p.aktif).map(p => (
                    <option key={p.id} value={p.kode}>{p.kode} - {p.nama} (Bawaan: {formatIDR(p.nominalDefault)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Nominal Tarif Kustom (Rp) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={nominal || ''}
                  onChange={(e) => setNominal(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold p-2.5 border border-slate-350 rounded-lg text-slate-800"
                  placeholder="Rp. 125,000"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
              >
                Simpan Tarif Khusus
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-800">Set Tarif Massal Kelas</h3>
            <p className="text-xs text-slate-500">Pemberitahuan: Melakukan override massal biaya program untuk satu kelas utuh sekaligus agar menghemat waktu rekam input admin.</p>
            
            <form onSubmit={handleApplyMass} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Pilih Kelas *</label>
                <select
                  required
                  value={massKelas}
                  onChange={(e) => setMassKelas(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-350 rounded-lg bg-white"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {activeClasses.map(c => (
                    <option key={c} value={c}>Kelas {c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Pilih Jenis Pembayaran *</label>
                <select
                  required
                  value={massKode}
                  onChange={(e) => setMassKode(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-350 rounded-lg bg-white"
                >
                  <option value="">-- Pilih Jenis Pembayaran --</option>
                  {paymentTypes.filter(p => p.aktif).map(p => (
                    <option key={p.id} value={p.kode}>{p.kode} - {p.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Nominal Kelas (Rp) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={massNominal || ''}
                  onChange={(e) => setMassNominal(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold p-2.5 border border-slate-350 rounded-lg text-slate-800"
                  placeholder="Rp. 150,000"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
              >
                Terapkan Massal Kelas
              </button>
            </form>
          </div>
        )}

        {/* Copy Paste Importer Block */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-3">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Impor Tarif Dari Excel</span>
          <p className="text-xs text-slate-500">Salin 3 kolom di Excel: <strong>NIS [Tab] Kode_Pembayaran [Tab] Nominal</strong> kemudian tempelkan di kotak berikut:</p>
          <textarea
            value={pasteTariff}
            onChange={(e) => setPasteTariff(e.target.value)}
            className="w-full text-[10px] font-mono bg-slate-900 text-slate-200 p-2 rounded h-20 overflow-auto"
            placeholder="23241001	SPP	125000&#10;23241002	SPP	150000"
          />
          <button
            onClick={handleImportTariffText}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded transition-colors"
          >
            Impor Tarif Khusus
          </button>
        </div>
      </div>

      {/* Right Table List Panel */}
      <div className="col-span-1 lg:col-span-2 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col h-[520px]">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold text-slate-950 text-xs">DAFTAR TARIF KUSTOM (PENYIMPANGAN) SEKOLAH</h3>
            <p className="text-[10px] text-slate-500">Daftar siswa yang tidak mematuhi tarif bawaan program utama.</p>
          </div>
          <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded border border-blue-250">
            {tariffs.length} Item Kustom
          </span>
        </div>

        <div className="overflow-y-auto flex-1 h-full font-sans">
          <table className="w-full text-xs text-left text-slate-650">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-4 py-3">Siswa (NIS)</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3 text-center">Kode</th>
                <th className="px-4 py-3 text-right">Nominal Kustom</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-750">
              {tariffs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400 italic">
                    Belum ada tarif khusus yang diatur. Semua siswa mengikuti tagihan bawaan program sekolah.
                  </td>
                </tr>
              ) : (
                tariffs.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/55 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-mono text-slate-850 font-bold leading-none">{t.nis}</p>
                      <p className="text-[11px] text-slate-900 font-bold uppercase mt-1 leading-none">{getStudentName(t.nis)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 text-[10px]">{getStudentClass(t.nis)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono font-black text-blue-700">{t.kodePembayaran}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {formatIDR(t.nominal)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRemove(t.id, t.nis, t.kodePembayaran)}
                        className="text-red-500 hover:text-red-800 p-1.5 hover:bg-red-50 rounded transition-colors"
                        title="Hapus tarif konvensional khusus"
                      >
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* SQL trace query footer */}
        <div className="bg-slate-950 p-2.5 font-mono text-[9px] text-slate-500 border-t border-slate-800 shrink-0">
          SELECT t.*, s.Nama, s.Kelas FROM Tarif_Siswa t JOIN Siswa s ON t.NIS = s.NIS ORDER BY s.Kelas ASC, s.Nama ASC;
        </div>
      </div>
    </div>
  );
}
