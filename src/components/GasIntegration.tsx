/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GAS_FILES, GasFile } from './GASCodeStorage';
import { 
  FileCode, HelpCircle, Copy, Check, ChevronRight, 
  Database, PlayCircle, Settings, Laptop, Landmark 
} from 'lucide-react';

export default function GasIntegration() {
  const [selectedFile, setSelectedFile] = useState<GasFile>(GAS_FILES[0]);
  const [copiedMap, setCopiedMap] = useState<{ [key: string]: boolean }>({});

  const handleCopyCode = (file: GasFile) => {
    navigator.clipboard.writeText(file.content);
    setCopiedMap((prev) => ({ ...prev, [file.name]: true }));
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [file.name]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Intro Banner */}
      <div className="bg-sky-600 text-white p-6 sm:p-8 rounded-2xl shadow-xs space-y-3 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] bg-sky-700 font-bold px-3 py-1 rounded-full uppercase tracking-widest text-sky-100">
            Panduan Deploy Mandiri
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-sans">
            Integrasi Google Apps Script (GAS) &amp; Google Spreadsheet
          </h2>
          <p className="text-xs text-sky-100 max-w-2xl leading-relaxed">
            Gunakan seluruh visual rancangan kode di bawah ini untuk membuat sistem pembayaran sekolah permanen di akun Google Cloud/Drive sekolah Anda. Gratis tanpa biaya hosting (Serverless).
          </p>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 text-9xl text-sky-500/20 font-bold pointer-events-none">GAS</div>
      </div>

      {/* Grid Layout Documentation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Setup steps & Spreadsheet Structures */}
        <div className="space-y-6 lg:col-span-1">
          {/* STEP 1: SHEET LAYOUT */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              1. Struktur Buku Spreadsheet
            </h3>
            <p className="text-xs text-slate-400 font-medium">Buat Google Spreadsheet baru di Google Drive Anda. Lalu, jalankan script inisialisasi atau buat sheet dengan header kolom berikut:</p>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                <p className="text-xs font-bold text-slate-700">📄 Sheet: Siswa</p>
                <code className="text-[9px] text-slate-400 font-mono leading-normal block bg-white p-1.5 rounded border border-slate-100">
                  ID | NIS | NISN | Nama | Kelas | Alamat | HP | Status | Jenis_Kelamin | Tempat_Lahir | Tanggal_Lahir | Jurusan | Tahun_Masuk | Nama_Wali
                </code>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                <p className="text-xs font-bold text-slate-700">📄 Sheet: Jenis_Pembayaran</p>
                <code className="text-[9px] text-slate-400 font-mono block bg-white p-1.5 rounded border border-slate-100">
                  ID | Kode | Nama | Jenis | Tahun_Ajaran | Nominal_Default | Aktif
                </code>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                <p className="text-xs font-bold text-slate-700">📄 Sheet: Tarif_Siswa</p>
                <code className="text-[9px] text-slate-400 font-mono block bg-white p-1.5 rounded border border-slate-100">
                  ID | NIS | Kode_Pembayaran | Nominal
                </code>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                <p className="text-xs font-bold text-slate-700">📄 Sheet: Tagihan</p>
                <code className="text-[9px] text-slate-400 font-mono block bg-white p-1.5 rounded border border-slate-100">
                  ID | NIS | Kode_Pembayaran | Nama_Pembayaran | Periode | Nominal | Terbayar | Status | Tahun_Ajaran | Jenis
                </code>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                <p className="text-xs font-bold text-slate-700">📄 Sheet: Transaksi</p>
                <code className="text-[9px] text-slate-400 font-mono block bg-white p-1.5 rounded border border-slate-100">
                  ID | No_Transaksi | Tanggal | NIS | Total | Petugas
                </code>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                <p className="text-xs font-bold text-slate-700">📄 Sheet: Detail_Transaksi</p>
                <code className="text-[9px] text-slate-400 font-mono block bg-white p-1.5 rounded border border-slate-100">
                  ID | No_Transaksi | Tagihan_ID | Nama_Pembayaran | Periode | Nominal
                </code>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                <p className="text-xs font-bold text-slate-700">📄 Sheet: Users</p>
                <code className="text-[9px] text-slate-400 font-mono block bg-white p-1.5 rounded border border-slate-100">
                  ID | Username | Password | Role
                </code>
              </div>
            </div>
          </div>

          {/* STEP 2: GAS SETUP */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Laptop className="w-5 h-5 text-sky-600" />
              2. Langkah Instalasi Editor
            </h3>
            
            <div className="space-y-3.5 text-xs text-slate-500 font-medium">
              <div className="flex gap-2.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">1</div>
                <p className="leading-relaxed">Buka Google Sheets yang sudah Anda siapkan, pilih menu <strong>Ekstensi &gt; Apps Script</strong>.</p>
              </div>

              <div className="flex gap-2.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">2</div>
                <p className="leading-relaxed">Hapus kode default pada file <code>myCode.gs</code>, ganti nama menjadi <code>Code.gs</code>.</p>
              </div>

              <div className="flex gap-2.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">3</div>
                <p className="leading-relaxed">Tambahkan file script baru (+ tombol tambah file) sesuai nama tab di sebelah kanan (<code>Database.gs</code>, dll) lalu salin isinya.</p>
              </div>

              <div className="flex gap-2.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">4</div>
                <p className="leading-relaxed">Jalankan fungsi <code>initSpreadsheetDatabase()</code> di dalam editor untuk memformulasikan sheet otomatis.</p>
              </div>

              <div className="flex gap-2.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">5</div>
                <p className="leading-relaxed">Klik tombol <strong>Terapkan (Deploy) &gt; Penerapan Baru</strong>. Pilih jenis <strong>Aplikasi Web</strong>.</p>
              </div>

              <div className="flex gap-2.5">
                <div className="w-5 h-5 rounded-full bg-sky-100 border border-sky-200 text-sky-700 flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">6</div>
                <p className="leading-relaxed">Konfigurasi: Akses jalankan sebagai <strong>Saya (email Anda)</strong>, Pengakses yaitu <strong>Siapa Saja (Anyone)</strong> agar petugas TU sekolah dapat mengakses.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Code selector & Viewer panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            {/* File Header Tab List */}
            <div className="bg-slate-50/50 p-2.5 border-b border-slate-100 flex flex-wrap gap-1">
              {GAS_FILES.map((file) => (
                <button 
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                    selectedFile.name === file.name 
                      ? 'bg-sky-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  {file.name}
                </button>
              ))}
            </div>

            {/* Description & Copy Button Block */}
            <div className="p-4 bg-slate-50/20 border-b border-slate-100 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-700 flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-sky-600" />
                  File: {selectedFile.name}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">{selectedFile.description}</p>
              </div>
              
              <button 
                onClick={() => handleCopyCode(selectedFile)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1 transition-all cursor-pointer ${
                  copiedMap[selectedFile.name] 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {copiedMap[selectedFile.name] ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Disalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Salin Kode Gs
                  </>
                )}
              </button>
            </div>

            {/* Raw Code container */}
            <div className="p-6 overflow-hidden">
              <pre className="text-[10px] font-mono text-slate-700 overflow-auto max-h-160 leading-normal bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-inner scrollbar-thin">
                {selectedFile.content}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
