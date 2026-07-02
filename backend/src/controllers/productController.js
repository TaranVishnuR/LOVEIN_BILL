const productService = require("../services/productService");

exports.getProducts = async (req, res) => {
  try {
    const products = await productService.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getActiveProducts = async (req, res) => {
  try {
    const products = await productService.getActiveProducts();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { productName, sellingPrice, stockQuantity, category } = req.body;

    if (!productName?.trim()) {
      return res.status(400).json({ message: "Product name is required" });
    }
    if (!category?.trim()) {
      return res.status(400).json({ message: "Category is required" });
    }
    if (isNaN(sellingPrice) || Number(sellingPrice) <= 0) {
      return res.status(400).json({ message: "Invalid selling price" });
    }
    if (isNaN(stockQuantity) || Number(stockQuantity) < 0) {
      return res.status(400).json({ message: "Invalid stock quantity" });
    }

    const product = await productService.createProduct(productName, sellingPrice, stockQuantity, category);
    res.status(201).json(product);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || "Server Error" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, sellingPrice, stockQuantity, category } = req.body;

    if (!productName?.trim()) {
      return res.status(400).json({ message: "Product name is required" });
    }
    if (!category?.trim()) {
      return res.status(400).json({ message: "Category is required" });
    }
    if (isNaN(sellingPrice) || Number(sellingPrice) <= 0) {
      return res.status(400).json({ message: "Invalid selling price" });
    }
    if (isNaN(stockQuantity) || Number(stockQuantity) < 0) {
      return res.status(400).json({ message: "Invalid stock quantity" });
    }

    const product = await productService.updateProduct(id, productName, sellingPrice, stockQuantity, category);
    res.json(product);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || "Server Error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || "Server Error" });
  }
};

exports.toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.toggleProductStatus(id);
    res.json(product);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || "Server Error" });
  }
};
