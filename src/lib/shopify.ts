const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL || 'vbiwbf-ev.myshopify.com';
const SHOPIFY_STOREFRONT_API_KEY = process.env.SHOPIFY_STOREFRONT_API_KEY || 'f923b416e0268a2def061f73388fd445';

const STOREFRONT_API_URL = `https://${SHOPIFY_STORE_URL}/api/2024-10/graphql.json`;

export async function shopifyFetch(query: string, variables?: Record<string, unknown>) {
  const res = await fetch(STOREFRONT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
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

export async function getProducts() {
  const query = `
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  `;
  const data = await shopifyFetch(query, { first: 12 });
  return data.products.edges.map((edge: any) => ({
    id: edge.node.id,
    title: edge.node.title,
    handle: edge.node.handle,
    description: edge.node.description,
    price: edge.node.priceRange.minVariantPrice.amount,
    currency: edge.node.priceRange.minVariantPrice.currencyCode,
    image: edge.node.images.edges[0]?.node.url || '',
  }));
}
