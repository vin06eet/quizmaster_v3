import { Button } from "@/components/ui/button";
import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { Trophy, ChevronRight } from "lucide-react";
const apiUrl = import.meta.env.VITE_BACKEND_URL;

const CreateQuizForm: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [numQuestions, setNumQuestions] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("easy");
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!title || !description || !numQuestions) {
      setMessage("Please fill in all required fields");
      setMessageType("error");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("numQuestions", numQuestions);
    formData.append("difficulty", difficulty);

    try {
      const response = await axios.post(`${apiUrl}/api/create/custom/quiz`, {
        title: title,
        description: description,
        numQuestions: numQuestions,
        difficulty: difficulty
      }, {
        withCredentials: true,
      });

      setMessage("Quiz created successfully");
      setMessageType("success");
      const createdId = response.data.id;

      setTimeout(() => {
        navigate(`/update/${createdId}`);
      }, 800);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error creating quiz");
      setMessageType("error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen text-white bg-[#0A0F1F]">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-[#0A0F1F] z-[-1]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.4),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(234,179,8,0.4),transparent_30%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
      </div>
      
      {/* Header with home button */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 border-b border-gray-800/50 bg-[#0A0F1F]/80 backdrop-blur-md shadow-md">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Trophy size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">QuizMaster</span>
          </Link>
        </div>
        
        <Link to="/">
          <Button variant="ghost" className="text-gray-200 hover:text-yellow-400 hover:bg-gray-800/50">
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen pt-20 pb-20 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-on-scroll ">
            <h1 className="text-4xl font-bold">
              Create New <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Quiz</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mt-4"></div>
            <p className="mt-4 text-gray-300">
              Fill in the details below to create a custom quiz
            </p>
          </div>

          <div className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 rounded-lg shadow-sm overflow-hidden ">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-extrabold text-gray-300 mb-1">
                      Quiz Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter quiz title"
                      className="w-full p-2 border border-gray-700 rounded-lg focus:border-yellow-500 focus:ring-yellow-500 bg-[#0E1225] text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-extrabold text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter quiz description"
                      rows={3}
                      className="w-full p-2 border border-gray-700 rounded-lg focus:border-yellow-500 focus:ring-yellow-500 bg-[#0E1225] text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="numQuestions" className="block text-sm font-exrabold text-gray-300 mb-1">
                      Number of Questions
                    </label>
                    <input
                      id="numQuestions"
                      type="number"
                      min="1"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(e.target.value)}
                      placeholder="Enter number of questions"
                      className="w-full p-2 border border-gray-700 rounded-lg focus:border-yellow-500 focus:ring-yellow-500 bg-[#0E1225] text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="difficulty" className="block text-sm font-extrabold text-gray-300 mb-1">
                      Difficulty
                    </label>
                    <select
                      id="difficulty"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full p-2 border border-gray-700 rounded-lg focus:border-yellow-500 focus:ring-yellow-500 bg-[#0E1225] text-white"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                {message && (
                  <div className={`p-3 rounded-lg ${messageType === "success" ? "bg-green-900/50 text-green-300 border border-green-700" : "bg-red-900/50 text-red-300 border border-red-700"}`}>
                    {message}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 ${
                    !title || !description || !numQuestions ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
                  } font-medium rounded-full shadow transition-all duration-200`}
                >
                  {loading ? "Creating..." : "Create Quiz"}
                  {!loading && <ChevronRight size={18} className="ml-1" />}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  <Link to="/upload" className="text-yellow-400 hover:text-yellow-300 hover:underline transition-colors">
                    Back to Upload
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CreateQuizForm };