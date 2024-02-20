const router = require("express").Router();
const products = require("../../controllers/product/product.controller");
const authAdmin = require("../../lib/auth.admin");
const authAgent = require("../../lib/auth.agent");
const auth = require("../../lib/auth.me")

router.post("/", authAdmin, products.create);
router.get("/", auth, products.getProductAll);
router.get("/:id", auth, products.getProductById);
router.put("/:id", authAdmin, products.update);
router.delete("/:id", authAdmin, products.delete);

module.exports = router;