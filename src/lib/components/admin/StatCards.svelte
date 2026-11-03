<script lang="ts">
	type Stat = {
		label: string;
		value: string;
		hint?: string;
		tone?: 'accent' | 'success' | 'warning';
	};

	let { items }: { items: Stat[] } = $props();
</script>

<section class="stats" aria-label="Ringkasan">
	{#each items as item (item.label)}
		<article class="stat {item.tone ?? ''}">
			<span class="label">{item.label}</span>
			<strong>{item.value}</strong>
			{#if item.hint}<small>{item.hint}</small>{/if}
		</article>
	{/each}
</section>

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
		gap: 12px;
		margin-bottom: 20px;
	}

	.stat {
		display: grid;
		gap: 6px;
		min-width: 0;
		padding: 16px;
		border: 1px solid #27364c;
		border-radius: 14px;
		background: #111b2d;
	}

	.label {
		color: #8fa1bb;
		font-size: 10px;
		font-weight: 750;
		letter-spacing: 0.6px;
		text-transform: uppercase;
	}

	strong {
		overflow: hidden;
		color: #edf4ff;
		font-size: 21px;
		letter-spacing: -0.5px;
		text-overflow: ellipsis;
	}

	small {
		color: #6f84a1;
		font-size: 10px;
	}

	.accent strong {
		color: #7dd3fc;
	}

	.success strong {
		color: #5eead4;
	}

	.warning strong {
		color: #fcd34d;
	}
</style>
