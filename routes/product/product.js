const router = require("express").Router();
const products = require("../../controllers/product/product.controller");
const authAdmin = require("../../lib/auth.admin");

router.post("/", authAdmin, products.create);
router.get("/", authAdmin, products.getProductAll);
router.get("/:id", authAdmin, products.getProductById);
router.put("/:id", authAdmin, products.update);
router.delete("/:id", authAdmin, products.delete);

module.exports = router;