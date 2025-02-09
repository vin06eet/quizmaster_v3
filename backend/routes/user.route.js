import express from 'express'
import { getUser, updateUser, deleteUser, displayAllUser } from '../controllers/user.controller.js'
import authenticate from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/user/:id', authenticate, getUser)
router.put('/user/:id', authenticate, updateUser)
router.delete('/user/:id', authenticate, deleteUser)
router.get('/user', authenticate, displayAllUser)

export default router