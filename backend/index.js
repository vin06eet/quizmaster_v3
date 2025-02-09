import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import authRoute from "./routes/auth.route.js"
import userRoute from "./routes/user.route.js"
import quizRoute from "./routes/quiz.route.js"
import uploadRoute from "./routes/upload.route.js"

dotenv.config()
const app = express()
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))

app.use(bodyParser.json())
app.use(cookieParser())

connectDB()



app.use('/api', authRoute)
app.use('/api', userRoute)
app.use('/api', quizRoute)
app.use('/api', uploadRoute)

const PORT = process.env.PORT || 6000

app.listen(PORT, ()=>{
    console.log(`Listening at port ${PORT}`);
})
