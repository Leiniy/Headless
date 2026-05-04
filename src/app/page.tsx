'use client';

import { useState, useEffect } from 'react';

type Variant = {
  id: number;
  title: string;
  price: string;
  available: boolean;
};

type Image = {
  id: number;
  src: string;
};

type Product = {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  variants: Variant[];
  images: Image[];
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://vbiwbf-ev.myshopify.com/products.json')
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
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
            {products.map((product) => {
              const price = product.variants[0]?.price || '0.00';
              const image = product.images[0]?.src || '';
              return (
                <a
                  key={product.id}
                  href={`https://vbiwbf-ev.myshopify.com/products/${product.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt={product.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">No image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium text-sm mb-1">{product.title}</h4>
                    <p className="text-gray-600 text-sm">${parseFloat(price).toFixed(2)}</p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
