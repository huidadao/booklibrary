require('dotenv').config()

const express = require('express')
const app = express()
const connectDB = require('./config/dbConn')
const expressLayouts = require('express-ejs-layouts')
const path = require('path')
const PORT = process.env.PORT || 3000
const indexRouter = require('./routes/roots')


connectDB()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.set('layout', 'layouts/layout')

app.use(expressLayouts)
app.use(express.static('public'))

app.use('/', require('./routes/roots'))


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} ...`)
})