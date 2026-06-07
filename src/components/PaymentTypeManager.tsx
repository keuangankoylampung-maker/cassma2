/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { JenisPembayaran, User } from '../types';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Settings, Layers, Star, Ban, X, Check, AlertCircle } from 'lucide-react';

interface PaymentTypeManagerProps {
  types: JenisPembayaran[];
  currentUser: User;
  onAddType: (data: Omit<JenisPembayaran, 'id'>) => void;
  onEditType: (id: string, data: Partial<JenisPembayaran>) => void;
  onDeleteType: (id: string) => void;
}

export default function PaymentTypeManager({
  types,
  currentUser,
  onAddType,
  onEditType,
  onDeleteType
}: PaymentTypeManagerProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<JenisPembayaran | null>(null);

  // Form states
  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [jenis, setJenis] = useState<'Bulanan' | 'Bebas'>('Bulanan');
  const [tahunAjaran, setTahunAjaran] = useState('2025/2026');
  const [nominalDefault, setNominalDefault] = useState(150000);
  const [aktif, setAktif] = useState<'Ya' | 'Tidak'>('Ya');

  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenAdd = () => {
    setEditingType(null);
    setKode('');
    setNama('');
    setJenis('Bulanan');
    setTahunAjaran('2025/2026');
    setNominalDefault(150000);
    setAktif('Ya');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (t: JenisPembayaran) => {
    setEditingType(t);
    setKode(t.kode);
    setNama(t.nama);
    setJenis(t.jenis);
    setTahunAjaran(t.tahunAjaran);
    setNominalDefault(t.nominalDefault);
    setAktif(t.aktif);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!kode.trim() || !nama.trim() || !tahunAjaran.trim()) {
      setErrorMsg('Semua field wajib diisi!');
      return;
    }

    // Code rules
    const formattedKode = kode.toUpperCase().trim();

    // Check duplicate code per school year
    const exists = types.some((t) => t.kode === formattedKode && t.tahunAjaran === tahunAjaran && t.id !== editingType?.id);
    if (exists) {
      setErrorMsg(`Kode pembayaran '${formattedKode}' untuk tahun ajaran ${tahunAjaran} sudah terdaftar.`);
      return;
    }

    const payload = {
      kode: formattedKode,
      nama,
      jenis,
      tahunAjaran,
      nominalDefault: Number(nominalDefault || 0),
      aktif
    };

    if (editingType) {
      onEditType(editingType.id, payload);
    } else {
      onAddType(payload);
    }
    setShowModal(false);
  };

  const formattedRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const isOperator = currentUser.role === 'Operator';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">Master Jenis Pembayaran ({types.length})</h2>
          <p className="text-xs text-slate-400">Atur akun penerimaan sekolah untuk mengelompokkan SPP bulanan atau cicilan bebas.</p>
        </div>
        <button 
          onClick={handleOpenAdd} 
          className="text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-sky-100 transition"
        >
          <Plus className="w-4 h-4" /> Tambah Pos Pembayaran
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bulanan Left Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="bg-sky-50 text-sky-600 p-2 rounded-xl"><Layers className="w-4 h-4" /></div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">A. Pembayaran Bulanan</h3>
                  <p className="text-[10px] text-slate-400">Tagihan berkala setiap bulan (Contoh: SPP, Ekstra, Praktikum)</p>
                </div>
              </div>
              <span className="text-[9px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-extrabold">BULANAN</span>
            </div>

            <div className="space-y-3">
              {types.filter((t) => t.jenis === 'Bulanan').map((t) => (
                <div key={t.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] bg-sky-100 text-sky-700 font-mono font-bold px-1.5 py-0.5 rounded mr-2">
                        {t.kode}
                      </span>
                      <span className="text-xs font-bold text-slate-700">{t.nama}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 font-mono">{t.tahunAjaran}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <div>
                      Tarif Terkait: <strong className="text-slate-800 font-mono">{formattedRupiah(t.nominalDefault)}</strong> / bulan
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                        t.aktif === 'Ya' ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        {t.aktif === 'Ya' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                        {t.aktif === 'Ya' ? 'Aktif' : 'Non-Aktif'}
                      </span>
                      
                      <button 
                        onClick={() => handleOpenEdit(t)}
                        className="bg-white hover:bg-sky-50 text-slate-500 hover:text-sky-600 p-1 rounded-md border border-slate-200 transition"
                      >
                        <Edit2 className="w-3" />
                      </button>

                      <button 
                        onClick={() => {
                          if (isOperator) {
                            alert('Akses Ditolak: Role Operator tidak bisa menghapus master pembayaran.');
                          } else if (confirm(`Hapus pos pembayaran ${t.kode}?`)) {
                            onDeleteType(t.id);
                          }
                        }}
                        disabled={isOperator}
                        className={`p-1 rounded-md border transition ${
                          isOperator 
                            ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed' 
                            : 'bg-white hover:bg-rose-50 border-slate-200 text-slate-500 hover:text-rose-600'
                        }`}
                      >
                        {isOperator ? <Ban className="w-3" /> : <Trash2 className="w-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bebas Right Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl"><Star className="w-4 h-4" /></div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">B. Pembayaran Bebas</h3>
                  <p className="text-[10px] text-slate-400">Tagihan sekali bayar yang bisa dicicil (Contoh: UPP, Seragam, Pariwisata)</p>
                </div>
              </div>
              <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-extrabold">CICILAN</span>
            </div>

            <div className="space-y-3">
              {types.filter((t) => t.jenis === 'Bebas').map((t) => (
                <div key={t.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 font-mono font-bold px-1.5 py-0.5 rounded mr-2">
                        {t.kode}
                      </span>
                      <span className="text-xs font-bold text-slate-700">{t.nama}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 font-mono">{t.tahunAjaran}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <div>
                      Tagihan Total: <strong className="text-slate-800 font-mono">{formattedRupiah(t.nominalDefault)}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                        t.aktif === 'Ya' ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        {t.aktif === 'Ya' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                        {t.aktif === 'Ya' ? 'Aktif' : 'Non-aktif'}
                      </span>
                      
                      <button 
                        onClick={() => handleOpenEdit(t)}
                        className="bg-white hover:bg-sky-50 text-slate-500 hover:text-sky-600 p-1 rounded-md border border-slate-200 transition"
                      >
                        <Edit2 className="w-3" />
                      </button>

                      <button 
                        onClick={() => {
                          if (isOperator) {
                            alert('Akses Ditolak: Role Operator tidak bisa menghapus master pembayaran.');
                          } else if (confirm(`Hapus pos pembayaran bebas ${t.kode}?`)) {
                            onDeleteType(t.id);
                          }
                        }}
                        disabled={isOperator}
                        className={`p-1 rounded-md border transition ${
                          isOperator 
                            ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed' 
                            : 'bg-white hover:bg-rose-50 border-slate-200 text-slate-500 hover:text-rose-600'
                        }`}
                      >
                        {isOperator ? <Ban className="w-3" /> : <Trash2 className="w-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up dialog modal for Pos Pembayaran */}
      {showModal && (
        <div id="payment_type_modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {editingType ? 'Sunting Pos Pembayaran' : 'Tambah Pos Penerimaan Pembayaran'}
                </h3>
                <p className="text-[10px] text-slate-400">Atur kode buku pembayaran agar sinkron dengan setoran kasir.</p>
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
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Kode Pembayaran */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Kode POS Pembayaran *</label>
                <input 
                  type="text" 
                  value={kode}
                  onChange={(e) => setKode(e.target.value)}
                  placeholder="Contoh: SPP, UPP, SERAGAM"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-mono font-bold"
                />
              </div>

              {/* Nama Pembayaran */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nama POS Penerimaan *</label>
                <input 
                  type="text" 
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Sumbangan Pembinaan Pendidikan"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              {/* Jenis Pembayaran */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase text-slate-500">Skema Pembayaran</label>
                <select 
                  value={jenis}
                  onChange={(e) => setJenis(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 bg-white font-medium"
                >
                  <option value="Bulanan">A. Bulanan (Tagihan rutin berulang tiap bulan)</option>
                  <option value="Bebas">B. Bebas (Sekali tagih, pelunasan bebas diangsur/dicicil)</option>
                </select>
              </div>

              {/* Tahun Ajaran */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tahun Ajaran *</label>
                <input 
                  type="text" 
                  value={tahunAjaran}
                  onChange={(e) => setTahunAjaran(e.target.value)}
                  placeholder="Contoh: 2025/2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              {/* Nominal Default */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nominal Default (IDR) *</label>
                <input 
                  type="number" 
                  value={nominalDefault}
                  onChange={(e) => setNominalDefault(Number(e.target.value))}
                  placeholder="Contoh: 150000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-mono font-bold"
                />
              </div>

              {/* Aktif? */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Status Aktif</label>
                <select 
                  value={aktif}
                  onChange={(e) => setAktif(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 bg-white font-medium"
                >
                  <option value="Ya">Ya, Aktifkan pendaftaran tagihan</option>
                  <option value="Tidak">Tidak Aktif</option>
                </select>
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
                  className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-1 shadow-sm transition"
                >
                  <Check className="w-4 h-4" /> Simpan Konfigurasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
