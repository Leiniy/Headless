import type { NextApiRequest, NextApiResponse } from 'next';

const STOREFRONT_TOKEN =
  process.env.SHOPIFY_STOREFRONT_TOKEN ||
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
  process.env.SHOPIFY_STOREFRONT_API_KEY ||
  '';

const STORE_URL =
  (process.env.SHOPIFY_STORE_URL || '').replace(/^https?:\/\//, '');

async function shopifyFetch<T = any>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const url = STORE_URL.startsWith('http') ? STORE_URL : `https://${STORE_URL}`;
  const res = await fetch(`${url}/api/2024-10/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store' as RequestCache,
  });

  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query: action } = req.query;

  try {
    if (action === 'products') {
      const data = await shopifyFetch<{ products: { edges: Array<{ node: any }> } }>(
        `query getProducts($first: Int!) {
          products(first: $first) {
            edges {
              node {
                id title handle
                priceRange { minVariantPrice { amount currencyCode } }
                images(first: 1) { edges { node { url } } }
                variants(first: 1) { edges { node { id } } }
              }
            }
          }
        }`,
        { first: 12 }
      );
      const products = data.products.edges.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        price: edge.node.priceRange.minVariantPrice.amount || '0.00',
        currency: edge.node.priceRange.minVariantPrice.currencyCode || 'USD',
        image: edge.node.images.edges[0]?.node.url || '',
        variantId: edge.node.variants.edges[0]?.node.id || '',
      }));
      return res.status(200).json(products);
    }

    if (action === 'page') {
      const { handle } = req.query;
      if (!handle || typeof handle !== 'string') {
        return res.status(400).json({ error: 'Missing handle' });
      }
      const data = await shopifyFetch<{ page: any }>(
        `query getPage($handle: String!) {
          page(handle: $handle) {
            id title handle body
            metafield(namespace: "custom", key: "page") { value }
          }
        }`,
        { handle }
      );
      if (!data.page) return res.status(404).json({ error: 'Page not found' });

      let modules: any[] = [];
      try { modules = JSON.parse(data.page.metafield?.value || '[]'); } catch {}

      return res.status(200).json({
        id: data.page.id,
        title: data.page.title,
        handle: data.page.handle,
        modules,
      });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}