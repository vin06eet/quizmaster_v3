import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Award, ArrowLeft, Trophy, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
const apiUrl = import.meta.env.VITE_BACKEND_URL;

interface Question {
  questionNumber: string;
  question: string;
  options: string[];
  isCorrect: boolean;
  score: number;
  markedOption?: string;
  answer: string;
}

interface Attempt {
  _id: string;
  isCompleted: boolean;
  title: string;
  description: string;
  questions: Question[];
  timeTaken: number;
  totalMarks: number;
}

interface PerformanceResponse {
  attempt: Attempt;
}

const AttemptPerformance = () => {
  const { quizId } = useParams();
  const [performanceDetails, setPerformanceDetails] = useState<PerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPerformanceDetails = async () => {
      try {
        const response = await axios.get<PerformanceResponse>(
          `${apiUrl}/api/quiz/attempt/performance/${quizId}`,
          { withCredentials: true }
        );
        setPerformanceDetails(response.data);
      } catch (err) {
        setError('Failed to fetch performance details');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceDetails();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0A0F1F]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-lg text-yellow-400">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0A0F1F]">
        <Card className="w-full max-w-md bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 text-white">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Return Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!performanceDetails) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0F1F] w-screen">
        <Card className="w-full max-w-md bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 text-white">
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">No performance data available for this attempt.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-full">
              Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const { attempt } = performanceDetails;
  const timeTaken = attempt.timeTaken;
  const correctCount = attempt.questions.filter(q => q.isCorrect).length;
  const attemptedCount = attempt.questions.filter(q => q.markedOption).length;
  const scorePercentage = (attempt.totalMarks / (attempt.questions.length * Math.max(...attempt.questions.map(q => q.score)))) * 100;

  return (
    <div className="min-h-screen w-screen text-white bg-[#0A0F1F]">
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 pt-24 pb-20">
        <div className="text-center mb-8 animate-on-scroll">
          <h1 className="text-4xl font-bold">
            Quiz <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Results</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mt-4"></div>
          <p className="mt-4 text-gray-300">
            {attempt.title}: {attempt.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Performance Summary Card */}
          <Card className="lg:col-span-1 bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" /> Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">Score: {attempt.totalMarks}</span>
                    <span className="text-sm font-medium text-gray-300">{Math.round(scorePercentage)}%</span>
                  </div>
                  <Progress value={scorePercentage} className="bg-gray-200 [&>div]:bg-blue-500 h-2"/>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg text-center border border-gray-700/50">
                    <div className="text-2xl font-bold text-green-400">{correctCount}</div>
                    <div className="text-xs text-gray-400">Correct</div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg text-center border border-gray-700/50">
                    <div className="text-2xl font-bold text-red-400">{attemptedCount - correctCount}</div>
                    <div className="text-xs text-gray-400">Incorrect</div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg text-center border border-gray-700/50">
                    <div className="text-2xl font-bold text-gray-400">{attempt.questions.length - attemptedCount}</div>
                    <div className="text-xs text-gray-400">Unattempted</div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg text-center border border-gray-700/50">
                    <div className="text-2xl font-bold text-yellow-400">
                      {Math.floor(timeTaken / 60) > 0 
                        ? `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`
                        : `${timeTaken}s`}
                    </div>
                    <div className="text-xs text-gray-400">Time Taken</div>
                  </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <h3 className="text-sm font-medium mb-2 text-gray-300">Question Overview</h3>
                  <div className="flex flex-wrap gap-2">
                    {attempt.questions.map((question) => (
                      <Badge
                        key={question.questionNumber}
                        variant="outline"
                        className={`cursor-pointer px-3 py-1 w-12 h-12 text-center ${
                          question.isCorrect 
                            ? 'bg-green-900/30 text-green-400 border-green-700 hover:bg-green-900/50' 
                            : question.markedOption 
                              ? 'bg-red-900/30 text-red-400 border-red-700 hover:bg-red-900/50' 
                              : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                        } ${expandedQuestion === question.questionNumber ? 'ring-2 ring-yellow-500' : ''}`}
                        onClick={() => setExpandedQuestion(question.questionNumber === expandedQuestion ? null : question.questionNumber)}
                      >
                        {question.questionNumber}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button 
                  className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium rounded-full shadow transition-all duration-200"
                  onClick={()=>navigate(`/report/${quizId}`)}
                >
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Questions Detail Card */}
          <Card className="lg:col-span-2 bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 text-white shadow-lg">
            <CardHeader>
              <CardTitle>Question Details</CardTitle>
              <CardDescription className="text-gray-400">
                {expandedQuestion 
                  ? `Viewing question ${expandedQuestion}`
                  : 'Select a question number to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expandedQuestion ? (
                <>
                  {attempt.questions
                    .filter(q => q.questionNumber === expandedQuestion)
                    .map((question) => (
                      <div key={question.questionNumber} className="space-y-4">
                        <div>
                          <h3 className="mb-2 font-semibold flex items-start text-gray-200">
                            <span className="inline-flex items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400 px-2 mr-2">
                              {question.questionNumber}
                            </span>
                            {question.question}
                          </h3>
                          <div className="ml-6">
                            {question.options.map((option, idx) => (
                              <div 
                                key={idx} 
                                className={`p-3 mb-2 rounded-md border flex items-center
                                  ${option === question.answer && option === question.markedOption 
                                    ? 'bg-green-900/30 border-green-700 text-green-300' 
                                    : option === question.answer 
                                      ? 'bg-green-900/30 border-green-700 text-green-300' 
                                      : option === question.markedOption 
                                        ? 'bg-red-900/30 border-red-700 text-red-300' 
                                        : 'bg-gray-800/50 border-gray-700 text-gray-300'
                                  }`}
                              >
                                {option === question.answer ? (
                                  <Check className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                                ) : option === question.markedOption ? (
                                  <X className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                                ) : (
                                  <div className="h-5 w-5 mr-2 flex-shrink-0" />
                                )}
                                <span>{option}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-400">Your answer</p>
                              <p className={`font-medium ${question.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                {question.markedOption || 'Not attempted'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Correct answer</p>
                              <p className="font-medium text-green-400">{question.answer}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="px-2 py-1 bg-gray-800/50 text-gray-300 border-gray-700">
                            Score: {question.isCorrect ? question.score : 0}/{question.score}
                          </Badge>
                          <Badge variant={question.isCorrect ? "default" : "destructive"} className={`px-2 py-1 ${question.isCorrect ? "bg-green-900/30 text-green-400 border-green-700" : "bg-red-900/30 text-red-400 border-red-700"}`}>
                            {question.isCorrect ? 'Correct' : question.markedOption ? 'Incorrect' : 'Not Attempted'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="rounded-full bg-yellow-500/20 p-3 mb-4">
                    <Award className="h-8 w-8 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-gray-200">Select a question to view details</h3>
                  <p className="text-gray-400 max-w-md">
                    Click on any question number from the badge list to see your answers and the correct answers.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export { AttemptPerformance };