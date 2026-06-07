/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Siswa, JenisPembayaran, TarifSiswa, Tagihan, Transaksi, DetailTransaksi, User } from '../types';

export const DEFAULT_USERS: User[] = [
  { id: 'usr-1', username: 'admin', password: '123', role: 'Admin' },
  { id: 'usr-2', username: 'operator', password: '123', role: 'Operator' }
];

export const DEFAULT_SISWA: Siswa[] = [
  {
    id: 'sis-1',
    nis: '23241001',
    nisn: '0087612341',
    nama: 'Ahmad Rafli Hidayat',
    jenisKelamin: 'Laki-laki',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2008-05-12',
    kelas: 'X-IPA-1',
    jurusan: 'MIPA',
    tahunMasuk: '2023',
    statusAktif: 'Aktif',
    namaWali: 'Heri Hidayat',
    alamat: 'Jl. Merdeka No. 45, Kebayoran Baru, Jakarta Selatan',
    noHp: '081234567890'
  },
  {
    id: 'sis-2',
    nis: '23241002',
    nisn: '0087612342',
    nama: 'Budi Cahyo Purnomo',
    jenisKelamin: 'Laki-laki',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2008-09-22',
    kelas: 'X-IPA-1',
    jurusan: 'MIPA',
    tahunMasuk: '2023',
    statusAktif: 'Aktif',
    namaWali: 'Sugeng Purnomo',
    alamat: 'Perum Gading Fajar Blok C2/12, Sidoarjo',
    noHp: '081398765432'
  },
  {
    id: 'sis-3',
    nis: '23241003',
    nisn: '0087612343',
    nama: 'Citra Amelia Putri',
    jenisKelamin: 'Perempuan',
    tempatLahir: 'Bandung',
    tanggalLahir: '2008-02-18',
    kelas: 'X-IPA-2',
    jurusan: 'MIPA',
    tahunMasuk: '2023',
    statusAktif: 'Aktif',
    namaWali: 'Achmad Fauzi',
    alamat: 'Dusun Sukamaju RT 03/04, Jatinangor',
    noHp: '085732145698'
  },
  {
    id: 'sis-4',
    nis: '22231101',
    nisn: '0076231908',
    nama: 'Dinda Ayu Lestari',
    jenisKelamin: 'Perempuan',
    tempatLahir: 'Semarang',
    tanggalLahir: '2007-11-05',
    kelas: 'XI-IPS-1',
    jurusan: 'IPS',
    tahunMasuk: '2022',
    statusAktif: 'Aktif',
    namaWali: 'Hendarto',
    alamat: 'Jl. Pemuda No. 89, Semarang Tengah',
    noHp: '082144556677'
  },
  {
    id: 'sis-5',
    nis: '22231102',
    nisn: '0076231909',
    nama: 'Edo Wijaya Saputra',
    jenisKelamin: 'Laki-laki',
    tempatLahir: 'Yogyakarta',
    tanggalLahir: '2007-04-30',
    kelas: 'XI-IPS-1',
    jurusan: 'IPS',
    tahunMasuk: '2022',
    statusAktif: 'Aktif',
    namaWali: 'Danang Saputra',
    alamat: 'Condongcatur, Depok, Sleman, DIY',
    noHp: '087899001122'
  },
  {
    id: 'sis-6',
    nis: '21221201',
    nisn: '0065112233',
    nama: 'Fahri Alamsyah',
    jenisKelamin: 'Laki-laki',
    tempatLahir: 'Malang',
    tanggalLahir: '2006-08-14',
    kelas: 'XII-IPA-1',
    jurusan: 'MIPA',
    tahunMasuk: '2021',
    statusAktif: 'Aktif',
    namaWali: 'Syarif Alamsyah',
    alamat: 'Jl. Ijen No. 10B, Klojen, Malang',
    noHp: '081122334455'
  },
  {
    id: 'sis-7',
    nis: '21221202',
    nisn: '0065112234',
    nama: 'Gita Nurhaliza',
    jenisKelamin: 'Perempuan',
    tempatLahir: 'Bogor',
    tanggalLahir: '2006-12-03',
    kelas: 'XII-IPS-2',
    jurusan: 'IPS',
    tahunMasuk: '2021',
    statusAktif: 'Aktif',
    namaWali: 'Dadang Hermawan',
    alamat: 'Jl. Pajajaran No. 22, Bogor Timur',
    noHp: '089988776655'
  },
  {
    id: 'sis-8',
    nis: '23241004',
    nisn: '0087612344',
    nama: 'Hafiz Pratama Putra',
    jenisKelamin: 'Laki-laki',
    tempatLahir: 'Tangerang',
    tanggalLahir: '2008-10-10',
    kelas: 'X-IPS-1',
    jurusan: 'IPS',
    tahunMasuk: '2023',
    statusAktif: 'Aktif',
    namaWali: 'Rahmat Putra',
    alamat: 'Kecamatan Karawaci, Kota Tangerang',
    noHp: '085233114422'
  },
  {
    id: 'sis-9',
    nis: '23241005',
    nisn: '0087612345',
    nama: 'Irma Kartika',
    jenisKelamin: 'Perempuan',
    tempatLahir: 'Medan',
    tanggalLahir: '2008-07-25',
    kelas: 'X-IPA-2',
    jurusan: 'MIPA',
    tahunMasuk: '2023',
    statusAktif: 'Nonaktif',
    namaWali: 'Syarifuddin',
    alamat: 'Puri Anjasmoro, Semarang Barat (Pindah)',
    noHp: '085277118899'
  }
];

