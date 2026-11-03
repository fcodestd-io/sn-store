<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="table-card">
	<div class="scroll">
		<table>{@render children()}</table>
	</div>
</div>

<style>
	.table-card {
		overflow: hidden;
		border: 1px solid #27364c;
		border-radius: 16px;
		background: #111b2d;
	}

	.scroll {
		overflow-x: auto;
	}

	table {
		width: 100%;
		min-width: 720px;
		border-collapse: collapse;
		font-size: 12px;
	}

	table :global(th) {
		padding: 13px 14px;
		border-bottom: 1px solid #27364c;
		background: #0e1829;
		color: #8fa1bb;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.6px;
		text-align: left;
		text-transform: uppercase;
		white-space: nowrap;
	}

	table :global(td) {
		padding: 13px 14px;
		border-bottom: 1px solid #1d2b40;
		color: #cbd7e8;
		vertical-align: middle;
	}

	table :global(tbody tr:last-child td) {
		border-bottom: 0;
	}

	table :global(tbody tr:hover td) {
		background: #131f33;
	}

	table :global(.num) {
		font-variant-numeric: tabular-nums;
		text-align: right;
		white-space: nowrap;
	}

	table :global(.muted) {
		color: #7387a3;
		font-size: 11px;
	}

	table :global(.mono) {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 11px;
	}

	table :global(a.link) {
		color: #7dd3fc;
		font-weight: 700;
		text-decoration: none;
	}

	table :global(a.link:hover) {
		text-decoration: underline;
	}
</style>
