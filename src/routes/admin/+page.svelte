
<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  });
</script>

<svelte:head>
  <title>Ringkasan | SN Store</title>
</svelte:head>

<section class="welcome-card">
  <div class="welcome-copy">
    <div class="eyebrow"><span class="live-dot"></span> STORE OVERVIEW</div>
    <h1>Ringkasan toko</h1>
    <p>Pantau katalog dan kelola bisnis digital Anda dari satu tempat.</p>
    <a href="/admin/products" class="welcome-button">Kelola katalog <span>→</span></a>
  </div>
  <div class="hero-art" aria-hidden="true">
    <div class="art-orbit orbit-one"></div>
    <div class="art-orbit orbit-two"></div>
    <div class="art-card">
      <span class="art-card-label">SN STORE</span>
      <span class="art-card-symbol">✳</span>
      <span class="art-card-line"></span>
      <span class="art-card-line short"></span>
      <span class="art-card-chip">DIGITAL</span>
    </div>
  </div>
</section>

{#if data.warning}
  <div class="notice" role="alert">{data.warning}</div>
{/if}

<section class="section-heading">
  <div>
    <p class="eyebrow">STORE PERFORMANCE</p>
    <h2>Statistik toko</h2>
  </div>
  <span class="section-tag">Semua data</span>
</section>

{#if data.stats}
  <section class="stats-grid">
    <article class="stat-card">
      <div class="stat-top">
        <span class="stat-icon blue">▤</span>
        <span class="stat-label">KATALOG</span>
      </div>
      <p class="stat-name">Total produk</p>
      <strong>{data.stats.products}</strong>
      <a href="/admin/products">Lihat produk <span>↗</span></a>
    </article>

    <article class="stat-card">
      <div class="stat-top">
        <span class="stat-icon violet">▧</span>
        <span class="stat-label">PESANAN</span>
      </div>
      <p class="stat-name">Total pesanan</p>
      <strong>{data.stats.orders}</strong>
      <span class="stat-footnote">Semua status pesanan</span>
    </article>

    <article class="stat-card">
      <div class="stat-top">
        <span class="stat-icon cyan">↗</span>
        <span class="stat-label">PEMBAYARAN</span>
      </div>
      <p class="stat-name">Transaksi tercatat</p>
      <strong>{data.stats.payments}</strong>
      <span class="stat-footnote">Semua status pembayaran</span>
    </article>
  </section>
{/if}

<section class="section-heading quick-heading">
  <div>
    <p class="eyebrow">QUICK ACCESS</p>
    <h2>Akses cepat</h2>
  </div>
</section>

<section class="quick-grid">
  <a class="quick-card" href="/admin/products">
    <span class="quick-icon blue">＋</span>
    <span class="quick-copy">
      <strong>Tambah produk</strong>
      <small>Tambahkan item baru ke katalog digital.</small>
    </span>
    <span class="quick-arrow">→</span>
  </a>

  <a class="quick-card" href="/admin/categories">
    <span class="quick-icon violet">◫</span>
    <span class="quick-copy">
      <strong>Kelola kategori</strong>
      <small>Rapikan produk ke dalam kategori.</small>
    </span>
    <span class="quick-arrow">→</span>
  </a>
</section>

<section class="info-card">
  <span class="info-symbol">✦</span>
  <div>
    <p class="eyebrow">NEXT STEP</p>
    <h2>Siapkan katalog sebelum menerima pesanan</h2>
    <p>
      Lengkapi nama produk, deskripsi, harga, dan gambar. Pastikan status
      produk sesuai sebelum katalog ditampilkan kepada pelanggan.
    </p>
  </div>
</section>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  .welcome-card {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    min-height: 230px;
    overflow: hidden;
    padding: 27px;
    border: 1px solid #2b4564;
    border-radius: 20px;
    background:
      radial-gradient(ellipse at 85% 50%, rgb(56 189 248 / 12%), transparent 43%),
      linear-gradient(120deg, #15243a, #11213a 65%, #122941);
  }

  .welcome-copy {
    position: relative;
    z-index: 2;
    max-width: 480px;
  }

  .eyebrow {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 10px;
    color: #8ba6c5;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: 1.5px;
  }

  .live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #38bdf8;
    box-shadow: 0 0 10px rgb(56 189 248 / 60%);
  }

  h1 {
    margin: 0;
    color: #f1f6ff;
    font-size: clamp(27px, 4vw, 35px);
    letter-spacing: -1.2px;
  }

  .welcome-copy > p {
    max-width: 380px;
    margin: 11px 0 20px;
    color: #9dafc8;
    font-size: 12px;
    line-height: 1.8;
  }

  .welcome-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 17px;
    min-height: 42px;
    padding: 0 14px;
    border: 1px solid #65c8f5;
    border-radius: 10px;
    background: #38bdf8;
    color: #062039;
    font-size: 11px;
    font-weight: 850;
    text-decoration: none;
  }

  .welcome-button span {
    font-size: 17px;
  }

  .hero-art {
    position: relative;
    flex: 0 0 190px;
    height: 180px;
  }

  .art-orbit {
    position: absolute;
    top: 50%;
    left: 50%;
    border: 1px solid rgb(125 211 252 / 17%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .orbit-one {
    width: 175px;
    height: 175px;
  }

  .orbit-two {
    width: 135px;
    height: 135px;
  }

  .art-card {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    width: 105px;
    height: 133px;
    flex-direction: column;
    align-items: flex-start;
    padding: 13px;
    border: 1px solid #46688a;
    border-radius: 15px;
    background: linear-gradient(150deg, #294866, #172c45);
    box-shadow: 0 18px 40px rgb(0 0 0 / 25%);
    transform: translate(-50%, -50%) rotate(7deg);
  }

  .art-card-label {
    color: #a6c6e4;
    font-size: 7px;
    font-weight: 850;
    letter-spacing: 1px;
  }

  .art-card-symbol {
    margin-top: 14px;
    color: #7dd3fc;
    font-size: 35px;
  }

  .art-card-line {
    width: 70px;
    height: 5px;
    margin-top: 9px;
    border-radius: 5px;
    background: #496987;
  }

  .art-card-line.short {
    width: 43px;
    margin-top: 5px;
  }

  .art-card-chip {
    margin-top: auto;
    padding: 4px 7px;
    border-radius: 5px;
    background: #1e435e;
    color: #9fe5ff;
    font-size: 7px;
    font-weight: 850;
    letter-spacing: 1px;
  }

  .section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin: 29px 0 15px;
  }

  .section-heading .eyebrow {
    margin-bottom: 7px;
  }

  h2 {
    margin: 0;
    color: #e7eef9;
    font-size: 18px;
    letter-spacing: -0.5px;
  }

  .section-tag {
    padding: 7px 10px;
    border: 1px solid #2a3b53;
    border-radius: 8px;
    color: #8da2be;
    font-size: 10px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 13px;
  }

  .stat-card {
    min-width: 0;
    padding: 18px;
    border: 1px solid #25344a;
    border-radius: 15px;
    background: #111b2d;
  }

  .stat-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .stat-icon,
  .quick-icon {
    display: grid;
    flex: 0 0 37px;
    width: 37px;
    height: 37px;
    place-items: center;
    border-radius: 11px;
    font-size: 20px;
  }

  .blue {
    background: #183654;
    color: #7dd3fc;
  }

  .violet {
    background: #2a294f;
    color: #c4b5fd;
  }

  .cyan {
    background: #163747;
    color: #67e8f9;
  }

  .stat-label {
    color: #657c99;
    font-size: 8px;
    font-weight: 850;
    letter-spacing: 1.1px;
  }

  .stat-name {
    margin: 15px 0 5px;
    color: #9aabc2;
    font-size: 11px;
  }

  .stat-card > strong {
    display: block;
    overflow-wrap: anywhere;
    color: #edf5ff;
    font-size: 30px;
    letter-spacing: -1px;
  }

  .stat-card > a,
  .stat-footnote {
    display: inline-block;
    margin-top: 13px;
    color: #7dd3fc;
    font-size: 10px;
    line-height: 1.6;
    text-decoration: none;
  }

  .stat-footnote {
    color: #7286a1;
  }

  .quick-heading {
    margin-top: 31px;
  }

  .quick-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .quick-card {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    padding: 16px;
    border: 1px solid #26364c;
    border-radius: 14px;
    background: #111b2d;
    color: inherit;
    text-decoration: none;
    transition: border-color 150ms ease, background 150ms ease;
  }

  .quick-card:hover {
    border-color: #426485;
    background: #142239;
  }

  .quick-copy {
    display: grid;
    flex: 1;
    min-width: 0;
    gap: 6px;
  }

  .quick-copy strong {
    color: #e5edf8;
    font-size: 12px;
  }

  .quick-copy small {
    color: #8092aa;
    font-size: 10px;
    line-height: 1.6;
  }

  .quick-arrow {
    color: #7dd3fc;
    font-size: 18px;
  }

  .info-card {
    display: flex;
    gap: 14px;
    margin-top: 21px;
    padding: 19px;
    border: 1px solid #293953;
    border-radius: 15px;
    background: linear-gradient(110deg, #131f32, #111b2b);
  }

  .info-symbol {
    display: grid;
    flex: 0 0 37px;
    width: 37px;
    height: 37px;
    place-items: center;
    border: 1px solid #34506d;
    border-radius: 11px;
    background: #1a3049;
    color: #7dd3fc;
    font-size: 19px;
  }

  .info-card h2 {
    font-size: 14px;
    line-height: 1.5;
  }

  .info-card > div > p:last-child {
    margin: 8px 0 0;
    color: #8c9db4;
    font-size: 11px;
    line-height: 1.8;
  }

  .notice {
    margin-top: 17px;
    padding: 12px 14px;
    border: 1px solid #6d5130;
    border-radius: 11px;
    background: #302719;
    color: #f4d5a2;
    font-size: 12px;
    line-height: 1.6;
  }

  @media (max-width: 850px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .stat-card {
      padding: 15px;
    }

    .stat-top {
      justify-content: flex-start;
    }

    .stat-label {
      margin-left: auto;
    }

    .stat-name {
      margin-top: 10px;
    }

    .stat-card > strong {
      font-size: 27px;
    }

    .stat-card > a,
    .stat-footnote {
      margin-top: 9px;
    }
  }

  @media (max-width: 560px) {
    .welcome-card {
      min-height: 0;
      padding: 21px 19px;
    }

    .hero-art {
      display: none;
    }

    .welcome-copy > p {
      margin-bottom: 16px;
    }

    .quick-grid {
      grid-template-columns: 1fr;
    }

    .info-card {
      padding: 15px;
    }
  }
</style>
