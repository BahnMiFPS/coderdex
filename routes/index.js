var express = require("express")
const pokemonRouter = require("./pokemon.api")
const { addIndex } = require("../util/addIndex")
var router = express.Router()

/* GET home page. */
router.get("/", function (req, res, next) {
	addIndex()
	res.status(200).send("Pokedex")
})

router.use("/pokemon", pokemonRouter)

module.exports = router
