import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const AttemptPerformance = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [performanceDetails, setPerformanceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformanceDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/quiz/attempt/performance/${quizId}`,
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
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Performance Details</h1>
      <pre>{JSON.stringify(performanceDetails, null, 2)}</pre>
    </div>
  );
};

export { AttemptPerformance };
