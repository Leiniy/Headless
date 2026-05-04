export type Product = {
  id: string;
  title: string;
  handle: string;
  price: string;
  currency: string;
  image: string;
  variantId: string;
};

export type CartItem = {
  variantId: string;
  quantity: number;
  title: string;
  price: string;
  image: string;
};

export type ShopifyPage = {
  id: string;
  title: string;
  handle: string;
  body: string;
};
