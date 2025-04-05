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
app.set('trust proxy', 1);
const FRONTEND_ORIGIN = 'https://quizmaster-v3.vercel.app';

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));
  

app.options('*', cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));
  
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