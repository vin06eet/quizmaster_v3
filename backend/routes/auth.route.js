import express from 'express'
import {register, login, logout, isLoggedIn, fetchAnnouncements} from '../controllers/auth.controller.js'
import authenticate from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/islogged', authenticate, isLoggedIn)
router.get('/fetch', authenticate, fetchAnnouncements)

export default router