const router = require("express").Router();
const products = require("../../controllers/product/product.controller");
const authAdmin = require("../../lib/auth.admin");
const authAgent = require("../../lib/auth.agent");
const auth = require("../../lib/auth.me");

router.post("/", authAdmin, products.create);
router.get("/", products.getProductAll);
router.get("/:id", products.getProductById);
router.put("/:id", authAdmin, products.update);
router.delete("/:id", products.delete);

module.exports = router;