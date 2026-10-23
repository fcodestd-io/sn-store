<script lang="ts">
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let showCreateForm = $state(false);

	const formatPrice = (value: number | string | null | undefined) =>
		new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(Number(value ?? 0));

	const statusLabel = (status: string) => {
		switch (status) {
			case 'available':
				return 'Tersedia';
			case 'reserved':
				return 'Dipesan';
			case 'sold':
				return 'Terjual';
			default:
				return status;
		}
	};
</script>

<svelte:head>
	<title>Kelola Akun | SN Store Admin</title>
	<meta name="description" content="Kelola akun dan item produk SN Store." />
</svelte:head>

<div class="page">
	<div class="breadcrumb">
		<a href="/admin/accounts">Akun & Items</a>
		<span>/</span>
		<span class="breadcrumb-current">Kelola produk</span>
	</div>

	<header class="page-header">
		<div class="heading">
			<div class="eyebrow">
				<span class="eyebrow-dot"></span>
				SN STORE / ACCOUNT MANAGEMENT
			</div>

			<h1>Kelola <span>Akun & Items</span></h1>
			<p class="subtitle">
				Atur daftar akun, informasi login, harga, dan ketersediaan item produk.
			</p>
		</div>

		<a href="/admin/accounts" class="button button-secondary back-button">
			<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path d="M19 12H5M11 18l-6-6 6-6" />
			</svg>
			Kembali
		</a>
	</header>

	<section class="product-summary">
		<div class="summary-icon">
			<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
				<path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v9" />
			</svg>
		</div>

		<div class="summary-info">
			<span class="summary-label">Produk yang dikelola</span>
			<h2>{data.product.name}</h2>

			<div class="summary-meta">
				{#if data.product.slug}
					<span>/{data.product.slug}</span>
				{/if}

				<span class="meta-divider"></span>
				<span>{data.product.product_type || 'Produk umum'}</span>
			</div>
		</div>

		<div class="summary-price">
			<span>Harga produk</span>
			<strong>{formatPrice(data.product.price)}</strong>
		</div>
	</section>

	{#if form?.success}
		<div class="alert alert-success" role="status">
			<span class="alert-icon">✓</span>
			<span>{form.message || 'Perubahan berhasil disimpan.'}</span>
		</div>
	{/if}

	{#if form?.error}
		<div class="alert alert-error" role="alert">
			<span class="alert-icon">!</span>
			<span>{form.error}</span>
		</div>
	{/if}

	<section class="content-panel">
		<div class="panel-header">
			<div class="panel-heading">
				<div class="section-icon">
					<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<rect x="3.5" y="5" width="17" height="14" rx="3" />
						<path d="M8 9h8M8 13h5" />
					</svg>
				</div>

				<div>
					<h2>Daftar akun & items</h2>
					<p>
						{data.accounts?.length ?? 0} item terdaftar untuk produk ini.
					</p>
				</div>
			</div>

			<button
				type="button"
				class="button button-primary"
				onclick={() => (showCreateForm = !showCreateForm)}
			>
				{#if showCreateForm}
					<span class="button-symbol">−</span>
					Tutup form
				{:else}
					<span class="button-symbol">+</span>
					Tambah item
				{/if}
			</button>
		</div>

		{#if showCreateForm}
			<div class="create-section">
				<div class="form-heading">
					<span class="form-step">01</span>
					<div>
						<h3>Tambah item baru</h3>
						<p>Masukkan informasi akun yang akan disimpan.</p>
					</div>
				</div>

				<form method="POST" action="?/create" class="account-form">
					<div class="form-grid">
						<label class="field field-full">
							<span>Nama item <b>*</b></span>
							<input type="text" name="name" placeholder="Contoh: Akun Premium 30 Hari" required />
						</label>

						<label class="field">
							<span>Email login</span>
							<input
								type="text"
								name="login_email"
								placeholder="Email atau username"
								autocomplete="off"
							/>
						</label>

						<label class="field">
							<span>Password login</span>
							<input
								type="password"
								name="login_password"
								placeholder="Password akun"
								autocomplete="new-password"
							/>
						</label>

						<label class="field">
							<span>Harga item <b>*</b></span>
							<div class="input-prefix">
								<span>Rp</span>
								<input type="number" name="price" min="0" step="1" placeholder="0" required />
							</div>
						</label>

						<label class="field">
							<span>Status</span>
							<select name="status" value="available">
								<option value="available">Tersedia</option>
								<option value="reserved">Dipesan</option>
								<option value="sold">Terjual</option>
							</select>
						</label>

						<label class="field field-full">
							<span>Catatan</span>
							<textarea name="notes" rows="3" placeholder="Informasi tambahan untuk item ini..."
							></textarea>
						</label>
					</div>

					<div class="form-actions">
						<button
							type="button"
							class="button button-secondary"
							onclick={() => (showCreateForm = false)}
						>
							Batal
						</button>

						<button type="submit" class="button button-primary"> Simpan item </button>
					</div>
				</form>
			</div>
		{/if}

		{#if data.accounts?.length}
			<div class="account-list">
				{#each data.accounts as account, index (account.id)}
					<article class="account-card">
						<div class="account-card-header">
							<div class="account-identity">
								<div class="account-index">
									{String(index + 1).padStart(2, '0')}
								</div>

								<div class="account-title">
									<h3>{account.name}</h3>
									<span class="account-id">ID: {account.id}</span>
								</div>
							</div>

							<span
								class="status-pill"
								class:status-available={account.status === 'available'}
								class:status-reserved={account.status === 'reserved'}
								class:status-sold={account.status === 'sold'}
							>
								<span class="status-dot"></span>
								{statusLabel(account.status)}
							</span>
						</div>

						<div class="account-details">
							<div class="detail-item">
								<span>Email / username</span>
								<strong>{account.login_email || 'Belum diisi'}</strong>
							</div>

							<div class="detail-item">
								<span>Password login</span>
								<strong>
									{account.login_password ? '••••••••' : 'Belum diisi'}
								</strong>
							</div>

							<div class="detail-item">
								<span>Harga item</span>
								<strong class="price-value">
									{formatPrice(account.price)}
								</strong>
							</div>

							<div class="detail-item">
								<span>Dibuat</span>
								<strong>
									{account.created_at
										? new Date(account.created_at).toLocaleDateString('id-ID', {
												day: '2-digit',
												month: 'short',
												year: 'numeric'
											})
										: '—'}
								</strong>
							</div>
						</div>

						{#if account.notes}
							<div class="account-notes">
								<span>Catatan</span>
								<p>{account.notes}</p>
							</div>
						{/if}

						<details class="edit-details">
							<summary>
								<span>
									<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<path d="m14 6 4 4M4 20l4.2-.8L19 8.4a2.8 2.8 0 0 0-4-4L4.8 14.6 4 20Z" />
									</svg>
									Edit item
								</span>

								<svg class="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
									<path d="m6 9 6 6 6-6" />
								</svg>
							</summary>

							<form method="POST" action="?/update" class="account-form edit-form">
								<input type="hidden" name="id" value={account.id} />

								<div class="form-grid">
									<label class="field field-full">
										<span>Nama item <b>*</b></span>
										<input type="text" name="name" value={account.name} required />
									</label>

									<label class="field">
										<span>Email login</span>
										<input
											type="text"
											name="login_email"
											value={account.login_email ?? ''}
											autocomplete="off"
										/>
									</label>

									<label class="field">
										<span>Password baru</span>
										<input
											type="password"
											name="login_password"
											placeholder="Kosongkan jika tidak diubah"
											autocomplete="new-password"
										/>
										<small> Biarkan kosong jika ingin mempertahankan password saat ini. </small>
									</label>

									<label class="field">
										<span>Harga item <b>*</b></span>
										<div class="input-prefix">
											<span>Rp</span>
											<input
												type="number"
												name="price"
												min="0"
												step="1"
												value={account.price}
												required
											/>
										</div>
									</label>

									<label class="field">
										<span>Status</span>
										<select name="status" value={account.status}>
											<option value="available">Tersedia</option>
											<option value="reserved">Dipesan</option>
											<option value="sold">Terjual</option>
										</select>
									</label>

									<label class="field field-full">
										<span>Catatan</span>
										<textarea name="notes" rows="3" placeholder="Catatan item..."
											>{account.notes ?? ''}</textarea
										>
									</label>
								</div>

								<div class="form-actions">
									<button type="submit" class="button button-primary"> Simpan perubahan </button>
								</div>
							</form>
						</details>

						<div class="delete-row">
							<span>Item ini tidak lagi diperlukan?</span>

							<form
								method="POST"
								action="?/delete"
								onsubmit={(event) => {
									if (
										!confirm(`Hapus item "${account.name}"? Tindakan ini tidak dapat dibatalkan.`)
									) {
										event.preventDefault();
									}
								}}
							>
								<input type="hidden" name="id" value={account.id} />

								<button type="submit" class="delete-button">
									<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 13h11l1-13M9 7V4h6v3" />
									</svg>
									Hapus item
								</button>
							</form>
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<div class="empty-icon">
					<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<rect x="3.5" y="5" width="17" height="14" rx="3" />
						<path d="M8 9h8M8 13h5" />
					</svg>
				</div>

				<h3>Belum ada item akun</h3>
				<p>
					Produk ini belum memiliki item akun. Tambahkan item pertama untuk mulai mengelola stok
					akun.
				</p>

				<button type="button" class="button button-primary" onclick={() => (showCreateForm = true)}>
					<span class="button-symbol">+</span>
					Tambah item pertama
				</button>
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

	.breadcrumb {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
		margin-bottom: 24px;
		color: #71839c;
		font-size: 12px;
	}

	.breadcrumb a {
		color: #8fa1bb;
		text-decoration: none;
	}

	.breadcrumb a:hover,
	.breadcrumb-current {
		color: #7dd3fc;
	}

	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 22px;
		margin-bottom: 25px;
	}

	.eyebrow {
		display: flex;
		align-items: center;
		gap: 9px;
		margin-bottom: 13px;
		color: #8fa1bb;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 1.5px;
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
		font-size: clamp(25px, 3vw, 34px);
		font-weight: 800;
		letter-spacing: -1px;
		line-height: 1.25;
	}

	h1 span {
		color: #38bdf8;
	}

	.subtitle {
		margin: 10px 0 0;
		color: #8fa1bb;
		font-size: 13px;
		line-height: 1.7;
	}

	.button {
		display: inline-flex;
		min-height: 40px;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 0 14px;
		border: 1px solid transparent;
		border-radius: 9px;
		font: inherit;
		font-size: 12px;
		font-weight: 750;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
		transition: 160ms ease;
	}

	.button svg {
		width: 17px;
		height: 17px;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.button-primary {
		border-color: #38bdf8;
		background: #38bdf8;
		color: #071523;
	}

	.button-primary:hover {
		border-color: #7dd3fc;
		background: #7dd3fc;
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

	.button-symbol {
		font-size: 18px;
		font-weight: 500;
		line-height: 1;
	}

	.product-summary {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px;
		margin-bottom: 20px;
		border: 1px solid #27364c;
		border-radius: 13px;
		background: #111b2d;
	}

	.summary-icon,
	.section-icon,
	.empty-icon {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		color: #38bdf8;
		border: 1px solid #244b68;
		background: #10283b;
	}

	.summary-icon {
		width: 50px;
		height: 50px;
		border-radius: 12px;
	}

	.summary-icon svg,
	.section-icon svg,
	.empty-icon svg {
		width: 23px;
		height: 23px;
		stroke: currentColor;
		stroke-width: 1.7;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.summary-info {
		flex: 1;
		min-width: 0;
	}

	.summary-label,
	.summary-price > span {
		color: #8fa1bb;
		font-size: 11px;
	}

	.summary-info h2 {
		margin: 5px 0 7px;
		color: #eaf1fb;
		font-size: 17px;
		font-weight: 800;
		overflow-wrap: anywhere;
	}

	.summary-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 9px;
		color: #8fa1bb;
		font-size: 11px;
	}

	.meta-divider {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: #50637d;
	}

	.summary-price {
		display: flex;
		flex-direction: column;
		gap: 7px;
		align-items: flex-end;
		padding-left: 18px;
		border-left: 1px solid #27364c;
	}

	.summary-price strong {
		color: #7dd3fc;
		font-size: 16px;
		white-space: nowrap;
	}

	.alert {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 13px 15px;
		margin-bottom: 18px;
		border: 1px solid;
		border-radius: 10px;
		font-size: 12px;
		line-height: 1.6;
	}

	.alert-icon {
		display: grid;
		width: 19px;
		height: 19px;
		flex: 0 0 auto;
		place-items: center;
		border: 1px solid currentColor;
		border-radius: 50%;
		font-size: 11px;
		font-weight: 800;
	}

	.alert-success {
		border-color: #1e5b4a;
		background: #102d29;
		color: #6ee7b7;
	}

	.alert-error {
		border-color: #70404a;
		background: #2b2029;
		color: #fda4af;
	}

	.content-panel {
		overflow: hidden;
		border: 1px solid #27364c;
		border-radius: 14px;
		background: #111b2d;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 18px;
		padding: 20px 22px;
		border-bottom: 1px solid #27364c;
	}

	.panel-heading {
		display: flex;
		align-items: center;
		gap: 13px;
		min-width: 0;
	}

	.section-icon {
		width: 43px;
		height: 43px;
		border-radius: 11px;
	}

	.panel-heading h2 {
		margin: 0;
		color: #eaf1fb;
		font-size: 14px;
		font-weight: 800;
	}

	.panel-heading p {
		margin: 5px 0 0;
		color: #8fa1bb;
		font-size: 11px;
		line-height: 1.6;
	}

	.create-section {
		padding: 22px;
		border-bottom: 1px solid #27364c;
		background: #0e192a;
	}

	.form-heading {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 20px;
	}

	.form-step {
		display: grid;
		width: 36px;
		height: 36px;
		flex: 0 0 auto;
		place-items: center;
		border: 1px solid #244b68;
		border-radius: 9px;
		background: #10283b;
		color: #7dd3fc;
		font-size: 11px;
		font-weight: 800;
	}

	.form-heading h3 {
		margin: 0;
		color: #eaf1fb;
		font-size: 14px;
	}

	.form-heading p {
		margin: 5px 0 0;
		color: #8fa1bb;
		font-size: 11px;
	}

	.account-form {
		min-width: 0;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 17px;
	}

	.field {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 8px;
	}

	.field-full {
		grid-column: 1 / -1;
	}

	.field > span {
		color: #b9c8db;
		font-size: 11px;
		font-weight: 700;
	}

	.field > span b {
		color: #7dd3fc;
	}

	.field input,
	.field select,
	.field textarea {
		width: 100%;
		min-width: 0;
		min-height: 42px;
		padding: 11px 12px;
		border: 1px solid #2b3b53;
		border-radius: 8px;
		outline: none;
		background: #0b1424;
		color: #e5edf8;
		font: inherit;
		font-size: 12px;
		transition:
			border-color 150ms ease,
			box-shadow 150ms ease;
	}

	.field textarea {
		min-height: 82px;
		resize: vertical;
		line-height: 1.6;
	}

	.field input::placeholder,
	.field textarea::placeholder {
		color: #657790;
	}

	.field input:focus,
	.field select:focus,
	.field textarea:focus {
		border-color: #38bdf8;
		box-shadow: 0 0 0 3px #38bdf817;
	}

	.field select {
		cursor: pointer;
	}

	.field small {
		color: #71839c;
		font-size: 10px;
		line-height: 1.5;
	}

	.input-prefix {
		display: flex;
		min-height: 42px;
		align-items: center;
		gap: 9px;
		padding-left: 12px;
		border: 1px solid #2b3b53;
		border-radius: 8px;
		background: #0b1424;
		color: #7dd3fc;
		font-size: 12px;
		font-weight: 800;
	}

	.input-prefix:focus-within {
		border-color: #38bdf8;
		box-shadow: 0 0 0 3px #38bdf817;
	}

	.input-prefix input {
		min-height: 40px;
		padding-left: 0;
		border: 0;
		box-shadow: none;
		background: transparent;
	}

	.form-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 20px;
	}

	.account-list {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 20px;
	}

	.account-card {
		min-width: 0;
		padding: 18px;
		border: 1px solid #27364c;
		border-radius: 12px;
		background: #0e192a;
	}

	.account-card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 14px;
		padding-bottom: 16px;
		border-bottom: 1px solid #27364c;
	}

	.account-identity {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 12px;
	}

	.account-index {
		display: grid;
		width: 40px;
		height: 40px;
		flex: 0 0 auto;
		place-items: center;
		border: 1px solid #244b68;
		border-radius: 10px;
		background: #10283b;
		color: #7dd3fc;
		font-size: 12px;
		font-weight: 800;
	}

	.account-title {
		min-width: 0;
	}

	.account-title h3 {
		margin: 0;
		color: #eaf1fb;
		font-size: 14px;
		font-weight: 800;
		overflow-wrap: anywhere;
	}

	.account-id {
		display: block;
		margin-top: 6px;
		color: #71839c;
		font-size: 10px;
		overflow-wrap: anywhere;
	}

	.status-pill {
		display: inline-flex;
		flex: 0 0 auto;
		align-items: center;
		gap: 7px;
		padding: 6px 9px;
		border: 1px solid;
		border-radius: 7px;
		font-size: 10px;
		font-weight: 800;
		white-space: nowrap;
	}

	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: currentColor;
	}

	.status-available {
		border-color: #1e5b4a;
		background: #102d29;
		color: #6ee7b7;
	}

	.status-reserved {
		border-color: #70582a;
		background: #302718;
		color: #fcd34d;
	}

	.status-sold {
		border-color: #3b4d66;
		background: #1b293b;
		color: #a9bbd4;
	}

	.account-details {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 16px;
		padding: 17px 0;
	}

	.detail-item {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 7px;
	}

	.detail-item > span {
		color: #71839c;
		font-size: 10px;
	}

	.detail-item strong {
		color: #cbd8e9;
		font-size: 12px;
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.detail-item .price-value {
		color: #7dd3fc;
	}

	.account-notes {
		padding: 12px 13px;
		margin-bottom: 14px;
		border: 1px solid #27364c;
		border-radius: 8px;
		background: #111b2d;
	}

	.account-notes > span {
		color: #8fa1bb;
		font-size: 10px;
		font-weight: 700;
	}

	.account-notes p {
		margin: 6px 0 0;
		color: #cbd8e9;
		font-size: 12px;
		line-height: 1.7;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}

	.edit-details {
		border: 1px solid #27364c;
		border-radius: 9px;
		background: #111b2d;
	}

	.edit-details summary {
		display: flex;
		min-height: 44px;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 0 13px;
		color: #b9c8db;
		font-size: 11px;
		font-weight: 750;
		list-style: none;
		cursor: pointer;
	}

	.edit-details summary::-webkit-details-marker {
		display: none;
	}

	.edit-details summary > span {
		display: inline-flex;
		align-items: center;
		gap: 9px;
	}

	.edit-details summary svg {
		width: 16px;
		height: 16px;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.edit-details summary:hover {
		color: #7dd3fc;
	}

	.chevron {
		transition: transform 160ms ease;
	}

	.edit-details[open] .chevron {
		transform: rotate(180deg);
	}

	.edit-form {
		padding: 16px;
		border-top: 1px solid #27364c;
	}

	.delete-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		padding-top: 15px;
	}

	.delete-row > span {
		color: #71839c;
		font-size: 10px;
	}

	.delete-button {
		display: inline-flex;
		min-height: 34px;
		align-items: center;
		justify-content: center;
		gap: 7px;
		padding: 0 10px;
		border: 1px solid #593440;
		border-radius: 8px;
		background: #291b27;
		color: #fda4af;
		font: inherit;
		font-size: 10px;
		font-weight: 750;
		cursor: pointer;
		transition: 160ms ease;
	}

	.delete-button:hover {
		border-color: #fb7185;
		background: #3a202d;
	}

	.delete-button svg {
		width: 15px;
		height: 15px;
		stroke: currentColor;
		stroke-width: 1.7;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.empty-state {
		display: flex;
		min-height: 280px;
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
		margin: 16px 0 0;
		color: #e5edf8;
		font-size: 15px;
	}

	.empty-state p {
		max-width: 430px;
		margin: 8px 0 18px;
		color: #8fa1bb;
		font-size: 12px;
		line-height: 1.8;
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

	@media (max-width: 900px) {
		.account-details {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 640px) {
		.page {
			padding: 20px 14px;
		}

		.page-header {
			flex-direction: column;
			gap: 16px;
		}

		.back-button {
			align-self: flex-start;
		}

		.product-summary {
			flex-wrap: wrap;
			padding: 15px;
		}

		.summary-info {
			flex-basis: calc(100% - 70px);
		}

		.summary-price {
			flex-basis: 100%;
			align-items: flex-start;
			padding: 13px 0 0;
			border-top: 1px solid #27364c;
			border-left: 0;
		}

		.panel-header {
			align-items: flex-start;
			flex-direction: column;
			padding: 16px;
		}

		.panel-header > .button {
			width: 100%;
		}

		.create-section {
			padding: 16px;
		}

		.form-grid {
			grid-template-columns: minmax(0, 1fr);
			gap: 15px;
		}

		.field-full {
			grid-column: auto;
		}

		.account-list {
			padding: 12px;
		}

		.account-card {
			padding: 13px;
		}

		.account-card-header {
			flex-direction: column;
		}

		.account-details {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			gap: 17px 12px;
		}

		.edit-form {
			padding: 13px;
		}

		.delete-row {
			align-items: flex-start;
			flex-direction: column;
		}

		.delete-button {
			width: 100%;
			min-height: 39px;
		}

		.form-actions {
			flex-direction: column-reverse;
		}

		.form-actions .button {
			width: 100%;
		}
	}
</style>
