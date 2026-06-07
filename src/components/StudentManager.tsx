/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { Siswa, User } from '../types';
import { 
  Plus, Edit2, Trash2, Search, FileDown, FileUp, 
  X, Check, AlertCircle, Ban, Filter, HelpCircle 
} from 'lucide-react';

interface StudentManagerProps {
  siswa: Siswa[];
  currentUser: User;
  onAddStudent: (data: Omit<Siswa, 'id'>) => void;
  onEditStudent: (id: string, data: Partial<Siswa>) => void;
  onDeleteStudent: (id: string) => void;
  onImportStudents: (data: Omit<Siswa, 'id'>[]) => void;
}

export default function StudentManager({
  siswa,
  currentUser,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onImportStudents
}: StudentManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('Semua');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Siswa | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [kelas, setKelas] = useState('X-MIPA-1');
  const [jurusan, setJurusan] = useState('');
  const [tahunMasuk, setTahunMasuk] = useState('2025');
  const [statusAktif, setStatusAktif] = useState<'Aktif' | 'Non-Aktif'>('Aktif');
  const [namaWali, setNamaWali] = useState('');
  const [alamat, setAlamat] = useState('');
  const [noHp, setNoHp] = useState('');

  // Error state
  const [errorMsg, setErrorMsg] = useState('');

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setNis('');
    setNisn('');
    setNama('');
    setJenisKelamin('Laki-laki');
    setTempatLahir('');
    setTanggalLahir('');
    setKelas('X-MIPA-1');
    setJurusan('MIPA');
    setTahunMasuk('2025');
    setStatusAktif('Aktif');
    setNamaWali('');
    setAlamat('');
    setNoHp('');
    setErrorMsg('');
    setShowModal(true);
  };

  // Open modal for edit
  const handleOpenEdit = (s: Siswa) => {
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
    setErrorMsg('');
    setShowModal(true);
  };

  // Unique list of classes for filtering
  const classesList = useMemo(() => {
    const list = new Set(siswa.map((s) => s.kelas));
    return ['Semua', ...Array.from(list)];
  }, [siswa]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return siswa.filter((s) => {
      const matchSearch = 
        s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nis.includes(searchTerm) ||
        s.nisn.includes(searchTerm) ||
        s.namaWali.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchClass = classFilter === 'Semua' || s.kelas === classFilter;
      return matchSearch && matchClass;
    });
  }, [siswa, searchTerm, classFilter]);

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!nis.trim() || !nama.trim() || !kelas.trim() || !noHp.trim()) {
      setErrorMsg('Field NIS, Nama, Kelas, dan No HP wajib diisi!');
      return;
    }

    // Check unique NIS (excluding current editing student)
    const exists = siswa.some((s) => s.nis === nis && s.id !== editingStudent?.id);
    if (exists) {
      setErrorMsg(`NIS ${nis} sudah digunakan oleh siswa lain.`);
      return;
    }

    const payload = {
      nis,
      nisn,
      nama,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      kelas,
      jurusan,
      tahunMasuk,
      statusAktif,
      namaWali,
      alamat,
      noHp
    };

    if (editingStudent) {
      onEditStudent(editingStudent.id, payload);
    } else {
      onAddStudent(payload);
    }
    setShowModal(false);
  };

  // Simulating Excel/CSV Import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const importedList: Omit<Siswa, 'id'>[] = [];

      // Check header row (NIS, NISN, Nama, Kelas, Jenis Kelamin,...)
      // Skip row 0 and parse items
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple comma/semicolon splitter
        const cols = line.split(/[;,]/).map((c) => c.replace(/^["']|["']$/g, '').trim());
        if (cols.length >= 3 && cols[0]) {
          importedList.push({
            nis: cols[0],
            nisn: cols[1] || '',
            nama: cols[2],
            jenisKelamin: (cols[3] === 'Perempuan' || cols[3] === 'P') ? 'Perempuan' : 'Laki-laki',
            tempatLahir: cols[4] || 'Jakarta',
            tanggalLahir: cols[5] || '2009-01-01',
            kelas: cols[6] || 'X-MIPA-1',
            jurusan: cols[7] || '',
            tahunMasuk: cols[8] || '2025',
            statusAktif: 'Aktif',
            namaWali: cols[9] || 'Wali Siswa',
            alamat: cols[10] || '',
            noHp: cols[11] || '081200000000'
          });
        }
      }

      if (importedList.length > 0) {
        onImportStudents(importedList);
        alert(`Berhasil mengimpor ${importedList.length} data siswa ke database!`);
      } else {
        alert('File tidak valid atau format kolom tidak sesuai.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Download template CSV or Simulating Excel Export
  const handleExportCSV = () => {
    const headers = [
      'NIS', 'NISN', 'Nama Siswa', 'Jenis Kelamin', 'Tempat Lahir', 
      'Tanggal Lahir', 'Kelas', 'Jurusan', 'Tahun Masuk', 'Status', 
      'Nama Wali', 'Alamat', 'No HP'
    ];

    const rows = filteredStudents.map((s) => [
      s.nis, s.nisn, s.nama, s.jenisKelamin, s.tempatLahir,
      s.tanggalLahir, s.kelas, s.jurusan || '', s.tahunMasuk, s.statusAktif,
      s.namaWali, s.alamat, s.noHp
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Siswa_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Import Template
  const handleDownloadTemplate = () => {
    const headers = [
      'NIS', 'NISN', 'Nama', 'Jenis_Kelamin(L/P)', 'Tempat_Lahir', 
      'Tanggal_Lahir(YYYY-MM-DD)', 'Kelas', 'Jurusan', 'Tahun_Masuk', 
      'Nama_Wali', 'Alamat', 'No_HP'
    ];
    const sampleVal = [
      '10009', '0089887711', 'Aris Budiman', 'L', 'Surabaya', 
      '2010-05-18', 'X-MIPA-1', 'MIPA', '2025', 
      'Rudi Budiman', 'Jl. Kenari No 10', '081299887766'
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), sampleVal.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Template_Siswa.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper check for role delete inhibition
  const isOperator = currentUser.role === 'Operator';

  return (
    <div className="space-y-6">
      {/* Title & Action Buttons Header */}
      <div id="student_header" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">Siswa Registrasi ({siswa.length})</h2>
          <p className="text-xs text-slate-400">Kelola informasi murid, kelas, kontak wali, dan download/upload CSV Excel.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Add triggers */}
          <button 
            onClick={handleDownloadTemplate} 
            title="Download Template CSV untuk diisi"
            className="text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-2 rounded-xl border border-indigo-200 flex items-center gap-1.5 transition"
          >
            <HelpCircle className="w-4 h-4" /> Template
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
            accept=".csv, .txt" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5 transition"
          >
            <FileUp className="w-4 h-4" /> Import Excel/CSV
          </button>

          <button 
            onClick={handleExportCSV} 
            className="text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5 transition"
          >
            <FileDown className="w-4 h-4" /> Export Excel
          </button>

          <button 
            onClick={handleOpenAdd} 
            className="text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-sky-100 transition"
          >
            <Plus className="w-4 h-4" /> Tambah Siswa
          </button>
        </div>
      </div>

      {/* Grid Filter and Quick Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        {/* Search */}
        <div className="md:col-span-3 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari siswa berdasarkan NIS, Nama, atau Nama Wali..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 placeholder-slate-400 font-medium"
          />
        </div>

        {/* Filter Classroom */}
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <select 
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white font-medium text-slate-600 appearance-none pointer-events-auto"
          >
            {classesList.map((cls) => (
              <option key={cls} value={cls}>{cls === 'Semua' ? 'Semua Kelas' : `Kelas ${cls}`}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List Datatable simulation */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3.5 px-4">NIS / NISN</th>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">L/P</th>
                <th className="py-3.5 px-4">Kelas & Jurusan</th>
                <th className="py-3.5 px-4">Tahun Masuk</th>
                <th className="py-3.5 px-4">Wali & No. HP</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ada data siswa ditemukan. Cobalah cari dengan kata kunci lain.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-700">{s.nis}</div>
                      <div className="text-[10px] text-slate-400">NISN: {s.nisn || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{s.nama}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {s.jenisKelamin === 'Laki-laki' ? 'L' : 'P'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-sky-50 text-sky-600 font-bold px-2 py-0.5 rounded text-[10px]">
                        {s.kelas}
                      </span>
                      {s.jurusan && (
                        <span className="ml-1.5 text-[10px] text-slate-400">({s.jurusan})</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{s.tahunMasuk}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700">{s.namaWali}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{s.noHp}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.statusAktif === 'Aktif' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-rose-50 text-rose-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.statusAktif === 'Aktif' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {s.statusAktif}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(s)}
                          title="Ubah Profil Siswa"
                          className="bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-600 p-1.5 rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            if (isOperator) {
                              alert('Akses ditolak: Petugas dengan role Operator tidak diperbolehkan menghapus siswa!');
                            } else {
                              if (confirm(`Apakah Anda yakin ingin menghapus siswa ${s.nama}?`)) {
                                onDeleteStudent(s.id);
                              }
                            }
                          }}
                          title={isOperator ? "Hapus hanya diperbolehkan untuk Admin" : "Hapus Profil Siswa"}
                          className={`p-1.5 rounded-lg transition ${
                            isOperator 
                              ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
                              : 'bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600'
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

      {/* CRUD Add/Edit Student Dialog Modal Overlay */}
      {showModal && (
        <div id="student_modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {editingStudent ? 'Edit Profil Siswa' : 'Registrasi Siswa Baru'}
                </h3>
                <p className="text-[10px] text-slate-500">Lengkapi formulir di bawah ini dengan lengkap dan valid.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NIS */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">NIS (Nomor Induk Siswa) *</label>
                  <input 
                    type="text" 
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    placeholder="Contoh: 10001"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring- focus:border-sky-500 font-medium"
                  />
                </div>

                {/* NISN */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">NISN (Nasional)</label>
                  <input 
                    type="text" 
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="Contoh: 0081234567"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                  />
                </div>

                {/* Nama */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Siswa Lengkap *</label>
                  <input 
                    type="text" 
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Ahmad Dani"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>

                {/* Jenis Kelamin */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Jenis Kelamin</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                      <input 
                        type="radio" 
                        name="jk" 
                        checked={jenisKelamin === 'Laki-laki'} 
                        onChange={() => setJenisKelamin('Laki-laki')}
                        className="text-sky-600 focus:ring-sky-500" 
                      />
                      Laki-laki
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                      <input 
                        type="radio" 
                        name="jk" 
                        checked={jenisKelamin === 'Perempuan'} 
                        onChange={() => setJenisKelamin('Perempuan')}
                        className="text-sky-600 focus:ring-sky-500" 
                      />
                      Perempuan
                    </label>
                  </div>
                </div>

                {/* Tempat & tgl lahir */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tempat / Tanggal Lahir</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={tempatLahir} 
                      onChange={(e) => setTempatLahir(e.target.value)} 
                      placeholder="Tempat" 
                      className="w-1/2 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:outline-none focus:border-sky-500 font-medium" 
                    />
                    <input 
                      type="date" 
                      value={tanggalLahir} 
                      onChange={(e) => setTanggalLahir(e.target.value)} 
                      className="w-1/2 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:outline-none focus:border-sky-500 font-medium" 
                    />
                  </div>
                </div>

                {/* Kelas */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Kelas *</label>
                  <select 
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 bg-white font-medium"
                  >
                    <option value="X-MIPA-1">X-MIPA-1</option>
                    <option value="X-MIPA-2">X-MIPA-2</option>
                    <option value="X-IPS-1">X-IPS-1</option>
                    <option value="XI-MIPA-1">XI-MIPA-1</option>
                    <option value="XI-IPS-1">XI-IPS-1</option>
                    <option value="XII-MIPA-1">XII-MIPA-1</option>
                    <option value="XII-IPS-1">XII-IPS-1</option>
                  </select>
                </div>

                {/* Jurusan, Tahun masuk, status */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Jurusan (Opsional)</label>
                  <input 
                    type="text" 
                    value={jurusan}
                    onChange={(e) => setJurusan(e.target.value)}
                    placeholder="Contoh: MIPA, IPS, Bahasa"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tahun Masuk / Angkatan</label>
                  <input 
                    type="text" 
                    value={tahunMasuk}
                    onChange={(e) => setTahunMasuk(e.target.value)}
                    placeholder="Contoh: 2024"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Status Siswa</label>
                  <select 
                    value={statusAktif}
                    onChange={(e) => setStatusAktif(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 bg-white font-medium"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Orang Tua / Wali Siswa</label>
                  <input 
                    type="text" 
                    value={namaWali}
                    onChange={(e) => setNamaWali(e.target.value)}
                    placeholder="Contoh: Subagyo Hermawan"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">No Handphone Wali (Kuitansi WA)*</label>
                  <input 
                    type="text" 
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>

                {/* Alamat */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Alamat Rumah Lengkap</label>
                  <textarea 
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Contoh: Jl. Merdeka Raya No 56A, Kebayoran Baru"
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-medium resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2 text-xs">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-1 shadow-sm shadow-sky-100 transition"
                >
                  <Check className="w-4 h-4" /> Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
