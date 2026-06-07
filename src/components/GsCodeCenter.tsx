/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GAS_FILES, INSTALLATION_GUIDE, GasFile } from '../utils/gasExporter';
import { Copy, Check, FileDown, Download, HelpCircle, BookOpen, Code, Settings } from 'lucide-react';

export default function GsCodeCenter() {
  const [selectedFile, setSelectedFile] = useState<GasFile>(GAS_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'guide'>('editor');

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (file: GasFile) => {
    const blob = new Blob([file.code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden" id="gas-code-center">
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-600" />
            Pusat Kode Google Apps Script
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Salin berkas-berkas program ini ke editor Apps Script Anda untuk mengaktifkan sinkronisasi database cloud Spreadsheet.
          </p>
        </div>
        
        {/* Tab Toggle */}
        <div className="flex bg-slate-200 p-1 rounded-lg self-start sm:self-center">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'editor'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            Editor Kode (.gs)
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Panduan Instalasi
          </button>
        </div>
      </div>

      {activeTab === 'editor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[500px]">
          {/* File Explorer Sidebar */}
          <div className="border-r border-slate-200 bg-slate-50/50 p-4 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Daftar File (.gs)</span>
            {GAS_FILES.map((file) => (
              <button
                key={file.name}
                onClick={() => {
                  setSelectedFile(file);
                  setCopied(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex flex-col gap-1 transition-colors ${
                  selectedFile.name === file.name
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/50 font-medium'
                    : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                }`}
              >
                <span className="flex items-center gap-1.5 font-mono">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  {file.name}
                </span>
                <span className="text-[11px] text-slate-400 line-clamp-1">{file.description}</span>
              </button>
            ))}
            
            <div className="mt-auto pt-4 border-t border-slate-200 text-xs text-slate-500 flex flex-col gap-2">
              <span className="font-semibold text-slate-700">Petunjuk Singkat:</span>
              <ol className="list-decimal list-inside space-y-1 text-slate-500">
                <li>Klik tombol <span className="font-medium">Salin</span></li>
                <li>Tempel di Google Apps Script</li>
                <li>Ulangi untuk seluruh 6 file</li>
                <li>Deploy sebagai Aplikasi Web</li>
              </ol>
            </div>
          </div>

          {/* Code Editor Panel */}
          <div className="col-span-1 lg:col-span-3 flex flex-col bg-slate-950 text-slate-200">
            {/* Editor Sub-header */}
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 font-semibold bg-slate-800 px-2 py-1 rounded">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-slate-400 truncate hidden sm:block">
                  {selectedFile.description}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Salin Kode
                    </>
                  )}
                </button>
                <button
                  onClick={() => downloadFile(selectedFile)}
                  className="p-1 text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-750 rounded transition-colors"
                  title="Unduh File"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Code Textarea */}
            <div className="p-4 overflow-auto flex-1 h-[450px] font-mono text-xs leading-relaxed">
              <pre className="text-emerald-400 select-all font-mono">
                {selectedFile.code}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        /* Guides Tab */
        <div className="p-6 overflow-y-auto max-h-[600px] bg-slate-50">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-8 markdown-body">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-xl font-bold text-slate-900">Petunjuk Sinkronisasi Sekolah</h3>
                <p className="text-sm text-slate-500">Panduan lengkap Deployment Google Apps Script ke Google Spreadsheet</p>
              </div>
            </div>

            <div className="text-sm space-y-6 text-slate-700">
              <section>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">1</span>
                  Kunci & Skema Spreadsheet
                </h4>
                <p className="leading-relaxed">
                  Aplikasi ini bersifat fleksibel. Jika Anda tidak mengonfigurasikan Google Sheets, SIPES akan berjalan penuh dalam
                  <strong> Mode Offline Simulator </strong> yang menyinkronkan data langsung ke memori internal browser Anda (<span className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">localStorage</span>).
                  Kemudahan ini dirancang agar petugas tata usaha bisa mempelajari dan menguji fitur sistem tanpa halangan jaringan.
                </p>
              </section>

              <section>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">2</span>
                  Alamat Database Sheets
                </h4>
                <p className="leading-relaxed mb-3">
                  Google Apps Script bertindak sebagai API server nirkabel. Server ini akan membuat secara otomatis tabel-tabel data di bawah ini pada saat sinkronisasi handshake pertama:
                </p>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px] text-slate-600">
                  <div className="p-2 bg-white rounded shadow-2xs border border-slate-100"><strong className="text-slate-900">Siswa</strong>: NIS, Wali, Kelas...</div>
                  <div className="p-2 bg-white rounded shadow-2xs border border-slate-100"><strong className="text-slate-900">Jenis_Pembayaran</strong>: SPP, UPP...</div>
                  <div className="p-2 bg-white rounded shadow-2xs border border-slate-100"><strong className="text-slate-900">Tarif_Siswa</strong>: Tarif Khas...</div>
                  <div className="p-2 bg-white rounded shadow-2xs border border-slate-100"><strong className="text-slate-900">Tagihan</strong>: Data Bulan Tagih...</div>
                  <div className="p-2 bg-white rounded shadow-2xs border border-slate-100"><strong className="text-slate-900">Transaksi</strong>: Log Pembayaran...</div>
                  <div className="p-2 bg-white rounded shadow-2xs border border-slate-100"><strong className="text-slate-900">Detail_Transaksi</strong>: Item Bill...</div>
                  <div className="p-2 bg-white rounded shadow-2xs border border-slate-100"><strong className="text-slate-900">Users</strong>: Hak kognitif role...</div>
                </div>
              </section>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 flex gap-3 text-blue-800">
                <HelpCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">PENTING DIINGAT SAAT DEPLOYMENT:</p>
                  <p className="leading-relaxed">
                    Setiap kali Anda mengubah kode script di Google Apps Script editor, pastikan Anda menerbitkan rilis baru. Pada menu <strong>Terapkan &gt; Kelola Penerapan (Manage Deployments)</strong>, klik ikon pensil (edit), lalu pilih versi baru <strong>"New Version"</strong>, lalu klik <strong>Terapkan</strong> kembali. Mengabaikan langkah ini akan membuat pembaruan kode Anda tidak masuk ke API URL aktif!
                  </p>
                </div>
              </div>

              <section className="bg-slate-900 text-slate-150 p-5 rounded-lg font-mono text-xs overflow-auto">
                <div className="text-cyan-400 font-bold mb-2">### ULASAN LANGKAH UTAMA:</div>
                {INSTALLATION_GUIDE}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
