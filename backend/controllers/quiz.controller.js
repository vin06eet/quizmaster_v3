import Quiz from '../models/quiz.model.js';
import User from '../models/user.model.js';
import Attempt from '../models/attempt.model.js';
import mongoose from 'mongoose';

//works fine
const getAllQuizzes = async (req, res) => {
    try {
        const userID = req.user._id; 
        const user = await User.findById(userID).populate('quizzesCreated');
        if (!user)
            return res.status(404).json({ message: "User  not found" });
        const quizzes = user.quizzesCreated;
        if (!quizzes || quizzes.length === 0)
            return res.status(404).json({ message: "No quizzes found for this user" });
        res.status(200).json({ quizzes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//works fine
const getQuizById = async (req, res)=>{
    try {
        const quiz = await Quiz.findById(req.params.id);
        if(!quiz)
            return res.status(404).json({message: "No quiz of this id found"})
        res.status(200).json({quiz})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

//works fins
const updateQuiz = async (req, res) => {
    try {
        const quizData = req.body;
        const maxMarks = (quizData.questions || []).reduce((sum, e) => sum + (e.marks || 1), 0);
        const updatedData = { ...quizData, maxMarks };
        const quiz = await Quiz.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (!quiz)
            return res.status(404).json({ message: "No quiz of this ID found" });
        res.status(200).json({ quiz });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



//works fine
const deleteQuiz = async (req, res) => {
    try {
        const userID = req.user._id;
        const quiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!quiz)
            return res.status(404).json({ message: "No quiz of this ID found" });
        await User.findByIdAndUpdate(
            userID,
            { $pull: { quizzesCreated: req.params.id } }, 
            { new: true }
        );
        res.status(200).json({ message: "Quiz deleted successfully", quiz });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const uploadQuiz = async (req, res)=>{
    try {
        const {quizData} = req
        if(!quizData || !quizData.title || !quizData.questions)
            return res.status(400).json({message: "Invalid quiz data"})
        const maxMarks = quizData.questions.reduce((sum, e) => sum + (e.marks || 1), 0);
        const newQuiz = new Quiz({
            title: quizData.title,
            description: quizData.description || '',
            questions: quizData.questions.map(question => ({
                questionNumber: question.questionNumber,
                question: question.question,
                options: question.options,
                answer: question.answer || 'a',
                marks: 1 // Default marks for each question
            })),
            maxMarks: maxMarks,
            time: 240, // Default time
            difficultyLevel: "Easy", // Default difficulty level
            attemptedBy: []
        })
        const savedQuiz = await newQuiz.save()
        const user = await User.findById(req.user._id)
        if(!user)
            return res.status(404).json({error: 'user not found'})
        user.quizzesCreated.push(savedQuiz._id.toString())
        await user.save()
        res.status(200).json({
            message: "Quiz uploaded successfully",
            id: savedQuiz._id.toString()
        })
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

//works fine
// const uploadQuiz = async (req, res)=>{
//     try {
//         const {
//             title,
//             description,
//             questions,
//             time,
//             marks,
//             difficultyLevel,
//             attemptedBy
//         } = req.body;

//         if(!title||!questions)
//             return res.status(400).json({message: "Title , questions and marks are required"})

//         if(!Array.isArray(questions)||questions.length === 0)
//             return res.status(400).json({message: "Questions should be as a non-empty array"})
        
//         for(const ques of questions){
//             if(!ques.question||!ques.options||!ques.answer||!ques.marks)
//                 return res.status(400).json({message: "Question, options and answer are required"})
//             if(!Array.isArray(ques.options)||ques.options.length <=2 )
//                 return res.status(400).json({message: "Options should be as an array with atleast two options"})
//             if(!ques.options.includes(ques.answer))
//                 return res.status(400).json({message: "Answer should be in options"})
//         }
        
//         const allowedDifficulties = ["Easy", "Medium", "Hard"]
//         if(difficultyLevel && !allowedDifficulties.includes(difficultyLevel))
//             return res.status(400).json({message: "Difficulty level should be one of the following: Easy, Medium, Hard"})
//         const newQuiz = new Quiz({
//             title,
//             description,
//             questions,
//             time: time||240,
//             difficultyLevel: difficultyLevel||"Easy",
//             attemptedBy: []
//         })
//         const savedQuiz = await newQuiz.save();
//         const user = await User.findById(req.user._id)
//         if (!user)
//             return res.status(404).json({ error: 'User  not found' })
//         user.quizzesCreated.push(savedQuiz._id.toString())
//         await user.save()
//         res.status(200).json({savedQuiz})
//         console.log(savedQuiz._id.toString())
//     } catch (error) {
//         res.status(500).json({error: error.message})
//     }
// }

//works fine
const attemptQuiz = async (req, res)=>{
    try {
        const userID = req.user._id
        const quizID = req.params.id
        if (!mongoose.Types.ObjectId.isValid(quizID))
            return res.status(400).json({ error: 'Invalid quiz ID' });
        const quiz = await Quiz.findById(quizID);
        if (!quiz)
            return res.status(404).json({ message: "Quiz not found" });
        const isPublic = quiz.Public
        if(!isPublic)
            return res.status(404).json({error: "Quiz is not public"});
        const quizDetails = {
            title: quiz.title,
            description: quiz.description,
            questions: quiz.questions.map(question => ({
                question: question.question,
                options: question.options,
                marks: question.marks
            })),
            maxMarks: quiz.maxMarks,
            time: quiz.time,
            difficultyLevel: quiz.difficultyLevel
        };
        
        res.status(200).json(quizDetails);
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

//works fine
const submitQuiz = async (req, res) => {
    try {
        const quizID = req.params.id;
        const userID = req.user._id;
        const answers = req.body.answers; 

        if (!mongoose.Types.ObjectId.isValid(quizID) || !mongoose.Types.ObjectId.isValid(userID))
            return res.status(400).json({ error: 'Invalid quiz ID or user ID' });
        

        const quiz = await Quiz.findById(quizID);
        if (!quiz)
            return res.status(404).json({ message: "Quiz not found" });
        
        const isPublic = quiz.Public
        if(!isPublic)
            return res.status(404).json({error: "Quiz is not public"});

        if (!Array.isArray(answers) || answers.length !== quiz.questions.length)
            return res.status(400).json({ error: 'Invalid number of answers provided' });
        
        const attemptDetails = {
            title: quiz.title,
            description: quiz.description,
            questions: quiz.questions.map((question, index) => ({
                question: question.question,
                options: question.options,
                answer: question.answer, 
                markedOption: answers[index], 
                isCorrect: question.answer === answers[index], 
                marks: question.marks,
                score: question.answer === answers[index] ? question.marks : 0 
            })),
            maxMarks: quiz.maxMarks,
            timeTaken: req.body.timeTaken || 0, 
            totalMarks: 0 
        };

        
        attemptDetails.totalMarks = attemptDetails.questions.reduce((sum, question) => sum + question.score, 0);

        
        const newAttempt = new Attempt(attemptDetails);
        const savedAttempt = await newAttempt.save();

        
        quiz.attempts.push(savedAttempt._id);
        quiz.attemptedBy.push(userID);
        await quiz.save();
        
        const user = await User.findById(userID);
        user.quizzesAttempted.push(savedAttempt._id);
        await user.save();
        console.log(savedAttempt._id)
        res.status(200).json({
            message: 'Quiz attempt submitted successfully',
            attempt: savedAttempt,
            totalMarks: savedAttempt.totalMarks
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAttempt = async (req, res) =>{
    try {
        const userID = req.user._id
        const quizID = req.params.id
        const quiz = attemptQuiz.findById(quizID)
        const user = User.findById(userID)
        if(!user.quizzesAttempted.findOne(quizID))
            return res.status(400).json({error: "You have not attempted this quiz"})
        if(!quiz)
            return res.status(400).json({error: 'Quiz not found'})
        res.status(200).json({quiz})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const getAllAttempts = async (req, res) => {
    try {
        const userID = req.user._id;
        const user = await User.findById(userID);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const attemptIDs = user.quizzesAttempted; 
        if (!attemptIDs || attemptIDs.length === 0)
            return res.status(404).json({ message: "No quiz attempts found for this user" });
        const attempts = await Attempt.find({ _id: { $in: attemptIDs } }).populate('questions');
        const quizData = attempts.map(attempt => ({
            _id: attempt._id,
            title: attempt.title,
            description: attempt.description,
            totalMarks: attempt.totalMarks,
            timeTaken: attempt.timeTaken,
            isCompleted: attempt.isCompleted,
            createdAt: attempt.createdAt,
            maxMarks: attempt.maxMarks,
            questions: attempt.questions.map(q => ({
                questionNumber: q.questionNumber,
                question: q.question,
                options: q.options,
                answer: q.answer,
                markedOption: q.markedOption,
                isCorrect: q.isCorrect,
                score: q.score
            }))
        }));
        res.status(200).json(quizData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



const getAllPublicQuizzes = async (req, res)=>{
    try {
        const quizzes = await Quiz.find({Public: true}).populate('questions');
        if(!quizzes || quizzes.length === 0)
            return res.status(404).json({message: "No public quizzes found"})
        res.status(200).json({quizzes})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const createAttempt = async (req, res)=>{
    try {
        const userID = req.user._id
        const quizID = req.params.id
        const user = await User.findById(userID)
        if (!mongoose.Types.ObjectId.isValid(quizID))
            return res.status(400).json({ error: 'Invalid quiz ID' })
        const quiz = await Quiz.findById(quizID)
        if(!user)
            return res.status(400).json({error: 'user not found'})
        if(!quiz)
            return res.status(400).json({error: 'Quiz not found'})
        const isPublic = quiz.Public
        
        const quizDetails = {
            title: quiz.title,
            description: quiz.description,
            questions: quiz.questions.map(question => ({
                questionNumber: question.questionNumber,
                question: question.question,
                options: question.options,
                answer: question.answer,
                marks: question.marks
            })),
            maxMarks: quiz.maxMarks,
            time: quiz.time,
            difficultyLevel: quiz.difficultyLevel
        };
        
        const createdAttempt = new Attempt(quizDetails)
        await createdAttempt.save()

        quiz.attempts.push(createdAttempt._id)
        quiz.attemptedBy.push(userID)
        await quiz.save()

        user.quizzesAttempted.push(createdAttempt._id)
        await user.save()
        res.status(200).json({createdAttempt, time: quiz.time})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const saveQuestion = async (req, res)=>{
    try {
        const quizID = req.params.id
        const userID = req.user._id
        const user = await User.findById(userID)
        if (!mongoose.Types.ObjectId.isValid(quizID))
            return res.status(400).json({ error: 'Invalid quiz ID' })
        const quiz = await Attempt.findById(quizID)
        if(!user)
            return res.status(400).json({error: 'user not found'})
        if(!quiz)
            return res.status(400).json({error: 'Quiz not found'})
        const {questionNumber, answer} = req.body
        // if(!questionNumber||!answer)
        //     return res.status(400).json({message: 'both question number and answer are required'})
        const result = await Attempt.updateOne({
            _id: quizID,
            'questions.questionNumber': questionNumber
        },
        {
            $set: {
                'questions.$.markedOption': answer
            }
        })
        if(result.nModified === 0)
            return res.status(404).json({ error: 'Attempt or question not found' })
        res.status(200).json({message: 'Question saved successfully'})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const saveQuizAttempt = async (req, res) => {
    try {
        const quizID = req.params.id;
        const { parentQuizId, timeLeft } = req.body;

        if (!mongoose.Types.ObjectId.isValid(quizID) || !mongoose.Types.ObjectId.isValid(parentQuizId)) {
            return res.status(400).json({ error: 'Invalid quiz ID or parent Quiz ID' });
        }

        const attempt = await Attempt.findById(quizID);
        if (!attempt) {
            return res.status(404).json({ error: 'Attempt not found' });
        }

        const parentQuiz = await Quiz.findById(parentQuizId);
        if (!parentQuiz) {
            return res.status(404).json({ error: 'Parent quiz not found' });
        }

        if (!Array.isArray(parentQuiz.questions)) {
            return res.status(500).json({ error: 'Parent quiz questions data is invalid' });
        }

        let totalMarks = attempt.questions.reduce((sum, question) => {
            const correspondingQuestion = parentQuiz.questions.find(
                (q) => q.questionNumber.toString() === question.questionNumber.toString()
            );
            if (!correspondingQuestion) return sum; 
            const { answer: correctAnswer, marks: marksAwarded } = correspondingQuestion;
            question.isCorrect = question.markedOption === correctAnswer;
            question.score = question.isCorrect ? marksAwarded : 0;
            return sum + question.score;
        }, 0);

        attempt.totalMarks = totalMarks;
        attempt.timeTaken = parentQuiz.time*60 - timeLeft;
        attempt.isCompleted = true;

        await attempt.save();

        res.status(200).json({
            message: 'Total marks calculated and updated successfully',
            totalMarks,
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const getMyQuizzes = async (req, res) => {
    try {
        const userID = req.user._id
        if (!mongoose.Types.ObjectId.isValid(userID))
            return res.status(400).json({ error: 'Invalid user ID' })
        const user = await User.findById(userID).populate('quizzesCreated')
        if (!user)
            return res.status(404).json({ error: 'User not found' })
        res.status(200).json({ user: { quizzesCreated: user.quizzesCreated } })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

const attemptPerformance = async (req, res)=>{
    try {
        const attemptID = req.params.id
        if (!mongoose.Types.ObjectId.isValid(attemptID))
            return res.status(400).json({ error: 'Invalid attempt ID' })
        const attempt = await Attempt.findById(attemptID)
        if (!attempt)
            return res.status(404).json({ error: 'Attempt not found' })
        return res.status(200).json({attempt})

    } catch (error) {
        res.status(500).json({ error: error.message})
    }
}

const updateFinalMarks = async (req, res)=>{
    try {
        const attemptID = req.params.id
        const userID = req.user._id
        const finalScore = req.body
        if (!mongoose.Types.ObjectId.isValid(userID))
            return res.status(400).json({ error: 'Invalid user ID' })
        if (!mongoose.Types.ObjectId.isValid(attemptID))
            return res.status(400).json({ error: 'Invalid attempt ID' })
        const attempt = await Attempt.findById(attemptID)
        if (!attempt)
            return res.status(404).json({ error: 'Attempt not found' })
        attempt.totalMarks = finalScore
        await attempt.save()
        res.status(200).json({message: "Marks saved successfully"})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const shareQuiz = async (req, res) => {
    try {
        const userID = req.user._id
        const quizID = req.params.id
        const { email } = req.body
        if (!mongoose.Types.ObjectId.isValid(userID))
            return res.status(400).json({ error: 'Invalid user ID' })
        if (!mongoose.Types.ObjectId.isValid(quizID))
            return res.status(400).json({ error: 'Invalid quiz ID' })
        const addressID = await User.findOne({email})
        const user = await User.findById(userID)
        if(!user)
            return res.status(404).json({error: "User not found"})
        if(!addressID)
            return res.status(404).json({ error: 'User not found'})
        addressID.announcements.push({
            sentBy: user.username.toString(),
            message: quizID
        })
        await addressID.save()
        res.status(200).json({message: "message sent successfully"})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const deleteAttempt = async (req, res) => {
    try {
        const userID = req.user._id
        const attemptID = req.params.id
        const user = await User.findById(userID)
        if(!user)
            return res.status(404).json({error: "User not found"})
        await Attempt.findByIdAndDelete(attemptID)
        await User.findByIdAndUpdate(
            userID,
            { $pull: {quizzesAttempted: attemptID} },
            { new: true }
        )
        res.status(200).json({message: "Attempt deleted successfully"})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export {
    getAllQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    uploadQuiz,
    attemptQuiz,
    submitQuiz,
    getAttempt,
    getAllAttempts,
    getAllPublicQuizzes,
    saveQuestion,
    saveQuizAttempt,
    createAttempt,
    getMyQuizzes,
    attemptPerformance,
    updateFinalMarks,
    shareQuiz,
    deleteAttempt
}