export const DEFAULT_JENIS_PEMBAYARAN: JenisPembayaran[] = [
  // Bulanan
  {
    id: 'jp-1',
    kode: 'SPP',
    nama: 'Sumbangan Pembinaan Pendidikan',
    jenis: 'Bulanan',
    tahunAjaran: '2025/2026',
    nominalDefault: 150000,
    aktif: true
  },
  {
    id: 'jp-2',
    kode: 'EKS',
    nama: 'Uang Ekskul & Pengembangan',
    jenis: 'Bulanan',
    tahunAjaran: '2025/2026',
    nominalDefault: 25000,
    aktif: true
  },
  // Bebas
  {
    id: 'jp-3',
    kode: 'UPP',
    nama: 'Uang Pangkal Pembangunan',
    jenis: 'Bebas',
    tahunAjaran: '2025/2026',
    nominalDefault: 3000000,
    aktif: true
  },
  {
    id: 'jp-4',
    kode: 'SRG',
    nama: 'Uang Seragam Sekolah',
    jenis: 'Bebas',
    tahunAjaran: '2025/2026',
    nominalDefault: 1000000,
    aktif: true
  },
  {
    id: 'jp-5',
    kode: 'TOU',
    nama: 'Study Tour & Industri',
    jenis: 'Bebas',
    tahunAjaran: '2025/2026',
    nominalDefault: 500000,
    aktif: true
  }
];

export const DEFAULT_TARIF_SISWA: TarifSiswa[] = [
  // Tarif khusus SPP Siswa tertentu
  { id: 'ts-1', nis: '23241001', kodePembayaran: 'SPP', nominal: 100000 }, // Rafli dapat diskon SPP jadi 100rb
  { id: 'ts-2', nis: '23241002', kodePembayaran: 'SPP', nominal: 150000 }, // Budi normal
  { id: 'ts-3', nis: '23241003', kodePembayaran: 'SPP', nominal: 125000 }, // Citra dapet subsidi dari yayasan jadi 125rb
  { id: 'ts-4', nis: '23241001', kodePembayaran: 'UPP', nominal: 2000000 }, // Rafli bayar UPP 2jt
  { id: 'ts-5', nis: '23241002', kodePembayaran: 'UPP', nominal: 1500000 }, // Budi bayar UPP 1.5jt
  { id: 'ts-6', nis: '23241003', kodePembayaran: 'UPP', nominal: 2500000 }  // Citra bayar UPP 2.5jt
];

