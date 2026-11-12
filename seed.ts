import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const prompts = [
    { name: "Fashion Advisor", content: "You are a friendly fashion customer support assistant. Give concise, practical clothing advice." },
    { name: "Product Expert", content: "You are a product specialist. Explain materials, fit, construction and garment care accurately." },
    { name: "Size Guide", content: "You help customers choose clothing sizes. Ask for measurements when needed and explain that fit can vary." }
  ];
  for (const prompt of prompts) {
    await prisma.systemPrompt.upsert({ where: { name: prompt.name }, update: { content: prompt.content }, create: prompt });
  }
  const products = [
    { sku: "TW-001", name: "Relaxed Cotton Shirt", category: "Shirts", description: "A versatile relaxed-fit shirt for everyday outfits.", sizes: "XS,S,M,L,XL", material: "100% cotton", price: 49.9, care: "Wash at 30°C with similar colours. Do not bleach. Air dry.", color: "White" },
    { sku: "TW-002", name: "Everyday Linen Shirt", category: "Shirts", description: "A breathable linen-blend shirt with an easy, casual silhouette.", sizes: "XS,S,M,L,XL", material: "55% linen, 45% cotton", price: 59.9, care: "Gentle wash at 30°C. Reshape while damp and iron on medium heat.", color: "Natural beige" },
    { sku: "TW-003", name: "Straight-Leg Trousers", category: "Trousers", description: "Clean straight-leg trousers designed for work and weekends.", sizes: "XS,S,M,L,XL", material: "65% viscose, 30% polyester, 5% elastane", price: 69.9, care: "Wash inside out at 30°C. Do not tumble dry.", color: "Black" },
    { sku: "TW-004", name: "Soft Knit Cardigan", category: "Knitwear", description: "A lightweight layering piece with a soft hand feel.", sizes: "S,M,L,XL", material: "50% cotton, 50% acrylic", price: 64.9, care: "Hand wash or use wool cycle. Dry flat.", color: "Oatmeal" },
    { sku: "TW-005", name: "Classic T-Shirt", category: "T-shirts", description: "A wardrobe essential with a regular fit and crew neckline.", sizes: "XS,S,M,L,XL", material: "100% organic cotton", price: 24.9, care: "Wash at 30°C inside out. Wash with similar colours.", color: "Black" },
    { sku: "TW-006", name: "Tailored Blazer", category: "Outerwear", description: "A smart single-breasted blazer for polished everyday looks.", sizes: "XS,S,M,L,XL", material: "70% polyester, 28% viscose, 2% elastane", price: 119.9, care: "Professional dry clean recommended.", color: "Charcoal" }
  ];
  for (const product of products) {
    await prisma.product.upsert({ where: { sku: product.sku }, update: product, create: product });
  }
}
main().finally(() => prisma.$disconnect());
