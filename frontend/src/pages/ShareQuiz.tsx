import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
}

interface ShareQuizProps {
  quizId: string;
  onClose: () => void;
}

const ShareQuiz: React.FC<ShareQuizProps> = ({ quizId, onClose }) => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [shareMethod, setShareMethod] = useState<'username' | 'email'>('username');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/user');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shareMethod === 'username' && username.trim() !== '') {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(username.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [username, users, shareMethod]);

  const handleShareByUsername = async (selectedUsername: string) => {
    try {
      setLoading(true);
      setError('');
      const user = users.find(u => u.username === selectedUsername);
      if (!user) {
        setError('User not found');
        return;
      }
      const response = await axios.post(`http://localhost:8080/api/quizzes/${quizId}/share`, { email: user.email });
      setMessage(response.data.message || 'Quiz shared successfully');
      setUsername('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to share quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleShareByEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await axios.post(`/api/quizzes/${quizId}/share`, { email });
      setMessage(response.data.message || 'Quiz shared successfully');
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to share quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Share Quiz</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <div className="flex mb-4 border rounded overflow-hidden">
        <button className={`flex-1 py-2 ${shareMethod === 'username' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`} onClick={() => setShareMethod('username')}>
          Share by Username
        </button>
        <button className={`flex-1 py-2 ${shareMethod === 'email' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`} onClick={() => setShareMethod('email')}>
          Share by Email
        </button>
      </div>

      {message && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{message}</div>}
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

      {shareMethod === 'username' ? (
        <div>
          <div className="mb-4">
            <label htmlFor="username" className="block mb-1 font-medium">Search by Username</label>
            <input id="username" type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="max-h-60 overflow-y-auto border rounded mb-4">
            {loading ? <div className="p-4 text-center text-gray-500">Loading...</div> : 
              filteredUsers.length === 0 ? <div className="p-4 text-center text-gray-500">No users found</div> : (
                <ul>
                  {filteredUsers.map((user) => (
                    <li key={user._id} className="p-2 border-b hover:bg-gray-100 cursor-pointer flex items-center justify-between" onClick={() => handleShareByUsername(user.username)}>
                      <div>
                        <span className="font-medium">{user.username}</span>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <button className="px-2 py-1 bg-blue-500 text-white rounded text-sm">Share</button>
                    </li>
                  ))}
                </ul>
              )
            }
          </div>
        </div>
      ) : (
        <form onSubmit={handleShareByEmail}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 font-medium">Email Address</label>
            <input id="email" type="email" placeholder="Enter email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300" disabled={loading || !email}>{loading ? 'Sending...' : 'Share Quiz'}</button>
        </form>
      )}
    </div>
  );
};

export default ShareQuiz;