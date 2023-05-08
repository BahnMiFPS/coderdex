const fs = require("fs")
const path = require("path")

const syncDatabase = () => {
	const imagesFolder = path.join(__dirname, "..", "assets", "images")

	let db = fs.readFileSync("db.json", "utf-8")
	const parsedDb = JSON.parse(db)
	let pokemons = parsedDb.data
	console.log(imagesFolder)
	pokemons = pokemons.filter((pokemon) => {
		const imagePath = path.join(imagesFolder, `${pokemon.name}.png`)
		return fs.existsSync(imagePath)
	})

	pokemons.forEach(function (pokemon, index) {
		pokemon.id = index + 1
		pokemon.url = `/assets/images/${pokemon.name}.png`

		pokemon.types = pokemon.types.map((type) => type.toLowerCase())
	})

	parsedDb.data = pokemons
	db = JSON.stringify(parsedDb)
	fs.writeFileSync("db.json", db)
}

module.exports = {
	syncDatabase,
}
