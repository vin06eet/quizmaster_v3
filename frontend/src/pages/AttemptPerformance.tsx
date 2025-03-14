import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Award, ArrowLeft } from 'lucide-react';

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
          `http://localhost:8080/api/quiz/attempt/performance/${quizId}`,
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
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-slate-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Return Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!performanceDetails) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 w-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No performance data available for this attempt.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/')}>
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
    <div className="min-h-screen bg-slate-50 w-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 py-6 px-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">{attempt.title}</h1>
            <Button variant="outline" className="bg-white hover:bg-slate-100" onClick={() => navigate('/')}>
              Home
            </Button>
          </div>
          <p className="mt-1 text-indigo-100">{attempt.description}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Performance Summary Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-indigo-500" /> Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Score: {attempt.totalMarks}</span>
                    <span className="text-sm font-medium">{Math.round(scorePercentage)}%</span>
                  </div>
                  <Progress value={scorePercentage} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-100 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-indigo-600">{correctCount}</div>
                    <div className="text-xs text-slate-500">Correct</div>
                  </div>
                  <div className="bg-slate-100 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-amber-600">{attemptedCount - correctCount}</div>
                    <div className="text-xs text-slate-500">Incorrect</div>
                  </div>
                  <div className="bg-slate-100 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-slate-600">{attempt.questions.length - attemptedCount}</div>
                    <div className="text-xs text-slate-500">Unattempted</div>
                  </div>
                  <div className="bg-slate-100 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.floor(timeTaken / 60) > 0 
                        ? `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`
                        : `${timeTaken}s`}
                    </div>
                    <div className="text-xs text-slate-500">Time Taken</div>
                  </div>
                </div>

                <div className="bg-slate-100 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2 text-slate-700">Question Overview</h3>
                  <div className="flex flex-wrap gap-2">
                    {attempt.questions.map((question) => (
                      <Badge
                        key={question.questionNumber}
                        variant="outline"
                        className={`cursor-pointer px-3 py-1 ${
                          question.isCorrect 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : question.markedOption 
                              ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        } ${expandedQuestion === question.questionNumber ? 'ring-2 ring-indigo-500' : ''}`}
                        onClick={() => setExpandedQuestion(question.questionNumber === expandedQuestion ? null : question.questionNumber)}
                      >
                        {question.questionNumber}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Detail Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Question Details</CardTitle>
              <CardDescription>
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
                          <h3 className="mb-2 font-semibold flex items-start">
                            <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 px-2 mr-2">
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
                                    ? 'bg-green-50 border-green-200' 
                                    : option === question.answer 
                                      ? 'bg-green-50 border-green-200' 
                                      : option === question.markedOption 
                                        ? 'bg-red-50 border-red-200' 
                                        : 'bg-slate-50 border-slate-200'
                                  }`}
                              >
                                {option === question.answer ? (
                                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                ) : option === question.markedOption ? (
                                  <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                                ) : (
                                  <div className="h-5 w-5 mr-2 flex-shrink-0" />
                                )}
                                <span>{option}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-slate-100 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-slate-500">Your answer</p>
                              <p className={`font-medium ${question.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                {question.markedOption || 'Not attempted'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500">Correct answer</p>
                              <p className="font-medium text-green-600">{question.answer}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="px-2 py-1">
                            Score: {question.isCorrect ? question.score : 0}/{question.score}
                          </Badge>
                          <Badge variant={question.isCorrect ? "default" : "destructive"} className={`px-2 py-1 ${question.isCorrect ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" : ""}`}>
                            {question.isCorrect ? 'Correct' : question.markedOption ? 'Incorrect' : 'Not Attempted'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="rounded-full bg-slate-100 p-3 mb-4">
                    <Award className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Select a question to view details</h3>
                  <p className="text-slate-500 max-w-md">
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