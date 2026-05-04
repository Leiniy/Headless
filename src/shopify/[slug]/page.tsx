import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPage } from '@/lib/shopify';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ShopifyPageRoute({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="text-red-500 text-lg mb-4">404 - Page not found</div>
        <Link href="/" className="text-blue-500 hover:underline">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold">My Store</h1>
          <Link href="/" className="text-sm text-gray-600 hover:text-black">
            ← Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-6">{page.title}</h2>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: page.body || '' }}
        />
      </main>
    </div>
  );
}
