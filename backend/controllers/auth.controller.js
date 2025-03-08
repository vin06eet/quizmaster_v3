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
            return res.status(400).json({ message: "all fields are required" });
        const existingUser = await User.findOne({ username });
        if (existingUser)
            return res.status(400).json({ error: "Username already exists" });
        const existingEmail = await User.findOne({ email });
        if (existingEmail)
            return res.status(400).json({ message: 'Email already exists' });
        const emailCorrect = validateEmail(email);
        const passwordCorrect = validatePassword(password);
        if (!emailCorrect)
            return res.status(400).json({ message: 'Invalid email' });
        if (!passwordCorrect)
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
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
            return res.status(404).json({ message: "User not found" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Incorrect password" });
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
        res.clearCookie('token');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const isLoggedIn = async (req, res)=>{
    try {
        userId = req.user._id
        const user = await User.findById(userId)
        if(!user)
            return res.status(400).json({istrue: false})
        return true
    } catch (error) {
        res.status(500).json({istrue: false})
    }
}

export {
    register,
    login,
    logout,
    isLoggedIn
}
