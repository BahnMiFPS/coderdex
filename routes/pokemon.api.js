const express = require("express")
const router = express.Router()
const fs = require("fs")
const allowedTypes = require("../constant/index")

router.get("/", (req, res, next) => {
	const allowedFilter = ["search", "type"]
	try {
		let { page, limit, ...filterQuery } = req.query
		page = parseInt(page) || 1
		limit = parseInt(limit) || 10
		//allow title,limit and page query string only
		const filterKeys = Object.keys(filterQuery)
		filterKeys.forEach((key) => {
			if (!allowedFilter.includes(key)) {
				const exception = new Error(`Query ${key} is not allowed`)
				exception.statusCode = 401
				throw exception
			}
			if (!filterQuery[key]) delete filterQuery[key]
		})
		//processing logic
		//Number of items skip for selection
		let offset = limit * (page - 1)

		//Read data from db.json then parse to JSobject
		let db = fs.readFileSync("db.json", "utf-8")
		let parsedData = JSON.parse(db)
		let pokemons = parsedData.data

		//Filter data by title
		let result = pokemons
		if (filterKeys.length) {
			filterKeys.forEach((condition) => {
				if (condition === "search") {
					const searchTerm = filterQuery[condition].toLowerCase()
					result = result.filter((pokemon) =>
						pokemon.name.toLowerCase().includes(searchTerm)
					)
				} else if (condition === "type") {
					const searchTypes = Array.isArray(filterQuery[condition])
						? filterQuery[condition].map((type) => type.toLowerCase())
						: [filterQuery[condition].toLowerCase()]
					result = result.filter((pokemon) =>
						searchTypes.every((searchType) =>
							pokemon.types.some((type) => type.toLowerCase() === searchType)
						)
					)
				}
			})
		}

		if (result.length === 0) {
			// If no matching Pokémon found, throw an error
			const error = new Error("No Pokemon found")
			error.statusCode = 404
			throw error
		}

		result = { data: result.slice(offset, offset + limit) }
		// Select the number of results by offset

		// Send response
		res.status(200).send(result)
	} catch (error) {
		next(error)
	}
})

router.get("/:id", (req, res) => {
	const pokemonId = parseInt(req.params.id) // Convert id to integer
	let db = fs.readFileSync("db.json", "utf-8")
	const parsedData = JSON.parse(db)
	const pokemons = parsedData.data

	const getPokemonById = (id) => {
		const pokemon = pokemons.find((pokemon) => pokemon.id === id)

		return pokemon || null
	}
	// Retrieve the Pokémon with the given id
	const pokemon = getPokemonById(pokemonId)

	if (!pokemon) {
		// Pokémon not found
		return res.status(404).json({ error: "Pokémon not found" })
	}

	// Get the previous and next Pokémon ids
	const previousPokemonId =
		pokemonId - 1 === 0 ? pokemons.length : pokemonId - 1
	const nextPokemonId = pokemonId + 1 > pokemons.length ? 1 : pokemonId + 1

	// Retrieve the previous and next Pokémon
	const previousPokemon = getPokemonById(previousPokemonId)
	const nextPokemon = getPokemonById(nextPokemonId)

	const response = {
		data: {
			pokemon,
			previousPokemon,
			nextPokemon,
		},
	}

	res.status(200).json(response)
})

router.post("/", (req, res, next) => {
	try {
		const { name, url, types } = req.body

		let db = fs.readFileSync("db.json", "utf-8")
		const pokemons = JSON.parse(db)

		//Missing required data
		if (!name || !url || !types) {
			const exception = new Error(`Missing required data. `)
			exception.statusCode = 401
			throw exception
		}
		// name existed
		const existed = pokemons.some((p) => p.name === name)

		if (existed) {
			const exception = new Error(`Pokemon ${name} is already existed`)
			exception.statusCode = 401
			throw exception
		}

		// //Type is invalid
		// if (!allowedTypes.includes(types[0]) || !allowedTypes.includes(types[1])) {
		// 	const exception = new Error(`Pokémon's type is invalid.`)
		// 	exception.statusCode = 401
		// 	throw exception
		// }

		// process input
		const newPokemon = {
			name,
			url,
			types,
		}
		//Read data from db.json then parse to JSobject

		//Add new book to book JS object

		pokemons.push(newPokemon)

		//Add new book to db JS object
		db = pokemons
		//db JSobject to JSON string
		db = JSON.stringify(db)
		//write and save to db.json
		fs.writeFileSync("db.json", db)
		//post send response
		res.status(200).send(newPokemon)
	} catch (error) {
		next(error)
	}
})

router.put("/:id", (req, res) => {
	const pokemonId = parseInt(req.params.id) // Convert id to integer
	const updatedData = req.body

	const dbData = fs.readFileSync("db.json", "utf-8")
	const pokemons = JSON.parse(dbData)

	// Get the index of the Pokémon with the given id in the pokemons array
	const pokemonIndex = pokemons.findIndex((pokemon) => pokemon.id === pokemonId)
	if (pokemonIndex === -1) {
		// Pokémon not found
		return res.status(404).json({ error: "Pokémon not found" })
	}

	// Update the Pokémon data at the found index
	pokemons[pokemonIndex] = {
		...pokemons[pokemonIndex],
		...updatedData,
	}

	// Save the updated pokemons array back to the data source (e.g., db.json)
	const updatedDbData = JSON.stringify(pokemons, null, 2)
	fs.writeFileSync("db.json", updatedDbData)

	res.status(200).json({ message: "Pokémon updated successfully" })
})

router.delete("/:id", (req, res) => {
	const pokemonId = parseInt(req.params.id) // Convert id to integer

	const dbData = fs.readFileSync("db.json", "utf-8")
	const pokemons = JSON.parse(dbData)

	// Get the index of the Pokémon with the given id in the pokemons array
	const pokemonIndex = pokemons.findIndex((pokemon) => pokemon.id === pokemonId)
	if (pokemonIndex === -1) {
		// Pokémon not found
		return res.status(404).json({ error: "Pokémon not found" })
	}

	// Update the Pokémon data at the found index
	pokemons.splice(pokemonIndex, 1)

	// Save the updated pokemons array back to the data source (e.g., db.json)
	const updatedDbData = JSON.stringify(pokemons)
	fs.writeFileSync("db.json", updatedDbData)

	res.status(200).json({ message: "Pokémon deleted successfully" })
})

module.exports = router
