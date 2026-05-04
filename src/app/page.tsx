'use client';

import { useState, useEffect } from 'react';

type Product = {
  id: string;
  title: string;
  handle: string;
  price: string;
  currency: string;
  image: string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = `
      query getProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
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
                  }
                }
              }
            }
          }
        }
      }
    `;

    fetch('https://vbiwbf-ev.myshopify.com/api/2024-10/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': 'f923b416e0268a2def061f73388fd445',
      },
      body: JSON.stringify({ query, variables: { first: 12 } }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.errors) {
          setError(data.errors[0].message);
          return;
        }
        const items = data.data?.products?.edges || [];
        setProducts(
          items.map((edge: any) => ({
            id: edge.node.id,
            title: edge.node.title,
            handle: edge.node.handle,
            price: edge.node.priceRange?.minVariantPrice?.amount || '0.00',
            currency: edge.node.priceRange?.minVariantPrice?.currencyCode || 'USD',
            image: edge.node.images?.edges?.[0]?.node?.url || '',
          }))
        );
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold">My Store</h1>
          <nav className="flex gap-6 text-sm text-gray-600">
            <a href="/" className="text-black font-medium">Home</a>
            <a href="/products">Products</a>
          </nav>
        </div>
      </header>

      <section className="px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome to Our Store</h2>
        <p className="text-gray-600 max-w-md mx-auto">Browse our latest collection</p>
      </section>

      <main className="max-w-7xl mx-auto px-6 pb-20">
        <h3 className="text-2xl font-semibold mb-8">Featured Products</h3>

        {error ? (
          <div className="text-red-500 p-4 border border-red-200 rounded">
            <strong>Error loading products:</strong> {error}
          </div>
        ) : products.length === 0 ? (
          <div className="text-gray-500 p-8 text-center border border-gray-200 rounded">
            Loading products...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <a
                key={product.id}
                href={`https://vbiwbf-ev.myshopify.com/products/${product.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-sm mb-1">{product.title}</h4>
                  <p className="text-gray-600 text-sm">
                    ${parseFloat(product.price).toFixed(2)} {product.currency}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
