const router = require("express").Router();
const delivery = require("../../controllers/delivery/delivery.controller");

router.post("/register", delivery.create);
router.get("/", delivery.getDeliveryAll);
router.put("/:id", delivery.update);
router.delete("/:id", delivery.delete);

router.put("/confirm/:id", delivery.comfirm);
router.put("/cancel/:id", delivery.cancel);

module.exports = router;
