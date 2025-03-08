import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    questions: [{
        questionNumber: {
            type: Number,
            required: true
        },
        question: {
            type: String,
            required: true
        },
        options: [{
            type: String,
            required: true
        }],
        answer: {
            type: String,
            required: true
        },
        marks: {
            type: Number,
            required: true
        }
    }],
    time: {
        type: Number,
        default: Infinity
    },
    difficultyLevel: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Easy"
    },
    Public: {
        type: Boolean,
        default: true
    },
    attemptedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    attempts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attempt'
    }]
}, {timestamps: true})

export default mongoose.model('Quiz', quizSchema)