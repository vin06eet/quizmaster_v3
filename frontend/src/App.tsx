import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Landing } from "./pages/Landing";
import { UploadForm } from "./pages/Upload";
import { DataDisplayPage } from "./pages/Browse";
import { UpdateQuiz } from './pages/Update'
import { TakeQuiz } from "./pages/TakeQuiz";
import MyQuizzes from "./pages/myQuizzes";
import { AttemptPerformance } from "./pages/AttemptPerformance";
import { UploadCustomForm } from "./pages/UploadCustom";
import { TooltipProvider } from './components/ui/tooltip';


function App() {
  return (
    <TooltipProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Landing />} />
        <Route path="/upload" element={<UploadForm />} />
        <Route path="/browse" element={<DataDisplayPage/>} />
        <Route path="/update/:quizId" element={<UpdateQuiz/>} />
        <Route path="/take/:quizId" element={<TakeQuiz/>} />
        <Route path="/myQuizzes" element={<MyQuizzes/>}/>
        <Route path="/performance/:quizId" element={<AttemptPerformance/>}></Route>
        <Route path="/upload/custom" element={<UploadCustomForm/>}/>
      </Routes>
    </Router>
    </TooltipProvider>
  );
}

export default App;
