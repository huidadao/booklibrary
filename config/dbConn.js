const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('Database connected successfully ...')
    } catch (err) {
        console.log(err)
    }
}

module.exports = connectDB