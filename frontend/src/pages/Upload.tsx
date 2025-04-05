import { Button } from "@/components/ui/button";
import { useState, ChangeEvent, FormEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { Trophy, ChevronRight, Upload, Check } from "lucide-react";
const apiUrl = import.meta.env.VITE_BACKEND_URL;

const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
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

    try {
      const response = await axios.post(`${apiUrl}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setMessage("File uploaded successfully");
      setMessageType("success");
      const uploadedId = response.data.id;
      
      // Short delay to show success message before navigating
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

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
          <Button variant="ghost" className=" rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white">
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen pt-20 pb-20 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-on-scroll">
            <h1 className="text-4xl font-bold">
              Upload <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Quiz</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mt-4"></div>
            <p className="mt-4 text-gray-300">
              Upload a quiz file to import questions and create a new quiz
            </p>
          </div>

          <div className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 rounded-lg shadow-sm overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragging 
                      ? 'border-yellow-500 bg-yellow-500/10' 
                      : file 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-gray-700 hover:border-yellow-500 hover:bg-yellow-500/5'
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
                        <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center mb-4">
                          <Check size={24} className="text-green-400" />
                        </div>
                        <p className="text-green-400 font-medium mb-1">{file.name}</p>
                        <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
                          <Upload size={24} className="text-yellow-400" />
                        </div>
                        <p className="text-gray-300 font-medium mb-1">Drag & Drop a file or click to browse</p>
                        <p className="text-sm text-gray-400">Supports JPEG, JPG, PNG and PDF files</p>
                      </>
                    )}
                  </div>
                </div>
                
                {message && (
                  <div className={`p-3 rounded-lg ${messageType === "success" ? "bg-green-900/50 text-green-300 border border-green-700" : "bg-red-900/50 text-red-300 border border-red-700"}`}>
                    <div className="flex items-center">
                      {messageType === "success" ? (
                        <Check size={16} className="mr-2" />
                      ) : (
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                        </svg>
                      )}
                      {message}
                    </div>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  disabled={loading || !file} 
                  className={`w-full py-3 ${
                    !file ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
                  } font-medium rounded-full shadow transition-all duration-200`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </div>
                  ) : (
                    <>
                      Upload Quiz File
                      <ChevronRight size={18} className="ml-1" />
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Want to make questions out of text? <Link to="/upload/custom" className="text-yellow-400 hover:text-yellow-300 hover:underline transition-colors">Click Here</Link>
                </p>
                <p className="text-sm text-gray-400">
                  Want to make questions out of custom prompts? <Link to="/create/custom/quiz" className="text-yellow-400 hover:text-yellow-300 hover:underline transition-colors">Click Here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { UploadForm };