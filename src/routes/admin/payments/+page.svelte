<script lang="ts">
	import FilterBar from '#lib/components/admin/FilterBar.svelte';
	import PageHeader from '#lib/components/admin/PageHeader.svelte';
	import Pagination from '#lib/components/admin/Pagination.svelte';
	import StatCards from '#lib/components/admin/StatCards.svelte';
	import StatusPill from '#lib/components/admin/StatusPill.svelte';
	import TableCard from '#lib/components/admin/TableCard.svelte';
	import {
		PAYMENT_STATUSES,
		formatDateTime,
		formatRupiah,
		paymentMethodLabel
	} from '#lib/display.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const stats = $derived(
		data.summary
			? [
					{
						label: 'Dana diterima',
						value: formatRupiah(data.summary.received_amount),
						hint: 'Pembayaran berstatus lunas',
						tone: 'success' as const
					},
					{
						label: 'Total transaksi',
						value: String(data.summary.total_payments),
						tone: 'accent' as const
					},
					{ label: 'Lunas', value: String(data.summary.paid_payments) },
					{
						label: 'Menunggu',
						value: String(data.summary.pending_payments),
						tone: 'warning' as const
					},
					{ label: 'Gagal / kedaluwarsa', value: String(data.summary.failed_payments) }
				]
			: []
	);
</script>

<svelte:head>
	<title>Pembayaran | SN Store</title>
</svelte:head>

<PageHeader
	eyebrow="FINANCE"
	title="Pembayaran"
	description="Transaksi Midtrans untuk setiap order, termasuk metode yang dipilih pelanggan di Snap."
	badge="{data.total} transaksi"
/>

{#if data.loadError}
	<div class="notice" role="alert"><span>!</span>{data.loadError}</div>
{/if}

{#if stats.length}<StatCards items={stats} />{/if}

<FilterBar
	statuses={PAYMENT_STATUSES}
	current={data.status}
	query={data.q}
	placeholder="Cari referensi transaksi atau metode…"
/>

{#if data.payments.length === 0 && !data.loadError}
	<div class="empty-state">
		<div class="empty-icon">↔</div>
		<h3>{data.status || data.q ? 'Tidak ada transaksi yang cocok' : 'Belum ada pembayaran'}</h3>
		<p>
			{data.status || data.q
				? 'Ubah filter atau kata kunci pencarian.'
				: 'Transaksi akan muncul di sini setelah pelanggan membuat invoice.'}
		</p>
	</div>
{:else if data.payments.length > 0}
	<TableCard>
		<thead>
			<tr>
				<th>Referensi</th>
				<th>Order</th>
				<th>Metode</th>
				<th class="num">Jumlah</th>
				<th>Status</th>
				<th>Dibayar</th>
				<th>Dibuat</th>
			</tr>
		</thead>
		<tbody>
			{#each data.payments as payment (payment.id)}
				<tr>
					<td class="mono"
						>{payment.external_id ?? '—'}
						<div class="muted">{payment.provider}</div></td
					>
					<td>
						{#if payment.order}
							<a class="link" href="/admin/orders/{payment.order_id}"
								>{payment.order.order_number}</a
							>
							<div class="muted">{payment.order.customer_name}</div>
						{:else}
							<span class="muted">—</span>
						{/if}
					</td>
					<td>{paymentMethodLabel(payment.payment_method)}</td>
					<td class="num">{formatRupiah(payment.amount)}</td>
					<td><StatusPill status={payment.status} /></td>
					<td class="muted">{formatDateTime(payment.paid_at)}</td>
					<td class="muted">{formatDateTime(payment.created_at)}</td>
				</tr>
			{/each}
		</tbody>
	</TableCard>

	<Pagination
		page={data.page}
		pageSize={data.pageSize}
		total={data.total}
		params={{ status: data.status, q: data.q || null }}
	/>
{/if}

<style>
	.notice {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 16px;
		padding: 13px 14px;
		border: 1px solid #7f2d3b;
		border-radius: 12px;
		background: #2e1420;
		color: #fda4af;
		font-size: 12px;
	}

	.notice span {
		display: grid;
		flex: 0 0 22px;
		width: 22px;
		height: 22px;
		place-items: center;
		border-radius: 50%;
		background: #7f2d3b;
		font-weight: 800;
	}

	.empty-state {
		padding: 44px 20px;
		border: 1px dashed #2c3d57;
		border-radius: 16px;
		background: #0f1829;
		text-align: center;
	}

	.empty-icon {
		display: grid;
		width: 48px;
		height: 48px;
		margin: 0 auto 14px;
		place-items: center;
		border: 1px solid #294967;
		border-radius: 12px;
		background: #172d45;
		color: #7dd3fc;
		font-size: 22px;
	}

	.empty-state h3 {
		margin: 0;
		color: #e5edf8;
		font-size: 15px;
	}

	.empty-state p {
		margin: 8px 0 0;
		color: #8294ad;
		font-size: 12px;
	}
</style>
