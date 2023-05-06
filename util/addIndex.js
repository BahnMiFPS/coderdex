const fs = require("fs")

const addIndex = () => {
	let db = fs.readFileSync("db.json", "utf-8")
	const pokemons = JSON.parse(db)
	pokemons.forEach(function (pokemon, index) {
		pokemon.id = index + 1
	})
	db = JSON.stringify(pokemons)
	fs.writeFileSync("db.json", db)
}

module.exports = {
	addIndex,
}
