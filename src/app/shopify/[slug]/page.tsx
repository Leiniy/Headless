import Link from 'next/link';
import { getPage } from '@/lib/shopify';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ShopifyPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold text-red-500">404</h1>
        <p className="text-gray-500">Page not found</p>
        <Link href="/Home" className="text-blue-500 hover:underline">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/Home" className="text-xl font-semibold">My Store</Link>
          <Link href="/Home" className="text-sm text-gray-500 hover:text-black">
            ← Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-6">{page.title}</h2>
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: page.body || '' }}
        />
      </main>
    </div>
  );
}
