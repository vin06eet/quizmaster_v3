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
const FRONTEND_ORIGIN = 'https://quizmaster-sepia.vercel.app';

app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: true
  }));
  

  app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.sendStatus(200);
  });
  

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
