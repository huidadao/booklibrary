const express = require('express')
const Auth = require('../models/auth')
const Book = require('../models/book')
const router = express.Router()

const multer = require('multer')
const path = require('path')
const fs = require('fs')
const uploadPath = path.join('public', Book.coverImageBasePath)
// const imageMimeTypes = ['images/jpeg', 'images/jpg', 'images/png', 'images/gif']

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadPath)
    },
    filename: (req, file, callback) => {
        console.log(file),
        callback(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.gif') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits: {
        fileSize: 1024 * 1024
    }
}).single('cover')

// All Books Route
router.get('/', async (req, res) => {
    let query = Book.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishedDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishedDate', req.query.publishedAfter)
    }
    console.log(Date(req.query.publishedBefore))
    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New Books Route
router.get('/new', async (req, res) => {
    try {
        const authors = await Auth.find()
        const book = new Book()
        res.render('books/new', { 
            authors: authors,
            book: book 
        })
    } catch {
        res.redirect(`/books`)
    }
})

// Create Books Route
router.post('/', (req, res) => {
    upload(req, res, (err) => {
        const fileName = req.file != null ? req.file.filename : null
        const { title, author, pageCount, description } = req.body
        const book = new Book({ 
            title,
            author, 
            publishDate: new Date(req.body.publishDate), 
            pageCount, 
            coverImageName: fileName, 
            description 
        })

        if (err) {
            console.log(err)
            renderNewPage(res, book, hasError=true)
        }

        try {
            const newBook = book.save()
            // res.redirect(`books/${newBook.id}`)
            res.redirect('books')
        } catch {
            if (book.coverImageName != null) {
                removeBookCover(book.coverImageName)
            }
            renderNewPage(res, book, hasError=true)
        }
    })
})


function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.log(err)
    })
}


async function renderNewPage(res, book, hasError=false) {
    try {
        const authors = await Auth.find()
        const params = {
            authors: authors,
            book: book 
        }
        if (hasError) params.errMessage = 'Error Creating Book'
        res.render('books/new', params)
    } catch {
        res.redirect(`/books`)
    }
}


module.exports = router