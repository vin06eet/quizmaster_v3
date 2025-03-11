import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Question {
  questionNumber: string;
  question: string;
  options: string[];
  isCorrect: boolean;
  score: number;
  markedOption?: string;
  correctAnswer: string;
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
  const navigate = useNavigate()

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!performanceDetails) return <div>No performance data available.</div>;

  return (
    <div className="w-screen bg-gradient-to-r from-indigo-500 to-purple-600 h-screen flex justify-center items-center">
    <div className="p-6 mx-auto bg-white shadow-2xl rounded-lg sm:w-1/2">
      <h1 className="text-2xl font-bold mb-4">Performance Details</h1>
      <h2 className="text-xl font-semibold">{performanceDetails.attempt.title}</h2>
      <p className="text-gray-600 mb-4">{performanceDetails.attempt.description}</p>

      <h3 className="text-lg font-semibold mb-2">Questions Attempted</h3>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {performanceDetails.attempt.questions.map((question) => (
          <button
            key={question.questionNumber}
            className={`p-4 text-white font-bold rounded-md transition-all duration-300 
              ${question.isCorrect ? 'bg-green-500' : question.markedOption ? 'bg-red-500' : 'bg-gray-200'}`}
            onClick={() => setExpandedQuestion(question.questionNumber === expandedQuestion ? null : question.questionNumber)}
          >
            {question.questionNumber}
          </button>
        ))}
      </div>

      {expandedQuestion && (
        <div className="p-4 border rounded-md shadow-sm bg-gray-100">
          {performanceDetails.attempt.questions.map((question) =>
            question.questionNumber === expandedQuestion ? (
              <div key={question.questionNumber}>
                <p className="font-medium">Q{question.questionNumber}: {question.question}</p>
                <ul className="list-disc ml-6">
                  {question.options.map((option, idx) => (
                    <li
                      key={idx}
                      className={`mt-1 ${option === question.markedOption ? 'font-bold text-blue-500' : ''} 
                        ${option === question.correctAnswer ? 'text-green-600' : ''}`}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm font-semibold">
                  Your Answer: <span className="text-blue-500">{question.markedOption || 'Not Attempted'}</span>
                </p>
                <p className="text-sm font-semibold">
                  Correct Answer: <span className="text-green-600">{question.correctAnswer}</span>
                </p>
              </div>
            ) : null
          )}
        </div>
      )}

      <div className="mt-6 text-lg font-semibold">
        <p>Total Score: {performanceDetails.attempt.totalMarks}</p>
        <p>Time Taken: {performanceDetails.attempt.timeTaken} seconds</p>
      </div>
      <div className="flex justify-center">
      <Button className="bg-green-500 text-black hover:text-white" onClick={()=>navigate('/landing')}>Proceed</Button>
      </div>
    </div>
    </div>
  );
};

export { AttemptPerformance };