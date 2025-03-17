import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface QuizItem {
  _id: string;
  title: string;
  description: string;
  Public: boolean;
}

const MyQuizzes: React.FC = () => {
  const [quizzesCreated, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-700 w-screen">
        <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading your quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-700 w-screen">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Quizzes</h3>
            <p className="text-red-500 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8 w-screen">
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={() => navigate("/")} 
          className="flex items-center gap-2 bg-white text-indigo-700 px-4 py-2 rounded-full shadow-lg hover:bg-indigo-50 transition-all duration-300 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Home
        </button>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
            My Quizzes
          </h1>
          <p className="text-indigo-200 max-w-xl mx-auto">
            Manage, update, and take your created quizzes
          </p>
          
          <button 
            onClick={() => navigate("/upload")} 
            className="mt-6 inline-flex items-center px-6 py-3 bg-white text-indigo-700 font-medium rounded-full shadow-lg hover:bg-indigo-50 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Quiz
          </button>
        </div>
        
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {quizzesCreated.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">No quizzes yet</h3>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">
                You haven't created any quizzes yet. Start by creating your first quiz to see it here.
              </p>
              <button 
                onClick={() => navigate("/upload")}
                className="mt-6 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Your First Quiz
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {quizzesCreated.map((quiz, index) => (
                <li key={quiz._id} className="group hover:bg-indigo-50 transition-all duration-200">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-800 font-semibold text-sm mr-3">
                            {index + 1}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                            {quiz.title}
                          </h3>
                          {quiz.Public && (
                            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Public
                            </span>
                          )}
                          {!quiz.Public && (
                            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Private
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-gray-700">{quiz.description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button 
                        variant="default" 
                        onClick={() => handleTakeQuiz(quiz._id)}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg shadow hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Take Quiz
                      </Button>
                      
                      <Button 
                        variant="default" 
                        onClick={() => handleUpdateQuiz(quiz._id)}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium rounded-lg shadow hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Update Quiz
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg shadow hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="text-center mt-8 text-indigo-200 text-sm">
          <p>Need help with your quizzes? Contact our support team for assistance.</p>
        </div>
      </div>
    </div>
  );
};

export default MyQuizzes;