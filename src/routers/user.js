const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/user')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emailers/account')



//user signup
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.firstName)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (error) {
    res.status(400).send(error)
    }
    
})

//login into user account
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (error) {
        res.status(400).send()
    }
})

//login route
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token

        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

//logout from all sessions
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

//find users
router.get('/users/me/profile', auth , async (req, res) => {
    res.send(req.user)
})


//updating a user
router.patch('/users/me/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['firstName', 'lastName', 'email', 'password', 'phoneNumber']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)   
    })
    if (!isValidOperation) {
            return res.status(400).send({error: "Invalid updates"})
        }
    
    try {
        
        updates.forEach((update) => req.user[update]=req.body[update])

       await req.user.save()
        
       res.send(req.user) 
    } catch (error) {
        res.status(400).send()
    }
})

//deleting a user
router.delete('/users/me/profile/', auth, async (req, res) => {
    try {
        
        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.firstName)
            res.send(req.user)
        
    } catch (error) {
        res.status(500).send()
    }
})

//avatar upload
const upload = multer({
    
    limits: {
        fileSize:3000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|)$/)) {
            return cb(new Error ('Please upload an image'))
        }
        
       cb(undefined, true) 
    }
})

router.post('/users/me/profile/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 170, height: 170 }).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()

    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error:error.message})
})

router.delete('/users/me/profile/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router
