import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useParams, useNavigate } from 'react-router-dom';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Award, Eye, Edit, CheckSquare } from 'lucide-react';

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
  timeLimit: number;
  marksPerQuestion: number;
  difficultyLevel: string;
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
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState(1);
  const difficultyLabels = ["Easy", "Medium", "Hard"];

  const handleSliderChange = (value: React.SetStateAction<number>[]) => {
    setDifficulty(value[0]);
  };

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
        difficultyLevel: difficultyLabels[difficulty],
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
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 p-4 md:p-6 flex justify-center w-screen items-center">
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-md z-50 ">
          <Card className="max-w-md">
            <CardHeader>
              <div className="flex justify-center mb-2">
                {message.includes('success') ? (
                  <CheckCircle className="h-12 w-12 text-green-500" />
                ) : (
                  <AlertCircle className="h-12 w-12 text-red-500" />
                )}
              </div>
              <CardTitle className="text-center">{message}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button 
                onClick={() => {
                  setShowPopup(false);
                  if (message.includes('success')) {
                    navigate('/myQuizzes');
                  }
                }} 
                className="bg-indigo-500 hover:bg-indigo-600 w-1/3"
              >
                OK
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="w-full max-w-3xl">
        <Card className="bg-white bg-opacity-95 shadow-2xl">
          <CardHeader className="border-b border-gray-200 pb-4">
            <CardTitle className="text-3xl font-bold text-center text-indigo-800">Update Quiz</CardTitle>
          </CardHeader>

          {loading ? (
            <CardContent className="flex justify-center p-8">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
                <p className="mt-4 text-lg font-medium text-gray-700">Loading quiz data...</p>
              </div>
            </CardContent>
          ) : quiz ? (
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="basic" className="w-full">
                <div className="px-6 pt-4 border-b border-gray-200">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic" className="bg-white">Basic Info</TabsTrigger>
                    <TabsTrigger value="settings" className="bg-white">Settings</TabsTrigger>
                    <TabsTrigger value="questions" className="bg-white">Questions</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="basic" className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-lg font-medium block mb-2">Title</label>
                      <Input 
                        type="text" 
                        value={quiz.title} 
                        onChange={handleTitleChange}
                        className="text-lg"
                        placeholder="Enter quiz title" 
                        required 
                      />
                    </div>

                    <div>
                      <label className="text-lg font-medium block mb-2">Description</label>
                      <textarea
                        value={quiz.description}
                        onChange={handleDescriptionChange}
                        placeholder="Describe your quiz"
                        className="w-full p-3 border rounded-md text-base bg-white"
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Eye className="mr-2 h-5 w-5" />
                          Visibility
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <Switch 
                            checked={isPublic} 
                            onCheckedChange={setVisibility} 
                          />
                          <span className="font-medium">
                            {isPublic ? "Public" : "Private"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Award className="mr-2 h-5 w-5" />
                          Difficulty
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col space-y-2">
                          <Slider
                            defaultValue={[difficulty]}
                            min={0}
                            max={2}
                            step={1}
                            onValueChange={handleSliderChange}
                          />
                          <div className="flex justify-between">
                            {difficultyLabels.map((label, index) => (
                              <Badge 
                                key={label} 
                                variant={difficulty === index ? "default" : "outline"}
                                className={difficulty === index ? "bg-indigo-600" : ""}
                              >
                                {label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Clock className="mr-2 h-5 w-5" />
                          Time Limit
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span>{timeInputType === "total" ? "Total Quiz Time" : "Time Per Question"}</span>
                            <Switch
                              checked={timeInputType === "total"}
                              onCheckedChange={() => setTimeInputType(prev => prev === "total" ? "perQuestion" : "total")}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              placeholder={timeInputType === "total" ? "Total minutes" : "Minutes per question"}
                              value={timeLimit}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) {
                                  setTimeLimit(value);
                                }
                              }}
                              required
                            />
                            <span className="text-sm text-gray-500">min</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Award className="mr-2 h-5 w-5" />
                          Marks Assignment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Switch
                              checked={applySameMarks}
                              onCheckedChange={setApplySameMarks}
                            />
                            <span>{applySameMarks ? "Same marks for all questions" : "Different marks per question"}</span>
                          </div>
                          
                          {applySameMarks && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                placeholder="Marks per question"
                                value={marksPerQuestion}
                                onChange={handleMarksChange}
                                required
                              />
                              <span className="text-sm text-gray-500">points</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="questions" className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/4 space-y-2 border-r pr-4">
                      <div className="font-medium mb-2">Questions List</div>
                      <div className="space-y-1 max-h-96 overflow-y-auto">
                        {quiz.questions.map((_, index) => (
                          <div 
                            key={index}
                            onClick={() => setActiveQuestionIndex(index)}
                            className={`p-2 rounded-md cursor-pointer transition-colors ${
                              activeQuestionIndex === index 
                                ? "bg-indigo-100 text-indigo-700 font-medium"
                                : "hover:bg-gray-100"
                            }`}
                          >
                          Question {index + 1}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="w-full md:w-3/4">
                      {quiz.questions[activeQuestionIndex] && (
                        <Card>
                          <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center">
                              <Edit className="mr-2 h-5 w-5" />
                              Question {activeQuestionIndex + 1}
                            </CardTitle>
                            {!applySameMarks && (
                              <div className="flex items-center">
                                <span className="mr-2 text-sm">Marks:</span>
                                <Input
                                  type="text"
                                  className="w-16 h-8 text-center"
                                  value={quiz.questions[activeQuestionIndex].marks || '5'}
                                  onChange={(e) => handleQuestionMarksChange(quiz.questions[activeQuestionIndex]._id, e.target.value)}
                                  required
                                />
                              </div>
                            )}
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <label className="font-medium block mb-2">Question Text</label>
                              <Input
                                type="text"
                                value={quiz.questions[activeQuestionIndex].question}
                                onChange={(e) => handleQuestionChange(quiz.questions[activeQuestionIndex]._id, e.target.value)}
                                placeholder="Enter question text"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="font-medium block mb-2">Options</label>
                              <div className="space-y-2">
                                {quiz.questions[activeQuestionIndex].options.map((option, oIndex) => (
                                  <div key={oIndex} className="flex items-center gap-2">
                                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-xs font-medium">
                                      {String.fromCharCode(65 + oIndex)}
                                    </div>
                                    <Input
                                      type="text"
                                      value={option}
                                      onChange={(e) => handleOptionChange(quiz.questions[activeQuestionIndex]._id, oIndex, e.target.value)}
                                      placeholder={`Option ${oIndex + 1}`}
                                      required
                                    />
                                    
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <label className="font-medium block mb-2">Correct Answer</label>
                              <div className="grid grid-cols-2 gap-2">
                                {quiz.questions[activeQuestionIndex].options.map((option, oIndex) => (
                                  <div
                                    key={oIndex}
                                    onClick={() => handleCorrectAnswerChange(quiz.questions[activeQuestionIndex]._id, option)}
                                    className={`p-2 border rounded-md cursor-pointer flex items-center gap-2 ${
                                      quiz.questions[activeQuestionIndex].answer === option
                                        ? 'bg-green-50 border-green-500'
                                        : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    {quiz.questions[activeQuestionIndex].answer === option && (
                                      <CheckSquare className="h-4 w-4 text-green-500" />
                                    )}
                                    <span>{option}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/myQuizzes')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Update Quiz
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-medium">No quiz found with the provided ID.</p>
              <Button 
                onClick={() => navigate('/myQuizzes')} 
                className="mt-4 bg-indigo-600"
              >
                Return to My Quizzes
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export { UpdateQuiz };
