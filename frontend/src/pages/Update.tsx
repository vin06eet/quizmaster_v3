import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
}

const UpdateQuiz: React.FC = () => {
  const [quizId, setQuizId] = useState<string>('');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch quiz data
  const fetchQuiz = async () => {
    if (!quizId) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/quiz/${quizId}`, {
        withCredentials: true,
      });
      const fetchedQuiz = response.data.quiz;
      // Deep clone the entire quiz object
      const clonedQuiz = JSON.parse(JSON.stringify(fetchedQuiz)) as Quiz;
      setQuiz(clonedQuiz);
      setMessage('');
    } catch (error) {
      setMessage('Error fetching quiz. Please check the ID.');
      setQuiz(null);
    }
    setLoading(false);
  };
  
  
  
  // Handle quiz ID input
  const handleQuizIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuizId(e.target.value);
  };

  // Handle title change
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (quiz) {
      setQuiz({ ...quiz, title: e.target.value });
    }
  };

  // Handle description change
  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (quiz) {
      setQuiz({ ...quiz, description: e.target.value });
    }
  };

  // Handle question text change
  const handleQuestionChange = (questionId: string, value: string) => {
    setQuiz((prevQuiz) => {
      if (!prevQuiz) return null;
      return {
        ...prevQuiz,
        questions: prevQuiz.questions.map((q) =>
          q._id === questionId ? { ...q, question: value } : q
        ),
      };
    });
  };
  
  

  // Handle option change
  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuiz((prevQuiz) => {
      if (!prevQuiz) return null;
      return {
        ...prevQuiz,
        questions: prevQuiz.questions.map((q) =>
          q._id === questionId
            ? { ...q, options: q.options.map((opt, i) => (i === optionIndex ? value : opt)) }
            : q
        ),
      };
    });
  };
  
  

  // Handle correct answer change
  const handleCorrectAnswerChange = (questionId: string, value: string) => {
    if (quiz) {
      const updatedQuestions = quiz.questions.map(q =>
        q._id === questionId ? { ...q, correctAnswer: value } : q
      );
      setQuiz({ ...quiz, questions: updatedQuestions });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!quiz) return;

    try {
      const response = await axios.patch(
        `http://localhost:8080/api/quiz/${quizId}`,
        quiz,
        { withCredentials: true }
      );
      setMessage('Quiz updated successfully!');
    } catch (error) {
      setMessage('Error updating quiz. Please try again.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Update Quiz</h1>
      
      {/* Quiz ID Input */}
      <div className="mb-6">
        <label className="block mb-2">Quiz ID:</label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={quizId}
            onChange={handleQuizIdChange}
            placeholder="Enter Quiz ID"
            className="flex-1"
          />
          <Button onClick={fetchQuiz} disabled={!quizId || loading}>
            {loading ? 'Loading...' : 'Fetch Quiz'}
          </Button>
        </div>
      </div>

      {message && (
        <p className="my-4 p-2 bg-green-100 text-green-700 rounded">{message}</p>
      )}

      {quiz && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title and Description */}
          <div>
            <label className="block mb-2">Title:</label>
            <Input
              type="text"
              value={quiz.title}
              onChange={handleTitleChange}
              required
            />
          </div>
          
          <div>
            <label className="block mb-2">Description:</label>
            <textarea
              value={quiz.description}
              onChange={handleDescriptionChange}
              required
              className="w-full p-2 border rounded bg-white"
              rows={3}
            />
          </div>

          {/* Questions */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Questions</h2>
            {quiz.questions.map((question, qIndex) => (
              <div key={question._id} className="p-4 border rounded">
                <h3 className="font-medium mb-2">Question {qIndex + 1}</h3>
                
                {/* Question Text */}
                <div className="mb-4">
                  <label className="block mb-2">Question Text:</label>
                  <Input
                    type="text"
                    value={question.question}
                    onChange={(e) => handleQuestionChange(question._id, e.target.value)}
                    required
                  />
                </div>

                {/* Options */}
                <div className="mb-4">
                  <label className="block mb-2">Options:</label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="mb-2">
                      <Input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(question._id, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Answer */}
                <div>
                  <label className="block mb-2">Correct Answer:</label>
                  <select
                    value={question.correctAnswer}
                    onChange={(e) => handleCorrectAnswerChange(question._id, e.target.value)}
                    className="w-full p-2 border rounded bg-white"
                    required
                  >
                    {question.options.map((option, oIndex) => (
                      <option key={oIndex} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full">
            Update Quiz
          </Button>
        </form>
      )}
    </div>
  );
};

export { UpdateQuiz };
