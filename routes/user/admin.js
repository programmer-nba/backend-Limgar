const router = require("express").Router();
const admins = require("../../controllers/user/admin.controller");
// const authAdmin = require("../../lib/authAdmin");

router.post("/", admins.create);
router.get("/", admins.getAdminAll);
router.get("/:id", admins.getAdminById);
router.put("/:id", admins.update);
router.delete("/:id", admins.delete);

module.exports = router;
