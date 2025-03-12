import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { CheckCircle, Timer, AlertCircle } from 'lucide-react';

const TakeQuiz: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string | null>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTnc, setShowTnc] = useState(true);
  const [score, setScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!showTnc) return;
    const createQuizAttempt = async () => {
      try {
        const response = await axios.post(`http://localhost:8080/api/quiz/attempt/create/${quizId}`, {}, { withCredentials: true });
        if (response.data?.createdAttempt) {
          setAttemptId(response.data.createdAttempt._id);
          setQuizData(response.data.createdAttempt);
          setTimeLeft(response.data.time * 60);
        }
      } catch (err: any) {
        setError(err.response?.status === 401 ? 'Please login to take this quiz' : 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    createQuizAttempt();
  }, [quizId, showTnc]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) handleFinish();
  }, [timeLeft]);

  const handleAcceptTnc = () => setShowTnc(false);
  
  const handleSelect = (option: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [currentQuestionIndex]: prev[currentQuestionIndex] === option ? null : option,
    }));
  };

  const handleSaveAndNext = async () => {
    if (!attemptId) return;
    setIsSubmitting(true);
    try {
      await axios.patch(`http://localhost:8080/api/quiz/attempt/save/question/${attemptId}`, {
        questionNumber: currentQuestionIndex + 1,
        answer: selectedOptions[currentQuestionIndex] || null,
      }, { withCredentials: true });
      setCurrentQuestionIndex(prev => Math.min(prev + 1, quizData!.questions.length - 1));
    } catch (err) {
      setError('Failed to save answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = async () => {
    if (!attemptId) return;
    setIsSubmitting(true);
    try {
      await axios.patch(`http://localhost:8080/api/quiz/attempt/save/question/${attemptId}`, {
        questionNumber: currentQuestionIndex + 1,
        answer: selectedOptions[currentQuestionIndex] || null,
      }, { withCredentials: true });
      
      const response = await axios.patch(
        `http://localhost:8080/api/quiz/attempt/save/${attemptId}`, 
        { parentQuizId: quizId, timeLeft: timeLeft }, 
        { withCredentials: true }
      );
      
      if (response.data?.totalMarks !== undefined) setScore(response.data.totalMarks);
    } catch (err) {
      setError('Error submitting quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getProgressPercentage = () => {
    if (!quizData) return 0;
    return ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
  };

  const getWarningClass = () => {
    if (timeLeft > 300) return 'text-yellow-200';
    if (timeLeft > 60) return 'text-amber-200';
    return 'text-red-200 animate-pulse'; 
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 w-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 w-screen">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-xl font-medium text-red-500">{error}</p>
        <Button className="mt-6 bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/')}>
          Return Home
        </Button>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 w-screen">
        <p className="text-xl font-medium text-gray-600">No quiz data available</p>
        <Button className="mt-6 bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/')}>
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-violet-400 to-violet-600 py-8 px-4 sm:px-6 lg:px-8 w-screen flex justify-center items-center">
      {showTnc ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50">
          <Card className="w-full max-w-md mx-auto animate-fade-in">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">Quiz Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">Please read and accept the terms and conditions to start the quiz:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>This quiz has a time limit of {Math.floor(timeLeft / 60)} minutes.</li>
                <li>You can navigate between questions using the previous and next buttons.</li>
                <li>Your answers are saved automatically when you move to the next question.</li>
                <li>You can change your answers at any time before submitting.</li>
                <li>Once you finish the quiz, you cannot retake it.</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                onClick={handleAcceptTnc}
              >
                Accept & Start Quiz
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="max-w-full mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full">
            {/* Header */}
            <div className="bg-gray-600 px-6 py-4 flex justify-between items-center">
              <h1 className="text-xl font-bold text-white truncate">{quizData.title}</h1>
              <div className={`flex items-center ${getWarningClass()} font-medium`}>
                <Timer className="mr-2 w-5 h-5" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="px-6 pt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Question {currentQuestionIndex + 1} of {quizData.questions.length}</span>
                <span>Progress: {Math.round(getProgressPercentage())}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>

            {/* Question */}
            <div className="px-6 py-6">
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    {quizData.questions[currentQuestionIndex].question}
                  </h2>
                  <div className="space-y-3">
                    {quizData.questions[currentQuestionIndex].options.map((option: string, i: number) => (
                      <label
                        key={i}
                        className={`block p-4 border rounded-lg cursor-pointer transition-all
                          ${selectedOptions[currentQuestionIndex] === option 
                            ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-300 ring-opacity-50' 
                            : 'hover:bg-blue-50 border-gray-200'}`}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 mr-3 rounded-full border flex items-center justify-center
                            ${selectedOptions[currentQuestionIndex] === option 
                              ? 'border-blue-600 bg-blue-600' 
                              : 'border-gray-400'}`}
                          >
                            {selectedOptions[currentQuestionIndex] === option && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <span className="text-gray-800">{option}</span>
                        </div>
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          value={option}
                          checked={selectedOptions[currentQuestionIndex] === option}
                          onChange={() => handleSelect(option)}
                          className="hidden"
                        />
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Navigation */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
              <Button 
                className="bg-gray-500 hover:bg-gray-600 text-white" 
                onClick={() => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))} 
                disabled={currentQuestionIndex === 0 || isSubmitting}
              >
                Previous
              </Button>
              
                {currentQuestionIndex < quizData.questions.length - 1 ? (
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white" 
                    onClick={handleSaveAndNext}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save & Next'}
                  </Button>
                ) : null}
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white" 
                  onClick={handleFinish}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Finish Quiz'}
                </Button>
              </div>
            </div>
          </div>
       
      )}
      
      {score !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm z-50">
          <Card className="w-full max-w-md mx-auto animate-fade-in">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">Quiz Completed!</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <p className="text-lg font-medium text-gray-700">Your responses have been submitted successfully.</p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                onClick={() => navigate(`/performance/${attemptId}`)}
              >
                View Results
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export { TakeQuiz };