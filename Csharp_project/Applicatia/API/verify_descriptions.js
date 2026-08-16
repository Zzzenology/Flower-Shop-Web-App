// Verification script to check product descriptions
// Usage: mongosh "mongodb+srv://raulbercea04:zA7NUXieOxrPkeyG@freecluster.v1ejj1x.mongodb.net/FlowerShop" --file verify_descriptions.js

// Connect to the FlowerShop database
use('FlowerShop');

print("=== Product Description Verification ===");
print("");

// Get all products and show their descriptions
const allProducts = db.products.find({}, { nume: 1, descriere: 1, price: 1, stock: 1 }).sort({ nume: 1 });

print("All products with their descriptions:");
print("=====================================");

let count = 0;
allProducts.forEach(product => {
  count++;
  const description = product.descriere || "NO DESCRIPTION";
  const truncatedDesc = description.length > 60 ? description.substring(0, 60) + "..." : description;
  
  print(`${count}. ${product.nume}`);
  print(`   Price: ${product.price} RON | Stock: ${product.stock || 0}`);
  print(`   Description: "${truncatedDesc}"`);
  print("");
});

// Statistics
const stats = {
  total: db.products.countDocuments(),
  withDescriptions: db.products.countDocuments({
    descriere: { $exists: true, $ne: null, $ne: "" }
  }),
  withDefaultDescription: db.products.countDocuments({
    descriere: "Produs frumos și de calitate, perfect pentru orice ocazie specială. Adaugă culoare și eleganță în orice spațiu."
  })
};

print("=== Statistics ===");
print(`Total products: ${stats.total}`);
print(`Products with descriptions: ${stats.withDescriptions}`);
print(`Products with default description: ${stats.withDefaultDescription}`);
print(`Products with custom descriptions: ${stats.withDescriptions - stats.withDefaultDescription}`);

if (stats.total === stats.withDescriptions) {
  print("\n✅ SUCCESS: All products have descriptions!");
} else {
  print(`\n❌ WARNING: ${stats.total - stats.withDescriptions} products are missing descriptions.`);
} 