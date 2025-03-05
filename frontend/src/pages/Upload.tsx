import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const [message, setMessage] = useState<string>('');
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
      setMessage('Please select a file first');
      return;
    }

    setLoading(true); // Start loading
    setLoading(true); // Start loading
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8080/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      setMessage('File uploaded successfully');
      const uploadedId = response.data.id; // Assuming the response contains the ID
      navigate(`/update/${uploadedId}`); // Redirect to the upload/id page
      
      console.log(response.data); 
    } catch (error) {
      setMessage('Error uploading file');
      console.error(error); // Use 'err' here as well
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div>
      <h1>Upload a File</h1>
      <form onSubmit={handleSubmit}>

        <Input type="file" onChange={handleFileChange} />
        <Button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </Button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export { UploadForm };
