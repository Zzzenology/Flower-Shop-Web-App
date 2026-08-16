// MongoDB script to add default descriptions to existing products
// Usage: mongosh "mongodb+srv://raulbercea04:zA7NUXieOxrPkeyG@freecluster.v1ejj1x.mongodb.net/FlowerShop" --file update_product_descriptions.js

// Connect to the FlowerShop database
use('FlowerShop');

// Default description to use for products without descriptions
const defaultDescription = "Produs frumos și de calitate, perfect pentru orice ocazie specială. Adaugă culoare și eleganță în orice spațiu.";

// Find products that don't have a description or have empty description
const productsWithoutDescription = db.products.find({
  $or: [
    { descriere: { $exists: false } },
    { descriere: null },
    { descriere: "" }
  ]
});

print("=== Updating Products with Default Descriptions ===");
print(`Default description: "${defaultDescription}"`);
print("");

// Count products that need updating
const countToUpdate = db.products.countDocuments({
  $or: [
    { descriere: { $exists: false } },
    { descriere: null },
    { descriere: "" }
  ]
});

print(`Found ${countToUpdate} products that need descriptions.`);

if (countToUpdate > 0) {
  print("Updating products...");
  
  // Update all products without descriptions
  const result = db.products.updateMany(
    {
      $or: [
        { descriere: { $exists: false } },
        { descriere: null },
        { descriere: "" }
      ]
    },
    {
      $set: { descriere: defaultDescription }
    }
  );
  
  print(`Successfully updated ${result.modifiedCount} products with default descriptions.`);
  
  // Show some examples of updated products
  print("\n=== Sample of Updated Products ===");
  const updatedProducts = db.products.find(
    { descriere: defaultDescription },
    { nume: 1, descriere: 1, _id: 1 }
  ).limit(5);
  
  updatedProducts.forEach(product => {
    print(`- ${product.nume}: "${product.descriere.substring(0, 50)}..."`);
  });
  
} else {
  print("No products found that need description updates.");
}

print("\n=== Summary ===");
const totalProducts = db.products.countDocuments();
const productsWithDescriptions = db.products.countDocuments({
  descriere: { $exists: true, $ne: null, $ne: "" }
});

print(`Total products in database: ${totalProducts}`);
print(`Products with descriptions: ${productsWithDescriptions}`);
print(`Products without descriptions: ${totalProducts - productsWithDescriptions}`);

print("\n=== Script completed successfully ==="); 