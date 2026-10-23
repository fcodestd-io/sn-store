<script lang="ts">
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<meta name="theme-color" content="#0B1120" />
	<meta name="robots" content="noindex, nofollow" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>SN Store Admin</title>
</svelte:head>

<div class="app-shell">
	<aside class="desktop-sidebar">
		<a class="brand" href="/admin">
			<span class="brand-icon">SN</span>
			<span class="brand-copy">
				<strong>SN Store</strong>
				<small>ADMIN WORKSPACE</small>
			</span>
		</a>

		<div class="workspace-label">WORKSPACE</div>

		<nav class="sidebar-nav" aria-label="Navigasi admin">
			<a class="nav-link" href="/admin">
				<span class="nav-icon">⌂</span>
				<span>Ringkasan</span>
			</a>

			<a class="nav-link" href="/admin/products">
				<span class="nav-icon">▤</span>
				<span>Produk digital</span>
			</a>

			<a class="nav-link" href="/admin/categories">
				<span class="nav-icon">◫</span>
				<span>Kategori</span>
			</a>

			<a class="nav-link" href="/admin/accounts">
				<span class="nav-icon">♙</span>
				<span>Akun &amp; Items</span>
			</a>

			<a class="nav-link" href="/admin/orders">
				<span class="nav-icon">▣</span>
				<span>Riwayat order</span>
			</a>

			<a class="nav-link" href="/admin/payments">
				<span class="nav-icon">↔</span>
				<span>Pembayaran</span>
			</a>
		</nav>

		<div class="sidebar-bottom">
			<div class="avatar">
				{(data.adminEmail?.[0] ?? 'A').toUpperCase()}
			</div>
			<div class="account-info">
				<strong>Administrator</strong>
				<small>{data.adminEmail ?? 'Admin SN Store'}</small>
			</div>
			<form method="POST" action="/logout">
				<button class="logout-icon" type="submit" aria-label="Keluar">↗</button>
			</form>
		</div>
	</aside>

	<div class="main-area">
		<header class="mobile-header">
			<a class="brand" href="/admin">
				<span class="brand-icon">SN</span>
				<span class="brand-copy">
					<strong>SN Store</strong>
					<small>ADMIN WORKSPACE</small>
				</span>
			</a>
			<form method="POST" action="/logout">
				<button class="mobile-logout" type="submit">Keluar ↗</button>
			</form>
		</header>

		<main class="main-content">
			{@render children()}
		</main>

		<footer class="desktop-footer">
			<span>SN Store <span class="footer-dot">•</span> Admin workspace</span>
			<span>Digital commerce management</span>
		</footer>
	</div>

	<nav class="mobile-nav" aria-label="Navigasi utama">
		<a href="/admin">
			<span class="nav-symbol">⌂</span>
			<span>Home</span>
		</a>

		<a href="/admin/products">
			<span class="nav-symbol">▤</span>
			<span>Produk</span>
		</a>

		<a href="/admin/categories">
			<span class="nav-symbol">◫</span>
			<span>Kategori</span>
		</a>

		<a href="/admin/accounts">
			<span class="nav-symbol">♙</span>
			<span>Akun</span>
		</a>

		<a href="/admin/orders">
			<span class="nav-symbol">▣</span>
			<span>Order</span>
		</a>

		<a href="/admin/payments">
			<span class="nav-symbol">↔</span>
			<span>Bayar</span>
		</a>
	</nav>
