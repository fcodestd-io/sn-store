
<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let editingId = $state<string | null>(null);
	let createPreview = $state<string | null>(null);
	let editPreview = $state<string | null>(null);

	const rupiah = new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		maximumFractionDigits: 0
	});

	const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
	const maxImageSize = 2 * 1024 * 1024;

	function updatePreview(input: HTMLInputElement, mode: 'create' | 'edit') {
		const file = input.files?.[0] ?? null;

		if (mode === 'create') {
			if (createPreview) URL.revokeObjectURL(createPreview);
			createPreview = null;
		} else {
			if (editPreview) URL.revokeObjectURL(editPreview);
			editPreview = null;
		}

		if (!file) return;

		if (!allowedTypes.includes(file.type)) {
			input.value = '';
			alert('Pilih gambar berformat JPEG, PNG, atau WebP.');
			return;
		}

		if (file.size > maxImageSize) {
			input.value = '';
			alert('Ukuran gambar maksimal 2 MB.');
			return;
		}

		const preview = URL.createObjectURL(file);

		if (mode === 'create') {
			createPreview = preview;
		} else {
			editPreview = preview;
		}
	}

	function cancelEdit() {
		if (editPreview) URL.revokeObjectURL(editPreview);

		editPreview = null;
		editingId = null;
	}

	onDestroy(() => {
		if (createPreview) URL.revokeObjectURL(createPreview);
		if (editPreview) URL.revokeObjectURL(editPreview);
	});
</script>

<svelte:head>
	<title>Produk Digital | SN Store</title>
</svelte:head>

<header class="page-heading">
	<div>
		<div class="eyebrow">CATALOG MANAGEMENT</div>
		<h1>Produk digital</h1>
		<p>Kelola produk, harga, gambar, dan ketersediaan katalog.</p>
	</div>
	<span class="count-badge">{data.products.length} produk</span>
</header>

