import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, ChevronRight } from "lucide-react";

interface AttemptItem {
  _id: string;
  title: string;
  description: string;
  totalMarks: number;
  timeTaken: number;
  isCompleted: boolean;
  createdAt: string;
}

const MyAttempts: React.FC = () => {
  const [attempts, setAttempts] = useState<AttemptItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8080/api/getallattempts", {
          withCredentials: true,
        });
        if (Array.isArray(response.data)) {
          setAttempts(response.data);
        } else {
          throw new Error("Invalid data structure");
        }
        setLoading(false);
      } catch (error: any) {
        console.error(error);
        setError(error.response?.data?.message || "Failed to load attempts");
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  const handleViewPerformance = (attemptId: string) => {
    navigate(`/performance/${attemptId}`);
  };

  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format time taken in minutes and seconds
  const formatTimeTaken = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
  };

  if (loading) {
    return (
      <div className="w-screen min-h-screen flex items-center justify-center bg-[#0A0F1F]">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-300">Loading your attempts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen min-h-screen flex items-center justify-center bg-[#0A0F1F]">
        <div className="bg-gradient-to-b from-gray-900 to-[#0E1225] p-8 rounded-lg border border-gray-800/50 shadow-xl max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Attempts</h3>
            <p className="text-red-400 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-full hover:from-yellow-600 hover:to-orange-700 transition-all duration-200"
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
      
      <div className="flex justify-center min-h-screen pt-32 pb-20 px-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8 animate-on-scroll">
            <h1 className="text-4xl font-bold">
              My <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Attempts</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mt-4"></div>
            <p className="mt-4 text-gray-300">
              Review your quiz attempts and performance history
            </p>
            
            <Button 
              onClick={() => navigate("/browse")} 
              className="mt-6 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium rounded-full shadow transition-all duration-200"
            >
              Take New Quiz
              <ChevronRight size={18} className="ml-1" />
            </Button>
          </div>
          
          <div className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 rounded-lg shadow-sm overflow-hidden">
            {attempts.length === 0 ? (
              <div className="py-16 px-6 text-center">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">No attempts yet</h3>
                <p className="mt-2 text-gray-400 max-w-md mx-auto">
                  You haven't attempted any quizzes yet. Start by taking a quiz to see your performance here.
                </p>
                <Button 
                  onClick={() => navigate("/explore")}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium rounded-full shadow transition-all duration-200"
                >
                  Take Your First Quiz
                  <ChevronRight size={18} className="ml-1" />
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-800/50">
                {attempts.map((attempt, index) => (
                  <li key={attempt._id} className="group hover:bg-gray-800/20 transition-all duration-200">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-500/20 text-yellow-400 font-semibold text-sm mr-3">
                              {index + 1}
                            </span>
                            <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                              {attempt.title}
                            </h3>
                            <Badge variant={attempt.isCompleted ? "default" : "outline"} className={`ml-3 ${attempt.isCompleted ? "bg-green-900/50 text-green-400 hover:bg-green-900/50 border-green-700" : "bg-yellow-900/50 text-yellow-400 border-yellow-700"}`}>
                              {attempt.isCompleted ? "Completed" : "Incomplete"}
                            </Badge>
                          </div>
                          <p className="mt-2 text-gray-300">{attempt.description}</p>
                          
                          <div className="mt-3 flex flex-wrap items-center gap-x-6 text-sm text-gray-400">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {formatTimeTaken(attempt.timeTaken)}
                            </div>
                            
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Score: {attempt.totalMarks}
                            </div>
                            
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              {formatDate(attempt.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button 
                          variant="default" 
                          onClick={() => handleViewPerformance(attempt._id)}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium rounded-full shadow transition-all duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          View Performance
                          <ChevronRight size={18} className="ml-1" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAttempts;