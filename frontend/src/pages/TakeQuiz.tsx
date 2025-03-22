import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../components/ui/card';
import { CheckCircle, AlertCircle, Flag, BookOpen, ChevronLeft, ChevronRight, Award, Clock, Menu, X, Trophy, Home } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../components/ui/tooltip';
import { Link } from 'react-router-dom';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Auto-show panel on desktop
      if (!mobile) {
        setShowQuestionPanel(true);
      }
    };

    // Initial setup
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleClear = async () => {
    if (!attemptId) return;
    setSelectedOptions(prev => {
      if (prev.hasOwnProperty(currentQuestionIndex)) {
        const updatedOptions = { ...prev };
        delete updatedOptions[currentQuestionIndex]; 
        return updatedOptions;
      }
      return prev; 
    });
  
    const newReviewed = new Set(reviewedQuestions);
    newReviewed.delete(currentQuestionIndex);
    setReviewedQuestions(newReviewed);
  
    try {
      await axios.patch(
        `http://localhost:8080/api/quiz/attempt/save/question/${attemptId}`,
        {
          questionNumber: currentQuestionIndex + 1,
          answer: null, 
        },
        { withCredentials: true }
      );
      setToastMessage("Selection cleared successfully");
    } catch (err) {
      setError("Failed to clear selection. Please try again.");
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
    if (isMobile) {
      setShowQuestionPanel(false);
    }
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

  const toggleQuestionPanel = () => {
    setShowQuestionPanel(!showQuestionPanel);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen text-white bg-[#0A0F1F]">
        <div className="w-20 h-20 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-xl font-medium text-gray-300">Loading quiz...</p>
        {/* Animated Background */}
        <div className="fixed inset-0 bg-[#0A0F1F] z-[-1]">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.4),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(234,179,8,0.4),transparent_30%)]"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen text-white bg-[#0A0F1F]">
        <AlertCircle className="w-20 h-20 text-red-500 mb-6" />
        <p className="text-2xl font-medium text-red-400">{error}</p>
        <Button className="mt-8 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 py-3 text-lg rounded-full" onClick={() => navigate('/')}>
          Return Home
        </Button>
        {/* Animated Background */}
        <div className="fixed inset-0 bg-[#0A0F1F] z-[-1]">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.4),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(234,179,8,0.4),transparent_30%)]"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen text-white bg-[#0A0F1F]">
        <BookOpen className="w-20 h-20 text-gray-400 mb-6" />
        <p className="text-2xl font-medium text-gray-300">No quiz data available</p>
        <Button className="mt-8 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 py-3 text-lg rounded-full" onClick={() => navigate('/')}>
          Return Home
        </Button>
        {/* Animated Background */}
        <div className="fixed inset-0 bg-[#0A0F1F] z-[-1]">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.4),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(234,179,8,0.4),transparent_30%)]"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
        </div>
      </div>
    );
  }

  const renderQuestionNavigationPanel = () => {
    if (!quizData || !quizData.questions) return null;
    
    return (
      <div 
        className={`
          lg:static lg:block lg:w-72 lg:min-h-screen lg:pt-16 lg:border-r lg:border-gray-800/50 lg:shadow-none lg:translate-x-0
          fixed inset-y-0 left-0 w-72 bg-[#0A0F1F] border-r border-gray-800/50 shadow-2xl transform transition-transform duration-300 ease-in-out z-40
          ${showQuestionPanel ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-800/50">
          <h3 className="text-lg font-semibold text-white">Questions</h3>
          <Button variant="ghost" size="icon" onClick={toggleQuestionPanel} className="lg:hidden">
            <X className="h-5 w-5 text-gray-400" />
          </Button>
        </div>
        <div className="p-4 border-b border-gray-800/50">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-center"><div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div> Unanswered</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div> Answered</div>
            
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
              if (index === currentQuestionIndex) bgColor += ' ring-2 ring-yellow-500';
              
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
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-3 border border-gray-800/50">
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
    <div className="w-screen min-h-screen text-white bg-[#0A0F1F]">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-[#0A0F1F] z-[-1]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.4),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(234,179,8,0.4),transparent_30%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
      </div>

      {showTnc ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md z-50">
          <Card className="w-full max-w-lg mx-auto animate-fade-in bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 shadow-2xl text-white">
            <CardHeader className="text-center bg-gradient-to-r from-yellow-500/20 to-orange-600/20 rounded-t-lg p-6 border-b border-gray-800/50">
              <CardTitle className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">{quizData.title}</span>
              </CardTitle>
              <CardDescription className="text-gray-300 mt-2">Time Limit: {Math.floor(originalTimeLeft / 60)} minutes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-gray-300">Please read and accept the terms and conditions to start the quiz:</p>
              <ul className="list-disc pl-5 text-gray-300 space-y-2">
                <li>This quiz has a time limit of {Math.floor(originalTimeLeft / 60)} minutes.</li>
                <li>You can navigate between questions using the navigation panel.</li>
                <li>You can flag questions for later review.</li>
                <li>Your must click on save & next to save the question.</li>
                <li>Not clicking on save & next will not save that particular choice.</li>
                <li>Once you finish the quiz, you cannot retake it.</li>
                <li>If time runs out, your quiz will be automatically submitted.</li>
              </ul>
            </CardContent>
            <CardFooter className="p-6 border-t border-gray-800/50">
              <Button 
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium py-3 rounded-full transition-colors text-lg"
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
          <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0F1F]/80 backdrop-blur-md shadow-md border-b border-gray-800/50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                {isMobile && (
                  <Button 
                    variant="ghost" 
                    className="text-gray-300 hover:text-yellow-400 mr-2"
                    onClick={toggleQuestionPanel}
                  >
                    <Menu className="h-5 w-5 mr-2" />
                    <span>Questions</span>
                  </Button>
                )}
                <div className="flex items-center ml-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Trophy size={16} className="text-white" />
                  </div>
                  <span className="ml-2 text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent hidden md:block">{quizData.title}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-yellow-400 flex items-center"
                  onClick={togglePause}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button> */}
                
                <div className={`flex items-center ${getWarningClass()} font-medium px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700/50`}>
                  <Clock className="mr-2 w-5 h-5" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>
          </header>
          
          {/* Content area */}
          <div className="flex flex-1 relative pt-16">
            {/* Side navigation panel */}
            {renderQuestionNavigationPanel()}
            
            {/* Main content - adjust width based on panel visibility */}
            <div className={`flex-1 px-4 py-6 md:px-6 transition-all duration-300 ${!isMobile ? 'lg:ml-5/6' : ''}`}>
              <div className="max-w-4xl mx-auto">
                {/* Progress bar */}
                <div className="mb-6 mt-4">
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Question {currentQuestionIndex + 1} of {quizData.questions.length}</span>
                    <span>Completed: {Math.round(getProgressPercentage())}%</span>
                  </div>
                  <div className="bg-gray-800/50 rounded-full h-2 overflow-hidden">
                    <Progress value={getProgressPercentage()} className="h-2 bg-gradient-to-r from-yellow-500 to-orange-600" />
                  </div>
                </div>
                
                {/* Question card */}
                <Card className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 shadow-xl mb-6">
                  <CardHeader className="border-b border-gray-800/50">
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
                              ? 'bg-gradient-to-r from-yellow-500/20 to-orange-600/20 border-yellow-500/50 ring-2 ring-yellow-400/30' 
                              : 'hover:bg-gray-800/50 border-gray-700/50 bg-gray-800/20'}`}
                        >
                          <div className="flex items-center">
                            <div className={`w-6 h-6 mr-3 rounded-full border flex items-center justify-center
                              ${selectedOptions[currentQuestionIndex] === option 
                                ? 'border-yellow-500 bg-yellow-500' 
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
                <div className="flex justify-between mb-10">
                  <Button 
                    className="bg-gray-800/50 hover:bg-gray-700/50 text-white border border-gray-700/50 rounded-full px-6" 
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))} 
                    disabled={currentQuestionIndex === 0 || isSubmitting}
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex space-x-3">
                    {currentQuestionIndex < quizData.questions.length - 1 ? (
                      <Button 
                        className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-full px-6" 
                        onClick={handleSaveAndNext}
                        disabled={isSubmitting}
                      >
                        Save & Next
                        <ChevronRight className="h-5 w-5 ml-1" />
                      </Button>
                    ) : null}
                    <Button 
                        className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-full px-6" 
                        onClick={handleClear}
                        disabled={isSubmitting}
                      >
                        Clear
                      </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6" 
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
            <div className="fixed bottom-4 right-4 bg-gray-800/90 text-white px-4 py-2 rounded-lg shadow-lg border-l-4 border-yellow-500 animate-fade-in z-50">
              {toastMessage}
            </div>
          )}
        </>
      )}
      
      {/* Confirmation modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm z-50">
          <Card className="w-full max-w-md mx-auto animate-fade-in bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 text-white shadow-xl">
            <CardHeader className="text-center border-b border-gray-800/50">
              <CardTitle className="text-xl font-bold text-white">Submit Quiz?</CardTitle>
            </CardHeader>
            <CardContent className="text-center p-6">
              <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-gray-300">
                Are you sure you want to submit your quiz? 
                {Object.keys(selectedOptions).length < quizData.questions.length && (
                  <span className="block mt-2 text-yellow-400">
                    You have {quizData.questions.length - Object.keys(selectedOptions).length} unanswered questions.
                  </span>
                )}
              </p>
              <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Questions Answered:</span>
                  <span>{Object.keys(selectedOptions).length} of {quizData.questions.length}</span>
                </div>
                <div className="bg-gray-700/50 rounded-full h-2 mt-2 overflow-hidden">
                <Progress 
                    value={(Object.keys(selectedOptions).length / quizData.questions.length) * 100} 
                    className="h-2 bg-gradient-to-r from-yellow-500 to-orange-600" 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-gray-800/50 p-4">
              <Button 
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                onClick={() => setShowConfirmSubmit(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg"
                onClick={handleFinish}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* Quiz results */}
      {score !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md z-50">
          <Card className="w-full max-w-lg mx-auto animate-fade-in bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 text-white shadow-2xl">
            <CardHeader className="text-center p-8 border-b border-gray-800/50">
              <CardTitle className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Quiz Completed!</span>
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg mt-2">Your results are ready</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
            <div className="flex justify-center">
              <div className="flex justify-center items-center gap-4">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent text-3xl font-bold">Marks Scored: </span>
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-600/20 border-4 border-yellow-500 flex items-center justify-center">
                  <span className="text-4xl font-bold text-yellow-400">{score}</span>
                </div>
              </div>
            
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <div className="text-sm text-gray-400">Time Taken</div>
                  <div className="text-xl font-medium text-white">{Math.floor(completionTime / 60)}:{String(completionTime % 60).padStart(2, '0')} minutes</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <div className="text-sm text-gray-400">Questions</div>
                  <div className="text-xl font-medium text-white">{Object.keys(selectedOptions).length} of {quizData.questions.length} answered</div>
                </div>
              </div>
              
              <div className="text-center text-gray-300 mt-8">
                <p>Your quiz has been submitted successfully!</p>
                <p>You can review your answers and see detailed explanations for each question.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-gray-800/50 p-6">
             
                <Button 
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 py-3 rounded-full"
                  onClick={() => navigate(`/performance/${attemptId}`)}
                >
                  <Home className="h-5 w-5 mr-2" />
                  View Detailed Results
                </Button>
          
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export { TakeQuiz };