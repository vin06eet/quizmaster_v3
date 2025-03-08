import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface DataItem {
  _id: string;
  title: string;
  description: string;
  public: boolean;
}

const DataDisplayPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/quiz/public/get",
          {
            withCredentials: true,
          }
        );

        // Extract the quizzes array
        if (Array.isArray(response.data.quizzes)) {
          setData(response.data.quizzes);
        } else {
          throw new Error("Invalid data structure");
        }

        setLoading(false);
      } catch (error: any) {
        console.error(error);
        setError(error.response?.data?.message || "Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTakeQuiz = (quizId: string) => {
    navigate(`/take/${quizId}`);
  };

  if (loading) {
    return <p className="text-center text-lg font-semibold">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 font-semibold">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 p-6 w-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Available Quizzes
        </h1>
        <input
          type="text"
          placeholder=" Search quizzes by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 mb-6 border rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <ul className="space-y-6">
          {data
            .filter((item) =>
              item.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item, index) => (
              <li
                key={item._id}
                className="p-5 border rounded-xl shadow-md bg-gray-50 transition-transform transform hover:scale-105 hover:shadow-lg"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {index + 1}. {item.title}
                </h3>
                <p className="text-gray-700 mt-2">{item.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {item.public ? "Public" : "Private"}
                </p>
                <button
                  className="mt-4 px-5 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition duration-200"
                  onClick={() => handleTakeQuiz(item._id)}
                >
                   Take Quiz
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export { DataDisplayPage };
