import { Button } from "@/components/ui/button";
import { useState, ChangeEvent, FormEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

const UploadCustomForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [numQuestions, setNumQuestions] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("easy");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage("");
      setMessageType("");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setMessage("");
      setMessageType("");
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file first");
      setMessageType("error");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("numQuestions", numQuestions);
    formData.append("difficulty", difficulty);
    

    try {
      const response = await axios.post("http://localhost:8080/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setMessage("File uploaded successfully");
      setMessageType("success");
      const uploadedId = response.data.id;

      setTimeout(() => {
        navigate(`/update/${uploadedId}`);
      }, 800);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error uploading file");
      setMessageType("error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center justify-center p-4 w-screen">
      <div className="fixed top-4 left-4 z-50">
        <button 
          onClick={() => navigate("/")} 
          className="flex items-center gap-2 bg-white text-indigo-700 px-4 py-2 rounded-full shadow-lg hover:bg-indigo-50 transition-all duration-300 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Home
        </button>
      </div>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
            Upload Quiz
          </h1>
          <p className="text-indigo-200 max-w-sm mx-auto">
            Upload a quiz file to import questions and create a new quiz
          </p>
        </div>

        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : file 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".jpg, .jpeg, .png, .pdf"
                />
                
                <div className="flex flex-col items-center justify-center">
                  {file ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-green-700 font-medium mb-1">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-gray-700 font-medium mb-1">Drag & Drop a file or click to browse</p>
                      <p className="text-sm text-gray-500">Supports JPEG, JPG, PNG and PDF files</p>
                    </>
                  )}
                </div>
              </div>
              {message && (
                <div className={`p-3 rounded-lg ${messageType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {message}
                </div>
              )}

              

              {
                <div className="space-y-4 mt-4">
                  <input
                    type="number"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
                    placeholder="Number of Questions"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                  />
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              }

              <Button
                type="submit"
                disabled={loading || !file}
                className={`w-full py-3 ${
                  !file ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                } text-white font-medium rounded-lg shadow transition-all duration-200`}
              >
                {loading ? "Uploading..." : "Upload Quiz File"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                <Link to="/upload">Go Back</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { UploadCustomForm };
