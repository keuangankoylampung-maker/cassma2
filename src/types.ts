/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Siswa {
  id: string;
  nis: string;
  nisn: string;
  nama: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tempatLahir: string;
  tanggalLahir: string;
  kelas: string;
  jurusan?: string; // Optional (SMA)
  tahunMasuk: string;
  statusAktif: 'Aktif' | 'Nonaktif';
  namaWali: string;
  alamat: string;
  noHp: string;
}

export type JenisPembayaranType = 'Bulanan' | 'Bebas';

export interface JenisPembayaran {
  id: string;
  kode: string; // e.g., SPP, EXTR, GDG, SRG
  nama: string; // e.g., SPP bulanan, Uang Gedung
  jenis: JenisPembayaranType;
  tahunAjaran: string; // e.g., "2025/2026"
  nominalDefault: number;
  aktif: boolean;
}

export interface TarifSiswa {
  id: string;
  nis: string;
  kodePembayaran: string;
  nominal: number;
}

export interface Tagihan {
  id: string;
  nis: string;
  kodePembayaran: string;
  periode: string; // e.g., "Januari", "Februari", ... for Bulanan, or "Sekali Tagih" / "Cicilan" for Bebas
  nominal: number;
  status: 'Belum Lunas' | 'Cicilan' | 'Lunas';
  terbayar: number; // Jumlah yang sudah dibayar
}

export interface Transaksi {
  id: string;
  noTransaksi: string;
  tanggal: string; // ISO String or YYYY-MM-DD HH:mm:ss
  nis: string;
  total: number;
  petugas: string;
}

export interface DetailTransaksi {
  id: string;
  noTransaksi: string;
  tagihanId: string;
  nominal: number;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'Admin' | 'Operator';
}

export interface ConsoleLog {
  id: string;
  timestamp: string; // HH:mm:ss
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface AppSettings {
  spreadsheetUrl: string;
  webAppUrl: string;
  connectionStatus: 'offline' | 'connecting' | 'connected';
  spreadsheetName: string;
  currentUser: User | null;
}

export interface SchoolConfig {
  nama: string;
  alamat: string;
  subHeader: string;
  inisial: string;
  npsn: string;
  statusKwitansi: string;
  logoUrl?: string;
  telepon?: string;
  email?: string;
  bendahara?: string;
  kepalaSekolah?: string;
}
