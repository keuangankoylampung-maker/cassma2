/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Siswa, Tagihan, Transaksi, User } from '../types';
import { 
  Search, ShoppingCart, CreditCard, Receipt, 
  Trash2, Plus, ChevronRight, Check, Printer, 
  AlertCircle, Sparkles, CheckSquare, Square 
} from 'lucide-react';

interface PaymentTransactionProps {
  siswa: Siswa[];
  tagihanList: Tagihan[];
  currentUser: User;
  onProcessPayment: (
    nis: string, 
    checkoutList: { id: string; nominalBayar: number }[],
    username: string
  ) => { success: boolean; message: string; noTransaksi?: string };
  // Visual navigation support
  preSelectedNis?: string;
}

export default function PaymentTransaction({
  siswa,
  tagihanList,
  currentUser,
  onProcessPayment,
  preSelectedNis = ''
}: PaymentTransactionProps) {
  // Search parameters for student
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Siswa | null>(null);

  // Cart/Shopping basket states
  // Map of tagihanId -> true/false
  const [selectedBillIds, setSelectedBillIds] = useState<{ [key: string]: boolean }>({});
  // Map of tagihanId -> custom payment amount entered by user
  const [customAmounts, setCustomAmounts] = useState<{ [key: string]: number }>({});

  // Receipt Modal State
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastReceiptNo, setLastReceiptNo] = useState('');
  const [receiptLog, setReceiptLog] = useState<{
    noTransaksi: string;
    tanggal: string;
    siswaName: string;
    nis: string;
    kelas: string;
    items: { namaPembayaran: string; periode: string; nominal: number }[];
    total: number;
    petugas: string;
  } | null>(null);

  // Handle pre-selection from dashboard
  React.useEffect(() => {
    if (preSelectedNis) {
      const matchS = siswa.find((s) => s.nis === preSelectedNis);
      if (matchS) {
        setSelectedStudent(matchS);
        setSelectedBillIds({});
        setCustomAmounts({});
      }
    }
  }, [preSelectedNis, siswa]);

  // Handle search result list
  const searchedSiswaList = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return siswa.filter((s) => {
      return (
        s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.includes(searchQuery) ||
        s.kelas.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [siswa, searchQuery]);

  // Retrieve active bills for currently selected student
  const activeStudentBills = useMemo(() => {
    if (!selectedStudent) return [];
    return tagihanList.filter((t) => t.nis === selectedStudent.nis);
  }, [tagihanList, selectedStudent]);

  // Select Student Handler
  const handleSelectStudent = (s: Siswa) => {
    setSelectedStudent(s);
    setSearchQuery('');
    setSelectedBillIds({});
    setCustomAmounts({});
  };

  // Toggle checkout list checkbox
  const handleToggleBill = (bill: Tagihan) => {
    const id = bill.id;
    const isSelectedNow = !selectedBillIds[id];
    
    setSelectedBillIds((prev) => ({
      ...prev,
      [id]: isSelectedNow
    }));

    if (isSelectedNow && !customAmounts[id]) {
      // Set default payment to remaining unpaid balance
      const remaining = bill.nominal - bill.terbayar;
      setCustomAmounts((prev) => ({
        ...prev,
        [id]: remaining
      }));
    }
  };

  // Adjust custom amount (useful for installment / Bebas bills)
  const handleAmountChange = (billId: string, val: number, max: number) => {
    const sanitized = Math.min(Math.max(0, val), max);
    setCustomAmounts((prev) => ({
      ...prev,
      [billId]: sanitized
    }));
  };

  // Select all outstanding bills at once (Pembayaran Massal)
  const handleSelectAllOutstanding = () => {
    const nextSelected: { [key: string]: boolean } = {};
    const nextAmounts: { [key: string]: number } = {};

    activeStudentBills.forEach((b) => {
      if (b.status !== 'Lunas') {
        nextSelected[b.id] = true;
        nextAmounts[b.id] = b.nominal - b.terbayar;
      }
    });

    setSelectedBillIds(nextSelected);
    setCustomAmounts(nextAmounts);
  };

  // Compute Grand Total of Basket items in real-time
  const cartTotal = useMemo(() => {
    return Object.keys(selectedBillIds).reduce((acc, id) => {
      if (selectedBillIds[id]) {
        return acc + (customAmounts[id] || 0);
      }
      return acc;
    }, 0);
  }, [selectedBillIds, customAmounts]);

  // Cart List items mapping
  const cartItems = useMemo(() => {
    return activeStudentBills.filter((b) => selectedBillIds[b.id] === true);
  }, [activeStudentBills, selectedBillIds]);

  // Process and commit Checkout Transaction
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || cartTotal === 0) return;

    // Build payload array
    const checkoutItems = cartItems.map((item) => ({
      id: item.id,
      nominalBayar: customAmounts[item.id] || 0
    }));

    // Trigger parent transaction handler
    const res = onProcessPayment(selectedStudent.nis, checkoutItems, currentUser.username);

    if (res.success && res.noTransaksi) {
      // Setup dynamic Receipt structure for immediate printing/display
      const receiptData = {
        noTransaksi: res.noTransaksi,
        tanggal: new Date().toISOString(),
        siswaName: selectedStudent.nama,
        nis: selectedStudent.nis,
        kelas: selectedStudent.kelas,
        items: cartItems.map((item) => ({
          namaPembayaran: item.namaPembayaran,
          periode: item.periode,
          nominal: customAmounts[item.id] || 0
        })),
        total: cartTotal,
        petugas: currentUser.username
      };

      setReceiptLog(receiptData);
      setLastReceiptNo(res.noTransaksi);
      setShowReceipt(true);

      // Clear selection states
      setSelectedBillIds({});
      setCustomAmounts({});
    } else {
      alert(`Transaksi Gagal: ${res.message}`);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Search Header Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: SEARCH AND STUDENT INFO */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-sky-600" />
              1. Cari &amp; Pilih Siswa
            </h3>

            {/* Live Search Input */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ketik Nama, NIS, atau Kelas..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
              />
            </div>

            {/* Search Results dropdown list */}
            {searchQuery.trim() !== '' && (
              <div className="bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100 p-1">
                {searchedSiswaList.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400 font-medium">Siswa tidak ditemukan.</p>
                ) : (
                  searchedSiswaList.map((s) => (
                    <div 
                      key={s.id} 
                      onClick={() => handleSelectStudent(s)}
                      className="p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer flex justify-between items-center transition"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">{s.nama}</p>
                        <p className="text-[10px] text-slate-400 font-mono">NIS: {s.nis} | Kelas: {s.kelas}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Selected Student Profile Badgecard */}
            {selectedStudent ? (
              <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="bg-white text-sky-600 font-bold p-2.5 rounded-xl text-lg shadow-xs border border-sky-100">🎓</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">{selectedStudent.nama}</h4>
                    <p className="text-[10px] text-sky-600 font-mono font-bold">KELAS {selectedStudent.kelas}</p>
                  </div>
                </div>

                <div className="text-[10px] space-y-1.5 text-slate-500 font-medium border-t border-sky-100/50 pt-3">
                  <div className="flex justify-between"><span className="text-slate-400">NIS / NISN:</span> <strong className="text-slate-700 font-mono">{selectedStudent.nis} / {selectedStudent.nisn || '-'}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Wali Murid:</span> <strong className="text-slate-700">{selectedStudent.namaWali}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">No. HP:</span> <strong className="text-slate-700 font-mono">{selectedStudent.noHp}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Status:</span> <span className="text-emerald-700 font-bold bg-emerald-100 px-1.5 rounded-full text-[9px]">Aktif</span></div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs font-medium border border-dashed border-slate-100 rounded-xl">
                Silakan ketik nama siswa di pencarian untuk memuat tagihan.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE BILLING SELECTION MATRIX & CHECKOUT BASKET */}
        <div className="lg:col-span-2 space-y-6">
          {selectedStudent ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">2. Lembar Tagihan Siswa</h3>
                  <p className="text-[10px] text-slate-500">Centang pos pembayaran yang akan dibayar dalam satu kuitansi sekaligus.</p>
                </div>
                
                {/* Mass action trigger */}
                <button 
                  onClick={handleSelectAllOutstanding}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1.5 border border-indigo-200 rounded-lg transition"
                >
                  ☑ Pilih Semua Tunggakan
                </button>
              </div>

              {/* Outstanding list Grid */}
              <div className="overflow-x-auto max-h-120 font-sans">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-4 text-center w-12">Pilih</th>
                      <th className="py-2.5 px-4">POS Pembayaran</th>
                      <th className="py-2.5 px-4">Periode</th>
                      <th className="py-2.5 px-4 text-right">Tagihan</th>
                      <th className="py-2.5 px-4 text-right">Terbayar</th>
                      <th className="py-2.5 px-4 text-right">Sisa Tagih</th>
                      <th className="py-2.5 px-4 text-center">Nominal Bayar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeStudentBills.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                          Siswa tidak memiliki record tagihan di dalam sistem.
                        </td>
                      </tr>
                    ) : (
                      activeStudentBills.map((b) => {
                        const isLunas = b.status === 'Lunas';
                        const isChecked = selectedBillIds[b.id] === true;
                        const remaining = b.nominal - b.terbayar;

                        return (
                          <tr 
                            key={b.id} 
                            onClick={() => !isLunas && handleToggleBill(b)}
                            className={`transition cursor-pointer select-none ${
                              isLunas 
                                ? 'bg-slate-50 opacity-60 cursor-not-allowed' 
                                : isChecked 
                                ? 'bg-sky-50' 
                                : 'hover:bg-slate-50/50'
                            }`}
                          >
                            <td className="py-3 px-4 text-center">
                              {isLunas ? (
                                <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                              ) : isChecked ? (
                                <CheckSquare className="w-4 h-4 text-sky-600 mx-auto" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300 mx-auto" />
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-sky-600 bg-sky-100 px-1.5 py-0.5 rounded text-[10px] mr-2">
                                {b.kodePembayaran}
                              </span>
                              <span className="font-semibold text-slate-700">{b.namaPembayaran}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 font-medium">{b.periode}</td>
                            <td className="py-3 px-4 text-right font-mono text-slate-500">{formatRupiah(b.nominal)}</td>
                            <td className="py-3 px-4 text-right font-mono text-emerald-600">+{formatRupiah(b.terbayar)}</td>
                            <td className="py-3 px-4 text-right font-mono text-slate-800 font-bold">{formatRupiah(remaining)}</td>
                            <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                              {isLunas ? (
                                <span className="text-[10px] text-emerald-600 font-bold">LUNAS</span>
                              ) : (
                                <input 
                                  type="number" 
                                  disabled={!isChecked}
                                  value={customAmounts[b.id] !== undefined ? customAmounts[b.id] : remaining}
                                  onChange={(e) => handleAmountChange(b.id, Number(e.target.value), remaining)}
                                  className={`w-24 px-2 py-1 font-mono text-xs font-bold text-center border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white ${
                                    isChecked ? 'border-sky-300 text-sky-700' : 'border-slate-200 text-slate-400 cursor-not-allowed'
                                  }`} 
                                />
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Basket Grand Total & Checkout Triggers */}
              {cartItems.length > 0 && (
                <div className="bg-slate-50 p-6 border-t border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Grand Total Pembayaran</p>
                      <p className="text-[10px] text-slate-400">{cartItems.length} tagihan dipilih di dalam keranjang</p>
                    </div>
                    <div className="text-right">
                      <h3 className="text-2xl font-extrabold text-emerald-600 font-mono">{formatRupiah(cartTotal)}</h3>
                    </div>
                  </div>

                  <form onSubmit={handleCheckoutSubmit}>
                    <button 
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-100/50 hover:shadow-lg transition cursor-pointer"
                    >
                      <CreditCard className="w-5 h-5 animate-pulse" />
                      KONFIRMASI BAYAR &amp; CETAK KWITANSI ({cartItems.length})
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 shadow-xs">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700">Daftar Tagihan Kosong</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Untuk memulai transaksi, cari siswa menggunakan modul di sebelah kiri terlebih dahulu.</p>
            </div>
          )}
        </div>
      </div>

      {/* DYNAMIC RECEIPT PRINT DIALOG MODAL VIEW OVERLAY */}
      {showReceipt && receiptLog && (
        <div id="receipt_modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            
            {/* Modal Header actions */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Pembayaran Berhasil
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <Printer className="w-4.5 h-4.5" /> Cetak Kwitansi
                </button>
                <button 
                  onClick={() => setShowReceipt(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>

            {/* Simulated Receipt Structure (Print friendly) */}
            <div id="receipt-print-area" className="p-8 space-y-6 bg-white font-sans text-xs">
              
              {/* Receipt Header logo / address */}
              <div className="flex justify-between items-start border-b-2 border-dashed border-slate-200 pb-5">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-50 text-sky-600 p-2.5 rounded-xl text-2xl font-bold border border-sky-100">🏫</div>
                  <div>
                    <h2 className="text-md font-bold text-slate-800">SMK BINA BANGSA</h2>
                    <p className="text-[10px] text-slate-400">Jl. Pembangunan No. 12, DKI Jakarta</p>
                    <p className="text-[10px] text-slate-400">Telp: 021-8273612 | WA: 0812-3456-7890</p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">KUITANSI PEMBAYARAN</h3>
                  <p className="font-mono font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded text-[10px] mt-1 inline-block">
                    {receiptLog.noTransaksi}
                  </p>
                </div>
              </div>

              {/* Student demographic information */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Nama Murid</p>
                  <p className="text-slate-800 font-bold">{receiptLog.siswaName}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">NIS / Kelas</p>
                  <p className="text-slate-800 font-mono">{receiptLog.nis} / {receiptLog.kelas}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Tanggal Transaksi</p>
                  <p className="text-slate-600">{new Date(receiptLog.tanggal).toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Petugas Kasir</p>
                  <p className="text-slate-600">{receiptLog.petugas} (TU-Administrator)</p>
                </div>
              </div>

              {/* Paid list itemized table */}
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Metode Item Terbayar</p>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left font-sans">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500">
                        <th className="py-2.5 px-4">Deskripsi Rekening</th>
                        <th className="py-2.5 px-4">Periode</th>
                        <th className="py-2.5 px-4 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                      {receiptLog.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-4 font-bold text-slate-700">{it.namaPembayaran}</td>
                          <td className="py-2.5 px-4 text-slate-500">{it.periode}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-800">{formatRupiah(it.nominal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Payment Stamp block */}
              <div className="flex justify-between items-center border-t-2 border-dashed border-slate-200 pt-5">
                <div className="relative p-3 border-2 border-dashed border-emerald-400 rounded-xl flex items-center justify-center -rotate-2 select-none">
                  <div className="text-center text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest leading-tight">
                    🏫 SMK BINA BANGSA<br />
                    <span className="text-xs">LUNAS</span><br />
                    {new Date(receiptLog.tanggal).toLocaleDateString('id-ID')}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Total Pembayaran</p>
                  <h2 className="text-2xl font-extrabold text-emerald-600 font-mono">{formatRupiah(receiptLog.total)}</h2>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-slate-100 text-[9px] text-slate-400 font-medium leading-relaxed">
                Kuitansi ini sah diterbitkan oleh sistem komputerisasi sekolah dan tidak memerlukan cap basah ttd fisik.<br />
                Kwitansi digital juga dikirimkan melalui WhatsApp dinas ke no wali: {selectedStudent?.noHp}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
