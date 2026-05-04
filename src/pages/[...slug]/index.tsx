// 动态页面：读取 Shopify 页面数据并渲染
import { getPage } from '@/lib/shopify';
import { GetStaticPaths, GetStaticProps } from 'next';

interface Module {
  type: string;
  [key: string]: any;
}

interface Product {
  id: string;
  title: string;
  handle: string;
  price: string;
  currency: string;
  image: string;
}

interface PageData {
  pageTitle: string;
  modules: Module[];
  products: Product[];
}

function HeroModule({ title, subtitle, image, ctaText, ctaUrl }: any) {
  return (
    <section className="relative h-[500px] flex items-center justify-center bg-gray-900 overflow-hidden">
      {image && <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-60" />}
      <div className="relative z-10 text-center text-white px-6">
        <h1 className="text-5xl font-bold mb-4">{title}</h1>
        {subtitle && <p className="text-xl mb-8">{subtitle}</p>}
        {ctaText && ctaUrl && (
          <a href={ctaUrl} className="inline-block px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors">
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

function FeaturesModule({ title, items }: any) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {title && <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(items || []).map((item: string, i: number) => (
            <div key={i} className="text-center p-6 border border-gray-200 rounded-xl">
              <div className="text-4xl mb-4">✅</div>
              <p className="text-lg font-medium">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductsModule({ title, products }: any) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {title && <h2 className="text-3xl font-bold mb-12 text-center">{title}</h2>}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: Product) => (
              <div key={product.id} className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-sm mb-1 truncate">{product.title}</h4>
                  <p className="text-gray-600 text-sm mb-3">${parseFloat(product.price).toFixed(2)} {product.currency}</p>
                  <a href={`https://vbiwbf-ev.myshopify.com/products/${product.handle}`} target="_blank" rel="noopener noreferrer"
                    className="block w-full py-2 bg-black text-white text-sm text-center rounded-full hover:bg-gray-800 transition-colors">
                    View Product
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">暂无商品</p>
        )}
      </div>
    </section>
  );
}

function BannerModule({ title, subtitle, url }: any) {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-6 text-center text-white">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        {subtitle && <p className="text-lg mb-6 opacity-90">{subtitle}</p>}
        {url && (
          <a href={url} className="inline-block px-8 py-3 bg-white text-purple-600 font-semibold rounded-full hover:bg-gray-100 transition-colors">
            了解更多
          </a>
        )}
      </div>
    </section>
  );
}

function renderModule(m: Module, products: Product[]) {
  switch (m.type) {
    case 'hero':     return <HeroModule key={m.type} {...m} />;
    case 'features':  return <FeaturesModule key={m.type} {...m} />;
    case 'products':  return <ProductsModule key={m.type} {...m} products={products} />;
    case 'banner':    return <BannerModule key={m.type} {...m} />;
    default: return null;
  }
}

interface Props {
  pageData: PageData;
}

export default function Page({ pageData }: Props) {
  const { pageTitle, modules } = pageData;

  return (
    <main>
      {modules.length === 0 ? (
        <div className="py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">{pageTitle}</h1>
          <p className="text-gray-400">页面模块配置为空，请在 Shopify 后台添加模块数据</p>
        </div>
      ) : (
        modules.map((m: Module, i: number) => renderModule(m, pageData.products))
      )}
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { slug: ['home'] } }],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string[];
  const handle = slug?.[0] || 'home';

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  let pageData: any = { pageTitle: handle, modules: [], products: [] };

  try {
    const [pageRes, productsRes] = await Promise.all([
      fetch(`${baseUrl}/api/shopify?query=page&handle=${handle}`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/shopify?query=products`, { cache: 'no-store' }),
    ]);
    if (pageRes.ok) pageData = await pageRes.json();
    if (productsRes.ok) pageData.products = await productsRes.json();
  } catch {}

  return {
    props: { pageData },
    revalidate: 60,
  };
};