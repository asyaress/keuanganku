import { Card } from '@/components/ui';
import { TransactionForm } from '@/components/transaction-form';
import { getTransactionFormData } from '@/lib/data';

function errorMessage(error?: string) {
  if (error === 'edit') return 'Transaksi tidak ditemukan atau sudah tidak bisa diedit.';
  if (error === 'nominal') return 'Nominal harus lebih dari Rp0.';
  if (error === 'tanggal') return 'Tanggal transaksi tidak valid.';
  if (error === 'kategori') return 'Pilih kategori yang sesuai dengan jenis transaksi.';
  if (error === 'wallet') return 'Dompet utama belum tersedia. Jalankan seed atau buat data dompet dulu.';
  if (error === 'investment-wallet') return 'Dompet investasi belum tersedia. Jalankan seed atau buat data dompet investasi dulu.';
  if (error === 'jenis') return 'Jenis transaksi tidak dikenali.';
  return 'Ada data yang belum lengkap. Cek nominal, dompet, kategori, atau tanggal lalu simpan lagi.';
}

export default async function CatatPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; error?: string; voided?: string; edited?: string; editId?: string; returnTo?: string }>;
}) {
  const params = (await searchParams) || {};
  const editId = Number(params.editId || 0);
  const { wallets, categories, editTransaction } = await getTransactionFormData(editId > 0 ? editId : undefined);
  const returnTo = params.returnTo && params.returnTo.startsWith('/') ? params.returnTo : '/dashboard';

  return (
    <div className="space-y-4">
      <div className="animate-fade-up">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Input cepat</p>
        <h1 className="mt-2 text-[30px] font-semibold tracking-tight text-app-text">{editTransaction ? 'Edit transaksi' : 'Catat transaksi'}</h1>
      </div>

      {params.saved === '1' ? (
        <Card className="animate-fade-up border-0 bg-[#effbfb] p-4 text-sm font-medium text-app-accentDark [animation-delay:60ms]">
          Data berhasil disimpan.
        </Card>
      ) : null}

      {params.edited === '1' ? (
        <Card className="animate-fade-up border-0 bg-[#effbfb] p-4 text-sm font-medium text-app-accentDark [animation-delay:60ms]">
          Perubahan transaksi berhasil disimpan.
        </Card>
      ) : null}

      {params.voided === '1' ? (
        <Card className="animate-fade-up border-0 bg-[#fff5f2] p-4 text-sm font-medium text-[#d1695b] [animation-delay:60ms]">
          Transaksi berhasil di-void.
        </Card>
      ) : null}

      {params.error ? (
        <Card className="animate-fade-up border-0 bg-[#fff5f2] p-4 text-sm font-medium text-[#d1695b] [animation-delay:60ms]">
          {errorMessage(params.error)}
        </Card>
      ) : null}

      {editId > 0 && !editTransaction ? (
        <Card className="animate-fade-up border-0 bg-[#fff5f2] p-4 text-sm font-medium text-[#d1695b] [animation-delay:60ms]">
          Transaksi yang ingin diedit tidak ditemukan.
        </Card>
      ) : null}

      <TransactionForm wallets={wallets} categories={categories} editTransaction={editTransaction as any} returnTo={returnTo} />
    </div>
  );
}
