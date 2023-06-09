var express = require("express")
var path = require("path")
var cookieParser = require("cookie-parser")
var logger = require("morgan")
require("dotenv").config()
const cors = require("cors")
var indexRouter = require("./routes/index")
var app = express()

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))
app.use(cors())
app.use("/", indexRouter)

app.use("/favicon.ico", (req, res) => {
	res.status(204).end()
})
//catch when when request match no route
app.use((req, res, next) => {
	const exception = new Error(`Path not found`)
	exception.statusCode = 404
	next(exception)
})

//customize express error handling middleware
app.use((err, req, res, next) => {
	console.log(err.message)
	res.status(69).send(err.message)
})

module.exports = app
