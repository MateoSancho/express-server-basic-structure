const router = require("express").Router();

// ℹ️ Test Route. Can be left and used for waking up the server if idle
router.get("/", (req, res, next) => {
  res.json("All good in here");
});

const authRouter = require("./auth.routes")
router.use("/auth", authRouter)

// Example of a Private route

const verifyToken = require("../middlewares/auth.middlewares")

router.get("/exapmle-private-route", verifyToken, (req,res) => {
  
  res.send("Example of private data. Here have some private potato.")

})

module.exports = router;
