const fs = require("fs")

const syncDatabase = () => {
	let db = fs.readFileSync("db.json", "utf-8")
	const pokemons = JSON.parse(db)
	pokemons.forEach(function (pokemon, index) {
		pokemon.id = index + 1
		pokemon.url = `/assets/images/${pokemon.name}.png`
		// pokemon.types = [
		// 	pokemon.Type1 ? pokemon.Type1 : pokemon.Types[0],
		// 	pokemon.Type2 ? pokemon.Type2 : pokemon.Types[1],
		// ]
		// delete pokemon.Type1
		// delete pokemon.Type2
		delete pokemon.imageURL
	})
	db = JSON.stringify(pokemons)
	fs.writeFileSync("db.json", db)
}

module.exports = {
	syncDatabase,
}
