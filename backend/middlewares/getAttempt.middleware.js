import Quiz from '../models/quiz.model.js';
import User from '../models/user.model.js';
import Attempt from '../models/attempt.model.js';
import mongoose from 'mongoose';

const getAttempt = async (req, res, next) =>{
    try {
        const attemptID = req.params.id
        const attempt = await Attempt.findById(attemptID)
        if(!attempt)
            return req.status(404).json({error: "attempt not found"})
        res.attempt = attempt
        next()
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export default getAttempt;