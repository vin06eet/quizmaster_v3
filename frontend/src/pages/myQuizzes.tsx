import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface QuizItem {
  _id: string;
  title: string;
  description: string;
  public: boolean;
}

const MyQuizzes: React.FC = () => {
  const [quizzesCreated, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/myQuizzes", {
          withCredentials: true,
        });

        if (Array.isArray(response.data.user.quizzesCreated)) {
          setQuizzes(response.data.user.quizzesCreated);
        } else {
          throw new Error("Invalid data structure");
        }

        setLoading(false);
      } catch (error: any) {
        console.error(error);
        setError(error.response?.data?.message || "Failed to load quizzes");
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleTakeQuiz = (quizId: string) => {
    navigate(`/take/${quizId}`);
  };

  const handleUpdateQuiz = (quizId: string) => {
    navigate(`/update/${quizId}`);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this quiz?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8080/api/quiz/${quizId}`, { withCredentials: true });

      // Remove the deleted quiz from state
      setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz._id !== quizId));
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("Failed to delete quiz. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 p-6 w-screen">
      <button 
      onClick={() => navigate("/Landing")} 
      className="fixed top-4 right-4 bg-teal-500 text-black px-4 py-2 rounded-md shadow-md hover:bg-blue-600 transition z-50"
    >
      Home
    </button>
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">My Quizzes</h1>

        {loading ? (
          <p className="text-gray-700 dark:text-gray-300 text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div className="space-y-6">
            {quizzesCreated.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center">No quizzes created yet.</p>
            ) : (
              quizzesCreated.map((quiz, index) => (
                <div
                  key={quiz._id}
                  className="p-5 border rounded-xl shadow-md bg-gray-50 transition-transform transform hover:scale-105 hover:shadow-lg"
                >
                  <h3 className="text-xl font-semibold text-gray-900">{index+1}. {quiz.title}</h3>
                  <p className="text-gray-700 mt-2">{quiz.description}</p>
                  <div className="mt-4 [@media(min-width:450px)]:flex-row flex-col flex gap-3 items-center">
                    <Button variant="default" className="bg-green-500 w-24" onClick={() => handleTakeQuiz(quiz._id)}>
                      Take Quiz
                    </Button>
                    <Button variant="default" className="bg-indigo-500 text-white w-24" onClick={() => handleUpdateQuiz(quiz._id)}>
                      Update Quiz
                    </Button>
                    <Button variant="destructive" className="bg-red-500 w-24" onClick={() => handleDeleteQuiz(quiz._id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyQuizzes;
