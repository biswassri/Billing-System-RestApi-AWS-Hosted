const router = require("express").Router();
const {
  createUser,
  login,
  getUsers,
  updateUsers,
} = require("../controllers/user.controller");
const { basicAuthMiddleware } = require('../middlewares/auth.middleware')

router.post('/create', createUser);
router.put('/update', basicAuthMiddleware, updateUsers);
router.get("/details", basicAuthMiddleware, getUsers);

//router.post("/login", login);
//router.delete("/", checkToken, deleteUser);

module.exports = router;