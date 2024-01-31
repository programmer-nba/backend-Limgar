const router = require("express").Router();
const admins = require("../../controllers/user/admin.controller");
// const authAdmin = require("../../lib/authAdmin");
const auth_admin = require("../../lib/auth.admin");

router.post("/", auth_admin, admins.create);
router.get("/", auth_admin, admins.getAdminAll);
router.get("/:id", auth_admin, admins.getAdminById);
router.put("/:id", auth_admin, admins.update);
router.delete("/:id", auth_admin, admins.delete);

module.exports = router;
