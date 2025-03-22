import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema({
    isCompleted: {
        type: Boolean,
        default: false
    },
    title: {
        type: mongoose.Schema.Types.String,
        ref: 'Quiz'
    },
    description: {
        type: mongoose.Schema.Types.String,
        ref: 'Quiz'
    },
    questions: [{
        questionNumber: {
            type: mongoose.Schema.Types.String,
            ref: 'Quiz'
        },
        question: {
            type: mongoose.Schema.Types.String,
            ref: 'Quiz'
        },
        options: [{
            type: mongoose.Schema.Types.String,
            ref: 'Quiz'
        }],
        // Check this part
        answer: {
            type: mongoose.Schema.Types.String,
            ref: 'Quiz'
        },
        markedOption: {
            type: String
        },
        isCorrect: {
            type: Boolean,
            default: false
        },
        marks: {
            type: mongoose.Schema.Types.Number,
            ref: 'Quiz'
        },
        score: {
            type: Number,
            default: 0
        }
    }],
    timeTaken: {
        type: Number,
        default: 0
    },
    totalMarks: {
        type: Number,
        default: 0
    },
    maxMarks: {
        type: mongoose.Schema.Types.Number,
        ref: 'Quiz'
    }
},{timestamps: true});

export default mongoose.model('Attempt', attemptSchema)