// Menghasilkan tagihan bawaan prapendaftar
export const generateSeedTagihan = (students: Siswa[]): Tagihan[] => {
  const tagihan: Tagihan[] = [];
  const bulan = ['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'];
  
  let idCounter = 1;

  students.forEach((s) => {
    // Cari tarif kustom atau default
    const getTarif = (kode: string, def: number) => {
      const match = DEFAULT_TARIF_SISWA.find(t => t.nis === s.nis && t.kodePembayaran === kode);
      return match ? match.nominal : def;
    };

    const sppNominal = getTarif('SPP', 150000);
    const eksNominal = getTarif('EKS', 25000);
    const uppNominal = getTarif('UPP', 3000000);
    const srgNominal = getTarif('SRG', 1000000);
    const touNominal = getTarif('TOU', 500000);

    // Untuk siswa dengan NIS ganjil, anggap lunas Juli - September, cicilan UPP, dll.
    const isOdd = parseInt(s.nis) % 2 !== 0;

    // Generate SPP untuk 12 Bulan (Periode sekolah dimulai Juli)
    bulan.forEach((b, idx) => {
      let status: 'Belum Lunas' | 'Cicilan' | 'Lunas' = 'Belum Lunas';
      let terbayar = 0;

      if (isOdd) {
        // Anggap lunas untuk Juli s.d Oktober
        if (idx <= 3) {
          status = 'Lunas';
          terbayar = sppNominal;
        }
      } else {
        // Anggap lunas untuk Juli s.d Agustus
        if (idx <= 1) {
          status = 'Lunas';
          terbayar = sppNominal;
        }
      }

      tagihan.push({
        id: `tag-${idCounter++}`,
        nis: s.nis,
        kodePembayaran: 'SPP',
        periode: b,
        nominal: sppNominal,
        status,
        terbayar
      });

      // Generate EKS (Ekskul)
      let eksStatus: 'Belum Lunas' | 'Cicilan' | 'Lunas' = 'Belum Lunas';
      let eksTerbayar = 0;
      if (isOdd && idx <= 3) {
        eksStatus = 'Lunas';
        eksTerbayar = eksNominal;
      } else if (!isOdd && idx <= 1) {
        eksStatus = 'Lunas';
        eksTerbayar = eksNominal;
      }
      tagihan.push({
        id: `tag-${idCounter++}`,
        nis: s.nis,
        kodePembayaran: 'EKS',
        periode: b,
        nominal: eksNominal,
        status: eksStatus,
        terbayar: eksTerbayar
      });
    });

    // Generate Bebas (UPP)
    let uppStatus: 'Belum Lunas' | 'Cicilan' | 'Lunas' = 'Belum Lunas';
    let uppTerbayar = 0;
    if (isOdd) {
      uppStatus = 'Cicilan';
      uppTerbayar = Math.floor(uppNominal / 2); // cicil setengah
    } else if (s.nis === '21221201' || s.nis === '21221202') { // Siswa kelas XII
      uppStatus = 'Lunas';
      uppTerbayar = uppNominal;
    }
    tagihan.push({
      id: `tag-${idCounter++}`,
      nis: s.nis,
      kodePembayaran: 'UPP',
      periode: 'Sekali Tagih',
      nominal: uppNominal,
      status: uppStatus,
      terbayar: uppTerbayar
    });

    // Uang Seragam (SRG)
    let srgStatus: 'Belum Lunas' | 'Cicilan' | 'Lunas' = 'Belum Lunas';
    let srgTerbayar = 0;
    if (s.nis !== '23241005') { // Irma Kartika nonaktif
      srgStatus = 'Lunas';
      srgTerbayar = srgNominal;
    }
    tagihan.push({
      id: `tag-${idCounter++}`,
      nis: s.nis,
      kodePembayaran: 'SRG',
      periode: 'Sekali Tagih',
      nominal: srgNominal,
      status: srgStatus,
      terbayar: srgTerbayar
    });

    // Study Tour (TOU)
    // Sebagian besar belum lunas, beberapa sudah lunas
    const touStatus = s.kelas.startsWith('XII') ? 'Lunas' : 'Belum Lunas';
    const touTerbayar = touStatus === 'Lunas' ? touNominal : 0;
    tagihan.push({
      id: `tag-${idCounter++}`,
      nis: s.nis,
      kodePembayaran: 'TOU',
      periode: 'Sekali Tagih',
      nominal: touNominal,
      status: touStatus,
      terbayar: touTerbayar
    });
  });

  return tagihan;
};

