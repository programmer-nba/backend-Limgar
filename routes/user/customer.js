const router = require("express").Router();
const customer = require("../../controllers/user/customer.controller");
//const row = require("../../controllers/user/row.controller")
//const authAdmin = require("../../lib/auth.admin");

router.post("/register", customer.create);
router.get("/", customer.getCustomerAll);
router.get("/findtel", customer.getCustomerByTelephone);
router.put("/:id", customer.update);
router.delete("/:id", customer.delete);

/*router.post("/row", row.create);
router.get("/row/all", row.getRowAll);
router.get("/row/:id", row.getRowById);
router.put("/row/:id", row.update);
router.delete("/row/:id", row.delete);*/

router.put("/customer/confirm/:id", customer.comfirm);
router.put("/customer/cancel/:id", customer.cancel);

module.exports = router;
