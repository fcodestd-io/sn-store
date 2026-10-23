<script lang="ts">
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let showPassword = $state(false);
</script>

<svelte:head>
	<title>Login Admin | SN Store</title>
	<meta name="theme-color" content="#0B1120" />
	<meta name="description" content="Login ke dashboard administrator SN Store." />
</svelte:head>

<main class="login-page">
	<div class="ambient ambient-one"></div>
	<div class="ambient ambient-two"></div>

	<section class="login-card">
		<a href="/login" class="brand" aria-label="SN Store">
			<span class="brand-icon">SN</span>
			<span class="brand-text">
				<strong>SN Store</strong>
				<small>DIGITAL COMMERCE</small>
			</span>
		</a>

		<div class="login-intro">
			<div class="eyebrow"><span class="status-dot"></span> ADMIN WORKSPACE</div>
			<h1>Selamat datang<br />kembali.</h1>
			<p>Masuk untuk mengelola produk dan operasional toko digital Anda.</p>
		</div>

		{#if form?.message}
			<div class="error-message" role="alert">
				<span class="error-icon">!</span>
				<span>{form.message}</span>
			</div>
		{/if}

		<form method="POST" class="login-form">
			<div class="field">
				<label for="email">Alamat email</label>
				<div class="input-wrap">
					<span class="input-icon" aria-hidden="true">✉</span>
					<input
						id="email"
						name="email"
						type="email"
						placeholder="admin@contoh.com"
						autocomplete="username"
						inputmode="email"
						required
					/>
				</div>
			</div>

			<div class="field">
				<div class="label-row">
					<label for="password">Password</label>
					<span class="secure-label">Akses aman</span>
				</div>
				<div class="input-wrap">
					<span class="input-icon lock-icon" aria-hidden="true">⌑</span>
					<input
						id="password"
						name="password"
						type={showPassword ? 'text' : 'password'}
						placeholder="Masukkan password"
						autocomplete="current-password"
						required
					/>
					<button
						class="password-toggle"
						type="button"
						onclick={() => (showPassword = !showPassword)}
						aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
					>
						{showPassword ? 'Sembunyikan' : 'Lihat'}
					</button>
				</div>
			</div>

			<button class="submit-button" type="submit">
				<span>Masuk ke dashboard</span>
				<span class="submit-arrow">→</span>
			</button>
		</form>

		<div class="login-footer">
			<span class="shield">◇</span>
			<span>Akses khusus administrator</span>
		</div>
	</section>

	<footer class="page-footer">
		<span>© {new Date().getFullYear()} SN Store</span>
		<span>Digital products, made simple.</span>
	</footer>
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(html) {
		min-width: 320px;
		min-height: 100%;
		background: #0b1120;
	}

	:global(body) {
		margin: 0;
		font-family:
			Inter,
			ui-sans-serif,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
		color: #e8eef8;
		-webkit-font-smoothing: antialiased;
	}

	:global(button),
	:global(input) {
		font: inherit;
	}

	.login-page {
		position: relative;
		display: flex;
		min-height: 100svh;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		padding: 28px 18px 18px;
		background: radial-gradient(ellipse at 50% 0%, rgb(37 74 126 / 24%), transparent 52%), #0b1120;
	}

	.ambient {
		position: absolute;
		width: 240px;
		height: 240px;
		border-radius: 50%;
		filter: blur(90px);
		opacity: 0.13;
		pointer-events: none;
	}

	.ambient-one {
		top: 5%;
		left: -120px;
		background: #38bdf8;
	}

	.ambient-two {
		right: -120px;
		bottom: 5%;
		background: #6366f1;
	}

	.login-card {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: 430px;
		padding: 29px 23px 22px;
		border: 1px solid #26344b;
		border-radius: 22px;
		background: rgb(17 26 43 / 94%);
		box-shadow: 0 28px 90px rgb(0 0 0 / 25%);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 11px;
		color: inherit;
		text-decoration: none;
	}

	.brand-icon {
		display: grid;
		width: 43px;
		height: 43px;
		place-items: center;
		border: 1px solid rgb(125 211 252 / 25%);
		border-radius: 13px;
		background: linear-gradient(145deg, #1d496c, #17314f);
		color: #a5e5ff;
		font-size: 14px;
		font-weight: 900;
		letter-spacing: -0.7px;
	}

	.brand-text {
		display: grid;
		gap: 4px;
	}

	.brand-text strong {
		font-size: 16px;
		letter-spacing: -0.4px;
	}

	.brand-text small {
		color: #8294af;
		font-size: 9px;
		font-weight: 750;
		letter-spacing: 1.6px;
	}

	.login-intro {
		margin: 39px 0 25px;
	}

	.eyebrow {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #8fb6d8;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 1.5px;
	}

	.status-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #38bdf8;
		box-shadow: 0 0 12px rgb(56 189 248 / 60%);
	}

	h1 {
		margin: 17px 0 12px;
		font-size: clamp(30px, 8vw, 38px);
		font-weight: 750;
		line-height: 1.13;
		letter-spacing: -1.6px;
	}

	.login-intro p {
		margin: 0;
		color: #93a3ba;
		font-size: 13px;
		line-height: 1.8;
	}

	.login-form {
		display: grid;
		gap: 19px;
	}

	.field {
		display: grid;
		gap: 9px;
	}

	.field label {
		color: #d6dfed;
		font-size: 12px;
		font-weight: 650;
	}

	.label-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.secure-label {
		color: #7289a6;
		font-size: 10px;
	}

	.input-wrap {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 49px;
		padding: 0 13px;
		border: 1px solid #2a3950;
		border-radius: 12px;
		background: #0c1525;
		transition:
			border-color 150ms ease,
			box-shadow 150ms ease;
	}

	.input-wrap:focus-within {
		border-color: #38bdf8;
		box-shadow: 0 0 0 3px rgb(56 189 248 / 10%);
	}

	.input-icon {
		flex: 0 0 auto;
		color: #7793b5;
		font-size: 17px;
	}

	.input-wrap input {
		width: 100%;
		min-width: 0;
		height: 47px;
		border: 0;
		outline: none;
		background: transparent;
		color: #edf5ff;
		font-size: 13px;
	}

	.input-wrap input::placeholder {
		color: #5d6d85;
	}

	.password-toggle {
		flex: 0 0 auto;
		min-height: 36px;
		padding: 0 3px;
		border: 0;
		background: transparent;
		color: #7dd3fc;
		font-size: 10px;
		font-weight: 750;
		cursor: pointer;
	}

	.submit-button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 51px;
		margin-top: 4px;
		padding: 0 16px;
		border: 1px solid #4cc5f4;
		border-radius: 12px;
		background: linear-gradient(110deg, #38bdf8, #5aaef5);
		color: #062039;
		font-size: 13px;
		font-weight: 850;
		cursor: pointer;
		transition:
			filter 150ms ease,
			transform 150ms ease;
	}

	.submit-button:hover {
		filter: brightness(1.07);
	}

	.submit-button:active {
		transform: scale(0.99);
	}

	.submit-arrow {
		font-size: 20px;
	}

	.error-message {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		margin: -7px 0 20px;
		padding: 12px;
		border: 1px solid #713b49;
		border-radius: 11px;
		background: #321b2a;
		color: #fecdd3;
		font-size: 12px;
		line-height: 1.6;
		overflow-wrap: anywhere;
	}

	.error-icon {
		display: grid;
		flex: 0 0 19px;
		width: 19px;
		height: 19px;
		place-items: center;
		border-radius: 50%;
		background: #8e344b;
		color: white;
		font-size: 12px;
		font-weight: 800;
	}

	.login-footer {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-top: 24px;
		padding-top: 19px;
		border-top: 1px solid #263248;
		color: #7e91ac;
		font-size: 10px;
	}

	.shield {
		color: #7dd3fc;
		font-size: 17px;
	}

	.page-footer {
		position: relative;
		z-index: 1;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 7px 16px;
		margin-top: 20px;
		color: #62728a;
		font-size: 10px;
	}

	@media (min-width: 600px) {
		.login-card {
			padding: 36px 36px 25px;
		}
	}
</style>
