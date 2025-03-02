import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Button } from '../components/ui/button';

const TakeQuiz: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate(); // Initialize useNavigate
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string | null>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTnc, setShowTnc] = useState(true);
  const [score, setScore] = useState<number | null>(null); // Store total marks

  useEffect(() => {
    if (!showTnc) return;

    const createQuizAttempt = async () => {
      try {
        const response = await axios.post(
          `http://localhost:8080/api/quiz/attempt/create/${quizId}`,
          {},
          { withCredentials: true }
        );

        if (response.data?.createdAttempt) {
          setAttemptId(response.data.createdAttempt._id);
          setQuizData(response.data.createdAttempt);
        }
      } catch (err: any) {
        setError(err.response?.status === 401 ? 'Please login to take this quiz' : 'Failed to load quiz');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    createQuizAttempt();
  }, [quizId, showTnc]);

  const handleAcceptTnc = () => {
    setShowTnc(false);
  };

  const handleSelect = (option: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [currentQuestionIndex]: option,
    }));
  };

  const handleSaveAndNext = async () => {
    if (!attemptId) return;
    await axios.patch(
      `http://localhost:8080/api/quiz/attempt/save/question/${attemptId}`,
      {
        questionNumber: currentQuestionIndex + 1,
        answer: selectedOptions[currentQuestionIndex],
      },
      { withCredentials: true }
    );

    setCurrentQuestionIndex(prev => Math.min(prev + 1, quizData!.questions.length - 1));
  };

  const handleFinish = async () => {
    if (!attemptId) return;

    try {
      const response = await axios.patch(
        `http://localhost:8080/api/quiz/attempt/save/${attemptId}`,
        { parentQuizId: quizId },
        { withCredentials: true }
      );

      if (response.data?.totalMarks !== undefined) {
        setScore(response.data.totalMarks);
      }
    } catch (err) {
      console.error('Error fetching final marks', err);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  };

  const handleClosePopup = () => {
    setScore(null);
    navigate('/landing'); // Redirect to landing page
  };

  if (loading) return <div>Loading quiz...</div>;
  if (error) return <div>{error}</div>;
  if (!quizData) return <div>No quiz data available</div>;

  return (
    <div className="p-4">
      {showTnc && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">Terms and Conditions</h2>
            <p className="mb-4">
              Before you begin, please read and accept the terms and conditions for this quiz.
            </p>
            <Button onClick={handleAcceptTnc}>Accept & Start Quiz</Button>
          </div>
        </div>
      )}

      {!showTnc && (
        <>
          <h1 className="text-2xl font-bold mb-4">{quizData.title}</h1>
          {quizData.description && <p className="mb-4">{quizData.description}</p>}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2">{quizData.questions[currentQuestionIndex].question}</h2>
            <div className="space-y-2">
              {quizData.questions[currentQuestionIndex].options.map((option, i) => (
                <div key={i} className="flex items-center">
                  <input
                    type="radio"
                    id={`question-${currentQuestionIndex}-option-${i}`}
                    name={`question-${currentQuestionIndex}`}
                    value={option}
                    checked={selectedOptions[currentQuestionIndex] === option}
                    onChange={() => handleSelect(option)}
                    className="mr-2"
                  />
                  <label htmlFor={`question-${currentQuestionIndex}-option-${i}`}>{option}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
              Previous
            </Button>
            {currentQuestionIndex < quizData.questions.length - 1 ? (
              <Button onClick={handleSaveAndNext}>Save & Next</Button>
            ) : (
              <Button onClick={handleFinish}>Finish</Button>
            )}
          </div>
        </>
      )}

      {/* Popup for Marks */}
      {score !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">Quiz Completed!</h2>
            <p className="text-lg">You scored: <strong>{score} marks</strong></p>
            <Button onClick={handleClosePopup}>Close</Button> {/* Redirects to landing page */}
          </div>
        </div>
      )}
    </div>
  );
};

export { TakeQuiz };
