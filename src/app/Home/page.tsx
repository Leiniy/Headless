import { getProducts } from '@/lib/shopify';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getProducts(12);

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/Home" className="text-xl font-semibold">My Store</Link>
          <nav className="flex gap-6 text-sm text-gray-600">
            <Link href="/Home" className="text-black font-medium">Home</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 text-center bg-gray-50">
        <h2 className="text-4xl font-bold mb-4">欢迎来到我们的商店</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-4">无头框架首页配置成功 🎉</p>
        <p className="text-gray-500 max-w-md mx-auto">Browse our latest collection</p>
      </section>

      {/* Products */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        <h3 className="text-2xl font-semibold mb-8">Featured Products</h3>

        {products.length === 0 ? (
          <div className="text-gray-400 p-8 text-center border border-gray-200 rounded-lg">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-sm mb-1 truncate">{product.title}</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    ${parseFloat(product.price).toFixed(2)} {product.currency}
                  </p>
                  <a
                    href={`https://vbiwbf-ev.myshopify.com/products/${product.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 bg-black text-white text-sm text-center rounded-full hover:bg-gray-800 transition-colors"
                  >
                    View Product
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
