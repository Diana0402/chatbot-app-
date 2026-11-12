import { prisma } from "@/lib/prisma";

export async function createAssistantReply(text: string) {
  const q = text.toLowerCase();
  const products = await prisma.product.findMany({ orderBy: { price: "asc" } });
  const matched = products.filter(p =>
    [p.name, p.category, p.material, p.color, p.description].join(" ").toLowerCase().split(/\W+/).some(word => word.length > 3 && q.includes(word))
  );
  if (/(size|sizing|fit|measurement)/.test(q)) {
    return "I can help with sizing! Our sample catalogue includes sizes XS–XL (some knitwear styles start at S). For the best recommendation, compare your chest, waist and hip measurements with the brand's size chart. If you share the product and your measurements, I can guide you. Please note that these are sample catalogue details.";
  }
  if (/(wash|care|clean|iron|laundry)/.test(q)) {
    const p = matched[0] ?? products[0];
    return `${p.name}: ${p.care} The care instructions are based on our sample product catalogue. Always check the care label on the garment.`;
  }
  if (/(recommend|outfit|work|office|budget|under|€|\$)/.test(q)) {
    const budget = q.match(/(?:under|below|budget of|€)\s*€?\s*(\d+(?:[.,]\d+)?)/);
    const limit = budget ? Number(budget[1].replace(",", ".")) : Infinity;
    const choices = products.filter(p => p.price <= limit).slice(0, 3);
    return `Here are a few ideas from the sample TrendWear catalogue:\n\n${choices.map(p => `• ${p.name} — €${p.price.toFixed(2)}. ${p.description} Material: ${p.material}.`).join("\n")}\n\nTell me the occasion, preferred style and budget if you'd like a more tailored selection.`;
  }
  if (matched.length) {
    return `${matched.slice(0, 3).map(p => `${p.name} (€${p.price.toFixed(2)})\n${p.description}\nMaterial: ${p.material}. Available sizes: ${p.sizes}. Care: ${p.care}`).join("\n\n")}\n\nWould you like help choosing a size or styling this item?`;
  }
  return "Welcome to TrendWear Assist! I can help you explore clothing, choose a size, understand fabrics and care instructions, or find an outfit within your budget. What are you looking for today?";
}
