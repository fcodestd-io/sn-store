<script lang="ts">
	import { statusMeta } from '#lib/display.ts';

	let { status }: { status: string | null | undefined } = $props();

	const meta = $derived(statusMeta(status));
</script>

<span class="pill {meta.tone}"><span class="dot"></span>{meta.label}</span>

<style>
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 9px;
		border: 1px solid;
		border-radius: 999px;
		font-size: 10px;
		font-weight: 800;
		white-space: nowrap;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: currentColor;
	}

	.success {
		border-color: #1f6f4a;
		background: #0f2a20;
		color: #5eead4;
	}

	.warning {
		border-color: #7a5a1c;
		background: #2b2110;
		color: #fcd34d;
	}

	.danger {
		border-color: #7f2d3b;
		background: #2e1420;
		color: #fda4af;
	}

	.neutral {
		border-color: #34445c;
		background: #172236;
		color: #a9b8cf;
	}
</style>
