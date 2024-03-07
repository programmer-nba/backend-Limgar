const router = require("express").Router();
const customer = require("../../controllers/user/customer.controller");
//const row = require("../../controllers/user/row.controller")
//const authAdmin = require("../../lib/auth.admin");

router.post("/register", customer.create);
router.get("/", customer.getCustomerAll);
router.get("/findtel", customer.getCustomerByTelephone);
router.put("/:id", customer.update);
router.delete("/:id", customer.delete);

module.exports = router;
