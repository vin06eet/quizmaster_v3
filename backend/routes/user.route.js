import express from 'express'
import { getUser, updateUser, deleteUser, displayAllUser, markAsRead, markAllAsRead, deleteNotif } from '../controllers/user.controller.js'
import authenticate from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/user/:id', authenticate, getUser)
router.put('/user/:id', authenticate, updateUser)
router.delete('/user/:id', authenticate, deleteUser)
router.get('/user', authenticate, displayAllUser)
router.patch('/user/markAsRead/:id', authenticate, markAsRead)
router.patch('/user/markAllAsRead', authenticate, markAllAsRead)
router.delete('/user/delete/notif/:id', authenticate, deleteNotif)

export default router