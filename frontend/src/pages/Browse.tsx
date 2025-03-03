import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface DataItem {
  _id: string;
  title: string;
  description: string;
  public: boolean;
}

const DataDisplayPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/quiz/public/get', {
          withCredentials: true,
        });
    
        // Extract the quizzes array
        if (Array.isArray(response.data.quizzes)) {
          setData(response.data.quizzes);
        } else {
          throw new Error('Invalid data structure');
        }
    
        setLoading(false);
      } catch (error: any) {
        console.error(error);
        setError(error.response?.data?.message || 'Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTakeQuiz = (quizId: string) => {
    navigate(`/take/${quizId}`);
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Quizzes</h1>
      <input
        type="text"
        placeholder="Search quizzes by title"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 p-2 border rounded"
      />
      <ul className="space-y-4">
        {data
          .filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((item, index) => (
            <li key={item._id} className="p-4 border rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">{index + 1}. {item.title}</h3> 
              <button className="mt-2 p-2 bg-blue-500 text-white rounded" onClick={() => handleTakeQuiz(item._id)}>
                Take Quiz
              </button>
              <p className="text-gray-600">{item.description}</p>
              <p className="text-sm">{item.public ? 'Public' : 'Private'}</p>
            </li>
          ))}
      </ul>
    </div>
  );
};

export { DataDisplayPage };
