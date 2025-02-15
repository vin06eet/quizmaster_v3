import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';

interface Question {
  question: string;
  options: string[];
  marks: number;
}

interface QuizData {
  title: string;
  description?: string;
  questions: Question[];
  time?: number;
  difficultyLevel?: string;
}

const TakeQuiz: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string | null>>({});

  useEffect(() => {
    const createQuizAttempt = async () => {
      try {
        const response = await axios.post(
          `http://localhost:8080/api/quiz/attempt/create/${quizId}`,
          {},
          { withCredentials: true }
        );
        setQuizData(response.data?.createdAttempt || null);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError('Please login to take this quiz');
        } else {
          setError('Failed to load quiz');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    createQuizAttempt();
  }, [quizId]);

  const handleSelect = (questionIndex: number, option: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [questionIndex]: prev[questionIndex] === option ? null : option,
    }));
  };

  if (loading) return <div>Loading quiz...</div>;
  if (error) return <div>{error}</div>;
  if (!quizData) return <div>No quiz data available</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{quizData.title}</h1>
      {quizData.description && <p className="mb-4">{quizData.description}</p>}
      <div className="space-y-4">
        {quizData.questions?.map((question, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2">{question.question}</h2>

            <div className="space-y-2">
              {question.options.map((option, i) => (
                <div key={i} className="flex items-center">
                  <input
                    type="radio"
                    id={`question-${index}-option-${i}`}
                    name={`question-${index}`}
                    value={option}
                    checked={selectedOptions[index] === option}
                    onChange={() => handleSelect(index, option)}
                    className="mr-2"
                  />
                  <label htmlFor={`question-${index}-option-${i}`}>
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Button className="w-full">Submit Answers</Button>
      </div>
    </div>
  );
};

export { TakeQuiz };
