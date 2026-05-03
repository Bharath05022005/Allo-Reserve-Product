import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Warehouses ───────────────────────────────────────────────────────────
  const warehouseA = await prisma.warehouse.upsert({
    where: { id: "wh_001" },
    update: {},
    create: {
      id: "wh_001",
      name: "Main Warehouse",
      location: "New York, NY",
    },
  });

  const warehouseB = await prisma.warehouse.upsert({
    where: { id: "wh_002" },
    update: {},
    create: {
      id: "wh_002",
      name: "West Coast Hub",
      location: "Los Angeles, CA",
    },
  });

  console.log(`✅ Warehouses: ${warehouseA.name}, ${warehouseB.name}`);

  // ─── Products ─────────────────────────────────────────────────────────────
  const products = [
    {
      id: "prod_001",
      name: "MacBook Pro M3 Max",
      description: "16-inch, 64GB RAM, 2TB SSD, Space Black",
      sku: "MBP-M3-MAX-16",
      price: new Decimal("349900"),
      imageUrl: "/products/macbook-pro.png",
    },
    {
      id: "prod_002",
      name: "Sony WH-1000XM5",
      description: "Wireless Noise Cancelling Headphones (Silver)",
      sku: "SONY-XM5-S",
      price: new Decimal("29990"),
      imageUrl: "/products/sony-headphones.png",
    },
    {
      id: "prod_003",
      name: "Samsung Odyssey G9",
      description: "49-inch Curved Gaming Monitor",
      sku: "SAM-G9-49",
      price: new Decimal("125000"),
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "prod_004",
      name: "Logitech MX Master 3S",
      description: "Performance Wireless Mouse (Pale Gray)",
      sku: "LOGI-MX3S-PG",
      price: new Decimal("9995"),
      imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "prod_005",
      name: "Keychron Q1 Pro",
      description: "Custom Mechanical Keyboard (Carbon Black)",
      sku: "KEY-Q1-PRO-CB",
      price: new Decimal("18500"),
      imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "prod_006",
      name: "iPhone 15 Pro",
      description: "Titanium Blue, 256GB",
      sku: "IP15-PRO-256",
      price: new Decimal("129900"),
      imageUrl: "/products/iphone-15-pro.png",
    },
    {
      id: "prod_007",
      name: "iPad Pro M4",
      description: "13-inch, Space Black, 1TB",
      sku: "IPAD-M4-13-SB",
      price: new Decimal("209900"),
      imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "prod_008",
      name: "Apple Watch Ultra 2",
      description: "Titanium Case with Blue Ocean Band",
      sku: "AW-ULTRA-2-OB",
      price: new Decimal("89900"),
      imageUrl: "/products/watch-ultra.png",
    },
    {
      id: "prod_009",
      name: "Dell XPS 17",
      description: "Intel i9-13900H, 64GB RAM, RTX 4070",
      sku: "DELL-XPS-17-9730",
      price: new Decimal("285000"),
      imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "prod_010",
      name: "Bose QuietComfort Ultra",
      description: "Black, Immersive Audio Headphones",
      sku: "BOSE-QC-ULTRA-BLK",
      price: new Decimal("35900"),
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        sku: product.sku,
      },
      create: product,
    });
  }

  console.log(`✅ Products: ${products.length} created/updated`);

  // ─── Stocks ───────────────────────────────────────────────────────────────
  const stockData = [
    // Main Warehouse (Target: 203 Total, 43 Reserved)
    { productId: "prod_001", warehouseId: "wh_001", totalUnits: 50, reservedUnits: 10 },
    { productId: "prod_002", warehouseId: "wh_001", totalUnits: 20, reservedUnits: 5 },
    { productId: "prod_003", warehouseId: "wh_001", totalUnits: 20, reservedUnits: 5 },
    { productId: "prod_004", warehouseId: "wh_001", totalUnits: 20, reservedUnits: 5 },
    { productId: "prod_005", warehouseId: "wh_001", totalUnits: 13, reservedUnits: 3 },
    { productId: "prod_006", warehouseId: "wh_001", totalUnits: 20, reservedUnits: 5 },
    { productId: "prod_007", warehouseId: "wh_001", totalUnits: 20, reservedUnits: 5 },
    { productId: "prod_008", warehouseId: "wh_001", totalUnits: 10, reservedUnits: 2 },
    { productId: "prod_009", warehouseId: "wh_001", totalUnits: 15, reservedUnits: 1 },
    { productId: "prod_010", warehouseId: "wh_001", totalUnits: 15, reservedUnits: 2 },

    // West Coast Hub (Target: 176 Total, 33 Reserved)
    { productId: "prod_001", warehouseId: "wh_002", totalUnits: 40, reservedUnits: 8 },
    { productId: "prod_002", warehouseId: "wh_002", totalUnits: 20, reservedUnits: 4 },
    { productId: "prod_003", warehouseId: "wh_002", totalUnits: 16, reservedUnits: 3 },
    { productId: "prod_004", warehouseId: "wh_002", totalUnits: 10, reservedUnits: 2 },
    { productId: "prod_005", warehouseId: "wh_002", totalUnits: 10, reservedUnits: 2 },
    { productId: "prod_006", warehouseId: "wh_002", totalUnits: 20, reservedUnits: 4 },
    { productId: "prod_007", warehouseId: "wh_002", totalUnits: 20, reservedUnits: 4 },
    { productId: "prod_008", warehouseId: "wh_002", totalUnits: 10, reservedUnits: 2 },
    { productId: "prod_009", warehouseId: "wh_002", totalUnits: 10, reservedUnits: 2 },
    { productId: "prod_010", warehouseId: "wh_002", totalUnits: 10, reservedUnits: 2 },
  ];

  for (const stock of stockData) {
    await prisma.stock.upsert({
      where: {
        productId_warehouseId: {
          productId: stock.productId,
          warehouseId: stock.warehouseId,
        },
      },
      update: {
        totalUnits: stock.totalUnits,
        reservedUnits: stock.reservedUnits,
      },
      create: stock,
    });
  }

  console.log(`✅ Stocks: ${stockData.length} records created/updated`);
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