// Menghasilkan transaksi awal
export const generateSeedTransaksi = (students: Siswa[], tagihans: Tagihan[]): { transaksi: Transaksi[], detail: DetailTransaksi[] } => {
  const transaksi: Transaksi[] = [];
  const detail: DetailTransaksi[] = [];
  
  // Ambil beberapa tagihan yang statusnya lunas untuk dimasukkan sebagai riwayat transaksi
  const lunasTagihans = tagihans.filter(t => t.status === 'Lunas' || t.status === 'Cicilan').slice(0, 15);
  let trxCounter = 1;
  let detailCounter = 1;

  // Kelompokkan tagihan berdasar NIS untuk menyimulasikan transaksi multi-tagihan
  const groupedByNis: { [nis: string]: Tagihan[] } = {};
  lunasTagihans.forEach(t => {
    if (!groupedByNis[t.nis]) groupedByNis[t.nis] = [];
    groupedByNis[t.nis].push(t);
  });

  // Ambil tanggal mundur
  const dates = [
    '2026-06-07 08:30:15',
    '2026-06-07 10:15:40',
    '2026-06-06 14:02:11',
    '2026-06-06 09:44:59',
    '2026-06-05 11:20:00',
    '2026-06-04 15:30:22',
    '2026-06-03 08:12:05',
    '2026-06-02 13:40:12',
    '2026-06-01 10:05:33',
  ];

  Object.entries(groupedByNis).forEach(([nis, bills], idx) => {
    const trxNo = `TRX-2026-${String(trxCounter).padStart(6, '0')}`;
    const date = dates[idx % dates.length];
    let total = 0;

    bills.forEach(b => {
      const payAmount = b.terbayar > 0 ? (b.status === 'Cicilan' ? b.terbayar : b.nominal) : b.nominal;
      total += payAmount;

      detail.push({
        id: `dtl-${detailCounter++}`,
        noTransaksi: trxNo,
        tagihanId: b.id,
        nominal: payAmount,
      });
    });

    transaksi.push({
      id: `trx-${trxCounter++}`,
      noTransaksi: trxNo,
      tanggal: date,
      nis,
      total,
      petugas: idx % 3 === 0 ? 'admin' : 'operator',
    });
  });

  return { transaksi, detail };
};

// Pengaturan awal aplikasi
export const loadDatabase = () => {
  const getOrSet = (key: string, defaultVal: string) => {
    const val = localStorage.getItem(key);
    if (!val) {
      localStorage.setItem(key, defaultVal);
      return JSON.parse(defaultVal);
    }
    try {
      return JSON.parse(val);
    } catch {
      localStorage.setItem(key, defaultVal);
      return JSON.parse(defaultVal);
    }
  };

  const siswa = getOrSet('sipes_siswa', JSON.stringify(DEFAULT_SISWA));
  const jenisPembayaran = getOrSet('sipes_jenis_pembayaran', JSON.stringify(DEFAULT_JENIS_PEMBAYARAN));
  const tarifSiswa = getOrSet('sipes_tarif_siswa', JSON.stringify(DEFAULT_TARIF_SISWA));
  
  // Untuk tagihan, jika tidak ada, generate.
  const initialTagihan = generateSeedTagihan(siswa);
  const tagihan = getOrSet('sipes_tagihan', JSON.stringify(initialTagihan));
  
  // Untuk transaksi
  const initialTrx = generateSeedTransaksi(siswa, initialTagihan);
  const transaksi = getOrSet('sipes_transaksi', JSON.stringify(initialTrx.transaksi));
  const detailTransaksi = getOrSet('sipes_detail_transaksi', JSON.stringify(initialTrx.detail));
  const users = getOrSet('sipes_users', JSON.stringify(DEFAULT_USERS));

  return { siswa, jenisPembayaran, tarifSiswa, tagihan, transaksi, detailTransaksi, users };
};

export const saveDatabase = (data: {
  siswa?: Siswa[];
  jenisPembayaran?: JenisPembayaran[];
  tarifSiswa?: TarifSiswa[];
  tagihan?: Tagihan[];
  transaksi?: Transaksi[];
  detailTransaksi?: DetailTransaksi[];
  users?: User[];
}) => {
  if (data.siswa) localStorage.setItem('sipes_siswa', JSON.stringify(data.siswa));
  if (data.jenisPembayaran) localStorage.setItem('sipes_jenis_pembayaran', JSON.stringify(data.jenisPembayaran));
  if (data.tarifSiswa) localStorage.setItem('sipes_tarif_siswa', JSON.stringify(data.tarifSiswa));
  if (data.tagihan) localStorage.setItem('sipes_tagihan', JSON.stringify(data.tagihan));
  if (data.transaksi) localStorage.setItem('sipes_transaksi', JSON.stringify(data.transaksi));
  if (data.detailTransaksi) localStorage.setItem('sipes_detail_transaksi', JSON.stringify(data.detailTransaksi));
  if (data.users) localStorage.setItem('sipes_users', JSON.stringify(data.users));
};
