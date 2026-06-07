/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Siswa } from '../types';
import { Plus, Search, Edit2, Trash2, FileSpreadsheet, Download, Upload, X, Check, Filter } from 'lucide-react';

interface SiswaPageProps {
  students: Siswa[];
  onAddStudent: (student: Siswa) => void;
  onEditStudent: (student: Siswa) => void;
  onDeleteStudent: (id: string) => void;
  userRole: 'Admin' | 'Operator';
  logAction: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
}

export default function SiswaPage({
  students,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  userRole,
  logAction
}: SiswaPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Siswa | null>(null);

  // Form states
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [kelas, setKelas] = useState('X-IPA-1');
  const [jurusan, setJurusan] = useState('MIPA');
  const [tahunMasuk, setTahunMasuk] = useState('2025');
  const [statusAktif, setStatusAktif] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [namaWali, setNamaWali] = useState('');
  const [alamat, setAlamat] = useState('');
  const [noHp, setNoHp] = useState('');

  // Excel paste state
  const [pasteData, setPasteData] = useState('');

  const openAddModal = () => {
    setEditingStudent(null);
    setNis('');
    setNisn('');
    setNama('');
    setJenisKelamin('Laki-laki');
    setTempatLahir('');
    setTanggalLahir('');
    setKelas('X-IPA-1');
    setJurusan('MIPA');
    setTahunMasuk('2025');
    setStatusAktif('Aktif');
    setNamaWali('');
    setAlamat('');
    setNoHp('');
    setIsModalOpen(true);
  };

  const openEditModal = (s: Siswa) => {
    setEditingStudent(s);
    setNis(s.nis);
    setNisn(s.nisn);
    setNama(s.nama);
    setJenisKelamin(s.jenisKelamin);
    setTempatLahir(s.tempatLahir);
    setTanggalLahir(s.tanggalLahir);
    setKelas(s.kelas);
    setJurusan(s.jurusan || '');
    setTahunMasuk(s.tahunMasuk);
    setStatusAktif(s.statusAktif);
    setNamaWali(s.namaWali);
    setAlamat(s.alamat);
    setNoHp(s.noHp);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis || !nama || !kelas) {
      alert('NIS, Nama, dan Kelas wajib diisi!');
      return;
    }

    const studentData: Siswa = {
      id: editingStudent ? editingStudent.id : 'sis-' + Date.now(),
      nis,
      nisn,
      nama,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      kelas,
      jurusan: kelas.includes('IPA') ? 'MIPA' : kelas.includes('IPS') ? 'IPS' : jurusan,
      tahunMasuk,
      statusAktif,
      namaWali,
      alamat,
      noHp
    };

    if (editingStudent) {
      onEditStudent(studentData);
      logAction('success', `Mengedit biodata siswa NIS: ${nis} - ${nama}`);
    } else {
      // Check duplicate NIS
      const duplicate = students.some(s => s.nis === nis);
      if (duplicate) {
        alert('NIS sudah terdaftar!');
        return;
      }
      onAddStudent(studentData);
      logAction('success', `Menambahkan siswa baru NIS: ${nis} - ${nama}`);
    }
    setIsModalOpen(false);
  };

  const handleImportExcel = () => {
    if (!pasteData.trim()) {
      alert('Silakan tempelkan data dari Excel terlebih dahulu!');
      return;
    }

    // Parse Tab-Separated Values (TSV from Excel copy)
    const lines = pasteData.trim().split('\n');
    let importedCount = 0;
    let duplicateCount = 0;

    lines.forEach((line) => {
      const cols = line.split('\t');
      if (cols.length >= 3) {
        const pNis = cols[0].trim();
        const pNisn = cols[1]?.trim() || '';
        const pNama = cols[2]?.trim() || '';
        const pKelas = cols[3]?.trim() || 'X-IPA-1';
        const pAlamat = cols[4]?.trim() || 'Sidoarjo';
        const pWali = cols[5]?.trim() || 'Wali';
        const pHp = cols[6]?.trim() || '08';
        
        // Skip header line if detected
        if (pNis.toLowerCase() === 'nis' || pNama.toLowerCase() === 'nama siswa') {
          return;
        }

        // Duplicate guard
        const exists = students.some(s => s.nis === pNis);
        if (exists) {
          duplicateCount++;
          return;
        }

        const newS: Siswa = {
          id: 'sis-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          nis: pNis,
          nisn: pNisn,
          nama: pNama,
          jenisKelamin: 'Laki-laki',
          tempatLahir: 'Sidoarjo',
          tanggalLahir: '2008-01-01',
          kelas: pKelas,
          jurusan: pKelas.includes('IPA') ? 'MIPA' : pKelas.includes('IPS') ? 'IPS' : 'Lainnya',
          tahunMasuk: '2025',
          statusAktif: 'Aktif',
          namaWali: pWali,
          alamat: pAlamat,
          noHp: pHp
        };

        onAddStudent(newS);
        importedCount++;
      }
    });

    logAction('success', `Berhasil mengimpor ${importedCount} siswa dari data Excel. (Diabaikan duplicat: ${duplicateCount})`);
    alert(`Sukses mengimpor ${importedCount} siswa!`);
    setPasteData('');
    setIsImportOpen(false);
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'NIS,NISN,Nama Siswa,Kelas,Jenis Kelamin,Tahun Masuk,Nama Wali,No HP,Alamat,Status\n';

    filteredStudents.forEach((s) => {
      csvContent += `"${s.nis}","${s.nisn}","${s.nama}","${s.kelas}","${s.jenisKelamin}","${s.tahunMasuk}","${s.namaWali}","${s.noHp}","${s.alamat.replace(/"/g, '""')}","${s.statusAktif}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Laporan_Siswa_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAction('info', `Mengekspor data siswa (.csv) sebanyak ${filteredStudents.length} baris`);
  };

  const handleDelete = (s: Siswa) => {
    if (userRole !== 'Admin') {
      alert('Hak akses ditolak! Hanya Admin yang boleh menghapus data siswa.');
      logAction('warning', `Percobaan penghapusan siswa ${s.nama} ditolak (Role: Operator)`);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus siswa ${s.nama} (NIS: ${s.nis})? Semua tagihan siswa ini akan terhapus dari ledger lokal.`)) {
      onDeleteStudent(s.id);
      logAction('error', `Menghapus siswa dari database: ${s.nama} (${s.nis})`);
    }
  };

  // Filter students based on search term and class selection
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nis.includes(searchTerm) ||
        (s.nisn && s.nisn.includes(searchTerm));
      const matchClass = selectedClass === 'Semua' || s.kelas === selectedClass;
      return matchSearch && matchClass;
    });
  }, [students, searchTerm, selectedClass]);

  // Unique classes for filter
  const classes = useMemo(() => {
    const list = new Set<string>();
    students.forEach(s => list.add(s.kelas));
    return Array.from(list).sort();
  }, [students]);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan NIS, Nama, atau NISN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-350 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          {/* Class Filter */}
          <div className="relative shrink-0 flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-xs py-1.5 px-3 border border-slate-350 rounded-lg bg-white font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Kelas</option>
              {classes.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setIsImportOpen(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300"
          >
            <Upload className="h-3.5 w-3.5" />
            Import Excel
          </button>
          
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* Grid SQL Trace Indicator */}
      <div className="bg-blue-50 text-[11px] text-blue-800 font-mono p-2 border border-blue-100 rounded flex items-center justify-between">
        <span className="font-semibold uppercase tracking-wider">🔎 DATATABLES EMULATOR QUERY FEED:</span>
        <span>
          SELECT * FROM Siswa WHERE (Nama LIKE '%{searchTerm}%' OR NIS = '{searchTerm}') {selectedClass !== 'Semua' ? `AND Kelas = '${selectedClass}'` : ''} LIMIT 50;
        </span>
      </div>

      {/* Student List Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-650">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">NIS</th>
                <th className="px-4 py-3">Nama Siswa</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">No HP / Handphone</th>
                <th className="px-4 py-3">Wali Murid</th>
                <th className="px-4 py-3">Alamat Rumah</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400 italic font-normal">
                    Tidak ditemukan kecocokan siswa. Silakan bersihkan kata kunci pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{s.nis}</td>
                    <td className="px-4 py-3.5 text-slate-900 font-bold uppercase">{s.nama}</td>
                    <td className="px-4 py-3.5"><span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-full text-[10px]">{s.kelas}</span></td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 font-bold rounded-full px-2 py-0.5 text-[10px] ${
                        s.statusAktif === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {s.statusAktif}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono">{s.noHp}</td>
                    <td className="px-4 py-3.5 text-slate-700">{s.namaWali}</td>
                    <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate">{s.alamat}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1 px-2 text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded flex items-center gap-1 transition"
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className="p-1 px-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded flex items-center gap-1 transition"
                        >
                          <Trash2 className="h-3 w-3" /> Hapus
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

      {/* Form Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingStudent ? 'Edit Profil Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">NIS (Nomor Induk Siswa) *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingStudent}
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    className="w-full text-xs font-mono font-bold p-2 border border-slate-300 rounded"
                    placeholder="Contoh: 23241009"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">NISN (Nasional)</label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    className="w-full text-xs font-mono p-2 border border-slate-300 rounded"
                    placeholder="Contoh: 00871122"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full text-xs font-bold uppercase p-2 border border-slate-300 rounded"
                  placeholder="Ahmad Sujak"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Jenis Kelamin</label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value as any)}
                    className="w-full text-xs p-2 border border-slate-300 rounded"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Kelas</label>
                  <input
                    type="text"
                    required
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full text-xs font-bold px-2 p-2 border border-slate-300 rounded"
                    placeholder="Contoh: X-IPA-1, XI-IPS-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Tempat Lahir</label>
                  <input
                    type="text"
                    value={tempatLahir}
                    onChange={(e) => setTempatLahir(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded"
                    placeholder="Jakarta"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Tahun Masuk</label>
                  <input
                    type="text"
                    value={tahunMasuk}
                    onChange={(e) => setTahunMasuk(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded text-center font-mono"
                    placeholder="2025"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Status Aktif</label>
                  <select
                    value={statusAktif}
                    onChange={(e) => setStatusAktif(e.target.value as any)}
                    className="w-full text-xs p-2 border border-slate-300 rounded"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Nama Wali Murid</label>
                  <input
                    type="text"
                    value={namaWali}
                    onChange={(e) => setNamaWali(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded"
                    placeholder="Bpk. Heri"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">No HP Wali / Siswa</label>
                  <input
                    type="text"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded font-mono"
                    placeholder="081234567"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Alamat Rumah Lengkap</label>
                <textarea
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded h-16"
                  placeholder="Jalan Merdeka No. 12 Sidoarjo..."
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Masukkan Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Copy-Paste Excel Import Drawer */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                Import Data Siswa dari Excel (Salin & Tempel)
              </h3>
              <button onClick={() => setIsImportOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 rounded p-4 text-xs text-emerald-900 border border-emerald-100 space-y-2">
                <p className="font-bold">Cara Kerja Impor Grid:</p>
                <p className="leading-relaxed font-sans">
                  Anda tidak perlu mengunggah file XLSX secara manual. Cukup buka data siswa di Microsoft Excel, buat kolom berurutan di bawah, pilih baris-baris data tersebut, tekan <strong>Ctrl+C (Copy)</strong>, lalu klik di dalam kotak teks di bawah ini dan tekan <strong>Ctrl+V (Paste)</strong>.
                </p>
                <p className="font-mono bg-white p-1 rounded border border-emerald-200 text-[10px]">
                  Urutan Kolom Excel: NIS [Tab] NISN [Tab] Nama [Tab] Kelas [Tab] Alamat [Tab] Wali [Tab] HP
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Tempel Data Tabular Excel Di Sini:</label>
                <textarea
                  className="w-full text-xs font-mono p-3 bg-slate-950 text-slate-200 rounded-lg h-44 focus:ring-2 focus:ring-blue-500 overflow-auto"
                  placeholder="23241011	008765412	Citra Safitri	X-IPA-1	Sidoarjo	Dodi Safitri	0812903344"
                  value={pasteData}
                  onChange={(e) => setPasteData(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportOpen(false);
                    setPasteData('');
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleImportExcel}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Check className="h-4 w-4" /> Import Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
