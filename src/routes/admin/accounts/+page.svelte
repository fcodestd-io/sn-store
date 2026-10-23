<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let search = $state(data.q ?? '');

	const formatPrice = (value: number | string | null | undefined) =>
		new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(Number(value ?? 0));
</script>

<svelte:head>
	<title>Akun & Items | SN Store Admin</title>
	<meta name="description" content="Kelola akun dan item produk SN Store." />
</svelte:head>

<div class="page">
	<header class="page-header">
		<div class="heading">
			<div class="eyebrow">
				<span class="eyebrow-dot"></span>
				SN STORE / ADMIN
			</div>

			<h1>Akun & <span>Items</span></h1>
			<p class="subtitle">Kelola akun, item digital, harga, dan ketersediaan produk.</p>
		</div>

		<div class="header-stat">
			<span class="stat-label">Total produk</span>
			<strong>{data.products?.length ?? 0}</strong>
			<span class="stat-caption">Produk ditemukan</span>
		</div>
	</header>

	<section class="toolbar">
		<div class="toolbar-copy">
			<div class="section-icon">
				<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<rect x="3.5" y="5" width="17" height="14" rx="3" />
					<path d="M8 9h8M8 13h5" />
				</svg>
			</div>

			<div>
				<h2>Daftar produk</h2>
				<p>Pilih produk untuk mengelola akun dan item di dalamnya.</p>
			</div>
		</div>

		<form method="GET" class="search-form">
			<label class="search-box">
				<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<circle cx="10.8" cy="10.8" r="6.8" />
					<path d="m16 16 4.2 4.2" />
				</svg>

				<input
					type="search"
					name="q"
					placeholder="Cari nama produk..."
					bind:value={search}
					aria-label="Cari nama produk"
				/>
			</label>

			<button class="button button-primary" type="submit"> Cari </button>

			{#if data.q}
				<a class="button button-secondary" href="/admin/accounts"> Reset </a>
			{/if}
		</form>
	</section>

	<section class="content-panel">
		<div class="panel-top">
			<div>
				<h2>Produk</h2>
				<p>Pilih salah satu produk untuk membuka pengelolaan item.</p>
			</div>

			<span class="count-pill">
				{data.products?.length ?? 0} produk
			</span>
		</div>

		{#if data.products?.length}
			<div class="product-grid">
				{#each data.products as product (product.id)}
					<article class="product-card">
						<div class="product-card-top">
							<div class="product-icon">
								<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
									<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
									<path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v9" />
								</svg>
							</div>

							<span
								class:status-active={product.is_active}
								class:status-inactive={!product.is_active}
								class="status-pill"
							>
								<span class="status-dot"></span>
								{product.is_active ? 'Aktif' : 'Nonaktif'}
							</span>
						</div>

						<div class="product-info">
							<h3>{product.name}</h3>

							{#if product.slug}
								<p class="product-slug">/{product.slug}</p>
							{:else}
								<p class="product-slug">ID: {product.id}</p>
							{/if}
						</div>

						<div class="product-meta">
							<div class="meta-item">
								<span>Tipe produk</span>
								<strong>{product.product_type || 'Umum'}</strong>
							</div>

							<div class="meta-item meta-price">
								<span>Harga produk</span>
								<strong>{formatPrice(product.price)}</strong>
							</div>
						</div>

						<a class="manage-button" href={`/admin/accounts/${product.id}`}>
							<span>Kelola akun & items</span>

							<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<path d="M5 12h14M13 6l6 6-6 6" />
							</svg>
						</a>
					</article>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<div class="empty-icon">
					<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<circle cx="10.8" cy="10.8" r="6.8" />
						<path d="m16 16 4.2 4.2M8 10.8h5.6" />
					</svg>
				</div>

				<h3>Produk tidak ditemukan</h3>

				<p>
					{#if data.q}
						Tidak ada produk yang cocok dengan pencarian "{data.q}".
					{:else}
						Belum ada produk yang tersedia untuk dikelola.
					{/if}
				</p>

				{#if data.q}
					<a href="/admin/accounts" class="button button-secondary"> Hapus pencarian </a>
				{/if}
			</div>
		{/if}
	</section>

	<footer class="page-footer">
		<span class="footer-indicator"></span>
		SN Store Admin
		<span class="footer-separator">/</span>
		Account Management
	</footer>
</div>

<style>
	:global(body) {
		background: #0b1424;
		color: #e5edf8;
	}

	:global(*) {
		box-sizing: border-box;
	}

	.page {
		width: 100%;
		max-width: 1440px;
		margin: 0 auto;
		padding: 32px;
		color: #e5edf8;
	}

	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 24px;
		margin-bottom: 30px;
	}

	.eyebrow {
		display: flex;
		align-items: center;
		gap: 9px;
		margin-bottom: 13px;
		color: #8fa1bb;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 1.7px;
	}

	.eyebrow-dot,
	.footer-indicator {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #38bdf8;
		box-shadow: 0 0 12px #38bdf844;
	}

	h1 {
		margin: 0;
		color: #f1f5fb;
		font-size: clamp(27px, 3vw, 35px);
		font-weight: 800;
		letter-spacing: -1.2px;
	}

	h1 span {
		color: #38bdf8;
	}

	.subtitle {
		margin: 10px 0 0;
		color: #8fa1bb;
		font-size: 14px;
		line-height: 1.7;
	}

	.header-stat {
		min-width: 150px;
		padding: 17px 20px;
		border: 1px solid #27364c;
		border-radius: 12px;
		background: #111b2d;
	}

	.stat-label,
	.stat-caption {
		display: block;
		color: #8fa1bb;
		font-size: 11px;
	}

	.header-stat strong {
		display: block;
		margin: 5px 0;
		color: #eaf6ff;
		font-size: 27px;
		font-weight: 800;
	}

	.stat-caption {
		color: #38bdf8;
	}

	.toolbar,
	.content-panel {
		border: 1px solid #27364c;
		border-radius: 14px;
		background: #111b2d;
	}

	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 22px;
		padding: 20px;
		margin-bottom: 20px;
	}

	.toolbar-copy {
		display: flex;
		align-items: center;
		gap: 13px;
		min-width: 220px;
	}

	.section-icon,
	.product-icon,
	.empty-icon {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		color: #38bdf8;
		border: 1px solid #244b68;
		background: #10283b;
	}

	.section-icon {
		width: 44px;
		height: 44px;
		border-radius: 11px;
	}

	.section-icon svg,
	.product-icon svg,
	.empty-icon svg {
		width: 22px;
		height: 22px;
		stroke: currentColor;
		stroke-width: 1.7;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	h2,
	h3,
	p {
		overflow-wrap: anywhere;
	}

	.toolbar h2,
	.panel-top h2 {
		margin: 0;
		color: #eaf1fb;
		font-size: 15px;
		font-weight: 750;
	}

	.toolbar-copy p,
	.panel-top p {
		margin: 5px 0 0;
		color: #8fa1bb;
		font-size: 12px;
		line-height: 1.6;
	}

	.search-form {
		display: flex;
		align-items: center;
		gap: 9px;
		width: min(100%, 520px);
	}

	.search-box {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 10px;
		min-width: 0;
		height: 42px;
		padding: 0 12px;
		border: 1px solid #2b3b53;
		border-radius: 9px;
		background: #0b1424;
		color: #8fa1bb;
	}

	.search-box:focus-within {
		border-color: #38bdf8;
		box-shadow: 0 0 0 3px #38bdf817;
	}

	.search-box svg {
		width: 18px;
		height: 18px;
		flex: 0 0 auto;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: round;
	}

	input {
		width: 100%;
		min-width: 0;
		border: 0;
		outline: 0;
		background: transparent;
		color: #e5edf8;
		font: inherit;
		font-size: 12px;
	}

	input::placeholder {
		color: #657790;
	}

	.button {
		display: inline-flex;
		min-height: 40px;
		align-items: center;
		justify-content: center;
		padding: 0 15px;
		border: 1px solid transparent;
		border-radius: 9px;
		font-size: 12px;
		font-weight: 750;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
		transition: 160ms ease;
	}

	.button-primary {
		border-color: #38bdf8;
		background: #38bdf8;
		color: #071523;
	}

	.button-primary:hover {
		background: #7dd3fc;
		border-color: #7dd3fc;
	}

	.button-secondary {
		border-color: #30425c;
		background: #172338;
		color: #c4d2e5;
	}

	.button-secondary:hover {
		border-color: #38bdf8;
		color: #7dd3fc;
	}

	.content-panel {
		overflow: hidden;
	}

	.panel-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 21px 22px;
		border-bottom: 1px solid #27364c;
	}

	.count-pill {
		display: inline-flex;
		align-items: center;
		padding: 6px 10px;
		border: 1px solid #244b68;
		border-radius: 7px;
		background: #10283b;
		color: #7dd3fc;
		font-size: 11px;
		font-weight: 750;
		white-space: nowrap;
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 15px;
		padding: 20px;
	}

	.product-card {
		display: flex;
		min-width: 0;
		flex-direction: column;
		padding: 18px;
		border: 1px solid #27364c;
		border-radius: 12px;
		background: #0e192a;
		transition:
			border-color 160ms ease,
			transform 160ms ease;
	}

	.product-card:hover {
		transform: translateY(-2px);
		border-color: #38617e;
	}

	.product-card-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.product-icon {
		width: 43px;
		height: 43px;
		border-radius: 11px;
	}

	.status-pill {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 6px 9px;
		border: 1px solid;
		border-radius: 7px;
		font-size: 10px;
		font-weight: 750;
		white-space: nowrap;
	}

	.status-active {
		border-color: #1e5b4a;
		background: #102d29;
		color: #6ee7b7;
	}

	.status-inactive {
		border-color: #4b3c43;
		background: #2b2029;
		color: #fda4af;
	}

	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: currentColor;
	}

	.product-info {
		margin: 18px 0;
	}

	.product-info h3 {
		margin: 0;
		color: #eaf1fb;
		font-size: 15px;
		font-weight: 750;
		line-height: 1.5;
	}

	.product-slug {
		margin: 6px 0 0;
		color: #71839c;
		font-size: 11px;
		overflow-wrap: anywhere;
	}

	.product-meta {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 12px;
		padding: 14px 0;
		margin-top: auto;
		border-top: 1px solid #27364c;
		border-bottom: 1px solid #27364c;
	}

	.meta-item {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 6px;
	}

	.meta-item span {
		color: #71839c;
		font-size: 10px;
	}

	.meta-item strong {
		color: #cbd8e9;
		font-size: 12px;
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.meta-price strong {
		color: #7dd3fc;
	}

	.manage-button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 42px;
		padding: 0 13px;
		margin-top: 15px;
		border: 1px solid #244b68;
		border-radius: 9px;
		background: #10283b;
		color: #7dd3fc;
		font-size: 12px;
		font-weight: 750;
		text-decoration: none;
		transition: 160ms ease;
	}

	.manage-button:hover {
		border-color: #38bdf8;
		background: #15354b;
	}

	.manage-button svg {
		width: 17px;
		height: 17px;
		flex: 0 0 auto;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.empty-state {
		display: flex;
		min-height: 270px;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		padding: 35px 20px;
		text-align: center;
	}

	.empty-icon {
		width: 52px;
		height: 52px;
		border-radius: 14px;
	}

	.empty-state h3 {
		margin: 17px 0 0;
		color: #e5edf8;
		font-size: 15px;
	}

	.empty-state p {
		max-width: 420px;
		margin: 8px 0 18px;
		color: #8fa1bb;
		font-size: 12px;
		line-height: 1.7;
	}

	.page-footer {
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 20px 2px 0;
		color: #71839c;
		font-size: 11px;
	}

	.footer-indicator {
		width: 6px;
		height: 6px;
	}

	.footer-separator {
		color: #3d5069;
	}

	@media (max-width: 1100px) {
		.product-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.toolbar {
			align-items: stretch;
			flex-direction: column;
		}

		.search-form {
			width: 100%;
		}
	}

	@media (max-width: 640px) {
		.page {
			padding: 20px 14px;
		}

		.page-header {
			flex-direction: column;
			gap: 18px;
			margin-bottom: 22px;
		}

		.header-stat {
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;
			width: 100%;
			min-width: 0;
			gap: 4px 12px;
		}

		.header-stat strong {
			grid-column: 2;
			grid-row: 1 / span 2;
			margin: 0;
			font-size: 24px;
		}

		.stat-caption {
			grid-column: 1;
		}

		.toolbar {
			padding: 15px;
		}

		.toolbar-copy {
			align-items: flex-start;
		}

		.search-form {
			flex-wrap: wrap;
		}

		.search-box {
			flex-basis: 100%;
		}

		.search-form .button {
			flex: 1;
		}

		.panel-top {
			align-items: flex-start;
			padding: 17px 15px;
		}

		.product-grid {
			grid-template-columns: minmax(0, 1fr);
			padding: 13px;
			gap: 12px;
		}

		.product-card {
			padding: 15px;
		}
	}
</style>
