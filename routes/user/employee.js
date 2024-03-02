const router = require("express").Router()
const employee = require("../../controllers/user/employee.controller")
const authAdmin = require("../../lib/auth.admin")

router.post("/", authAdmin, employee.create);
router.get("/", authAdmin, employee.getEmployeetAll);
router.get("/:id", authAdmin, employee.getEmployeeById);
router.get("/stock/:id", authAdmin, employee.getEmployeeByStockId);
router.put("/:id", authAdmin, employee.update);
router.delete("/:id", authAdmin, employee.delete);

module.exports = router;