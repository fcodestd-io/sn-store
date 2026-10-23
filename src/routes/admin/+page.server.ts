import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const [products, orders, payments] = await Promise.all([
    locals.supabase
      .from('products')
      .select('id', { count: 'exact', head: true }),

    locals.supabase
      .from('orders')
      .select('id', { count: 'exact', head: true }),

    locals.supabase
      .from('payments')
      .select('id', { count: 'exact', head: true })
  ]);

  const failed = [products, orders, payments].some(
    (result) => result.error
  );

  if (failed) {
    console.error('Dashboard summary query failed.');
    return {
      stats: null,
      warning: 'Sebagian data ringkasan belum dapat dimuat.'
    };
  }

  return {
    stats: {
      products: products.count ?? 0,
      orders: orders.count ?? 0,
      payments: payments.count ?? 0
    },
    warning: null
  };
};
