
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      default: "Furniture"
    },
    description: {
      type: String,
      default: "Quality furniture for your home and office."
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
