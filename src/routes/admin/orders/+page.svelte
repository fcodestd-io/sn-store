<script lang="ts">
	import FilterBar from '#lib/components/admin/FilterBar.svelte';
	import PageHeader from '#lib/components/admin/PageHeader.svelte';
	import Pagination from '#lib/components/admin/Pagination.svelte';
	import StatCards from '#lib/components/admin/StatCards.svelte';
	import StatusPill from '#lib/components/admin/StatusPill.svelte';
	import TableCard from '#lib/components/admin/TableCard.svelte';
	import { ORDER_STATUSES, formatDateTime, formatRupiah } from '#lib/display.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const stats = $derived(
		data.summary
			? [
					{
						label: 'Total order',
						value: String(data.summary.total_orders),
						tone: 'accent' as const
					},
					{ label: 'Lunas', value: String(data.summary.paid_orders), tone: 'success' as const },
					{
						label: 'Menunggu',
						value: String(data.summary.pending_orders),
						tone: 'warning' as const
					},
					{
						label: 'Pendapatan',
						value: formatRupiah(data.summary.revenue),
						hint: 'Dari order berstatus lunas'
					}
				]
			: []
	);
</script>

<svelte:head>
	<title>Riwayat Order | SN Store</title>
</svelte:head>

<PageHeader
	eyebrow="SALES"
	title="Riwayat order"
	description="Semua pesanan dari bot Telegram, lengkap dengan status pembayaran dan pengiriman akun."
	badge="{data.total} order"
/>

{#if data.loadError}
	<div class="notice" role="alert"><span>!</span>{data.loadError}</div>
{/if}

{#if stats.length}<StatCards items={stats} />{/if}

<FilterBar
	statuses={ORDER_STATUSES}
	current={data.status}
	query={data.q}
	placeholder="Cari nomor order atau nama pelanggan…"
/>

{#if data.orders.length === 0 && !data.loadError}
	<div class="empty-state">
		<div class="empty-icon">▣</div>
		<h3>{data.status || data.q ? 'Tidak ada order yang cocok' : 'Belum ada order'}</h3>
		<p>
			{data.status || data.q
				? 'Ubah filter atau kata kunci pencarian.'
				: 'Order akan muncul di sini setelah pelanggan membuat invoice lewat bot.'}
		</p>
	</div>
{:else if data.orders.length > 0}
	<TableCard>
		<thead>
			<tr>
				<th>Order</th>
				<th>Pelanggan</th>
				<th>Produk</th>
				<th class="num">Total</th>
				<th>Status</th>
				<th>Akun</th>
				<th>Dibuat</th>
			</tr>
		</thead>
		<tbody>
			{#each data.orders as order (order.id)}
				<tr>
					<td>
						<a class="link mono" href="/admin/orders/{order.id}">{order.order_number}</a>
						<div class="muted">{order.source}</div>
					</td>
					<td>{order.customer_name}</td>
					<td>
						{#if order.products.length}{order.products.join(', ')}{:else}<span class="muted">—</span
							>{/if}
					</td>
					<td class="num">{formatRupiah(order.total_amount)}</td>
					<td><StatusPill status={order.status} /></td>
					<td>
						{#if order.status !== 'paid'}
							<span class="muted">—</span>
						{:else if order.delivery && order.delivery.total > 0 && order.delivery.delivered === order.delivery.total}
							<StatusPill status="completed" />
						{:else if order.delivery && order.delivery.total > 0}
							<span class="muted">Menunggu kirim</span>
						{:else if order.fulfilled_at}
							<span
								class="muted"
								title="Rincian akun tidak terbaca; jalankan migrasi admin_orders_payments"
							>
								Terpenuhi
							</span>
						{:else}
							<span class="muted">Belum dialokasikan</span>
						{/if}
					</td>
					<td class="muted">{formatDateTime(order.created_at)}</td>
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