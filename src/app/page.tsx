'use client';

import { useState, useEffect } from 'react';

type Product = {
  id: string;
  title: string;
  handle: string;
  price: string;
  currency: string;
  image: string;
  variantId: string;
};

type CartItem = {
  variantId: string;
  quantity: number;
  title: string;
  price: string;
  image: string;
};

const STOREFRONT_TOKEN = 'a233b69972e06502c727dfda23afd31c';
const STORE_URL = 'https://vbiwbf-ev.myshopify.com';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

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
              variants(first: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
      }
    `;

    fetch(`${STORE_URL}/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
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
            variantId: edge.node.variants?.edges?.[0]?.node?.id || '',
          }))
        );
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.variantId === product.variantId);
      if (existing) {
        return prev.map((item) =>
          item.variantId === product.variantId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        variantId: product.variantId,
        quantity: 1,
        title: product.title,
        price: product.price,
        image: product.image,
      }];
    });
  };

  const createCheckout = async () => {
    if (cartItems.length === 0) return;

    const query = `
      mutation createCheckout($lineItems: [CheckoutLineItemInput!]!) {
        checkoutCreate(input: { lineItems: $lineItems }) {
          checkout {
            webUrl
            id
          }
          checkoutUserErrors {
            code
            field
            message
          }
        }
      }
    `;

    try {
      const res = await fetch(`${STORE_URL}/api/2024-10/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query,
          variables: {
            lineItems: cartItems.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
            })),
          },
        }),
      });
      const data = await res.json();
      const checkoutUrl = data.data?.checkoutCreate?.checkout?.webUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setError('Failed to create checkout');
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-4 sticky top-0 bg-white z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold">My Store</h1>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm"
          >
            🛒 Cart
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowCart(false)} />
          <div className="relative w-80 h-full bg-white shadow-xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Shopping Cart</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-black text-xl">
                ✕
              </button>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-gray-500">Your cart is empty</p>
            ) : (
              <>
                <div className="flex-1 overflow-auto">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4 py-4 border-b border-gray-100">
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 text-xs">No img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.title}</p>
                        <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium">${parseFloat(item.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={createCheckout}
                    className="w-full py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                  >
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome to Our Store</h2>
        <p className="text-gray-600 max-w-md mx-auto">Browse our latest collection</p>
      </section>

      {/* Products */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        <h3 className="text-2xl font-semibold mb-8">Featured Products</h3>

        {error ? (
          <div className="text-red-500 p-4 border border-red-200 rounded">
            <strong>Error:</strong> {error}
          </div>
        ) : products.length === 0 ? (
          <div className="text-gray-500 p-8 text-center border border-gray-200 rounded">
            Loading products...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
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
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-sm mb-1 truncate">{product.title}</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    ${parseFloat(product.price).toFixed(2)} {product.currency}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
