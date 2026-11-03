<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let editingId = $state<string | null>(null);
	let command = $state('');
	let response = $state('');
	let isActive = $state(true);
	let deleteId = $state<string | null>(null);

	function editCommand(item: (typeof data.commands)[number]) {
		editingId = item.id;
		command = item.command;
		response = item.response;
		isActive = item.is_active;
		deleteId = null;
	}

	function resetForm() {
		editingId = null;
		command = '';
		response = '';
		isActive = true;
	}

	function formatDate(value: string) {
		return new Intl.DateTimeFormat('id-ID', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(value));
	}
</script>

<svelte:head>
	<title>Telegram Commands | SN Store</title>
	<meta name="description" content="Kelola command dan respons Telegram bot SN Store." />
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<div class="header-content">
			<div class="breadcrumb">
				<span>Admin</span>
				<span class="breadcrumb-separator">/</span>
				<span>Telegram</span>
				<span class="breadcrumb-separator">/</span>
				<span class="breadcrumb-current">Commands</span>
			</div>

			<h1>Telegram Commands</h1>
			<p class="page-description">
				Kelola perintah dan respons otomatis untuk Telegram bot SN Store.
			</p>
		</div>

		<div class="header-summary">
			<div class="summary-icon">
				<svg
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M21.5 2 14.5 22l-4-9-9-4 20-7Z" />
					<path d="M21.5 2 10.5 13" />
				</svg>
			</div>
			<div>
				<span class="summary-label">Total Commands</span>
				<strong class="summary-value">{data.commands.length}</strong>
			</div>
		</div>
	</header>

	{#if data.loadError}
		<div class="alert alert-error" role="alert">
			<strong>Gagal memuat data</strong>
			<p>{data.loadError}</p>
		</div>
	{/if}

	{#if form?.message}
		<div class="alert alert-error" role="alert">
			<strong>Operasi gagal</strong>
			<p>{form.message}</p>
		</div>
	{/if}

	<div class="content-grid">
		<section class="panel editor-panel">
			<div class="panel-header">
				<div class="panel-heading-icon">
					{#if editingId}
						<svg
							width="19"
							height="19"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M12 20h9" />
							<path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
						</svg>
					{:else}
						<svg
							width="19"
							height="19"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M12 5v14M5 12h14" />
						</svg>
					{/if}
				</div>

				<div>
					<h2>{editingId ? 'Edit Command' : 'Create Command'}</h2>
					<p>
						{editingId ? 'Perbarui informasi command.' : 'Tambahkan command baru ke bot.'}
					</p>
				</div>
			</div>

			<form
				method="POST"
				action={editingId ? '?/update' : '?/create'}
				use:enhance={() => {
					return async ({ update }) => {
						await update({ reset: false });
						if (!form?.message) resetForm();
					};
				}}
			>
				{#if editingId}
					<input type="hidden" name="id" value={editingId} />
				{/if}

				<div class="form-field">
					<label for="command">Command Name</label>
					<div class="command-input">
						<span class="command-prefix">/</span>
						<input
							id="command"
							name="command"
							bind:value={command}
							type="text"
							placeholder="contoh: produk"
							maxlength="32"
							pattern="[a-zA-Z0-9_]+"
							autocomplete="off"
							required
						/>
					</div>
					<span class="field-hint"> Huruf kecil, angka, dan underscore. Tanpa tanda slash. </span>
				</div>

				<div class="form-field">
					<div class="label-row">
						<label for="response">Response Message</label>
						<span class="optional-label">Maks. 4000 karakter</span>
					</div>
					<textarea
						id="response"
						name="response"
						bind:value={response}
						placeholder="Tulis pesan yang akan dikirim oleh bot..."
						rows="7"
						maxlength="4000"
						required></textarea>
					<div class="textarea-footer">
						<span>Pesan mendukung teks multi-baris.</span>
						<span>{response.length}/4000</span>
					</div>
				</div>

				<label class="status-setting">
					<span class="status-setting-copy">
						<strong>Command Status</strong>
						<span>Aktifkan atau nonaktifkan command.</span>
					</span>
					<input class="status-checkbox" type="checkbox" name="is_active" bind:checked={isActive} />
					<span class="switch" aria-hidden="true"></span>
				</label>

				<div class="form-actions">
					{#if editingId}
						<button class="button button-secondary" type="button" onclick={resetForm}>
							Cancel
						</button>
					{/if}

					<button class="button button-primary" type="submit">
						{#if editingId}
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<path d="M20 6 9 17l-5-5" />
							</svg>
							Save Changes
						{:else}
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<path d="M12 5v14M5 12h14" />
							</svg>
							Create Command
						{/if}
					</button>
				</div>
			</form>

			<div class="template-info">
				<div class="template-info-icon">
					<svg
						width="17"
						height="17"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M12 16v-4M12 8h.01" />
					</svg>
				</div>
				<div>
					<strong>Dynamic Template</strong>
					<p>
						Gunakan <code>{'{{product_catalog}}'}</code> untuk menampilkan katalog produk secara dinamis
						jika didukung handler bot.
					</p>
				</div>
			</div>
		</section>

		<section class="panel commands-panel">
			<div class="panel-header commands-header">
				<div class="panel-heading-icon cyan-icon">
					<svg
						width="19"
						height="19"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M8 6h13M8 12h13M8 18h13" />
						<path d="M3 6h.01M3 12h.01M3 18h.01" />
					</svg>
				</div>

				<div class="commands-heading-text">
					<h2>Command List</h2>
					<p>Daftar command yang tersimpan.</p>
				</div>

				<span class="total-badge">{data.commands.length} total</span>
			</div>

			{#if data.commands.length === 0}
				<div class="empty-state">
					<div class="empty-icon">
						<svg
							width="27"
							height="27"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.6"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M21.5 2 14.5 22l-4-9-9-4 20-7Z" />
							<path d="M21.5 2 10.5 13" />
						</svg>
					</div>
					<h3>No commands yet</h3>
					<p>Command yang ditambahkan akan muncul di sini.</p>
				</div>
			{:else}
				<div class="command-list">
					{#each data.commands as item (item.id)}
						<article class:command-inactive={!item.is_active} class="command-card">
							<div class="command-card-header">
								<div class="command-name">
									<span class="slash">/</span>
									<h3>{item.command}</h3>
								</div>

								<span class:badge-inactive={!item.is_active} class="status-badge">
									<span class="status-indicator"></span>
									{item.is_active ? 'Active' : 'Inactive'}
								</span>
							</div>

							<div class="response-content">
								<p>{item.response}</p>
							</div>

							{#if item.response.includes('{{product_catalog}}')}
								<div class="template-badge">
									<span class="template-dot"></span>
									Dynamic product catalog
								</div>
							{/if}

							<div class="command-card-footer">
								<span class="updated-at">
									<svg
										width="13"
										height="13"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.8"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<circle cx="12" cy="12" r="10" />
										<path d="M12 6v6l4 2" />
									</svg>
									{formatDate(item.updated_at)}
								</span>

								<div class="command-actions">
									<button
										class="icon-button edit-button"
										type="button"
										title="Edit command"
										aria-label={`Edit command ${item.command}`}
										onclick={() => editCommand(item)}
									>
										<svg
											width="15"
											height="15"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="1.8"
											stroke-linecap="round"
											stroke-linejoin="round"
											aria-hidden="true"
										>
											<path d="M12 20h9" />
											<path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
										</svg>
									</button>

									<form method="POST" action="?/toggle" use:enhance>
										<input type="hidden" name="id" value={item.id} />
										<input type="hidden" name="is_active" value={String(!item.is_active)} />
										<button
											class="icon-button toggle-button"
											type="submit"
											title={item.is_active ? 'Nonaktifkan command' : 'Aktifkan command'}
											aria-label={`${item.is_active ? 'Nonaktifkan' : 'Aktifkan'} command ${item.command}`}
										>
											{#if item.is_active}
												<svg
													width="15"
													height="15"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="1.8"
													stroke-linecap="round"
													stroke-linejoin="round"
													aria-hidden="true"
												>
													<rect x="3" y="3" width="18" height="18" rx="3" />
													<path d="M9 9v6M15 9v6" />
												</svg>
											{:else}
												<svg
													width="15"
													height="15"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="1.8"
													stroke-linecap="round"
													stroke-linejoin="round"
													aria-hidden="true"
												>
													<path d="m5 12 4 4L19 6" />
												</svg>
											{/if}
										</button>
									</form>

									{#if deleteId === item.id}
										<form method="POST" action="?/delete" use:enhance>
											<input type="hidden" name="id" value={item.id} />
											<button
												class="icon-button delete-confirm-button"
												type="submit"
												title="Konfirmasi hapus"
												aria-label={`Konfirmasi hapus ${item.command}`}
											>
												<svg
													width="15"
													height="15"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="1.8"
													stroke-linecap="round"
													stroke-linejoin="round"
													aria-hidden="true"
												>
													<path d="M20 6 9 17l-5-5" />
												</svg>
											</button>
											<button
												class="icon-button cancel-delete-button"
												type="button"
												title="Batal hapus"
												aria-label="Batal hapus"
												onclick={() => (deleteId = null)}
											>
												×
											</button>
										</form>
									{:else}
										<button
											class="icon-button delete-button"
											type="button"
											title="Hapus command"
											aria-label={`Hapus command ${item.command}`}
											onclick={() => {
												deleteId = item.id;
											}}
										>
											<svg
												width="15"
												height="15"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="1.8"
												stroke-linecap="round"
												stroke-linejoin="round"
												aria-hidden="true"
											>
												<path d="M3 6h18" />
												<path d="m19 6-1 14H6L5 6" />
												<path d="M10 11v6M14 11v6" />
												<path d="M9 6V4h6v2" />
											</svg>
										</button>
									{/if}
								</div>
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</section>
	</div>
</div>
```

<style>
	:global(body) {
		background: #0b1120;
		color: #e5eaf4;
	}

	:global(*) {
		box-sizing: border-box;
	}

	.page-container {
		width: 100%;
		max-width: 1600px;
		margin: 0 auto;
		padding: 32px;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		margin-bottom: 30px;
	}

	.breadcrumb {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 9px;
		margin-bottom: 14px;
		color: #7d8ba5;
		font-size: 12px;
	}

	.breadcrumb-separator {
		color: #46536c;
	}

	.breadcrumb-current {
		color: #56c9e8;
	}

	.page-header h1 {
		margin: 0;
		color: #f3f6fc;
		font-size: clamp(26px, 3vw, 34px);
		font-weight: 750;
		letter-spacing: -0.04em;
	}

	.page-description {
		margin: 9px 0 0;
		color: #8e9bb1;
		font-size: 14px;
		line-height: 1.65;
	}

	.header-summary {
		display: flex;
		min-width: 170px;
		align-items: center;
		gap: 13px;
		padding: 16px 18px;
		border: 1px solid #25334a;
		border-radius: 13px;
		background: #111b2d;
	}

	.summary-icon,
	.panel-heading-icon {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		border: 1px solid #21465b;
		border-radius: 10px;
		background: #102b3d;
		color: #56c9e8;
	}

	.summary-icon {
		width: 43px;
		height: 43px;
	}

	.header-summary > div:last-child {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.summary-label {
		color: #91a0b7;
		font-size: 11px;
	}

	.summary-value {
		color: #f3f6fc;
		font-size: 23px;
		font-weight: 750;
	}

	.content-grid {
		display: grid;
		grid-template-columns: minmax(300px, 0.86fr) minmax(0, 1.35fr);
		align-items: start;
		gap: 22px;
	}

	.panel {
		min-width: 0;
		overflow: hidden;
		border: 1px solid #25334a;
		border-radius: 15px;
		background: #111a2b;
		box-shadow: 0 12px 32px rgb(0 0 0 / 10%);
	}

	.editor-panel {
		padding: 24px;
	}

	.commands-panel {
		padding: 24px;
	}

	.panel-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 26px;
	}

	.panel-heading-icon {
		width: 42px;
		height: 42px;
	}

	.panel-header h2 {
		margin: 0;
		color: #eef3fb;
		font-size: 16px;
		font-weight: 700;
		letter-spacing: -0.015em;
	}

	.panel-header p {
		margin: 5px 0 0;
		color: #8492a9;
		font-size: 12px;
		line-height: 1.5;
	}

	.cyan-icon {
		border-color: #21465b;
		background: #102b3d;
		color: #56c9e8;
	}

	.form-field {
		margin-bottom: 22px;
	}

	.form-field label {
		display: block;
		margin-bottom: 9px;
		color: #dce5f3;
		font-size: 12px;
		font-weight: 650;
	}

	.command-input {
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 0 13px;
		border: 1px solid #2b3a51;
		border-radius: 9px;
		background: #0c1423;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
	}

	.command-input:focus-within {
		border-color: #36b9dc;
		box-shadow: 0 0 0 3px rgb(54 185 220 / 10%);
	}

	.command-prefix {
		color: #56c9e8;
		font-size: 15px;
		font-weight: 750;
	}

	.command-input input {
		width: 100%;
		min-width: 0;
		height: 43px;
		border: 0;
		outline: 0;
		background: transparent;
		color: #edf4ff;
		font: inherit;
		font-size: 13px;
	}

	input::placeholder,
	textarea::placeholder {
		color: #59677e;
	}

	.field-hint {
		display: block;
		margin-top: 8px;
		color: #71819a;
		font-size: 11px;
		line-height: 1.6;
	}

	.label-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}

	.optional-label {
		color: #6f7e95;
		font-size: 10px;
	}

	textarea {
		display: block;
		width: 100%;
		min-height: 145px;
		padding: 12px;
		resize: vertical;
		border: 1px solid #2b3a51;
		border-radius: 9px;
		outline: none;
		background: #0c1423;
		color: #e5eaf4;
		font: inherit;
		font-size: 12px;
		line-height: 1.7;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
	}

	textarea:focus {
		border-color: #36b9dc;
		box-shadow: 0 0 0 3px rgb(54 185 220 / 10%);
	}

	.textarea-footer {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		margin-top: 8px;
		color: #71819a;
		font-size: 10px;
	}

	.status-setting {
		position: relative;
		display: flex;
		align-items: center;
		gap: 15px;
		padding: 16px 0;
		border-top: 1px solid #263349;
		border-bottom: 1px solid #263349;
		cursor: pointer;
	}

	.status-setting-copy {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 5px;
	}

	.status-setting-copy strong {
		color: #e2eaf6;
		font-size: 12px;
	}

	.status-setting-copy > span {
		color: #8190a8;
		font-size: 11px;
		line-height: 1.5;
	}

	.status-checkbox {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
	}

	.switch {
		position: relative;
		width: 39px;
		height: 22px;
		flex: 0 0 auto;
		border: 1px solid #3b4860;
		border-radius: 30px;
		background: #283449;
		transition: background 0.2s;
	}

	.switch::after {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #9ba8bb;
		content: '';
		transition:
			transform 0.2s,
			background 0.2s;
	}

	.status-checkbox:checked + .switch {
		border-color: #2386a2;
		background: #11627a;
	}

	.status-checkbox:checked + .switch::after {
		transform: translateX(17px);
		background: #e9fbff;
	}

	.status-checkbox:focus-visible + .switch {
		outline: 3px solid rgb(86 201 232 / 30%);
		outline-offset: 3px;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 9px;
		margin-top: 22px;
	}

	.button {
		display: inline-flex;
		min-height: 38px;
		align-items: center;
		justify-content: center;
		gap: 7px;
		padding: 9px 13px;
		border: 1px solid transparent;
		border-radius: 8px;
		font: inherit;
		font-size: 11px;
		font-weight: 700;
		cursor: pointer;
		transition:
			background 0.15s,
			border-color 0.15s,
			transform 0.15s;
	}

	.button:active {
		transform: translateY(1px);
	}

	.button:focus-visible,
	.icon-button:focus-visible {
		outline: 3px solid rgb(86 201 232 / 35%);
		outline-offset: 2px;
	}

	.button-primary {
		border-color: #29a9ca;
		background: #1497b8;
		color: #f4fcff;
	}

	.button-primary:hover {
		border-color: #48c7e5;
		background: #18a8cb;
	}

	.button-secondary {
		border-color: #35445c;
		background: #182439;
		color: #c4cfdf;
	}

	.button-secondary:hover {
		background: #202e45;
	}

	.template-info {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		margin-top: 23px;
		padding: 13px;
		border: 1px solid #24465b;
		border-radius: 10px;
		background: #102334;
	}

	.template-info-icon {
		display: flex;
		flex: 0 0 auto;
		padding-top: 1px;
		color: #56c9e8;
	}

	.template-info strong {
		color: #b7eafa;
		font-size: 11px;
	}

	.template-info p {
		margin: 6px 0 0;
		color: #91abc1;
		font-size: 11px;
		line-height: 1.7;
		overflow-wrap: anywhere;
	}

	.template-info code {
		padding: 2px 5px;
		border: 1px solid #29475a;
		border-radius: 4px;
		background: #0b1b2a;
		color: #73d9ef;
		font-size: 10px;
	}

	.commands-header {
		margin-bottom: 23px;
	}

	.commands-heading-text {
		min-width: 0;
		flex: 1;
	}

	.total-badge {
		padding: 6px 9px;
		border: 1px solid #2b4359;
		border-radius: 6px;
		background: #14273a;
		color: #74d6ed;
		font-size: 10px;
		font-weight: 700;
		white-space: nowrap;
	}

	.command-list {
		display: grid;
		gap: 12px;
	}

	.command-card {
		min-width: 0;
		padding: 16px;
		border: 1px solid #29374d;
		border-radius: 11px;
		background: #0e1727;
		transition:
			border-color 0.15s,
			background 0.15s;
	}

	.command-card:hover {
		border-color: #3a526a;
		background: #111d2f;
	}

	.command-card.command-inactive {
		opacity: 0.76;
	}

	.command-card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 13px;
	}

	.command-name {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 5px;
	}

	.slash {
		color: #56c9e8;
		font-size: 15px;
		font-weight: 750;
	}

	.command-name h3 {
		margin: 0;
		overflow-wrap: anywhere;
		color: #e9f0fb;
		font-size: 14px;
		font-weight: 700;
	}

	.status-badge {
		display: inline-flex;
		flex: 0 0 auto;
		align-items: center;
		gap: 6px;
		padding: 5px 8px;
		border: 1px solid #245343;
		border-radius: 6px;
		background: #122d28;
		color: #80d6b0;
		font-size: 10px;
		font-weight: 650;
	}

	.status-indicator {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #61d5a1;
		box-shadow: 0 0 7px rgb(97 213 161 / 30%);
	}

	.status-badge.badge-inactive {
		border-color: #3b4658;
		background: #202a3a;
		color: #9ba8bb;
	}

	.badge-inactive .status-indicator {
		background: #8491a4;
		box-shadow: none;
	}

	.response-content {
		padding: 11px 12px;
		border: 1px solid #222f44;
		border-radius: 7px;
		background: #0b1321;
	}

	.response-content p {
		display: -webkit-box;
		margin: 0;
		overflow: hidden;
		color: #a8b6ca;
		font-size: 11px;
		line-height: 1.75;
		overflow-wrap: anywhere;
		white-space: pre-wrap;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 5;
	}

	.template-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		margin-top: 10px;
		padding: 5px 7px;
		border: 1px solid #4a4229;
		border-radius: 5px;
		background: #2b271b;
		color: #d9c58d;
		font-size: 10px;
	}

	.template-dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: #dfc36c;
	}

	.command-card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-top: 13px;
		padding-top: 12px;
		border-top: 1px solid #222e42;
	}

	.updated-at {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: #77869e;
		font-size: 10px;
	}

	.command-actions {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.command-actions form {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.icon-button {
		display: grid;
		width: 31px;
		height: 31px;
		flex: 0 0 auto;
		place-items: center;
		border: 1px solid #34435a;
		border-radius: 7px;
		background: #182438;
		color: #9eafc6;
		cursor: pointer;
		transition:
			color 0.15s,
			border-color 0.15s,
			background 0.15s;
	}

	.edit-button:hover {
		border-color: #237e9a;
		background: #123347;
		color: #63d4ef;
	}

	.toggle-button:hover {
		border-color: #60718b;
		background: #25334a;
		color: #e1e9f5;
	}

	.delete-button:hover,
	.delete-confirm-button:hover {
		border-color: #97474c;
		background: #3a202d;
		color: #ff9caa;
	}

	.delete-confirm-button {
		border-color: #8e4148;
		background: #351e2b;
		color: #ff9caa;
	}

	.cancel-delete-button {
		font-size: 20px;
	}

	.empty-state {
		display: flex;
		min-height: 270px;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 28px;
		text-align: center;
	}

	.empty-icon {
		display: grid;
		width: 54px;
		height: 54px;
		margin-bottom: 17px;
		place-items: center;
		border: 1px solid #264458;
		border-radius: 14px;
		background: #10283a;
		color: #56c9e8;
	}

	.empty-state h3 {
		margin: 0 0 7px;
		color: #e3ebf8;
		font-size: 14px;
	}

	.empty-state p {
		max-width: 260px;
		margin: 0;
		color: #8190a8;
		font-size: 12px;
		line-height: 1.7;
	}

	.alert {
		margin-bottom: 20px;
		padding: 14px 16px;
		border: 1px solid;
		border-radius: 10px;
		font-size: 12px;
		line-height: 1.6;
	}

	.alert strong {
		display: block;
		margin-bottom: 3px;
	}

	.alert p {
		margin: 0;
	}

	.alert-error {
		border-color: #713c4b;
		background: #2d1b2b;
		color: #ffb4c0;
	}

	@media (max-width: 1100px) {
		.page-container {
			padding: 24px;
		}

		.content-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 600px) {
		.page-container {
			padding: 18px 13px;
		}

		.page-header {
			align-items: flex-start;
		}

		.header-summary {
			min-width: auto;
			padding: 10px;
		}

		.summary-icon {
			width: 35px;
			height: 35px;
		}

		.summary-label {
			font-size: 10px;
		}

		.summary-value {
			font-size: 19px;
		}

		.editor-panel,
		.commands-panel {
			padding: 16px;
		}

		.command-card {
			padding: 12px;
		}

		.command-card-footer {
			align-items: flex-start;
		}

		.updated-at {
			max-width: 60%;
			line-height: 1.5;
		}

		.form-actions {
			flex-direction: column-reverse;
		}

		.form-actions .button {
			width: 100%;
		}
	}
</style>
