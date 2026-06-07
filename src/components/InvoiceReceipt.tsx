/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Siswa, Transaksi, DetailTransaksi, Tagihan, JenisPembayaran } from '../types';
import { Printer, X, ShieldCheck, CheckCircle, Smartphone } from 'lucide-react';

interface InvoiceReceiptProps {
  transaction: Transaksi;
  details: DetailTransaksi[];
  student: Siswa;
  allBills: Tagihan[];
  allPaymentTypes: JenisPembayaran[];
  onClose: () => void;
}

export default function InvoiceReceipt({
  transaction,
  details,
  student,
  allBills,
  allPaymentTypes,
  onClose
}: InvoiceReceiptProps) {
  
  const handlePrint = () => {
    window.print();
  };

  const getBillInfo = (tagihanId: string) => {
    const bill = allBills.find(b => b.id === tagihanId);
    if (!bill) return { code: 'N/A', period: 'N/A' };
    const payType = allPaymentTypes.find(p => p.kode === bill.kodePembayaran);
    return {
      code: bill.kodePembayaran,
      name: payType ? payType.nama : 'Uang Pembayaran',
      period: bill.periode,
      type: payType ? payType.jenis : 'Bulanan'
    };
  };

  // Format IDR Currency
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Print Overrides Style Block */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div 
        id="print-area" 
        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden pointer-events-auto print:shadow-none print:border-none print:w-full print:max-w-none"
      >
        {/* Interactive Bar (Hidden during print) */}
        <div className="no-print bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-semibold text-slate-700">Bukti Transaksi Siap Cetak</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm flex items-center gap-2 shadow-sm transition-all"
            >
              <Printer className="h-4 w-4" />
              Cetak PDF / Printer
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Receipt Page Grid */}
        <div className="p-8 sm:p-10 font-sans text-slate-800">
          {/* School Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-900 pb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl font-black tracking-wider text-xl shadow-md flex items-center justify-center h-12 w-12 border-2 border-white">
                SP
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none uppercase">SMA ADI LUHUR SIDOARJO</h1>
                <p className="text-xs text-slate-500 mt-1">Jl. Pendidikan No. 102, Sidoarjo, Jawa Timur</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">SIPP: 421.5/901/105.02/2024 | NPSN: 20231908</p>
              </div>
            </div>
            <div className="text-right sm:text-right w-full sm:w-auto">
              <span className="text-xs font-bold text-blue-600 tracking-wider bg-blue-50 px-2.5 py-1 rounded-full uppercase border border-blue-200 inline-block">
                KWITANSI PEMBAYARAN RESMI
              </span>
              <p className="text-sm font-mono font-bold text-slate-900 mt-2">{transaction.noTransaksi}</p>
              <p className="text-xs text-slate-400 mt-0.5">{new Date(transaction.tanggal).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
            </div>
          </div>

          {/* Student & Cas Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">INFORMASI SISWA</span>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="text-slate-500 py-0.5 w-24">NIS / NISN</td>
                    <td className="text-slate-900 font-semibold py-0.5">: {student.nis} / {student.nisn}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-500 py-0.5">Nama Lengkap</td>
                    <td className="text-slate-900 font-semibold py-0.5 uppercase">: {student.nama}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-500 py-0.5">Kelas / Jurusan</td>
                    <td className="text-slate-900 font-semibold py-0.5">: {student.kelas} {student.jurusan ? `(${student.jurusan})` : ''}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-1.5 text-xs md:border-l md:border-slate-200 md:pl-6">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">INFORMASI TRANSAKSI</span>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="text-slate-500 py-0.5 w-24">Status Kas</td>
                    <td className="text-emerald-600 font-bold py-0.5 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      LUNAS (SAH)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-slate-500 py-0.5">Metode Bayar</td>
                    <td className="text-slate-900 font-semibold py-0.5">: Tunai / Cash</td>
                  </tr>
                  <tr>
                    <td className="text-slate-500 py-0.5">Kasir / Petugas</td>
                    <td className="text-slate-900 font-semibold py-0.5">: {transaction.petugas}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bill Table */}
          <div className="my-6">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-900 font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-2.5 text-left w-8">No</th>
                  <th className="py-2.5 text-left">Kode</th>
                  <th className="py-2.5 text-left">Jenis Pembayaran</th>
                  <th className="py-2.5 text-left">Periode</th>
                  <th className="py-2.5 text-right">Nominal Dibayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {details.map((item, index) => {
                  const billInfo = getBillInfo(item.tagihanId);
                  return (
                    <tr key={item.id} className="text-slate-700">
                      <td className="py-3 text-left font-mono">{index + 1}</td>
                      <td className="py-3 text-left font-mono font-bold text-blue-700">{billInfo.code}</td>
                      <td className="py-3 text-left">
                        <span className="font-semibold text-slate-900">{billInfo.name}</span>
                        <span className="text-[10px] text-slate-400 block italic">Jenis: {billInfo.type}</span>
                      </td>
                      <td className="py-3 text-left font-medium">{billInfo.period}</td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900">{formatIDR(item.nominal)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 font-bold text-sm text-slate-900">
                  <td colSpan={4} className="py-4 text-left uppercase">TOTAL PENERIMAAN KAS</td>
                  <td className="py-4 text-right font-mono text-base font-black text-blue-800 bg-slate-50/50 px-2">
                    {formatIDR(transaction.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Terbilang block */}
          <div className="p-3 bg-blue-50/50 rounded border border-blue-100 text-xs text-blue-900 italic my-6 flex flex-col sm:flex-row sm:items-start gap-1">
            <span className="font-bold uppercase text-[10px] sm:mt-0.5 tracking-wider font-sans shrink-0">TERBILANG:</span>
            <span>
              "{terbilangIDR(transaction.total)} Rupiah"
            </span>
          </div>

          {/* Footer Receipt Signatures */}
          <div className="grid grid-cols-2 gap-12 mt-12 py-4">
            <div className="text-center text-xs space-y-16">
              <div className="space-y-1">
                <p className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Wali Siswa / Pengonfirmasi</p>
                <div className="h-10"></div>
                <p className="font-bold border-b border-slate-300 pb-1 mx-8 uppercase text-slate-650">__________________</p>
              </div>
            </div>

            <div className="text-center text-xs space-y-16 relative">
              {/* Lunas Stamp mockup */}
              <div className="absolute top-1/4 left-1/3 border-4 border-emerald-600/30 text-emerald-600/30 font-black rounded-lg px-3 py-1.5 text-base tracking-widest font-mono uppercase transform -rotate-12 pointer-events-none select-none">
                LUNAS
                <p className="text-[8px] text-center tracking-normal mt-0.5">SIPES - VERIFIED</p>
              </div>

              <div className="space-y-1">
                <p className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Petugas Tata Usaha / Keuangan</p>
                <div className="h-10 flex items-center justify-center">
                  <span className="text-[10px] font-mono text-slate-400 italic">Signed Electronically</span>
                </div>
                <p className="font-bold border-b border-slate-300 pb-1 mx-8 text-slate-900 uppercase">
                  {transaction.petugas.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom disclaimer */}
          <div className="mt-12 text-center text-[10px] text-slate-400 border-t border-dashed border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>Simpan kwitansi ini sebagai bukti bayar sekolah yang sah. Di-generate otomatis oleh sistem SIPES.</p>
            <p className="font-mono flex items-center gap-1 text-slate-300">
              <CheckCircle className="h-3 w-3 text-emerald-500" /> Secure Cloud Ledger Code
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Convert numbers into standard spoken Indonesian numbers
function terbilangIDR(angka: number): string {
  const bil = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  
  if (angka < 12) {
    return bil[angka];
  } else if (angka < 20) {
    return bil[angka - 10] + " Belas";
  } else if (angka < 100) {
    return bil[Math.floor(angka / 10)] + " Puluh " + bil[angka % 10];
  } else if (angka < 200) {
    return "Seratus " + terbilangIDR(angka - 100);
  } else if (angka < 1000) {
    return bil[Math.floor(angka / 100)] + " Ratus " + terbilangIDR(angka % 100);
  } else if (angka < 2000) {
    return "Seribu " + terbilangIDR(angka - 1000);
  } else if (angka < 1000000) {
    return terbilangIDR(Math.floor(angka / 1000)) + " Ribu " + terbilangIDR(angka % 1000);
  } else if (angka < 1000000000) {
    return terbilangIDR(Math.floor(angka / 1000000)) + " Juta " + terbilangIDR(angka % 1000000);
  } else if (angka < 1000000000000) {
    return terbilangIDR(Math.floor(angka / 1000000000)) + " Milyar " + terbilangIDR(angka % 1000000000);
  }
  return String(angka);
}
