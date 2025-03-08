import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

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

  useEffect(() => {
    if (!showTnc) return;
    const createQuizAttempt = async () => {
      try {
        const response = await axios.post(`http://localhost:8080/api/quiz/attempt/create/${quizId}`, {}, { withCredentials: true });
        if (response.data?.createdAttempt) {
          setAttemptId(response.data.createdAttempt._id);
          setQuizData(response.data.createdAttempt);
          setTimeLeft(response.data.time || 240);
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
    await axios.patch(`http://localhost:8080/api/quiz/attempt/save/question/${attemptId}`, {
      questionNumber: currentQuestionIndex + 1,
      answer: selectedOptions[currentQuestionIndex] || null,
    }, { withCredentials: true });
    setCurrentQuestionIndex(prev => Math.min(prev + 1, quizData!.questions.length - 1));
  };

  const handleFinish = async () => {
    if (!attemptId) return;
    await axios.patch(`http://localhost:8080/api/quiz/attempt/save/question/${attemptId}`, {
      questionNumber: currentQuestionIndex + 1,
      answer: selectedOptions[currentQuestionIndex] || null,
    }, { withCredentials: true });
    try {
      const response = await axios.patch(`http://localhost:8080/api/quiz/attempt/save/${attemptId}`, { parentQuizId: quizId }, { withCredentials: true });
      if (response.data?.totalMarks !== undefined) setScore(response.data.totalMarks);
    } catch (err) {
      console.error('Error fetching final marks', err);
    }
  };

  if (loading) return <div className="w-screen flex justify-center items-center h-screen text-xl font-semibold">Loading quiz...</div>;
  if (error) return <div className="w-screen text-center text-red-500 mt-6">{error}</div>;
  if (!quizData) return <div className="w-screen text-center text-gray-600 mt-6">No quiz data available</div>;

  return (
    <div className=" w-screen">
    <div className="flex justify-center items-center h-screen">
    <div className="max-w-3xl mx-auto p-6 bg-gray-100 shadow-lg rounded-lg">
      {showTnc ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center w-96">
            <h2 className="text-2xl font-bold mb-4">Terms & Conditions</h2>
            <p className="text-gray-700 mb-4">Please read and accept the terms and conditions to start.</p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAcceptTnc}>Accept & Start Quiz</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-blue-700">{quizData.title}</h1>
            <div className="text-red-500 font-semibold">Time Left: {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? '0' : ''}{timeLeft % 60}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-3">{quizData.questions[currentQuestionIndex].question}</h2>
            <div className="space-y-3">
              {quizData.questions[currentQuestionIndex].options.map((option: string, i: number) => (
                  <label key={i} className={`block p-3 border rounded-lg cursor-pointer ${selectedOptions[currentQuestionIndex] === option ? 'bg-blue-100' : 'hover:bg-blue-50'}`}>

                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={option}
                    checked={selectedOptions[currentQuestionIndex] === option}
                    onChange={() => handleSelect(option)}
                    className="hidden"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <Button className="bg-gray-500 hover:bg-gray-600 text-white" onClick={() => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))} disabled={currentQuestionIndex === 0}>Previous</Button>
            {currentQuestionIndex < quizData.questions.length - 1 ? (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveAndNext}>Save & Next</Button>
            ) : null}
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleFinish}>Finish</Button>
          </div>
        </>
      )}
      {score !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-4" onClick={() => navigate(`/performance/${attemptId}`)}>Proceed </Button>
          </div>
        </div>
      )}
    </div>
    </div>
    </div>
  );
};

export { TakeQuiz };
