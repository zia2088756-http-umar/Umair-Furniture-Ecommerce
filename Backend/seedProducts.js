
require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  { name: "Aaron Study Desk", image: "./Images/Table_1.png", price: 12000, category: "Study Desk" },
  { name: "Armes Study Desk", image: "./Images/Table_2.png", price: 15000, category: "Study Desk" },
  { name: "Amy Study Desk", image: "./Images/Table_3.png", price: 13000, category: "Study Desk" },
  { name: "Albro Study Desk", image: "./Images/Table_4.png", price: 11000, category: "Study Desk" },
  { name: "Aguilar Armchair", image: "./Images/chair1.png", price: 15000, category: "Chair" },
  { name: "Carol Armchair", image: "./Images/chair2.png", price: 18000, category: "Chair" },
  { name: "Clopton Armchair", image: "./Images/chair3.png", price: 14000, category: "Chair" },
  { name: "Ethel Armchair", image: "./Images/chair4.png", price: 13000, category: "Chair" },
  { name: "Sofa S-01", image: "./Images/sofa1.png", price: 20000, category: "Sofa" },
  { name: "Sofa S-02", image: "./Images/sofa2.png", price: 26000, category: "Sofa" },
  { name: "Sofa S-03", image: "./Images/sofa3.png", price: 25000, category: "Sofa" },
  { name: "Sofa S-04", image: "./Images/sofa4.png", price: 29000, category: "Sofa" }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Update existing products by name or insert new ones
    for (const product of products) {
      await Product.findOneAndUpdate(
        { name: product.name },
        { $set: product },
        { upsert: true, new: true, runValidators: true }
      );
    }

    console.log("12 products inserted/updated successfully!");
  } catch (error) {
    console.error("Seeding error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();
