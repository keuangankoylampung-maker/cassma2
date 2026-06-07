/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Siswa {
  id: string; // ID unik (auto generated)
  nis: string; // Nomor Induk Siswa
  nisn: string; // Nomor Induk Siswa Nasional
  nama: string; // Nama Siswa
  jenisKelamin: 'Laki-laki' | 'Perempuan'; // Jenis Kelamin
  tempatLahir: string;
  tanggalLahir: string;
  kelas: string; // Contoh: X-MIPA-1, XI-IPS-2
  jurusan?: string; // Jurusan (opsional SMA/SMK)
  tahunMasuk: string; // Contoh: 2024
  statusAktif: 'Aktif' | 'Non-Aktif';
  namaWali: string;
  alamat: string;
  noHp: string;
}

export interface JenisPembayaran {
  id: string;
  kode: string; // Contoh: SPP, GEDUNG, SERAGAM
  nama: string; // Contoh: SPP Bulanan, Uang Gedung
  jenis: 'Bulanan' | 'Bebas'; // Bulanan (SPP, Ekstra), Bebas (Gedung, Seragam yang bisa dicicil)
  tahunAjaran: string; // Contoh: 2025/2026
  nominalDefault: number; // Untuk bulanan, nominal per bulan. Untuk bebas, total kewajiban.
  aktif: 'Ya' | 'Tidak';
}

export interface TarifSiswa {
  id: string;
  nis: string;
  kodePembayaran: string;
  nominal: number; // Tarif khusus siswa ini
}

export interface Tagihan {
  id: string;
  nis: string;
  kodePembayaran: string;
  namaPembayaran: string; // SPP, Gedung dll
  periode: string; // Bulanan: 'Januari 2025', 'Februari 2025' dll. Bebas: 'Sekali Bayar' atau 'Uang Gedung'
  nominal: number; // Jumlah tagihan
  terbayar: number; // Jumlah yang sudah dibayar (berguna untuk cicilan)
  status: 'Belum Lunas' | 'Cicilan' | 'Lunas';
  tahunAjaran: string;
  jenis: 'Bulanan' | 'Bebas';
}

export interface Transaksi {
  id: string;
  noTransaksi: string; // Format: TRX-2026-000001
  tanggal: string; // ISO String / Date
  nis: string;
  namaSiswa: string;
  kelas: string;
  total: number;
  petugas: string;
}

export interface DetailTransaksi {
  id: string;
  noTransaksi: string;
  tagihanId: string;
  namaPembayaran: string;
  periode: string;
  nominal: number;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'Admin' | 'Operator';
}
