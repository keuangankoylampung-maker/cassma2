/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Siswa, JenisPembayaran, TarifSiswa, Tagihan, Transaksi, DetailTransaksi, User } from '../types';

export const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'admin', password: '123', role: 'Admin' },
  { id: 'u2', username: 'operator', password: '123', role: 'Operator' }
];

export const INITIAL_SISWA: Siswa[] = [
  {
    id: 's1',
    nis: '10001',
    nisn: '0081234561',
    nama: 'Ahmad Dani',
    jenisKelamin: 'Laki-laki',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2009-04-12',
    kelas: 'X-MIPA-1',
    jurusan: 'MIPA',
    tahunMasuk: '2024',
    statusAktif: 'Aktif',
    namaWali: 'Subagyo',
    alamat: 'Jl. Merdeka No. 45, Jakarta Pusat',
    noHp: '081234567890'
  },
  {
    id: 's2',
    nis: '10002',
    nisn: '0081234562',
    nama: 'Siti Aminah',
    jenisKelamin: 'Perempuan',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2009-08-21',
    kelas: 'X-MIPA-1',
    jurusan: 'MIPA',
    tahunMasuk: '2024',
    statusAktif: 'Aktif',
    namaWali: 'Hasanuddin',
    alamat: 'Jl. Pemuda No. 12, Jakarta Pusat',
    noHp: '081398765432'
  },
  {
    id: 's3',
    nis: '10003',
    nisn: '0081234563',
    nama: 'Budi Santoso',
    jenisKelamin: 'Laki-laki',
    tempatLahir: 'Bandung',
    tanggalLahir: '2008-11-03',
    kelas: 'XI-IPS-1',
    jurusan: 'IPS',
    tahunMasuk: '2023',
    statusAktif: 'Aktif',
    namaWali: 'Hermawan',
    alamat: 'Jl. Gajah Mada No. 102, Jakarta Barat',
    noHp: '081555667788'
  },
  {
    id: 's4',
    nis: '10004',
    nisn: '0081234564',
    nama: 'Citra Lestari',
    jenisKelamin: 'Perempuan',
    tempatLahir: 'Semarang',
    tanggalLahir: '2008-01-15',
    kelas: 'XI-IPS-1',
    jurusan: 'IPS',
    tahunMasuk: '2023',
    statusAktif: 'Aktif',
    namaWali: 'Joko Widodo',
    alamat: 'Jl. Slamet Riyadi No. 5, Jakarta Selatan',
    noHp: '082144332211'
  }
];

export const INITIAL_JENIS_PEMBAYARAN: JenisPembayaran[] = [
  {
    id: 'p1',
    kode: 'SPP',
    nama: 'Sumbangan Pembinaan Pendidikan (SPP)',
    jenis: 'Bulanan',
    tahunAjaran: '2025/2026',
    nominalDefault: 150000,
    aktif: 'Ya'
  },
  {
    id: 'p2',
    kode: 'EKS',
    nama: 'Kegiatan Ekstrakurikuler',
    jenis: 'Bulanan',
    tahunAjaran: '2025/2026',
    nominalDefault: 30000,
    aktif: 'Ya'
  },
  {
    id: 'p3',
    kode: 'UPP',
    nama: 'Uang Pengembangan Pendidikan (UPP/Uang Gedung)',
    jenis: 'Bebas',
    tahunAjaran: '2025/2026',
    nominalDefault: 2000000,
    aktif: 'Ya'
  },
  {
    id: 'p4',
    kode: 'SRG',
    nama: 'Uang Seragam Lengkap',
    jenis: 'Bebas',
    tahunAjaran: '2025/2026',
    nominalDefault: 750000,
    aktif: 'Ya'
  }
];

export const INITIAL_TARIF_SISWA: TarifSiswa[] = [
  // Ahmad Dani (10001) got a scholarship discount for SPP
  { id: 't1', nis: '10001', kodePembayaran: 'SPP', nominal: 100000 },
  // Budi Santoso (10003) pays slightly more for SPP standard XI
  { id: 't2', nis: '10003', kodePembayaran: 'SPP', nominal: 150000 },
  // Citra Lestari (10004) pays customized SPP
  { id: 't3', nis: '10004', kodePembayaran: 'SPP', nominal: 125000 },
  // Customized UPP (Uang Gedung)
  { id: 't4', nis: '10001', kodePembayaran: 'UPP', nominal: 2000000 },
  { id: 't5', nis: '10002', kodePembayaran: 'UPP', nominal: 1500000 },
  { id: 't6', nis: '10004', kodePembayaran: 'UPP', nominal: 2500000 }
];

