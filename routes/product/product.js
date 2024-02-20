const router = require("express").Router();
const products = require("../../controllers/product/product.controller");
const authAdmin = require("../../lib/auth.admin");
const authAgent = require("../../lib/auth.agent")

router.post("/", authAdmin, products.create);
router.get("/", authAgent, products.getProductAll);
router.get("/:id", authAgent, products.getProductById);
router.put("/:id", authAdmin, products.update);
router.delete("/:id", authAdmin, products.delete);

module.exports = router;