import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  // 重定向到 shopify/[slug] 渲染 Shopify 后台的页面内容
  redirect(`/shopify/${slug}`);
}