export const INITIAL_TAGIHAN: Tagihan[] = [
  // SPP Ahmad Dani (10001) for Juli, Agustus, September 2025
  {
    id: 'tg1',
    nis: '10001',
    kodePembayaran: 'SPP',
    namaPembayaran: 'Sumbangan Pembinaan Pendidikan (SPP)',
    periode: 'Juli 2025',
    nominal: 100000,
    terbayar: 100000,
    status: 'Lunas',
    tahunAjaran: '2025/2026',
    jenis: 'Bulanan'
  },
  {
    id: 'tg2',
    nis: '10001',
    kodePembayaran: 'SPP',
    namaPembayaran: 'Sumbangan Pembinaan Pendidikan (SPP)',
    periode: 'Agustus 2025',
    nominal: 100000,
    terbayar: 0,
    status: 'Belum Lunas',
    tahunAjaran: '2025/2026',
    jenis: 'Bulanan'
  },
  {
    id: 'tg3',
    nis: '10001',
    kodePembayaran: 'SPP',
    namaPembayaran: 'Sumbangan Pembinaan Pendidikan (SPP)',
    periode: 'September 2025',
    nominal: 100000,
    terbayar: 0,
    status: 'Belum Lunas',
    tahunAjaran: '2025/2026',
    jenis: 'Bulanan'
  },
  // UPP Ahmad Dani (UPP = 2.000.000, has paid 500.000 once) -> Cicilan
  {
    id: 'tg4',
    nis: '10001',
    kodePembayaran: 'UPP',
    namaPembayaran: 'Uang Pengembangan Pendidikan (UPP/Uang Gedung)',
    periode: 'Tagihan Sekali Bayar',
    nominal: 2000000,
    terbayar: 500000,
    status: 'Cicilan',
    tahunAjaran: '2025/2026',
    jenis: 'Bebas'
  },

  // SPP Siti Aminah (10002) - Monthly 150.000 (Default)
  {
    id: 'tg5',
    nis: '10002',
    kodePembayaran: 'SPP',
    namaPembayaran: 'Sumbangan Pembinaan Pendidikan (SPP)',
    periode: 'Juli 2025',
    nominal: 150000,
    terbayar: 150000,
    status: 'Lunas',
    tahunAjaran: '2025/2026',
    jenis: 'Bulanan'
  },
  {
    id: 'tg6',
    nis: '10002',
    kodePembayaran: 'SPP',
    namaPembayaran: 'Sumbangan Pembinaan Pendidikan (SPP)',
    periode: 'Agustus 2025',
    nominal: 150000,
    terbayar: 150000,
    status: 'Lunas',
    tahunAjaran: '2025/2026',
    jenis: 'Bulanan'
  },
  {
    id: 'tg7',
    nis: '10002',
    kodePembayaran: 'SPP',
    namaPembayaran: 'Sumbangan Pembinaan Pendidikan (SPP)',
    periode: 'September 2025',
    nominal: 150000,
    terbayar: 0,
    status: 'Belum Lunas',
    tahunAjaran: '2025/2026',
    jenis: 'Bulanan'
  },
  // UPP Siti Aminah (UPP = 1.500.000, fully paid) -> Lunas
  {
    id: 'tg8',
    nis: '10002',
    kodePembayaran: 'UPP',
    namaPembayaran: 'Uang Pengembangan Pendidikan (UPP/Uang Gedung)',
    periode: 'Tagihan Sekali Bayar',
    nominal: 1500000,
    terbayar: 1500000,
    status: 'Lunas',
    tahunAjaran: '2025/2026',
    jenis: 'Bebas'
  },

  // Budi Santoso (10003) - SPP 150.000, Juli paid, Agustus unpaid
  {
    id: 'tg9',
    nis: '10003',
    kodePembayaran: 'SPP',
    namaPembayaran: 'Sumbangan Pembinaan Pendidikan (SPP)',
    periode: 'Juli 2025',
    nominal: 150000,
    terbayar: 150000,
    status: 'Lunas',
    tahunAjaran: '2025/2026',
    jenis: 'Bulanan'
  },
  {
    id: 'tg10',
    nis: '10003',
    kodePembayaran: 'SPP',
    namaPembayaran: 'Sumbangan Pembinaan Pendidikan (SPP)',
    periode: 'Agustus 2025',
    nominal: 150000,
    terbayar: 0,
    status: 'Belum Lunas',
    tahunAjaran: '2025/2026',
    jenis: 'Bulanan'
  },
  // UPP Budi Santoso (UPP default = 2.000.000, hasn't paid at all)
  {
    id: 'tg11',
    nis: '10003',
    kodePembayaran: 'UPP',
    namaPembayaran: 'Uang Pengembangan Pendidikan (UPP/Uang Gedung)',
    periode: 'Tagihan Sekali Bayar',
    nominal: 2000000,
    terbayar: 0,
    status: 'Belum Lunas',
    tahunAjaran: '2025/2026',
    jenis: 'Bebas'
  }
];

