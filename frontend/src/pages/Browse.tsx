import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Search, Home, Clock, FileText, DollarSign, Zap } from "lucide-react";

interface Question {
  marks: number;
}

interface DataItem {
  _id: string;
  title: string;
  description: string;
  time: number; 
  difficultyLevel: string;
  questions: Question[]; 
}

const DataDisplayPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8080/api/quiz/public/get",
          {
            withCredentials: true,
          }
        );

        if (Array.isArray(response.data.quizzes)) {
          setData(response.data.quizzes);
        } else {
          throw new Error("Invalid data structure");
        }

        setLoading(false);
      } catch (error: any) {
        console.error(error);
        setError(error.response?.data?.message || "Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTakeQuiz = (quizId: string) => {
    navigate(`/take/${quizId}`);
  };

  // Function to get background color by difficulty level
  const getDifficultyBadgeColor = (difficulty: string) => {
    switch(difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-900/30 text-green-400 border border-green-700/50";
      case "medium":
        return "bg-yellow-900/30 text-yellow-400 border border-yellow-700/50";
      case "hard":
        return "bg-red-900/30 text-red-400 border border-red-700/50";
      default:
        return "bg-blue-900/30 text-blue-400 border border-blue-700/50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1F] w-screen">
        <div className="bg-[#0E1225] p-8 rounded-lg shadow-xl border border-gray-800/50 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          <p className="mt-4 text-lg font-medium text-gray-300">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1F] w-screen">
        <div className="bg-[#0E1225] p-8 rounded-lg shadow-xl border border-gray-800/50 max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 mb-4 border border-red-700/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-200 mb-2">Error Loading Quizzes</h3>
            <p className="text-red-400 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-full hover:from-yellow-600 hover:to-orange-700 transition duration-150 ease-in-out"
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
      
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 border-b border-gray-800/50 bg-[#0A0F1F]/80 backdrop-blur-md shadow-md">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">QuizMaster</span>
          </Link>
        </div>
        
        <Link to="/">
          <button 
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 px-4 py-2 rounded-full shadow-lg transition-all duration-300 font-medium text-white"
          >
            <Home size={18} />
            Back to Home
          </button>
        </Link>
      </div>
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10 animate-fadeIn">
          <h1 className="text-4xl font-bold mb-2">
            Available <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Quizzes</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mt-4"></div>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto">
            Discover and take quizzes to test your knowledge and skills
          </p>
        </div>
        
        <div className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-800/50">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search quizzes by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-4 border border-gray-800 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 bg-gray-900/50 text-gray-200 placeholder-gray-500"
              />
            </div>
          </div>
          
          {data.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
            <div className="py-12 px-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-300">No quizzes found</h3>
              <p className="mt-1 text-gray-400">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-800/50">
              {data
                .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item) => {
                  const totalMarks = item.questions?.reduce(
                    (sum, question) => sum + question.marks,
                    0
                  ) || 0;
                  
                  const totalQuestions = item.questions?.length || 0;
                  
                  return (
                    <li key={item._id} className="group hover:bg-gray-800/20 transition-all duration-200">
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-200 group-hover:text-yellow-400 transition-colors">
                              {item.title}
                            </h3>
                            <p className="mt-2 text-gray-400">{item.description}</p>
                            
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-700/50">
                                <Clock size={14} className="mr-1" />
                                {item.time} min
                              </span>
                              
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-900/30 text-purple-400 border border-purple-700/50">
                                <FileText size={14} className="mr-1" />
                                {totalQuestions} Questions
                              </span>
                              
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900/30 text-blue-400 border border-blue-700/50">
                                <DollarSign size={14} className="mr-1" />
                                {totalMarks} Marks
                              </span>
                              
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyBadgeColor(item.difficultyLevel)}`}>
                                <Zap size={14} className="mr-1" />
                                {item.difficultyLevel}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-medium rounded-full shadow-md hover:from-yellow-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200 transform hover:-translate-y-1"
                            onClick={() => handleTakeQuiz(item._id)}
                          >
                            Take Quiz
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>

        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>Can't find what you're looking for? Contact us for custom quizzes.</p>
        </div>
      </div>
    </div>
  );
};

export { DataDisplayPage };