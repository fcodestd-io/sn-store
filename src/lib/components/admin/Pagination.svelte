<script lang="ts">
	let {
		page,
		pageSize,
		total,
		params
	}: { page: number; pageSize: number; total: number; params: Record<string, string | null> } =
		$props();

	const lastPage = $derived(Math.max(1, Math.ceil(total / pageSize)));

	function href(target: number): string {
		const search = new URLSearchParams();

		for (const [key, value] of Object.entries(params)) {
			if (value) search.set(key, value);
		}

		if (target > 1) search.set('page', String(target));

		const text = search.toString();

		return text ? `?${text}` : '?';
	}
</script>

{#if total > 0}
	<nav class="pagination" aria-label="Halaman">
		<span>
			{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} dari {total}
		</span>
		<div>
			{#if page > 1}<a href={href(page - 1)}>← Sebelumnya</a>{/if}
			<strong>{page} / {lastPage}</strong>
			{#if page < lastPage}<a href={href(page + 1)}>Berikutnya →</a>{/if}
		</div>
	</nav>
{/if}

<style>
	.pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 14px;
		color: #8fa1bb;
		font-size: 11px;
	}

	div {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	strong {
		color: #cbd7e8;
	}

	a {
		padding: 8px 12px;
		border: 1px solid #2c3d57;
		border-radius: 9px;
		background: #111b2d;
		color: #a7dfff;
		font-weight: 700;
		text-decoration: none;
	}

	a:hover {
		border-color: #38bdf8;
	}
</style>