export const INITIAL_TRANSAKSI: Transaksi[] = [
  {
    id: 'tx1',
    noTransaksi: 'TRX-2025-000001',
    tanggal: '2025-07-10T08:30:00Z',
    nis: '10001',
    namaSiswa: 'Ahmad Dani',
    kelas: 'X-MIPA-1',
    total: 100000,
    petugas: 'admin'
  },
  {
    id: 'tx2',
    noTransaksi: 'TRX-2025-000002',
    tanggal: '2025-07-12T10:15:00Z',
    nis: '10002',
    namaSiswa: 'Siti Aminah',
    kelas: 'X-MIPA-1',
    total: 1650000, // SPP Juli + UPP 1.500.000
    petugas: 'operator'
  },
  {
    id: 'tx3',
    noTransaksi: 'TRX-2025-000003',
    tanggal: '2025-08-05T09:00:00Z',
    nis: '10001',
    namaSiswa: 'Ahmad Dani',
    kelas: 'X-MIPA-1',
    total: 500000, // UPP Cicilan 500.000
    petugas: 'admin'
  },
  {
    id: 'tx4',
    noTransaksi: 'TRX-2025-000004',
    tanggal: '2025-08-06T14:45:00Z',
    nis: '10002',
    namaSiswa: 'Siti Aminah',
    kelas: 'X-MIPA-1',
    total: 150000, // SPP Agustus
    petugas: 'operator'
  },
  {
    id: 'tx5',
    noTransaksi: 'TRX-2025-000005',
    tanggal: '2025-08-07T11:00:00Z',
    nis: '10003',
    namaSiswa: 'Budi Santoso',
    kelas: 'XI-IPS-1',
    total: 150000, // SPP Juli
    petugas: 'admin'
  }
];

export const INITIAL_DETAIL_TRANSAKSI: DetailTransaksi[] = [
  // tx1
  {
    id: 'dt1',
    noTransaksi: 'TRX-2025-000001',
    tagihanId: 'tg1',
    namaPembayaran: 'Sumbangan Pembinaan Pendidikan (SPP)',
    periode: 'Juli 2025',
    nominal: 100000
  },
  // tx2
  {
    id: 'dt2',
    noTransaksi: 'TRX-2025-000002',
    tagihanId: 'tg5',
    namaPembayaran: 'Sumbangan Pembinaan Pendidikan (SPP)',
    periode: 'Juli 2025',
    nominal: 150000
  },
  {
    id: 'dt3',
    noTransaksi: 'TRX-2025-000002',
    tagihanId: 'tg8',
    namaPembayaran: 'Uang Pengembangan Pendidikan (UPP/Uang Gedung)',
    periode: 'Tagihan Sekali Bayar',
    nominal: 1500000
  },
  // tx3 (Ahmad Dani UPP cicilan 1)
  {
    id: 'dt4',
    noTransaksi: 'TRX-2025-000003',
    tagihanId: 'tg4',
    namaPembayaran: 'Uang Pengembangan Pendidikan (UPP/Uang Gedung)',
    periode: 'Tagihan Sekali Bayar',
    nominal: 500000
  },
  // tx4 (Siti SPP Agustus)
  {
    id: 'dt5',
    noTransaksi: 'TRX-2025-000004',
    tagihanId: 'tg6',
    namaPembayaran: 'Sumbangan Pembinaan Pendidikan (SPP)',
    periode: 'Agustus 2025',
    nominal: 150000
  },
  // tx5 (Budi SPP Juli)
  {
    id: 'dt6',
    noTransaksi: 'TRX-2025-000005',
    tagihanId: 'tg9',
    namaPembayaran: 'Sumbangan Pembinaan Pendidikan (SPP)',
    periode: 'Juli 2025',
    nominal: 150000
  }
];

export function initiateLocalDatabase() {
  const getOrSet = (key: string, initial: string) => {
    const existing = localStorage.getItem(key);
    if (!existing) {
      localStorage.setItem(key, initial);
      return JSON.parse(initial);
    }
    return JSON.parse(existing);
  };

  const users = getOrSet('db_users', JSON.stringify(INITIAL_USERS));
  const siswa = getOrSet('db_siswa', JSON.stringify(INITIAL_SISWA));
  const jenisPembayaran = getOrSet('db_jenis_pembayaran', JSON.stringify(INITIAL_JENIS_PEMBAYARAN));
  const tarifSiswa = getOrSet('db_tarif_siswa', JSON.stringify(INITIAL_TARIF_SISWA));
  const tagihan = getOrSet('db_tagihan', JSON.stringify(INITIAL_TAGIHAN));
  const transaksi = getOrSet('db_transaksi', JSON.stringify(INITIAL_TRANSAKSI));
  const detailTransaksi = getOrSet('db_detail_transaksi', JSON.stringify(INITIAL_DETAIL_TRANSAKSI));

  // Ensure current user is logged in
  if (!localStorage.getItem('current_user')) {
    localStorage.setItem('current_user', JSON.stringify(users[0]));
  }

  return {
    users,
    siswa,
    jenisPembayaran,
    tarifSiswa,
    tagihan,
    transaksi,
    detailTransaksi
  };
}
