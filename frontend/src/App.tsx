import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Landing } from "./pages/Landing";
import { UploadForm } from "./pages/Upload";
import { DataDisplayPage } from "./pages/Browse";
import { UpdateQuiz } from './pages/Update'
import { TakeQuiz } from "./pages/TakeQuiz";
import MyQuizzes from "./pages/myQuizzes";
import { AttemptPerformance } from "./pages/AttemptPerformance";

function Home(){
  return (
    <div className="bg-gray-200 w-screen h-screen flex flex-col justify-center items-center">
      <h1>QuizMaster</h1>
      <div className="space-x-4 m-4">
        <Link to='/login'>
          <Button variant="outline">Login</Button>
        </Link>
        <Link to='/register'>
          <Button variant="outline">Register</Button>
        </Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/upload" element={<UploadForm />} />
        <Route path="/browse" element={<DataDisplayPage/>} />
        <Route path="/update/:quizId" element={<UpdateQuiz/>} />
        <Route path="/take/:quizId" element={<TakeQuiz/>} />
        <Route path="/myQuizzes" element={<MyQuizzes/>}/>
        <Route path="/performance/:quizId" element={<AttemptPerformance/>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
