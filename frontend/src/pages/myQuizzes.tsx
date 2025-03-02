import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface QuizItem {
  _id: string;
  title: string;
  description: string;
  public: boolean;
}

const MyQuizzes: React.FC = () => {
  const [quizzesCreated, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/myQuizzes', {
          withCredentials: true,
        });
        
        if (Array.isArray(response.data.user.quizzesCreated)) {
          setQuizzes(response.data.user.quizzesCreated);
        } else {
          throw new Error('Invalid data structure');
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error(error);
        setError(error.response?.data?.message || 'Failed to load quizzes');
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleTakeQuiz = (quizId: string) => {
    navigate(`/take/${quizId}`);
  };

  const handleUpdateQuiz = (quizId: string) => {
    navigate(`/update/${quizId}`);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Quizzes</h1>
      <ul className="space-y-4">
        {quizzesCreated.map((quiz) => (
          <li key={quiz._id} className="p-4 border rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">{quiz.title}</h3>
            <p className="text-gray-600">{quiz.description}</p>
            <div className="mt-2">
              <button className="mr-2 p-2 bg-blue-500 text-white rounded" onClick={() => handleTakeQuiz(quiz._id)}>
                Take Quiz
              </button>
              <button className="p-2 bg-green-500 text-white rounded" onClick={() => handleUpdateQuiz(quiz._id)}>
                Update Quiz
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyQuizzes;
