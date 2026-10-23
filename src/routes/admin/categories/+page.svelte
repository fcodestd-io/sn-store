<script lang="ts">
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let editingId = $state<string | null>(null);
</script>

<svelte:head>
	<title>Kategori | SN Store</title>
</svelte:head>

<header class="page-heading">
	<div>
		<div class="eyebrow">CATALOG MANAGEMENT</div>
		<h1>Kategori produk</h1>
		<p>Kelompokkan produk agar katalog lebih rapi dan mudah dijelajahi.</p>
	</div>
	<span class="count-badge">{data.categories.length} kategori</span>
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
			<h2>Tambah kategori</h2>
			<p>Buat kategori baru untuk mengelompokkan produk digital.</p>
		</div>
	</div>

	<form method="POST" action="?/create" class="form">
		<label for="new-name">Nama kategori <span>*</span></label>
		<input id="new-name" name="name" maxlength="80" placeholder="Contoh: Akun Premium" required />

		<label for="new-slug">Slug <small>Opsional, dibuat otomatis jika kosong</small></label>
		<input id="new-slug" name="slug" placeholder="akun-premium" />

		<label for="new-description">Deskripsi <small>Opsional</small></label>
		<textarea
			id="new-description"
			name="description"
			rows="3"
			placeholder="Deskripsi singkat kategori..."></textarea>

		<button class="primary-button" type="submit">
			<span>＋</span> Simpan kategori
		</button>
	</form>
</section>

<section class="list-section">
	<div class="section-heading">
		<div>
			<div class="eyebrow">YOUR CATALOG</div>
			<h2>Daftar kategori</h2>
		</div>
		<span class="muted-count">{data.categories.length} item</span>
	</div>

	{#if data.categories.length === 0}
		<div class="empty-state">
			<div class="empty-icon">◫</div>
			<h3>Belum ada kategori</h3>
			<p>Buat kategori pertama menggunakan formulir di atas.</p>
		</div>
	{:else}
		<div class="category-list">
			{#each data.categories as category (category.id)}
				<article class="category-card">
					{#if editingId === category.id}
						<form method="POST" action="?/update" class="form">
							<input type="hidden" name="id" value={category.id} />

							<label for={`name-${category.id}`}>Nama kategori</label>
							<input
								id={`name-${category.id}`}
								name="name"
								value={category.name}
								maxlength="80"
								required
							/>

							<label for={`slug-${category.id}`}>Slug</label>
							<input id={`slug-${category.id}`} name="slug" value={category.slug} required />

							<label for={`description-${category.id}`}>Deskripsi</label>
							<textarea id={`description-${category.id}`} name="description" rows="3"
								>{category.description ?? ''}</textarea
							>

							<label class="checkbox-row">
								<input type="checkbox" name="is_active" checked={category.is_active} />
								<span>Kategori aktif</span>
							</label>

							<div class="button-row">
								<button class="primary-button" type="submit">Simpan perubahan</button>
								<button class="secondary-button" type="button" onclick={() => (editingId = null)}
									>Batal</button
								>
							</div>
						</form>
					{:else}
						<div class="category-top">
							<div class="category-icon">◫</div>
							<div class="category-info">
								<h3>{category.name}</h3>
								<p>/{category.slug}</p>
							</div>
							<span class:inactive={!category.is_active} class="status">
								<span class="status-dot"></span>
								{category.is_active ? 'Aktif' : 'Nonaktif'}
							</span>
						</div>

						{#if category.description}
							<p class="description">{category.description}</p>
						{/if}

						<div class="card-footer">
							<span class="category-type">KATEGORI PRODUK</span>
							<div class="card-actions">
								<button
									class="secondary-button"
									type="button"
									onclick={() => (editingId = category.id)}>Ubah</button
								>

								<form
									method="POST"
									action="?/delete"
									onsubmit={(event) => {
										if (!confirm(`Hapus kategori "${category.name}"?`)) {
											event.preventDefault();
										}
									}}
								>
									<input type="hidden" name="id" value={category.id} />
									<button class="danger-button" type="submit">Hapus</button>
								</form>
							</div>
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
	.category-card {
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
	.category-icon,
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

	.form > label {
		margin-top: 5px;
		color: #cbd7e8;
		font-size: 12px;
		font-weight: 650;
	}

	.form > label > span {
		color: #7dd3fc;
	}

	.form label small {
		display: block;
		margin-top: 4px;
		color: #7387a3;
		font-size: 10px;
		font-weight: 400;
	}

	.form input:not([type='checkbox']),
	.form textarea {
		width: 100%;
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
	.form textarea:focus {
		border-color: #38bdf8;
		box-shadow: 0 0 0 3px rgb(56 189 248 / 9%);
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

	.category-list {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 13px;
	}

	.category-card {
		padding: 16px;
	}

	.category-top {
		display: flex;
		align-items: center;
		gap: 11px;
		min-width: 0;
	}

	.category-icon {
		flex-basis: 40px;
		width: 40px;
		height: 40px;
	}

	.category-info {
		flex: 1;
		min-width: 0;
	}

	.category-info h3 {
		margin: 0;
		overflow-wrap: anywhere;
		color: #e6eef9;
		font-size: 13px;
		line-height: 1.5;
	}

	.category-info p {
		margin: 5px 0 0;
		overflow-wrap: anywhere;
		color: #8294ad;
		font-size: 10px;
	}

	.status {
		display: inline-flex;
		flex: 0 0 auto;
		align-items: center;
		gap: 5px;
		padding: 5px 7px;
		border: 1px solid #245044;
		border-radius: 999px;
		background: #142d2b;
		color: #86efac;
		font-size: 9px;
		font-weight: 750;
	}

	.status.inactive {
		border-color: #3a4557;
		background: #202b3b;
		color: #9aa9bc;
	}

	.status-dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: currentColor;
	}

	.description {
		margin: 13px 0 0;
		color: #8d9db3;
		font-size: 11px;
		line-height: 1.8;
		overflow-wrap: anywhere;
	}

	.card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 16px;
		padding-top: 13px;
		border-top: 1px solid #26354a;
	}

	.category-type {
		color: #687f9d;
		font-size: 8px;
		font-weight: 800;
		letter-spacing: 1px;
	}

	.card-actions,
	.button-row {
		display: flex;
		gap: 7px;
	}

	.card-actions form {
		display: flex;
	}

	.button-row > button {
		flex: 1;
	}

	.checkbox-row {
		display: flex;
		align-items: center;
		gap: 9px;
		min-height: 38px;
	}

	.checkbox-row input {
		width: 18px;
		height: 18px;
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
		text-align: center;
		background: #101a2a;
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

	@media (max-width: 850px) {
		.category-list {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 430px) {
		.panel {
			padding: 15px;
		}

		.category-card {
			padding: 13px;
		}

		.category-top {
			flex-wrap: wrap;
		}

		.status {
			margin-left: auto;
		}

		.card-footer {
			align-items: flex-start;
			flex-direction: column;
		}

		.card-actions {
			width: 100%;
		}

		.card-actions > button,
		.card-actions > form {
			flex: 1;
		}

		.card-actions form button {
			width: 100%;
		}
	}
</style>
