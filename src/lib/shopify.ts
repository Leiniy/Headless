import type { Product, ShopifyPage, CartItem } from './types';

function getStoreUrl(): string {
  const val = process.env.SHOPIFY_STORE_URL || '';
  if (!val) return '';
  // 确保有 protocol
  if (!val.startsWith('http://') && !val.startsWith('https://')) {
    return `https://${val}`;
  }
  return val;
}

const STOREFRONT_TOKEN =
  process.env.SHOPIFY_STOREFRONT_TOKEN ||
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
  process.env.SHOPIFY_STOREFRONT_API_KEY ||
  '';

async function shopifyFetch<T = any>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const storeUrl = getStoreUrl();
  if (!storeUrl) {
    throw new Error('SHOPIFY_STORE_URL is not configured');
  }

  const res = await fetch(`${storeUrl}/api/2024-10/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store' as RequestCache,
  });

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
}

// ─── Products ───────────────────────────────────────────────────────────────

export async function getProducts(first = 12): Promise<Product[]> {
  try {
    const data = await shopifyFetch<{ products: { edges: Array<{ node: any }> } }>(
      `query getProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              priceRange {
                minVariantPrice { amount currencyCode }
              }
              images(first: 1) {
                edges { node { url } }
              }
              variants(first: 1) {
                edges { node { id } }
              }
            }
          }
        }
      }`,
      { first }
    );

    return data.products.edges.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      price: edge.node.priceRange.minVariantPrice.amount || '0.00',
      currency: edge.node.priceRange.minVariantPrice.currencyCode || 'USD',
      image: edge.node.images.edges[0]?.node.url || '',
      variantId: edge.node.variants.edges[0]?.node.id || '',
    }));
  } catch (e: unknown) {
    console.warn('getProducts failed:', e instanceof Error ? e.message : String(e));
    return [];
  }
}

// ─── Page ───────────────────────────────────────────────────────────────────

export async function getPage(handle: string): Promise<ShopifyPage | null> {
  try {
    const data = await shopifyFetch<{ page: any }>(
      `query getPage($handle: String!) {
        page(handle: $handle) {
          id
          title
          handle
          body
        }
      }`,
      { handle }
    );

    if (!data.page) return null;

    return {
      id: data.page.id,
      title: data.page.title,
      handle: data.page.handle,
      body: data.page.body,
    };
  } catch {
    return null;
  }
}

// ─── Checkout ───────────────────────────────────────────────────────────────

export async function createCheckout(lineItems: CartItem[]): Promise<string | null> {
  const data = await shopifyFetch<{
    checkoutCreate: {
      checkout: { webUrl: string };
      checkoutUserErrors: Array<{ message: string }>;
    };
  }>(
    `mutation createCheckout($lineItems: [CheckoutLineItemInput!]!) {
      checkoutCreate(input: { lineItems: $lineItems }) {
        checkout { webUrl }
        checkoutUserErrors { message }
      }
    }`,
    {
      lineItems: lineItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    }
  );

  if (data.checkoutCreate.checkoutUserErrors.length > 0) {
    throw new Error(data.checkoutCreate.checkoutUserErrors[0].message);
  }

  return data.checkoutCreate.checkout.webUrl;
}