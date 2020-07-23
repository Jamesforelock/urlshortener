const { Router } = require('express')
const bcrypt = require('bcrypt')
const config = require('config')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')
const User = require('../models/User')
const router = Router()

// api/auth/register
router.post('/register',
    [
        check('email', 'Invalid email').isEmail(),
        check('password', 'Minimal length of password is 6 symbols')
            .isLength({ min: 6 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: "Incorrect registration data"
                })
            }
            
            const { email, password } = req.body
            
            const candidate = await User.findOne({ email })
            if (candidate) {
                return res.status(400).json({ message: 'This user does already exists' })
            }

            const hashedPassword = await bcrypt.hash(password, 12)
            const user = new User({ email, password: hashedPassword })

            await user.save()

            res.status(201).json({ message: 'The user has been created' })

        } catch (e) {
            res.status(500).json({ message: "Something went wrong" })
        }
    })

// api/auth/login
router.post('/login',
    [
        check('email', 'Input correct email').normalizeEmail().isEmail(),
        check('password', 'Input password').exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: "Incorrect login data"
                })
            }
            const {email, password} = req.body
            const user = await User.findOne({email})
            if(!user) {
                return res.status(400).json({message:'This user doesn\'t exist'})
            }

            const isMatch = await bcrypt.compare(password, user.password)

            if(!isMatch) {
                return res.status(400).json({message: 'Incorrect password or login!'})
            }

            const token = jwt.sign(
                {userId: user.id},
                config.get('jwtSecret'),
                {expiresIn: '1h'}
            )

            res.json({token, userId: user.id})

        } catch (e) {
            res.status(500).json({ message: "Something went wrong" })
        }
    })

module.exports = router