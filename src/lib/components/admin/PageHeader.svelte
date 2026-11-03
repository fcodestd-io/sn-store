<script lang="ts">
	let {
		eyebrow,
		title,
		description,
		badge
	}: { eyebrow: string; title: string; description: string; badge?: string } = $props();
</script>

<header class="page-heading">
	<div>
		<div class="eyebrow">{eyebrow}</div>
		<h1>{title}</h1>
		<p>{description}</p>
	</div>
	{#if badge}<span class="badge">{badge}</span>{/if}
</header>

<style>
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

	p {
		max-width: 520px;
		margin: 9px 0 0;
		color: #8fa1bb;
		font-size: 12px;
		line-height: 1.8;
	}

	.badge {
		flex: 0 0 auto;
		padding: 8px 11px;
		border: 1px solid #2c4664;
		border-radius: 9px;
		background: #14263c;
		color: #a7dfff;
		font-size: 10px;
		font-weight: 750;
	}
</style>
