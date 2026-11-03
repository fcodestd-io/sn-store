<script lang="ts">
	import PageHeader from '#lib/components/admin/PageHeader.svelte';
	import StatusPill from '#lib/components/admin/StatusPill.svelte';
	import TableCard from '#lib/components/admin/TableCard.svelte';
	import { formatDateTime, formatRupiah, paymentMethodLabel } from '#lib/display.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const order = $derived(data.order);
</script>

<svelte:head>
	<title>{order.order_number} | Riwayat Order | SN Store</title>
</svelte:head>

<a class="back" href="/admin/orders">← Kembali ke riwayat order</a>

<PageHeader
	eyebrow="ORDER DETAIL"
	title={order.order_number}
	description="Dibuat {formatDateTime(order.created_at)}"
/>

<section class="grid">
	<article class="card">
		<h2>Ringkasan</h2>
		<dl>
			<dt>Status</dt>
			<dd><StatusPill status={order.status} /></dd>
			<dt>Total</dt>
			<dd class="strong">{formatRupiah(order.total_amount)}</dd>
			<dt>Dibayar</dt>
			<dd>{formatDateTime(order.paid_at)}</dd>
			<dt>Akun terpenuhi</dt>
			<dd>{formatDateTime(order.fulfilled_at)}</dd>
			<dt>Sumber</dt>
			<dd>{order.source}</dd>
		</dl>
	</article>

	<article class="card">
		<h2>Pelanggan</h2>
		<dl>
			<dt>Nama</dt>
			<dd>{order.customer_name}</dd>
			<dt>Telegram chat ID</dt>
			<dd class="mono">{order.telegram_chat_id ?? '—'}</dd>
			<dt>Email</dt>
			<dd>
				{order.customer_email?.endsWith('@telegram.invalid') ? '—' : (order.customer_email ?? '—')}
			</dd>
			<dt>Telepon</dt>
			<dd>{order.customer_phone ?? '—'}</dd>
		</dl>
		{#if order.notes}<p class="note">{order.notes}</p>{/if}
	</article>
</section>

<h2 class="section-title">Item pesanan</h2>
<TableCard>
	<thead>
		<tr
			><th>Produk</th><th class="num">Harga</th><th class="num">Jumlah</th><th class="num"
				>Subtotal</th
			></tr
		>
	</thead>
	<tbody>
		{#each data.items as item (item.id)}
			<tr>
				<td>{item.product_name}</td>
				<td class="num">{formatRupiah(item.unit_price)}</td>
				<td class="num">{item.quantity}</td>
				<td class="num"
					>{formatRupiah(item.line_total ?? Number(item.unit_price) * item.quantity)}</td
				>
			</tr>
		{:else}
			<tr><td colspan="4" class="muted">Tidak ada item.</td></tr>
		{/each}
	</tbody>
</TableCard>

<h2 class="section-title">Pembayaran</h2>
<TableCard>
	<thead>
		<tr>
			<th>Referensi</th><th>Metode</th><th class="num">Jumlah</th><th>Status</th><th>Dibayar</th><th
				>Kedaluwarsa</th
			>
		</tr>
	</thead>
	<tbody>
		{#each data.payments as payment (payment.id)}
			<tr>
				<td class="mono"
					>{payment.external_id ?? '—'}
					<div class="muted">{payment.provider}</div></td
				>
				<td>{paymentMethodLabel(payment.payment_method)}</td>
				<td class="num">{formatRupiah(payment.amount)}</td>
				<td><StatusPill status={payment.status} /></td>
				<td class="muted">{formatDateTime(payment.paid_at)}</td>
				<td class="muted">{formatDateTime(payment.expires_at)}</td>
			</tr>
		{:else}
			<tr><td colspan="6" class="muted">Belum ada data pembayaran.</td></tr>
		{/each}
	</tbody>
</TableCard>

<h2 class="section-title">Akun yang dikirim</h2>
{#if data.assignmentsUnavailable}
	<p class="hint">
		Data pengiriman akun belum dapat dimuat. Jalankan migrasi
		20261028000000_admin_orders_payments.sql.
	</p>
{:else}
	<TableCard>
		<thead>
			<tr><th>Akun</th><th>Email/Username</th><th>Slot</th><th>Status kirim</th></tr>
		</thead>
		<tbody>
			{#each data.assignments as assignment (assignment.id)}
				<tr>
					<td>{assignment.account?.name ?? '—'}</td>
					<td class="mono">{assignment.account?.login_email ?? '—'}</td>
					<td class="num">{assignment.slot_number}</td>
					<td>
						{#if assignment.delivered_at}
							<StatusPill status="completed" />
							<div class="muted">{formatDateTime(assignment.delivered_at)}</div>
						{:else}
							<StatusPill status="pending" />
						{/if}
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="4" class="muted">
						{#if order.fulfilled_at}
							Order sudah terpenuhi, tetapi rincian akun tidak terbaca. Jalankan migrasi
							20261028000000_admin_orders_payments.sql agar admin dapat membaca data pengiriman
							akun.
						{:else if order.status === 'paid'}
							Belum ada akun dialokasikan. Tambahkan akun/kapasitas; bot akan mengirimnya otomatis.
						{:else}
							Akun dikirim otomatis setelah pembayaran lunas.
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</TableCard>
{/if}

<style>
	.back {
		display: inline-block;
		margin-bottom: 14px;
		color: #8fa1bb;
		font-size: 12px;
		text-decoration: none;
	}

	.back:hover {
		color: #7dd3fc;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 14px;
		margin-bottom: 8px;
	}

	.card {
		min-width: 0;
		padding: 18px;
		border: 1px solid #27364c;
		border-radius: 16px;
		background: #111b2d;
	}

	h2 {
		margin: 0 0 14px;
		color: #e5edf8;
		font-size: 15px;
	}

	.section-title {
		margin: 26px 0 12px;
	}

	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 10px 18px;
		margin: 0;
		font-size: 12px;
	}

	dt {
		color: #8fa1bb;
	}

	dd {
		margin: 0;
		min-width: 0;
		color: #dbe6f5;
		overflow-wrap: anywhere;
	}

	.strong {
		color: #7dd3fc;
		font-weight: 800;
	}

	.mono {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 11px;
	}

	.note {
		margin: 14px 0 0;
		padding-top: 12px;
		border-top: 1px solid #27364c;
		color: #8fa1bb;
		font-size: 11px;
	}

	.hint {
		padding: 14px;
		border: 1px solid #7a5a1c;
		border-radius: 12px;
		background: #2b2110;
		color: #fcd34d;
		font-size: 12px;
	}
</style>
