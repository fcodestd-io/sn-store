<script lang="ts">
	import { statusMeta } from '#lib/display.ts';

	let {
		statuses,
		current,
		query,
		placeholder
	}: {
		statuses: readonly string[];
		current: string | null;
		query: string;
		placeholder: string;
	} = $props();

	function href(status: string | null): string {
		const params = new URLSearchParams();

		if (status) params.set('status', status);
		if (query) params.set('q', query);

		const text = params.toString();

		return text ? `?${text}` : '?';
	}
</script>

<section class="filters">
	<form method="GET" class="search" role="search">
		{#if current}<input type="hidden" name="status" value={current} />{/if}
		<input name="q" value={query} {placeholder} maxlength="60" aria-label="Cari" />
		<button type="submit">Cari</button>
		{#if query}<a class="reset" href={current ? `?status=${current}` : '?'}>Reset</a>{/if}
	</form>

	<nav class="chips" aria-label="Filter status">
		<a class:active={!current} href={href(null)}>Semua</a>
		{#each statuses as status (status)}
			<a class:active={current === status} href={href(status)}>{statusMeta(status).label}</a>
		{/each}
	</nav>
</section>

<style>
	.filters {
		display: grid;
		gap: 12px;
		margin-bottom: 16px;
	}

	.search {
		display: flex;
		gap: 8px;
	}

	input {
		flex: 1;
		min-width: 0;
		min-height: 44px;
		padding: 11px 12px;
		border: 1px solid #2b3b53;
		border-radius: 10px;
		outline: none;
		background: #0b1424;
		color: #e5edf8;
		font-size: 13px;
	}

	input:focus {
		border-color: #38bdf8;
		box-shadow: 0 0 0 3px rgb(56 189 248 / 9%);
	}

	button {
		min-height: 44px;
		padding: 0 16px;
		border: 1px solid #38bdf8;
		border-radius: 10px;
		background: #38bdf8;
		color: #062039;
		font-size: 11px;
		font-weight: 750;
		cursor: pointer;
	}

	.reset {
		display: grid;
		place-items: center;
		padding: 0 12px;
		color: #8fa1bb;
		font-size: 11px;
		text-decoration: none;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.chips a {
		padding: 8px 12px;
		border: 1px solid #2c3d57;
		border-radius: 999px;
		background: #111b2d;
		color: #a9b8cf;
		font-size: 11px;
		font-weight: 700;
		text-decoration: none;
	}

	.chips a:hover {
		border-color: #38bdf8;
	}

	.chips a.active {
		border-color: #38bdf8;
		background: #14263c;
		color: #7dd3fc;
	}
</style>
