import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Trophy, ChevronRight, Book, Check, X, AlertTriangle, ArrowLeft, Home } from "lucide-react";
import axios from "axios";

interface QuizResult {
  title: string;
  accuracy: number;
  strengths: string[];
  weaknesses: string[];
  areas_to_look_into: string[];
  detailed_report: string;
}

const QuizResultsPage: React.FC = () => {
  const [results, setResults] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { attemptId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`http://localhost:8080/api/test/route/${attemptId}`, {}, {withCredentials: true});

        let data = response.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
        console.log("Parsed data:", data);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        throw new Error("Invalid JSON response format");
      }
    }
   
        if (!data || typeof data !== 'object') {
          throw new Error("Invalid response format");
        }
        
        if (data.title === undefined || data.accuracy === undefined) {
          throw new Error("Missing required fields in response");
        }
        
        const formattedData: QuizResult = {
          title: data.title || "Quiz Results",
          accuracy: Number(data.accuracy) || 0,
          strengths: Array.isArray(data.strengths) ? data.strengths : [],
          weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
          areas_to_look_into: Array.isArray(data.areas_to_look_into) ? data.areas_to_look_into : [],
          detailed_report: data.detailed_report || ""
        };
        
        setResults(formattedData);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("Failed to load quiz results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchResults();
    } else {
      setError("No quiz attempt ID provided");
      setLoading(false);
    }
  }, [attemptId]);

  const getAccuracyColorClass = (accuracy: number) => {
    if (accuracy >= 80) return "from-green-500 to-green-600";
    if (accuracy >= 60) return "from-yellow-500 to-yellow-600";
    return "from-red-500 to-red-600";
  };

  if (loading) {
    return (
      <div className="w-screen min-h-screen text-white bg-[#0A0F1F] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-lg text-gray-300">Generating quiz report...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="w-screen min-h-screen text-white bg-[#0A0F1F] flex items-center justify-center">
        <div className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 rounded-lg shadow-sm p-8 max-w-md w-full">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
              <AlertTriangle size={24} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Error Loading Results</h2>
            <p className="text-gray-300 mb-6">{error || "Unable to load quiz results"}</p>
            <Button 
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium rounded-full shadow"
            >
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Debug render - will help identify if component reaches this point
  console.log("Rendering with results:", results);

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

      <div className="flex items-center justify-center min-h-screen pt-24 pb-16 px-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8 animate-on-scroll">
            <h1 className="text-4xl font-bold">
              Quiz <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Analysis</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mt-4"></div>
          </div>

          <div className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                <h2 className="text-2xl font-bold mb-4 md:mb-0">{results.title}</h2>
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="text-sm text-gray-400">Accuracy</div>
                    <div className={`text-2xl font-bold bg-gradient-to-r ${getAccuracyColorClass(results.accuracy)} bg-clip-text text-transparent`}>
                      {results.accuracy.toFixed(2)}%
                    </div>
                  </div>
                  <div className="w-16 h-16 relative">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-gray-700"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 * (1 - results.accuracy / 100)}
                        className={`text-gradient ${
                          results.accuracy >= 80 
                            ? 'text-green-500' 
                            : results.accuracy >= 60 
                              ? 'text-yellow-500' 
                              : 'text-red-500'
                        }`}
                      />
                    </svg>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <Trophy size={20} className={`${
                        results.accuracy >= 80 
                          ? 'text-green-400' 
                          : results.accuracy >= 60 
                            ? 'text-yellow-400' 
                            : 'text-red-400'
                      }`} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center mr-3">
                      <Check size={16} className="text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold">Strengths</h3>
                  </div>
                  <ul className="space-y-2">
                    {results.strengths && results.strengths.length > 0 ? (
                      results.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-400 mr-2">•</span>
                          <span className="text-gray-300">{strength}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-300">No specific strengths identified.</li>
                    )}
                  </ul>
                </div>

                <div className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center mr-3">
                      <X size={16} className="text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold">Areas for Improvement</h3>
                  </div>
                  {results.weaknesses && results.weaknesses.length > 0 ? (
                    <ul className="space-y-2">
                      {results.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-400 mr-2">•</span>
                          <span className="text-gray-300">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-300">No specific weaknesses identified.</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-900/30 flex items-center justify-center mr-3">
                    <Book size={16} className="text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Areas to Look Into</h3>
                </div>
                <div className="space-y-4">
                  {results.areas_to_look_into && results.areas_to_look_into.length > 0 ? (
                    results.areas_to_look_into.map((area, index) => (
                      <p key={index} className="text-gray-300">{area}</p>
                    ))
                  ) : (
                    <p className="text-gray-300">No specific areas identified for further study.</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center mr-3">
                    <AlertTriangle size={16} className="text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Detailed Report</h3>
                </div>
                <div className="text-gray-300 prose prose-invert max-w-none">
                  {results.detailed_report ? (
                    results.detailed_report.split("\n\n").map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))
                  ) : (
                    <p>No detailed report available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate("/myAttempts")}
              className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-medium rounded-full shadow px-6 py-3 flex items-center"
            >
              <ArrowLeft size={18} className="mr-2" />
              My Attempts
            </Button>
            <Button
              onClick={() => navigate("/browse")}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium rounded-full shadow px-6 py-3 flex items-center"
            >
              Try Another Quiz
              <ChevronRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { QuizResultsPage };