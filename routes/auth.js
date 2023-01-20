const express = require('express')
const router = express.Router()
const Auth = require('../models/auth')

// All Authors Route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }

    try {
        const auths = await Auth.find(searchOptions)
        res.render('auth/index', { 
            authors: auths,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New Author Route
router.get('/new', (req, res) => {
    res.render('auth/new', { auth: new Auth() })
})

// Create Author Route
router.post('/', async (req, res) => {
    const auth = new Auth({
        name: req.body.name
    })
    try {
        const newAuth = await auth.save()
        res.redirect(`auth/${newAuth.id}`)
    } catch {
        res.render('auth/new', {
            auth: auth,
            errorMessage: 'Error creating Auth'
        })
    }
})


module.exports = router