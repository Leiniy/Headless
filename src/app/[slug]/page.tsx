'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
};

const STOREFRONT_TOKEN = 'a233b69972e06502c727dfda23afd31c';

export default function PageRoute() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<Page | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const query = `
      query getPage($handle: String!) {
        page(handle: $handle) {
          id
          title
          handle
          body
        }
      }
    `;

    fetch('https://vbiwbf-ev.myshopify.com/api/2024-10/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables: { handle: slug } }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.errors) {
          setError(data.errors[0].message);
          setLoading(false);
          return;
        }
        if (!data.data?.page) {
          setError('Page not found');
          setLoading(false);
          return;
        }
        setPage(data.data.page);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="text-red-500 text-lg mb-4">404 - Page not found</div>
        <a href="/" className="text-blue-500 hover:underline">← Back to Home</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold">My Store</h1>
          <a href="/" className="text-sm text-gray-600 hover:text-black">
            ← Home
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-6">{page?.title}</h2>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: page?.body || '' }}
        />
      </main>
    </div>
  );
}
