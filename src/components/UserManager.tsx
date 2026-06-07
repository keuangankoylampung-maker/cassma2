/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../types';
import { Shield, Plus, Lock, Trash2, Ban, ShieldAlert, Check, X, AlertCircle } from 'lucide-react';

interface UserManagerProps {
  users: User[];
  currentUser: User;
  onAddUser: (data: Omit<User, 'id'>) => void;
  onDeleteUser: (id: string) => void;
}

export default function UserManager({
  users,
  currentUser,
  onAddUser,
  onDeleteUser
}: UserManagerProps) {
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Operator'>('Operator');
  const [errorMsg, setErrorMsg] = useState('');

  const isAdmin = currentUser.role === 'Admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Semua field wajib diisi!');
      return;
    }

    // Check duplicate username
    const exists = users.some((u) => u.username.toLowerCase() === username.toLowerCase().trim());
    if (exists) {
      setErrorMsg(`Username '${username}' sudah terdaftar.`);
      return;
    }

    onAddUser({
      username: username.trim(),
      password: password,
      role
    });

    setShowModal(false);
    setUsername('');
    setPassword('');
    setRole('Operator');
  };

  // If Operator attempts to look at this page, block them visually!
  if (!isAdmin) {
    return (
      <div id="user_forbidden" className="bg-white p-12 text-center rounded-2xl border border-slate-100 max-w-lg mx-auto shadow-xs my-10 space-y-4">
        <div className="bg-rose-50 text-rose-600 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-md font-bold text-slate-800">Akses Ditolak / Terbatas</h3>
          <p className="text-xs text-slate-400">Status Anda saat ini adalah <strong>Operator</strong>. Hanya Administrator Sekolah (Admin) yang memiliki privilege untuk mengelola kredensial sistem.</p>
        </div>
        <p className="text-[10px] bg-slate-50 text-slate-400 p-2.5 rounded-lg border leading-relaxed">
          Gunakan tombol pilihan pengguna di bilah navigasi atas untuk berpindah peran menjadi "Admin" untuk mengakses halaman manajemen kredensial ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">Manajemen User &amp; Hak Akses ({users.length})</h2>
          <p className="text-xs text-slate-400">Kelola credentials login petugas TU. Terapkan pemisahan peranan (Admin vs Operator).</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-sky-100 transition"
        >
          <Plus className="w-4 h-4" /> Tambah User Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden max-w-3xl">
        <table className="w-full text-left font-sans text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
              <th className="py-2.5 px-4">ID</th>
              <th className="py-2.5 px-4">Username Login</th>
              <th className="py-2.5 px-4 font-bold">Tipe Peran (Role)</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition">
                <td className="py-3.5 px-4 text-slate-400 font-mono">{u.id}</td>
                <td className="py-3.5 px-4 font-bold text-slate-700">{u.username}</td>
                <td className="py-3.5 px-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    u.role === 'Admin' 
                      ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                      : 'bg-sky-50 text-sky-600 border border-sky-200'
                  }`}>
                    <Shield className="w-3 h-3" />
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Aktif
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button 
                    onClick={() => {
                      if (u.username === 'admin') {
                        alert('Gagal: Pengguna admin bawaan sistem tidak diperbolehkan untuk dihapus!');
                      } else if (u.username === currentUser.username) {
                        alert('Gagal: Anda tidak diperbolehkan menghapus akun Anda sendiri saat sedang masuk!');
                      } else if (confirm(`Apakah Anda yakin ingin menghapus user ${u.username}?`)) {
                        onDeleteUser(u.id);
                      }
                    }}
                    title="Hapus Hak Akses Pengguna"
                    className="bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 p-1.5 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div id="add_user_modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Registrasi User Baru</h3>
                <p className="text-[10px] text-slate-400">Daftarkan kredensial operator atau admin sekolah baru.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium text-slate-600">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 flex items-center gap-2 rounded-xl">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Username */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Username Login *</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: rudi.operator"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-bold"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Kata Sandi (Password) *</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Isi password aman"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Level Hak Akses *</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-white font-bold"
                >
                  <option value="Operator">Operator (Hanya Input &amp; Cetak, tidak bisa hapus)</option>
                  <option value="Admin">Admin (Akses penuh seluruh database keuangan)</option>
                </select>
              </div>

              {/* Actions */}
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
                  <Check className="w-4 h-4" /> Simpan User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