{#if form?.message}
	<div class="notice" role="alert"><span>!</span>{form.message}</div>
{/if}

{#if data.loadError}
	<div class="notice" role="alert"><span>!</span>{data.loadError}</div>
{/if}

<section class="panel">
	<div class="panel-heading">
		<div class="heading-icon">＋</div>
		<div>
			<h2>Tambah produk</h2>
			<p>Isi informasi produk yang akan dimasukkan ke katalog.</p>
		</div>
	</div>

	<form
		method="POST"
		action="?/create"
		enctype="multipart/form-data"
		class="form"
	>
		<label for="new-name">Nama produk <span>*</span></label>
		<input
			id="new-name"
			name="name"
			maxlength="160"
			placeholder="Contoh: Paket Premium 1 Bulan"
			required
		/>

		<div class="field-grid">
			<div class="field">
				<label for="new-category">Kategori</label>
				<select id="new-category" name="category_id">
					<option value="">Tanpa kategori</option>
					{#each data.categories as category (category.id)}
						<option value={category.id}>{category.name}</option>
					{/each}
				</select>
			</div>

			<div class="field">
				<label for="new-type">Jenis produk</label>
				<select id="new-type" name="product_type">
					<option value="digital">Produk digital</option>
					<option value="service">Layanan</option>
				</select>
			</div>
		</div>

		<div class="field-grid">
			<div class="field">
				<label for="new-price">Harga (Rupiah) <span>*</span></label>
				<div class="price-input">
					<span>Rp</span>
					<input
						id="new-price"
						name="price"
						type="number"
						min="0"
						step="1"
						inputmode="numeric"
						placeholder="15000"
						required
					/>
				</div>
			</div>

			<div class="field">
				<label for="new-stock">Stok <small>Opsional</small></label>
				<input
					id="new-stock"
					name="stock_quantity"
					type="number"
					min="0"
					step="1"
					inputmode="numeric"
					placeholder="Tidak dibatasi"
				/>
			</div>
		</div>

		<label for="new-image">Gambar produk <small>Opsional · JPEG, PNG, WebP · Maks. 2 MB</small></label>
		<input
			class="file-input"
			id="new-image"
			name="image"
			type="file"
			accept="image/jpeg,image/png,image/webp"
			onchange={(event) => updatePreview(event.currentTarget, 'create')}
		/>

		{#if createPreview}
			<div class="preview-box">
				<img src={createPreview} alt="Preview gambar produk baru" />
				<div>
					<strong>Preview gambar</strong>
					<p>Gambar akan diunggah ketika produk disimpan.</p>
					<button
						class="secondary-button"
						type="button"
						onclick={() => {
							const input = document.getElementById('new-image') as HTMLInputElement;
							input.value = '';
							if (createPreview) URL.revokeObjectURL(createPreview);
							createPreview = null;
						}}
					>
						Batalkan gambar
					</button>
				</div>
			</div>
		{/if}

		<label for="new-slug">Slug <small>Opsional, dibuat dari nama jika kosong</small></label>
		<input id="new-slug" name="slug" placeholder="paket-premium-1-bulan" />

		<label for="new-description">Deskripsi produk</label>
		<textarea
			id="new-description"
			name="description"
			rows="3"
			placeholder="Jelaskan fitur, masa aktif, ketentuan, dan informasi produk..."
		></textarea>

		<button class="primary-button" type="submit">
			<span>＋</span> Simpan produk
		</button>
	</form>
</section>

<section class="list-section">
	<div class="section-heading">
		<div>
			<div class="eyebrow">YOUR INVENTORY</div>
			<h2>Daftar produk</h2>
		</div>
		<span class="muted-count">{data.products.length} item</span>
	</div>

	{#if data.products.length === 0}
		<div class="empty-state">
			<div class="empty-icon">▤</div>
			<h3>Katalog masih kosong</h3>
			<p>Tambahkan produk pertama melalui formulir di atas.</p>
		</div>
	{:else}
		<div class="product-list">
			{#each data.products as product (product.id)}
				<article class="product-card">
					{#if editingId === product.id}
						<form
							method="POST"
							action="?/update"
							enctype="multipart/form-data"
							class="form edit-form"
						>
							<input type="hidden" name="id" value={product.id} />

							<label for={`name-${product.id}`}>Nama produk</label>
							<input
								id={`name-${product.id}`}
								name="name"
								value={product.name}
								maxlength="160"
								required
							/>

							<div class="field-grid">
								<div class="field">
									<label for={`category-${product.id}`}>Kategori</label>
									<select
										id={`category-${product.id}`}
										name="category_id"
										value={product.category_id ?? ''}
									>
										<option value="">Tanpa kategori</option>
										{#each data.categories as category (category.id)}
											<option value={category.id}>{category.name}</option>
										{/each}
									</select>
								</div>

								<div class="field">
									<label for={`type-${product.id}`}>Jenis produk</label>
									<select
										id={`type-${product.id}`}
										name="product_type"
										value={product.product_type}
									>
										<option value="digital">Produk digital</option>
										<option value="service">Layanan</option>
									</select>
								</div>
							</div>

							<div class="field-grid">
								<div class="field">
									<label for={`price-${product.id}`}>Harga (Rupiah)</label>
									<input
										id={`price-${product.id}`}
										name="price"
										type="number"
										min="0"
										step="1"
										inputmode="numeric"
										value={product.price}
										required
									/>
								</div>

								<div class="field">
									<label for={`stock-${product.id}`}>Stok</label>
									<input
										id={`stock-${product.id}`}
										name="stock_quantity"
										type="number"
										min="0"
										step="1"
										inputmode="numeric"
										value={product.stock_quantity ?? ''}
									/>
								</div>
							</div>

							<label for={`image-${product.id}`}>
								Ganti gambar
								<small>Biarkan kosong untuk mempertahankan gambar saat ini.</small>
							</label>

							<input
								class="file-input"
								id={`image-${product.id}`}
								name="image"
								type="file"
								accept="image/jpeg,image/png,image/webp"
								onchange={(event) => updatePreview(event.currentTarget, 'edit')}
							/>

							<div class="edit-preview">
								{#if editPreview}
									<img src={editPreview} alt="Preview gambar pengganti" />
									<button
										class="secondary-button"
										type="button"
										onclick={() => {
											const input = document.getElementById(
												`image-${product.id}`
											) as HTMLInputElement;
											input.value = '';
											if (editPreview) URL.revokeObjectURL(editPreview);
											editPreview = null;
										}}
									>
										Batal ganti gambar
									</button>
								{:else if product.image_url}
									<img src={product.image_url} alt={`Gambar ${product.name}`} />
									<span class="helper-text">Gambar saat ini</span>
								{:else}
									<div class="no-image">Belum ada gambar</div>
								{/if}
							</div>

							<label for={`slug-${product.id}`}>Slug</label>
							<input
								id={`slug-${product.id}`}
								name="slug"
								value={product.slug}
								maxlength="180"
								required
							/>

							<label for={`description-${product.id}`}>Deskripsi</label>
							<textarea
								id={`description-${product.id}`}
								name="description"
								rows="3"
							>{product.description ?? ''}</textarea>

							<label class="checkbox-row">
								<input
									type="checkbox"
									name="is_active"
									checked={product.is_active}
								/>
								<span>Produk aktif dan dapat ditampilkan di katalog publik</span>
							</label>

							<div class="button-row">
								<button class="primary-button" type="submit">
									Simpan perubahan
								</button>
								<button
									class="secondary-button"
									type="button"
									onclick={cancelEdit}
								>
									Batal
								</button>
							</div>
						</form>
					{:else}
						<div class="product-visual">
							{#if product.image_url}
								<img
									class="product-image"
									src={product.image_url}
									alt={`Gambar ${product.name}`}
									loading="lazy"
								/>
							{:else}
								<div class="product-placeholder">
									<span>SN</span>
									<small>DIGITAL PRODUCT</small>
								</div>
							{/if}

							<span class:inactive={!product.is_active} class="status">
								<span class="status-dot"></span>
								{product.is_active ? 'Aktif' : 'Nonaktif'}
							</span>
						</div>

						<div class="product-info">
							<div class="product-category">
								<span class="category-dot"></span>
								{product.categories?.name ?? 'Tanpa kategori'}
							</div>

							<h3>{product.name}</h3>

							{#if product.description}
								<p class="description">{product.description}</p>
							{:else}
								<p class="description empty-description">Belum ada deskripsi produk.</p>
							{/if}

							<div class="price-row">
								<div>
									<span class="price-label">HARGA JUAL</span>
									<strong class="price">{rupiah.format(product.price)}</strong>
								</div>
								<span class="type-badge">
									{product.product_type === 'digital' ? 'Digital' : 'Layanan'}
								</span>
							</div>

							<div class="product-meta">
								<span class="meta-icon">▦</span>
								{product.stock_quantity === null
									? 'Stok tidak dibatasi'
									: `Stok tersedia: ${product.stock_quantity}`}
							</div>
						</div>

						<div class="card-actions">
							<button
								class="secondary-button"
								type="button"
								onclick={() => {
									if (editPreview) URL.revokeObjectURL(editPreview);
									editPreview = null;
									editingId = product.id;
								}}
							>
								<span>✎</span> Ubah produk
							</button>

							<form
								method="POST"
								action="?/delete"
								onsubmit={(event) => {
									if (!confirm(`Hapus produk "${product.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
										event.preventDefault();
									}
								}}
							>
								<input type="hidden" name="id" value={product.id} />
								<button
									class="danger-button"
									type="submit"
									aria-label={`Hapus ${product.name}`}
								>
									Hapus
								</button>
							</form>
						</div>
					{/if}
				</article>
			{/each}
		</div>
	{/if}
</section>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	.page-heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 13px;
		margin-bottom: 24px;
	}

	.eyebrow {
		margin-bottom: 9px;
		color: #7dd3fc;
		font-size: 9px;
		font-weight: 850;
		letter-spacing: 1.5px;
	}

	h1 {
		margin: 0;
		color: #edf4ff;
		font-size: clamp(26px, 5vw, 33px);
		letter-spacing: -1px;
	}

	.page-heading p {
		max-width: 450px;
		margin: 9px 0 0;
		color: #8fa1bb;
		font-size: 12px;
		line-height: 1.8;
	}

	.count-badge,
	.muted-count {
		flex: 0 0 auto;
		padding: 8px 11px;
		border: 1px solid #2c4664;
		border-radius: 9px;
		background: #14263c;
		color: #a7dfff;
		font-size: 10px;
		font-weight: 750;
	}

	.panel,
	.product-card {
		min-width: 0;
		border: 1px solid #27364c;
		border-radius: 16px;
		background: #111b2d;
	}

	.panel {
		padding: 20px;
	}

	.panel-heading {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 21px;
	}

	.heading-icon,
	.empty-icon {
		display: grid;
		flex: 0 0 42px;
		width: 42px;
		height: 42px;
		place-items: center;
		border: 1px solid #294967;
		border-radius: 12px;
		background: #172d45;
		color: #7dd3fc;
		font-size: 23px;
	}

	h2 {
		margin: 0;
		color: #e5edf8;
		font-size: 17px;
		letter-spacing: -0.4px;
	}

	.panel-heading p {
		margin: 6px 0 0;
		color: #8294ad;
		font-size: 11px;
		line-height: 1.6;
	}

	.form {
		display: grid;
		gap: 9px;
	}

	.form > label,
	.field > label {
		margin-top: 5px;
		color: #cbd7e8;
		font-size: 12px;
		font-weight: 650;
	}

	.form label > span {
		color: #7dd3fc;
	}

	.form label small {
		display: block;
		margin-top: 4px;
		color: #8294ad;
		font-size: 10px;
		font-weight: 400;
		line-height: 1.6;
	}

	.form input:not([type='checkbox']):not([type='file']),
	.form select,
	.form textarea {
		width: 100%;
		min-width: 0;
		min-height: 46px;
		padding: 12px;
		border: 1px solid #2b3b53;
		border-radius: 10px;
		outline: none;
		background: #0b1424;
		color: #e5edf8;
		font-size: 13px;
	}

	.form textarea {
		min-height: 83px;
		resize: vertical;
	}

	.form input::placeholder,
	.form textarea::placeholder {
		color: #5e718d;
	}

	.form input:focus,
	.form select:focus,
	.form textarea:focus {
		border-color: #38bdf8;
		box-shadow: 0 0 0 3px rgb(56 189 248 / 9%);
	}

	.field-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}

	.field {
		display: grid;
		min-width: 0;
		gap: 9px;
	}

	.price-input {
		display: flex;
		align-items: center;
		min-width: 0;
		min-height: 46px;
		padding-left: 12px;
		border: 1px solid #2b3b53;
		border-radius: 10px;
		background: #0b1424;
	}

	.price-input > span {
		color: #7dd3fc;
		font-size: 12px;
		font-weight: 800;
	}

	.price-input input {
		border: 0 !important;
		background: transparent !important;
		box-shadow: none !important;
	}

	.file-input {
		width: 100%;
		min-width: 0;
		padding: 10px;
		border: 1px dashed #3a506d;
		border-radius: 10px;
		background: #0b1424;
		color: #b9c9dd;
		font-size: 11px;
	}

	.file-input::file-selector-button {
		margin-right: 10px;
		padding: 8px 10px;
		border: 1px solid #36506e;
		border-radius: 7px;
		background: #1a2b43;
		color: #d8e8fa;
		font-weight: 700;
		cursor: pointer;
	}

	button {
		min-height: 43px;
		padding: 10px 13px;
		border-radius: 10px;
		font-size: 11px;
		font-weight: 750;
		cursor: pointer;
	}

	.primary-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-top: 7px;
		border: 1px solid #38bdf8;
		background: #38bdf8;
		color: #062039;
	}

	.primary-button:hover {
		background: #7dd3fc;
	}

	.secondary-button {
		border: 1px solid #34465f;
		background: #17253a;
		color: #c3d5ea;
	}

	.secondary-button:hover {
		background: #20344e;
	}

	.danger-button {
		border: 1px solid #663745;
		background: #2c1c2a;
		color: #fda4af;
	}

	.danger-button:hover {
		background: #432333;
	}

	.preview-box {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 12px;
		border: 1px solid #304660;
		border-radius: 12px;
		background: #0d1727;
	}

	.preview-box img,
	.edit-preview img {
		display: block;
		width: 100px;
		height: 100px;
		flex: 0 0 100px;
		border-radius: 9px;
		object-fit: cover;
		background: #17253a;
	}

	.preview-box strong {
		color: #e5edf8;
		font-size: 12px;
	}

	.preview-box p {
		color: #8fa1bb;
		font-size: 11px;
		line-height: 1.6;
	}

	.preview-box .secondary-button {
		min-height: 35px;
	}

	.list-section {
		margin-top: 30px;
	}

	.section-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 15px;
	}

	.section-heading .eyebrow {
		margin-bottom: 7px;
	}

	.muted-count {
		padding: 0;
		border: 0;
		background: transparent;
		color: #8294ad;
	}

	.product-list {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 14px;
	}

	.product-card {
		overflow: hidden;
	}

	.product-visual {
		position: relative;
		height: 165px;
		overflow: hidden;
		background:
			radial-gradient(ellipse at 50% 10%, rgb(56 189 248 / 15%), transparent 60%),
			#15253b;
	}

	.product-image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.product-placeholder {
		display: flex;
		width: 100%;
		height: 100%;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		background:
			radial-gradient(ellipse at 50% 40%, rgb(56 189 248 / 13%), transparent 65%),
			linear-gradient(145deg, #192d47, #101a2b);
		color: #7dd3fc;
	}

	.product-placeholder > span {
		font-size: 37px;
		font-weight: 900;
		letter-spacing: -2px;
	}

	.product-placeholder > small {
		color: #7189a8;
		font-size: 8px;
		font-weight: 850;
		letter-spacing: 2px;
	}

	.status {
		position: absolute;
		top: 11px;
		right: 11px;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 9px;
		border: 1px solid #245044;
		border-radius: 999px;
		background: rgb(15 39 36 / 94%);
		color: #86efac;
		font-size: 9px;
		font-weight: 800;
	}

	.status.inactive {
		border-color: #465268;
		background: rgb(30 41 59 / 95%);
		color: #b6c1d1;
	}

	.status-dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: currentColor;
	}

	.product-info {
		padding: 15px 15px 0;
	}

	.product-category {
		display: flex;
		align-items: center;
		gap: 7px;
		color: #7ea6c9;
		font-size: 10px;
	}

	.category-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #38bdf8;
	}

	.product-info h3 {
		margin: 10px 0 6px;
		overflow-wrap: anywhere;
		color: #e5edf8;
		font-size: 14px;
		line-height: 1.55;
	}

	.description {
		display: -webkit-box;
		overflow: hidden;
		margin: 0;
		color: #8799b1;
		font-size: 11px;
		line-height: 1.8;
		overflow-wrap: anywhere;
		white-space: pre-line;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
	}

	.empty-description {
		color: #61748e;
		font-style: italic;
	}

	.price-row {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 8px;
		margin-top: 16px;
		padding-top: 13px;
		border-top: 1px solid #26354a;
	}

	.price-label {
		display: block;
		margin-bottom: 6px;
		color: #687f9d;
		font-size: 8px;
		font-weight: 850;
		letter-spacing: 1.1px;
	}

	.price {
		display: block;
		overflow-wrap: anywhere;
		color: #7dd3fc;
		font-size: 17px;
		letter-spacing: -0.4px;
	}

	.type-badge {
		flex: 0 0 auto;
		padding: 6px 8px;
		border: 1px solid #344563;
		border-radius: 7px;
		background: #1a2b43;
		color: #b6c9e0;
		font-size: 9px;
		font-weight: 750;
	}

	.product-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 12px;
		color: #8395ad;
		font-size: 10px;
		line-height: 1.5;
	}

	.meta-icon {
		color: #7ea6c9;
		font-size: 15px;
	}

	.card-actions {
		display: flex;
		gap: 8px;
		padding: 14px 15px 15px;
		margin-top: 13px;
		border-top: 1px solid #26354a;
	}

	.card-actions > button,
	.card-actions > form {
		flex: 1;
		min-width: 0;
	}

	.card-actions > form {
		display: flex;
	}

	.card-actions > form button {
		width: 100%;
	}

	.edit-form {
		padding: 15px;
	}

	.edit-preview {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
	}

	.helper-text {
		color: #8294ad;
		font-size: 11px;
	}

	.no-image {
		display: grid;
		width: 100px;
		height: 75px;
		place-items: center;
		border: 1px dashed #34465f;
		border-radius: 9px;
		color: #8294ad;
		font-size: 10px;
	}

	.button-row {
		display: flex;
		gap: 8px;
		margin-top: 9px;
	}

	.button-row > button {
		flex: 1;
		min-width: 0;
	}

	.checkbox-row {
		display: flex;
		align-items: flex-start;
		gap: 9px;
		line-height: 1.7;
	}

	.checkbox-row input {
		flex: 0 0 18px;
		width: 18px;
		height: 18px;
		margin-top: 1px;
		accent-color: #38bdf8;
	}

	.checkbox-row span {
		color: #cbd7e8;
		font-size: 12px;
	}

	.empty-state {
		padding: 35px 18px;
		border: 1px dashed #33445c;
		border-radius: 15px;
		background: #101a2a;
		text-align: center;
	}

	.empty-icon {
		margin: 0 auto 13px;
	}

	.empty-state h3 {
		margin: 0;
		color: #e5edf8;
		font-size: 14px;
	}

	.empty-state p {
		max-width: 290px;
		margin: 8px auto 0;
		color: #8799b1;
		font-size: 11px;
		line-height: 1.8;
	}

	.notice {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		margin-bottom: 16px;
		padding: 12px 14px;
		border: 1px solid #6b5030;
		border-radius: 11px;
		background: #302719;
		color: #f4d5a2;
		font-size: 12px;
		line-height: 1.7;
		overflow-wrap: anywhere;
	}

	.notice > span {
		display: grid;
		flex: 0 0 19px;
		width: 19px;
		height: 19px;
		place-items: center;
		border-radius: 50%;
		background: #72512d;
		color: #fff0d0;
		font-weight: 850;
	}

	@media (max-width: 850px) {
		.product-list {
			grid-template-columns: 1fr;
		}

		.product-visual {
			height: 185px;
		}
	}

	@media (max-width: 430px) {
		.panel {
			padding: 15px;
		}

		.field-grid {
			grid-template-columns: 1fr;
			gap: 9px;
		}

		.product-visual {
			height: 165px;
		}

		.product-info {
			padding-right: 13px;
			padding-left: 13px;
		}

		.card-actions {
			padding-right: 13px;
			padding-left: 13px;
		}

		.preview-box {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
