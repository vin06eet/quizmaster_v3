import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file first");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8080/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setMessage("File uploaded successfully");
      const uploadedId = response.data.id;
      navigate(`/update/${uploadedId}`);
    } catch (error) {
      setMessage("Error uploading file");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen flex flex-col text-white overflow-hidden bg-gradient-to-br from-gray-900 via-gray-600 to-gray-400">
      <div className="relative flex justify-center items-center flex-grow">
        <div className="bg-opacity-40 backdrop-blur-xl p-6 rounded-lg shadow-lg border border-gray-700 bg-gradient-to-br from-gray-600 to-gray-900 w-80">
          <div className="flex justify-center items-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-4 ">Upload a File</h1>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <Input type="file" onChange={handleFileChange} className="text-white border border-gray-600 bg-transparent p-2 rounded-lg" />
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 border-none text-white transition duration-300 ease-in-out">
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </form>
          {message && <p className="mt-2 text-sm text-gray-300">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export { UploadForm };