import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trophy, Plus, Play, Pencil, Trash, Send, X } from "lucide-react";

interface QuizItem {
  _id: string;
  title: string;
  description: string;
  Public: boolean;
}

interface SharePopupProps {
  quizId: string;
  quizTitle: string;
  onClose: () => void;
}

const SharePopup: React.FC<SharePopupProps> = ({ quizId, quizTitle, onClose }) => {
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ text: "Please enter an email address", type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `http://localhost:8080/api/quiz/send/${quizId}`, 
        { email }, 
        { withCredentials: true }
      );
      
      setMessage({ text: "Quiz shared successfully!", type: 'success' });
      setEmail("");
      
      // Close the popup after 2 seconds on success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.error || "Failed to share quiz", 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        <h3 className="text-xl font-bold text-white mb-1">Share Quiz</h3>
        <p className="text-gray-400 mb-4">Share "{quizTitle}" with another user</p>
        
        <form onSubmit={handleShare}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Recipient's Email
            </label>
            <input 
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full bg-[#0A0F1F] text-white border border-gray-800 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          
          {message.text && (
            <div className={`p-3 rounded-lg mb-4 ${
              message.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800/50' : 
              'bg-red-900/30 text-red-400 border border-red-800/50'
            }`}>
              {message.text}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="mr-2 text-gray-400 hover:text-white"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-full shadow transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Sharing...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Share Quiz
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MyQuizzes: React.FC = () => {
  const [quizzesCreated, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [sharePopup, setSharePopup] = useState<{ isOpen: boolean; quizId: string; quizTitle: string }>({
    isOpen: false,
    quizId: "",
    quizTitle: ""
  });
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

  const handleShareQuiz = (quizId: string, quizTitle: string) => {
    setSharePopup({
      isOpen: true,
      quizId,
      quizTitle
    });
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
      <div className="w-screen min-h-screen flex items-center justify-center bg-[#0A0F1F]">
        <div className="bg-[#0E1225] border border-gray-800/50 p-8 rounded-lg shadow-xl flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-r-transparent border-yellow-500 animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-300">Loading your quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen min-h-screen flex items-center justify-center bg-[#0A0F1F]">
        <div className="bg-[#0E1225] border border-gray-800/50 p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-200 mb-2">Error Loading Quizzes</h3>
            <p className="text-red-400 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-full shadow transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen text-white bg-[#0A0F1F]">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-[#0A0F1F] z-[-1]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.4),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(234,179,8,0.4),transparent_30%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
      </div>
      
      {/* Share Popup */}
      {sharePopup.isOpen && (
        <SharePopup 
          quizId={sharePopup.quizId}
          quizTitle={sharePopup.quizTitle}
          onClose={() => setSharePopup({ isOpen: false, quizId: "", quizTitle: "" })}
        />
      )}
      
      {/* Header with home button */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 border-b border-gray-800/50 bg-[#0A0F1F]/80 backdrop-blur-md shadow-md">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Trophy size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">QuizMaster</span>
          </Link>
        </div>
        
        <Link to="/">
          <Button variant="ghost" className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white">
            Back to Home
          </Button>
        </Link>
      </div>
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">
            My <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Quizzes</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mt-4"></div>
          <p className="mt-4 text-gray-300">
            Manage, update, and take your created quizzes
          </p>
          
          <Button 
            onClick={() => navigate("/upload")} 
            className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium rounded-full shadow transition-all duration-200"
          >
            <Plus size={18} className="mr-2" />
            Create New Quiz
          </Button>
        </div>
        
        <div className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 rounded-lg shadow-lg overflow-hidden">
          {quizzesCreated.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-200">No quizzes yet</h3>
              <p className="mt-2 text-gray-400 max-w-md mx-auto">
                You haven't created any quizzes yet. Start by creating your first quiz to see it here.
              </p>
              <Button 
                onClick={() => navigate("/upload")}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium rounded-full shadow transition-all duration-200"
              >
                <Plus size={18} className="mr-2" />
                Create Your First Quiz
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {quizzesCreated.map((quiz, index) => (
                <div key={quiz._id} className="group p-6 hover:bg-[#0A0F1F]/50 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400 font-semibold text-sm mr-3">
                          {index + 1}
                        </div>
                        <h3 className="text-xl font-bold text-gray-100 group-hover:text-yellow-400 transition-colors">
                          {quiz.title}
                        </h3>
                        {quiz.Public ? (
                          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800/50">
                            Public
                          </span>
                        ) : (
                          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800/30 text-gray-400 border border-gray-700/50">
                            Private
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-gray-400">{quiz.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button 
                      variant="default" 
                      onClick={() => handleTakeQuiz(quiz._id)}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-full shadow transition-all duration-200"
                    >
                      <Play size={16} className="mr-2" />
                      Take
                    </Button>
                    
                    <Button 
                      variant="default" 
                      onClick={() => handleUpdateQuiz(quiz._id)}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium rounded-full shadow transition-all duration-200"
                    >
                      <Pencil size={16} className="mr-2" />
                      Update
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      onClick={() => handleDeleteQuiz(quiz._id)}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-full shadow transition-all duration-200"
                    >
                      <Trash size={16} className="mr-2" />
                      Delete
                    </Button>
                    
                    <Button 
                      variant="default"
                      onClick={() => handleShareQuiz(quiz._id, quiz.title)}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-full shadow transition-all duration-200"
                    >
                      <Send size={16} className="mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>Need help with your quizzes? Contact our support team for assistance.</p>
        </div>
      </div>
    </div>
  );
};

export default MyQuizzes;