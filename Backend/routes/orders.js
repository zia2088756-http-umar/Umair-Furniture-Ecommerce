
const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");

const router = express.Router();

// Create a new order
router.post("/", async (req, res) => {
  try {
    const { customer, items } = req.body;

    // Validate customer information
    if (
      !customer ||
      typeof customer.name !== "string" ||
      typeof customer.phone !== "string" ||
      typeof customer.address !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid customer information."
      });
    }

    const name = customer.name.trim();
    const phone = customer.phone.trim();
    const address = customer.address.trim();

    if (
      name.length < 2 || name.length > 100 ||
      phone.length < 7 || phone.length > 20 ||
      address.length < 5 || address.length > 300
    ) {
      return res.status(400).json({
        success: false,
        message: "Please check your name, phone and address."
      });
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty or contains too many items."
      });
    }

    // Validate cart item IDs and quantities
    const quantities = new Map();

    for (const item of items) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or quantity."
        });
      }

      const id = item.productId.toLowerCase();

      if (quantities.has(id)) {
        return res.status(400).json({
          success: false,
          message: "Duplicate cart products are not allowed."
        });
      }

      quantities.set(id, item.quantity);
    }

    // Fetch real products and prices from MongoDB
    const productIds = [...quantities.keys()];
    const products = await Product.find({
      _id: { $in: productIds }
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products are no longer available."
      });
    }

    const orderItems = products.map(product => ({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: quantities.get(product._id.toString())
    }));

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Delivery is currently free.
    const deliveryFee = 0;
    const total = subtotal + deliveryFee;

    const order = await Order.create({
      customer: { name, phone, address },
      items: orderItems,
      subtotal,
      deliveryFee,
      total
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: {
        id: order._id,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error("Order creation error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to place your order. Please try again."
    });
  }
});

// Get a single order by ID.
// Demo endpoint only; add authentication/authorization before production use.
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID."
      });
    }

    const order = await Order.findById(req.params.id).select(
      "-customer.phone -customer.address"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found."
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve order."
    });
  }
});

module.exports = router;