</div>

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
		color: #e5edf8;
		-webkit-font-smoothing: antialiased;
	}

	:global(button),
	:global(input),
	:global(select),
	:global(textarea) {
		font: inherit;
	}

	:global(button:focus-visible),
	:global(a:focus-visible) {
		outline: 2px solid #38bdf8;
		outline-offset: 3px;
	}

	.app-shell {
		min-height: 100svh;
		background: radial-gradient(ellipse at 70% 0%, rgb(28 53 88 / 16%), transparent 45%), #0b1120;
	}

	.desktop-sidebar {
		position: fixed;
		inset: 0 auto 0 0;
		z-index: 10;
		display: flex;
		width: 248px;
		flex-direction: column;
		padding: 25px 17px 16px;
		border-right: 1px solid #202c40;
		background: #0d1525;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 11px;
		color: inherit;
		text-decoration: none;
	}

	.brand-icon {
		display: grid;
		flex: 0 0 42px;
		width: 42px;
		height: 42px;
		place-items: center;
		border: 1px solid #315171;
		border-radius: 13px;
		background: linear-gradient(145deg, #1e4669, #172e49);
		color: #a5e5ff;
		font-size: 14px;
		font-weight: 900;
		letter-spacing: -0.7px;
	}

	.brand-copy {
		display: grid;
		gap: 4px;
	}

	.brand-copy strong {
		font-size: 15px;
		letter-spacing: -0.4px;
	}

	.brand-copy small {
		color: #7085a3;
		font-size: 9px;
		font-weight: 750;
		letter-spacing: 1.4px;
	}

	.workspace-label {
		margin: 43px 10px 13px;
		color: #667891;
		font-size: 9px;
		font-weight: 850;
		letter-spacing: 1.7px;
	}

	.sidebar-nav {
		display: grid;
		gap: 6px;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 46px;
		padding: 0 12px;
		border: 1px solid transparent;
		border-radius: 11px;
		color: #94a4bb;
		font-size: 12px;
		font-weight: 650;
		text-decoration: none;
		transition:
			background 150ms ease,
			color 150ms ease;
	}

	.nav-link:hover,
	.nav-link:focus-visible {
		border-color: #263c57;
		background: #15253a;
		color: #dff5ff;
	}

	.nav-icon {
		display: grid;
		width: 22px;
		place-items: center;
		color: #7ea4c9;
		font-size: 21px;
	}

	.sidebar-bottom {
		display: flex;
		align-items: center;
		gap: 9px;
		margin-top: auto;
		padding-top: 17px;
		border-top: 1px solid #243047;
	}

	.avatar {
		display: grid;
		flex: 0 0 35px;
		width: 35px;
		height: 35px;
		place-items: center;
		border: 1px solid #34506f;
		border-radius: 11px;
		background: #1b3049;
		color: #a5e5ff;
		font-size: 13px;
		font-weight: 850;
	}

	.account-info {
		display: grid;
		flex: 1;
		min-width: 0;
		gap: 4px;
	}

	.account-info strong {
		color: #dce6f4;
		font-size: 10px;
	}

	.account-info small {
		overflow: hidden;
		color: #7487a1;
		font-size: 9px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.logout-icon,
	.mobile-logout {
		min-width: 37px;
		min-height: 37px;
		border: 1px solid #2a3a52;
		border-radius: 10px;
		background: #111d30;
		color: #a6bad1;
		font-size: 14px;
		cursor: pointer;
	}

	.main-area {
		min-height: 100svh;
		margin-left: 248px;
	}

	.mobile-header,
	.mobile-nav {
		/* Pertahankan properti lainnya */
		grid-template-columns: repeat(6, minmax(0, 1fr));
	}

	.main-content {
		width: 100%;
		max-width: 1500px;
		min-height: calc(100svh - 55px);
		margin: 0 auto;
		padding: 34px 36px 40px;
	}

	.desktop-footer {
		display: flex;
		justify-content: space-between;
		gap: 15px;
		padding: 16px 36px;
		border-top: 1px solid #202c40;
		color: #667891;
		font-size: 10px;
	}

	.footer-dot {
		padding: 0 4px;
		color: #38bdf8;
	}

	@media (max-width: 800px) {
		.desktop-sidebar {
			display: none;
		}

		.main-area {
			margin-left: 0;
		}

		.mobile-header {
			position: sticky;
			top: 0;
			z-index: 15;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 12px;
			min-height: 67px;
			padding: 11px 16px;
			border-bottom: 1px solid #263247;
			background: rgb(13 21 37 / 94%);
			backdrop-filter: blur(16px);
		}

		.brand-icon {
			flex-basis: 38px;
			width: 38px;
			height: 38px;
			border-radius: 12px;
		}

		.brand-copy strong {
			font-size: 14px;
		}

		.brand-copy small {
			font-size: 8px;
		}

		.mobile-logout {
			padding: 0 11px;
			color: #b9d6ed;
			font-size: 11px;
			font-weight: 750;
		}

		.main-content {
			min-height: calc(100svh - 67px);
			padding: 24px 15px 105px;
		}

		.desktop-footer {
			display: none;
		}

		.mobile-nav {
			position: fixed;
			inset: auto 0 0;
			z-index: 20;
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			padding: 8px 9px calc(8px + env(safe-area-inset-bottom));
			border-top: 1px solid #29364b;
			background: rgb(13 21 37 / 96%);
			backdrop-filter: blur(16px);
		}

		.mobile-nav a {
			display: grid;
			justify-items: center;
			align-content: center;
			gap: 3px;
			min-height: 49px;
			border-radius: 11px;
			color: #8193ad;
			font-size: 10px;
			font-weight: 700;
			text-decoration: none;
		}

		.mobile-nav a:active {
			background: #1b2b42;
			color: #7dd3fc;
		}

		.nav-symbol {
			font-size: 22px;
			line-height: 25px;
		}
	}
</style>
