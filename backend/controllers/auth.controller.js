import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { validateEmail, validatePassword } from '../utils/validate.utils.js'

const register = async (req, res) => {
    try {
        const {
            username,
            email,
            password
        } = req.body
        if(!username || !email || !password)
            return res.status(400).json({ error: "all fields are required" });
        const existingUser = await User.findOne({ username });
        if (existingUser)
            return res.status(400).json({ error: "Username already exists" });
        const existingEmail = await User.findOne({ email });
        if (existingEmail)
            return res.status(400).json({ error: 'Email already exists' });
        const emailCorrect = validateEmail(email);
        const passwordCorrect = validatePassword(password);
        if (!emailCorrect)
            return res.status(400).json({ error: 'Invalid email' });
        if (!passwordCorrect)
            return res.status(400).json({ error: 'Password must be at least 8 characters with capital letters, special characters and numbers' });
        const user = new User({
            username,
            email,
            password
        });
        await user.save();
        const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: process.env.JWT_EXPIRES_IN,
            sameSite: 'strict'
        });
        res.status(201).json({
            message: "User created successfully",
            id: user._id,
            token: token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;
        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ error: "Incorrect password" });
        const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: process.env.JWT_EXPIRES_IN,
            sameSite: 'strict'
        });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: 'Strict' 
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const isLoggedIn = async (req, res)=>{
    try {
        const userId = req.user._id
        const user = await User.findById(userId)
        if(!user)
            return res.status(400).json({final: false})
        res.status(200).json({
            userID: userId,
            final: true
        })
    } catch (error) {
        res.status(500).json({istrue: false})
    }
}

const fetchAnnouncements = async (req, res)=>{
    try {
        const userId = req.user._id
        const user = await User.findById(userId)
        if(!user)
            return res.status(404).json({error: "user not found"})
        const announcements = user.announcements
        res.status(200).json({announcements})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export {
    register,
    login,
    logout,
    isLoggedIn,
    fetchAnnouncements
}
