import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // 开发自定义页面放在 src/app/ 目录下
  // Shopify 动态路由放在 src/shopify/ 目录下（内容从 Shopify 后台读取）
};

export default nextConfig;
