import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../components/ui/card';
import { CheckCircle, AlertCircle, Flag, BookOpen, ChevronLeft, ChevronRight, Award, Clock, Menu, X } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../components/ui/tooltip';


const TakeQuiz: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string | null>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [reviewedQuestions, setReviewedQuestions] = useState<Set<number>>(new Set());
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTnc, setShowTnc] = useState(true);
  const [score, setScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuestionPanel, setShowQuestionPanel] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [originalTimeLeft, setOriginalTimeLeft] = useState<number>(0);
  const [completionTime, setCompletionTime] = useState<number>(0);

  useEffect(() => {
    if (!showTnc) return;
    const createQuizAttempt = async () => {
      try {
        const response = await axios.post(`http://localhost:8080/api/quiz/attempt/create/${quizId}`, {}, { withCredentials: true });
        if (response.data?.createdAttempt) {
          setAttemptId(response.data.createdAttempt._id);
          setQuizData(response.data.createdAttempt);
          setTimeLeft(response.data.time * 60);
          setOriginalTimeLeft(response.data.time * 60);
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
    if (timeLeft === null || timeLeft <= 0 || isPaused) return;
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isPaused]);

  useEffect(() => {
    if (timeLeft === 0) handleFinish();
  }, [timeLeft]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleAcceptTnc = () => setShowTnc(false);
  
  const handleSelect = (option: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [currentQuestionIndex]: prev[currentQuestionIndex] === option ? null : option,
    }));
    
    const newReviewed = new Set(reviewedQuestions);
    newReviewed.add(currentQuestionIndex);
    setReviewedQuestions(newReviewed);
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
      setToastMessage("Answer saved successfully");
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
      setCompletionTime(originalTimeLeft - timeLeft);
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const handleNavigateToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowQuestionPanel(false);
  };

  const toggleFlagQuestion = () => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentQuestionIndex)) {
      newFlagged.delete(currentQuestionIndex);
      setToastMessage("Question unflagged");
    } else {
      newFlagged.add(currentQuestionIndex);
      setToastMessage("Question flagged for review");
    }
    setFlaggedQuestions(newFlagged);
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getProgressPercentage = () => {
    if (!quizData) return 0;
    const answered = Object.keys(selectedOptions).length;
    return (answered / quizData.questions.length) * 100;
  };

  const getQuestionStatus = (index: number) => {
    if (flaggedQuestions.has(index)) return 'flagged';
    if (selectedOptions[index]) return 'answered';
    if (reviewedQuestions.has(index)) return 'reviewed';
    return 'unanswered';
  };

  const getWarningClass = () => {
    if (timeLeft > 300) return 'text-emerald-400';
    if (timeLeft > 60) return 'text-amber-400';
    return 'text-red-400 animate-pulse'; 
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
    setToastMessage(isPaused ? "Quiz resumed" : "Quiz paused - timer stopped");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 w-screen">
        <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-xl font-medium text-gray-300">Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 w-screen text-white">
        <AlertCircle className="w-20 h-20 text-red-500 mb-6" />
        <p className="text-2xl font-medium text-red-400">{error}</p>
        <Button className="mt-8 bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-lg" onClick={() => navigate('/')}>
          Return Home
        </Button>
      </div>
    );
  }

  if (!quizData) {
    return (
      
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 w-screen text-white">
        <BookOpen className="w-20 h-20 text-gray-400 mb-6" />
        <p className="text-2xl font-medium text-gray-300">No quiz data available</p>
        <Button className="mt-8 bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-lg" onClick={() => navigate('/')}>
          Return Home
        </Button>
      </div>
     
    );
  }

  const renderQuestionNavigationPanel = () => {
    if (!quizData || !quizData.questions) return null;
    
    return (
      
      <div className={` fixed inset-y-0 left-0 w-72 bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${showQuestionPanel ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Questions</h3>
          <Button variant="ghost" size="icon" onClick={() => setShowQuestionPanel(false)}>
            <X className="h-5 w-5 text-gray-400" />
          </Button>
        </div>
        <div className="p-4 border-b border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-center"><div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div> Unanswered</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div> Answered</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div> Reviewed</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div> Flagged</div>
          </div>
        </div>
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
          <div className="grid grid-cols-5 gap-2">
            {quizData.questions.map((_: any, index: number) => {
              const status = getQuestionStatus(index);
              let bgColor = 'bg-gray-700';
              if (status === 'answered') bgColor = 'bg-green-600';
              if (status === 'reviewed') bgColor = 'bg-blue-600';
              if (status === 'flagged') bgColor = 'bg-red-600';
              if (index === currentQuestionIndex) bgColor += ' ring-2 ring-white';
              
              return (
                <button 
                  key={index}
                  className={`w-10 h-10 ${bgColor} rounded flex items-center justify-center text-white font-medium transition hover:opacity-80`}
                  onClick={() => handleNavigateToQuestion(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium text-gray-400">QUIZ SUMMARY</h4>
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Total Questions:</span>
                <span>{quizData.questions.length}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Answered:</span>
                <span>{Object.keys(selectedOptions).length}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Flagged for Review:</span>
                <span>{flaggedQuestions.size}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Unanswered:</span>
                <span>{quizData.questions.length - Object.keys(selectedOptions).length}</span>
              </div>
              <div className="pt-2 border-t border-gray-700">
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>Completion:</span>
                  <span>{Math.round(getProgressPercentage())}%</span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2 bg-gray-700" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
    );
  };

  return (
    <div className="w-screen">
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex flex-col w-screen">
      {showTnc ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md z-50">
          <Card className="w-full max-w-lg mx-auto animate-fade-in bg-gray-800 text-white border-0 shadow-2xl">
            <CardHeader className="text-center bg-indigo-800 rounded-t-lg p-6">
              <CardTitle className="text-3xl font-bold text-white">{quizData.title}</CardTitle>
              <CardDescription className="text-gray-300 mt-2">Time Limit: {Math.floor(originalTimeLeft / 60)} minutes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-gray-300">Please read and accept the terms and conditions to start the quiz:</p>
              <ul className="list-disc pl-5 text-gray-300 space-y-2">
                <li>This quiz has a time limit of {Math.floor(originalTimeLeft / 60)} minutes.</li>
                <li>You can navigate between questions using the navigation panel.</li>
                <li>You can flag questions for later review.</li>
                <li>Your answers are saved automatically when you move to another question.</li>
                <li>You can add personal notes for each question.</li>
                <li>Once you finish the quiz, you cannot retake it.</li>
                <li>If time runs out, your quiz will be automatically submitted.</li>
              </ul>
            </CardContent>
            <CardFooter className="bg-gray-800 rounded-b-lg p-6">
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-colors text-lg"
                onClick={handleAcceptTnc}
              >
                Accept & Start Quiz
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <>
          {/* Main quiz interface */}
          <header className="bg-gray-900 shadow-lg z-10">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-white mr-2"
                  onClick={() => setShowQuestionPanel(!showQuestionPanel)}
                >
                  <Menu className="h-5 w-5 mr-2" />
                  <span>Questions</span>
                </Button>
                <h1 className="text-xl font-bold text-white hidden md:block">{quizData.title}</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-white flex items-center"
                  onClick={togglePause}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                
                <div className={`flex items-center ${getWarningClass()} font-medium px-3 py-1 rounded-full bg-gray-800`}>
                  <Clock className="mr-2 w-5 h-5" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>
          </header>
          
          {/* Content area */}
          <div className="flex flex-1 relative">
            {/* Side navigation panel */}
            {renderQuestionNavigationPanel()}
            
            {/* Main content */}
            <div className="flex-1 px-4 py-6 md:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Question {currentQuestionIndex + 1} of {quizData.questions.length}</span>
                    <span>Completed: {Math.round(getProgressPercentage())}%</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-2" />
                </div>
                
                {/* Question card */}
                <Card className="bg-gray-800 border-0 shadow-xl mb-6">
                  <CardHeader className="border-b border-gray-700">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl font-semibold text-white">
                        Question {currentQuestionIndex + 1}
                      </CardTitle>
                      <div className="flex space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className={flaggedQuestions.has(currentQuestionIndex) ? "text-red-500" : "text-gray-400 hover:text-red-500"}
                            onClick={toggleFlagQuestion}
                          >
                            <Flag className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Flag for review
                        </TooltipContent>
                      </Tooltip>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-medium text-gray-100 mb-6">
                      {quizData.questions[currentQuestionIndex].question}
                    </h2>
                    <div className="space-y-4">
                      {quizData.questions[currentQuestionIndex].options.map((option: string, i: number) => (
                        <label
                          key={i}
                          className={`block p-4 border rounded-lg cursor-pointer transition-all
                            ${selectedOptions[currentQuestionIndex] === option 
                              ? 'bg-indigo-900 border-indigo-500 ring-2 ring-indigo-400 ring-opacity-50' 
                              : 'hover:bg-gray-700 border-gray-600 bg-gray-700/50'}`}
                        >
                          <div className="flex items-center">
                            <div className={`w-6 h-6 mr-3 rounded-full border flex items-center justify-center
                              ${selectedOptions[currentQuestionIndex] === option 
                                ? 'border-indigo-500 bg-indigo-500' 
                                : 'border-gray-400'}`}
                            >
                              {selectedOptions[currentQuestionIndex] === option && (
                                <CheckCircle className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <span className="text-gray-200">{option}</span>
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
      
                {/* Navigation */}
                <div className="flex justify-between">
                  <Button 
                    className="bg-gray-700 hover:bg-gray-600 text-white" 
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))} 
                    disabled={currentQuestionIndex === 0 || isSubmitting}
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex space-x-3">
                    {currentQuestionIndex < quizData.questions.length - 1 ? (
                      <Button 
                        className="bg-indigo-600 hover:bg-indigo-500 text-white" 
                        onClick={handleSaveAndNext}
                        disabled={isSubmitting}
                      >
                        Save & Next
                        <ChevronRight className="h-5 w-5 ml-1" />
                      </Button>
                    ) : null}
                    <Button 
                      className="bg-green-600 hover:bg-green-500 text-white" 
                      onClick={() => setShowConfirmSubmit(true)}
                      disabled={isSubmitting}
                    >
                      <Award className="h-5 w-5 mr-1" />
                      Finish Quiz
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Toast notification */}
          {toastMessage && (
            <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg border-l-4 border-indigo-500 animate-fade-in z-50">
              {toastMessage}
            </div>
          )}
        </>
      )}
      
      {/* Confirmation modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm z-50">
          <Card className="w-full max-w-md mx-auto animate-fade-in bg-gray-800 text-white border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-white">Submit Quiz?</CardTitle>
            </CardHeader>
            <CardContent className="text-center p-6">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <p className="text-gray-300">
                Are you sure you want to submit your quiz? 
                {Object.keys(selectedOptions).length < quizData.questions.length && (
                  <span className="block mt-2 text-amber-400">
                    You have {quizData.questions.length - Object.keys(selectedOptions).length} unanswered questions.
                  </span>
                )}
              </p>
              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Questions Answered:</span>
                  <span>{Object.keys(selectedOptions).length} of {quizData.questions.length}</span>
                </div>
                <Progress 
                  value={(Object.keys(selectedOptions).length / quizData.questions.length) * 100} 
                  className="h-2 mt-2" 
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between p-4 border-t border-gray-700">
              <Button 
                className="bg-gray-600 hover:bg-gray-500 text-white" 
                onClick={() => setShowConfirmSubmit(false)}
              >
                Continue Quiz
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-500 text-white" 
                onClick={handleFinish}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* Results modal */}
      {score !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-lg z-50">
          <Card className="w-full max-w-lg mx-auto animate-fade-in bg-gray-800 text-white border-0 shadow-2xl">
            <CardHeader className="text-center bg-indigo-900 rounded-t-lg p-6">
              <CardTitle className="text-3xl font-bold text-white">Quiz Completed!</CardTitle>
            </CardHeader>
            <CardContent className="text-center p-8">
              <div className="w-24 h-24 mx-auto bg-green-900 rounded-full flex items-center justify-center mb-6">
                <Award className="w-14 h-14 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Your Score</h3>
              <div className="text-5xl font-bold text-indigo-400 mb-6">{score}</div>
              <p className="text-lg text-gray-300">
                You've completed the quiz in {Math.floor((completionTime) / 60)} minutes and {((completionTime) % 60)} seconds.
              </p>
              
              <div className="mt-8 p-4 bg-gray-700 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-800 rounded-lg text-center">
                    <p className="text-sm text-gray-400">Questions</p>
                    <p className="text-2xl font-bold text-white">{quizData.questions.length}</p>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg text-center">
                    <p className="text-sm text-gray-400">Answered</p>
                    <p className="text-2xl font-bold text-white">{Object.keys(selectedOptions).length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center p-6 border-t border-gray-700">
              <Button 
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-8 rounded-lg transition-colors text-lg"
                onClick={() => navigate(`/performance/${attemptId}`)}
              >
                View Detailed Results
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
    </div>
  );
};

export { TakeQuiz };