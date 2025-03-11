import React, { useState, ChangeEvent, FormEvent, useEffect, ChangeEventHandler } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface Question {
  answer: string | number | readonly string[] | undefined;
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  marks?: number;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number ; 
  marksPerQuestion: number ;
  difficultyLevel: string
}

const UpdateQuiz: React.FC = () => {
  const [timeLimit, setTimeLimit] = useState<number | string>('');
  const [isPublic, setVisibility] = useState<boolean>(true);
  const [applySameMarks, setApplySameMarks] = useState<boolean>(true);
  const [marksPerQuestion, setMarksPerQuestion] = useState<number | string>('');

  const [timeInputType, setTimeInputType] = useState<'total' | 'perQuestion'>('total');
  const { quizId } = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/api/quiz/${quizId}`, {
          withCredentials: true,
        });
        const fetchedQuiz = response.data.quiz;
                const clonedQuiz = JSON.parse(JSON.stringify(fetchedQuiz)) as Quiz;
        setQuiz(clonedQuiz);
        setMessage('');
      } catch (error) {
        setMessage('Error fetching quiz. Please check the ID.');
        setQuiz(null);
      }
      setLoading(false);
    };

    fetchQuiz();
  }, [quizId]); 

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (quiz) {
      setQuiz({ ...quiz, title: e.target.value });
    }
  };

  const handleDifficultyLevel: ChangeEventHandler<HTMLSelectElement> = (e) => {
    if (quiz) {
      setQuiz({ ...quiz, difficultyLevel: e.target.value });
    }
  };
  

  const handleMarksChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setMarksPerQuestion(value);
    }
  };

  const handleQuestionMarksChange = (questionId: string, value: string) => {
    setQuiz((prevQuiz) => {
      if (!prevQuiz) return null;
      return {
        ...prevQuiz,
        questions: prevQuiz.questions.map((q) =>
          q._id === questionId ? { ...q, marks: Number(value) } : q
        ),
      };
    });
  };

    const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (quiz) {
      setQuiz({ ...quiz, description: e.target.value });
    }
  };
  
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

    const handleCorrectAnswerChange = (questionId: string, value: string) => {
    if (quiz) {
      const updatedQuestions = quiz.questions.map((q) =>
        q._id === questionId ? { ...q, answer: value } : q
      );
      setQuiz({ ...quiz, questions: updatedQuestions });
    }
  };

  

   const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!quiz) return;

    try {
      const updatedQuiz = { 
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions.map((q, index) => ({
          questionNumber: index + 1,
          question: q.question,
          options: q.options,
          answer: q.answer,
          marks: applySameMarks ? Number(marksPerQuestion) : q.marks || 5
        })),
        time: timeInputType === 'total' ? Number(timeLimit) : Number(timeLimit) * quiz.questions.length,
        difficultyLevel: quiz.difficultyLevel, 
        Public: isPublic
      };
      await axios.patch(`http://localhost:8080/api/quiz/${quizId}`, updatedQuiz, {
        withCredentials: true,
      });
      setMessage('Quiz updated successfully!');
      setShowPopup(true);
      
    } catch (error) {
      setMessage('Error updating quiz. Please try again.');
      setShowPopup(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 p-6 w-screen relative">
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-md">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md">
            <p className="text-xl font-bold mb-4">{message}</p>
            <Button onClick={() => {
              setShowPopup(false)
              navigate('/myQuizzes')
            }} className="bg-indigo-500 w-1/3 py-2" >OK</Button>
          </div>
        </div>
      )}
      
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg">
      <h1 className="text-3xl font-extrabold mb-6 text-center">Update Quiz</h1>

      {loading ? (
        <p>Loading...</p>
      ) : quiz ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xl block mb-2 font-bold">Visibility:</label>
            <div className="flex-col">
              <div>
              <label>
                <input
                  type="radio"
                  value="total"
                  checked = {isPublic===true}
                  onChange={() => setVisibility(true)}
                />
                Public
              </label>
              </div>
              <div>
              <label>
                <input
                  type="radio"
                  value="perQuestion"
                  checked = {isPublic===false}
                  onChange={() => setVisibility(false)}
                />
                Private
              </label>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xl block mb-2 font-bold" htmlFor="difficulty">Difficulty:</label>
              <select 
                id="difficulty" 
                className="border border-gray-300 rounded-md p-2 w-full bg-white" 
                onChange={handleDifficultyLevel} 
                defaultValue={"Easy"}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
              </select>
          </div>


          {/* Title and Description */}
          <div>
            <label className="text-xl block mb-2 font-bold">Title:</label>
            <Input type="text" value={quiz.title} onChange={handleTitleChange} required />
          </div>

          <div>
            <label className="text-xl block mb-2 font-bold">Description:</label>
            <textarea
              value={quiz.description}
              onChange={handleDescriptionChange}
              required
              className="w-full p-2 border rounded bg-white"
              rows={3}
            />
          </div>

          {/* Time Input Type Toggle */}
          <div>
            <label className="text-xl block mb-2 font-bold">Choose Type:</label>
            <div className="flex-col">
              <div>
              <label>
                <input
                  type="radio"
                  value="total"
                  checked={timeInputType === 'total'}
                  onChange={() => setTimeInputType('total')}
                />
                Total Time (in minutes)
              </label>
              </div>
              <div>
              <label>
                <input
                  type="radio"
                  value="perQuestion"
                  checked={timeInputType === 'perQuestion'}
                  onChange={() => setTimeInputType('perQuestion')}
                />
                Time Per Question (in minutes)
              </label>
              </div>
            </div>
          </div>

          {/* Time Limit */}
          <div>
            <label className="text-xl block mb-2 font-bold">Time Limit:</label>
            <Input
              type="text"  // Change from "number" to "text"
              value={timeLimit}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) { // Allow only digits
                  setTimeLimit(value);
                }
              }}
              required
            />
          </div>

          {/* Marks Selection */}
          <div>
              <label className="text-xl block mb-2 font-bold">Marks Assignment:</label>
              <div className="flex gap-4">
                <label>
                  <input
                    type="radio"
                    value="same"
                    checked={applySameMarks}
                    onChange={() => setApplySameMarks(true)}
                  />
                  Same Marks for All Questions
                </label>
                <label>
                  <input
                    type="radio"
                    value="different"
                    checked={!applySameMarks}
                    onChange={() => setApplySameMarks(false)}
                  />
                  Different Marks Per Question
                </label>
              </div>
            </div>

            {/* Single Marks Input */}
            {applySameMarks && (
              <div>
                <label className="text-xl block mb-2 font-bold">Marks Per Question:</label>
                <Input type="text" value={marksPerQuestion} onChange={handleMarksChange} required />
              </div>
            )}

          {/* Questions */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Questions</h2>
            {quiz.questions.map((question, qIndex) => (
              <div key={question._id} className="p-4 border rounded-lg hover:shadow-2xl">
                <h3 className="font-semibold mb-2">Question {qIndex + 1}</h3>

                {/* Question Text */}
                <div className="mb-4">
                  <label className="font-semibold block mb-2">Question Text:</label>
                  <Input
                    type="text"
                    value={question.question}
                    onChange={(e) => handleQuestionChange(question._id, e.target.value)}
                    required
                  />
                </div>

                {/* Options */}
                <div className="mb-4">
                  <label className="font-semibold block mb-2">Options:</label>
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
                  <label className="font-semibold block mb-2">Correct Answer:</label>
                  <select
                    value={question.answer}
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

                {/* Marks Per Question (if applicable) */}
                {!applySameMarks && (
                    <div className="mt-4">
                      <label className="font-semibold block mb-2">Marks:</label>
                      <Input
                        type="text"
                        value={question.marks || '5'}
                        onChange={(e) => handleQuestionMarksChange(question._id, e.target.value)}
                        required
                      />
                    </div>
                  )}
              </div>
            ))}
          </div>
            <div className='flex justify-center'>
            <Button type="submit" className=" bg-indigo-500 w-1/3 h-11 font-extrabold ">
            Update Quiz
          </Button>
            </div>
          
        </form>
      ) : (
        <p>No quiz found.</p>
      )}
    </div>
    </div>
  );
};

export { UpdateQuiz };
