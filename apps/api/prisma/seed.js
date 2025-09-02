import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample items
  const items = [
    {
      sku: 'PS5-001',
      name: 'PlayStation 5 Console',
      description: 'Next-generation gaming console with 4K gaming and ray tracing',
      category: 'Gaming',
    },
    {
      sku: 'IPHONE-15-001',
      name: 'iPhone 15 Pro',
      description: 'Latest iPhone with A17 Pro chip and titanium design',
      category: 'Electronics',
    },
    {
      sku: 'RTX-4090-001',
      name: 'NVIDIA GeForce RTX 4090',
      description: 'High-end graphics card for gaming and content creation',
      category: 'Computer Hardware',
    },
  ];

  const createdItems = [];
  for (const itemData of items) {
    const item = await prisma.item.upsert({
      where: { sku: itemData.sku },
      update: {},
      create: itemData,
    });
    createdItems.push(item);
    console.log(`✅ Created item: ${item.name}`);
  }

  // Generate price history for each item (60 days)
  const marketplaces = ['amazon', 'ebay', 'bestbuy', 'walmart'];
  
  for (const item of createdItems) {
    console.log(`📊 Generating price history for ${item.name}...`);
    
    for (let day = 0; day < 60; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      
      for (const marketplace of marketplaces) {
        // Generate realistic price variations
        const basePrice = getBasePrice(item.sku);
        const variation = faker.number.float({ min: 0.8, max: 1.2 });
        const price = Math.round(basePrice * variation * 100) / 100;
        
        const shipping = faker.number.float({ min: 0, max: 15, fractionDigits: 2 });
        const tax = Math.round(price * 0.08 * 100) / 100; // 8% tax
        const availability = faker.datatype.boolean({ probability: 0.9 });
        
        await prisma.priceData.create({
          data: {
            itemId: item.id,
            marketplaceId: marketplace,
            price,
            shipping,
            tax,
            availability,
            timestamp: date,
          },
        });
      }
    }
  }

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJByJ.xsI5Q8Q8Q8Q8Q', // 'password'
      name: 'Test User',
    },
  });

  // Create notification preferences for test user
  await prisma.notificationPreference.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      emailOptIn: true,
    },
  });

  // Add some items to watchlist
  await prisma.watchlist.createMany({
    data: [
      { userId: testUser.id, itemId: createdItems[0].id },
      { userId: testUser.id, itemId: createdItems[1].id },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📧 Test user: test@example.com / password`);
  console.log(`📦 Created ${createdItems.length} items with 60 days of price history`);
}

function getBasePrice(sku) {
  switch (sku) {
    case 'PS5-001':
      return 499.99;
    case 'IPHONE-15-001':
      return 999.99;
    case 'RTX-4090-001':
      return 1599.99;
    default:
      return 100.00;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
