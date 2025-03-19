import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Award, Eye, Edit, CheckSquare, Trophy, Home } from 'lucide-react';

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
  Public: boolean;
}

const UpdateQuiz: React.FC = () => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [timeLimit, setTimeLimit] = useState<number | string>(quiz?.timeLimit?quiz.timeLimit:60);
  const [isPublic, setVisibility] = useState<boolean>(quiz?.Public?quiz?.Public:true);
  const [applySameMarks, setApplySameMarks] = useState<boolean>(false);
  const [marksPerQuestion, setMarksPerQuestion] = useState<number | string>('');
  const [timeInputType, setTimeInputType] = useState<'total' | 'perQuestion'>('total');
  const { quizId } = useParams<{ quizId: string }>();
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState(quiz?.difficultyLevel=="Easy"?0:(quiz?.difficultyLevel=="Medium"?1:2));
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
          <Button variant="ghost" className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white">
            Back to Home
          </Button>
        </Link>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-md z-50">
          <Card className="max-w-md bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 text-white">
            <CardHeader>
              <div className="flex justify-center mb-2">
                {message.includes('success') ? (
                  <CheckCircle className="h-12 w-12 text-green-500" />
                ) : (
                  <AlertCircle className="h-12 w-12 text-red-500" />
                )}
              </div>
              <CardTitle className="text-center text-white">{message}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button 
                onClick={() => {
                  setShowPopup(false);
                  if (message.includes('success')) {
                    navigate('/myQuizzes');
                  }
                }} 
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 w-1/3 text-white"
              >
                OK
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="flex items-center justify-center min-h-screen pt-20 pb-20 px-4">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8 animate-on-scroll">
            <h1 className="text-4xl font-bold">
              Update <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Quiz</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mt-4"></div>
            <p className="mt-4 text-gray-300">
              Modify your quiz details and questions
            </p>
          </div>

          <Card className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 shadow-xl text-white">
            <CardHeader className="border-b border-gray-800/50 pb-4">
              <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Update Quiz</CardTitle>
            </CardHeader>

            {loading ? (
              <CardContent className="flex justify-center p-8">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                  <p className="mt-4 text-lg font-medium text-gray-300">Loading quiz data...</p>
                </div>
              </CardContent>
            ) : quiz ? (
              <form onSubmit={handleSubmit}>
                <Tabs defaultValue="basic" className="w-full">
                  <div className="px-6 pt-4 border-b border-gray-800/50">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-800/30">
                      <TabsTrigger value="basic" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-black text-gray-400">Basic Info</TabsTrigger>
                      <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-black text-gray-400">Settings</TabsTrigger>
                      <TabsTrigger value="questions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-black text-gray-400">Questions</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="basic" className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-lg font-medium block mb-2 text-gray-300">Title</label>
                        <Input 
                          type="text" 
                          value={quiz.title} 
                          onChange={handleTitleChange}
                          className="text-lg bg-gray-800/50 border-gray-700 text-white"
                          placeholder="Enter quiz title" 
                          required 
                        />
                      </div>

                      <div>
                        <label className="text-lg font-medium block mb-2 text-gray-300">Description</label>
                        <textarea
                          value={quiz.description}
                          onChange={handleDescriptionChange}
                          placeholder="Describe your quiz"
                          className="w-full p-3 rounded-md text-base bg-gray-800/50 border border-gray-700 text-white"
                          rows={4}
                          required
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-gray-800/30 border-gray-700/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center text-gray-100">
                            <Eye className="mr-2 h-5 w-5 text-yellow-500" />
                            Visibility
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4">
                            <Switch 
                              checked={isPublic} 
                              onCheckedChange={setVisibility}
                              className="data-[state=checked]:bg-yellow-500"
                            />
                            <span className="font-medium text-gray-300">
                              {isPublic ? "Public" : "Private"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-800/30 border-gray-700/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center text-gray-100">
                            <Award className="mr-2 h-5 w-5 text-yellow-500"/>
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
                              className="[&>span]:bg-yellow-500"
                            />
                            <div className="flex justify-between">
                              {difficultyLabels.map((label, index) => (
                                <Badge 
                                  key={label} 
                                  variant={difficulty === index ? "default" : "outline"}
                                  className={difficulty === index ? "bg-gradient-to-r from-yellow-500 to-orange-600" : "border-gray-600 text-gray-400"}
                                >
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-800/30 border-gray-700/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center text-gray-100">
                            <Clock className="mr-2 h-5 w-5 text-yellow-500" />
                            Time Limit
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300">{timeInputType === "total" ? "Total Quiz Time" : "Time Per Question"}</span>
                              <Switch
                                checked={timeInputType === "total"}
                                onCheckedChange={() => setTimeInputType(prev => prev === "total" ? "perQuestion" : "total")}
                                className="data-[state=checked]:bg-yellow-500"
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
                                className="bg-gray-800/50 border-gray-700 text-white"
                                required
                              />
                              <span className="text-sm text-gray-400">min</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-800/30 border-gray-700/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center text-gray-100">
                            <Award className="mr-2 h-5 w-5 text-yellow-500" />
                            Marks Assignment
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <Switch
                                checked={applySameMarks}
                                onCheckedChange={setApplySameMarks}
                                className="data-[state=checked]:bg-yellow-500"
                              />
                              <span className="text-gray-300">{applySameMarks ? "Same marks for all questions" : "Different marks per question"}</span>
                            </div>
                            
                            {applySameMarks && (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="text"
                                  placeholder="Marks per question"
                                  value={marksPerQuestion}
                                  onChange={handleMarksChange}
                                  className="bg-gray-800/50 border-gray-700 text-white"
                                  required
                                />
                                <span className="text-sm text-gray-400">points</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="questions" className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-1/4 space-y-2 border-r border-gray-800/50 pr-4">
                        <div className="font-medium mb-2 text-gray-300">Questions List</div>
                        <div className="space-y-1 max-h-96 overflow-y-auto">
                          {quiz.questions.map((_, index) => (
                            <div 
                              key={index}
                              onClick={() => setActiveQuestionIndex(index)}
                              className={`p-2 rounded-md cursor-pointer transition-colors ${
                                activeQuestionIndex === index 
                                  ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 font-medium"
                                  : "hover:bg-gray-800/50 text-gray-300"
                              }`}
                            >
                            Question {index + 1}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-full md:w-3/4">
                        {quiz.questions[activeQuestionIndex] && (
                          <Card className="bg-gray-800/30 border-gray-700/50">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                              <CardTitle className="text-lg flex items-center text-gray-100">
                                <Edit className="mr-2 h-5 w-5 text-yellow-500" />
                                Question {activeQuestionIndex + 1}
                              </CardTitle>
                              {!applySameMarks && (
                                <div className="flex items-center">
                                  <span className="mr-2 text-sm text-gray-400">Marks:</span>
                                  <Input
                                    type="text"
                                    className="w-16 h-8 text-center bg-gray-800/50 border-gray-700 text-white"
                                    value={quiz.questions[activeQuestionIndex].marks || '5'}
                                    onChange={(e) => handleQuestionMarksChange(quiz.questions[activeQuestionIndex]._id, e.target.value)}
                                    required
                                  />
                                </div>
                              )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <label className="font-medium block mb-2 text-gray-300">Question Text</label>
                                <Input
                                  type="text"
                                  value={quiz.questions[activeQuestionIndex].question}
                                  onChange={(e) => handleQuestionChange(quiz.questions[activeQuestionIndex]._id, e.target.value)}
                                  placeholder="Enter question text"
                                  className="bg-gray-800/50 border-gray-700 text-white"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="font-medium block mb-2 text-gray-300">Options</label>
                                <div className="space-y-2">
                                  {quiz.questions[activeQuestionIndex].options.map((option, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-medium">
                                        {String.fromCharCode(65 + oIndex)}
                                      </div>
                                      <Input
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleOptionChange(quiz.questions[activeQuestionIndex]._id, oIndex, e.target.value)}
                                        placeholder={`Option ${oIndex + 1}`}
                                        className="bg-gray-800/50 border-gray-700 text-white"
                                        required
                                      />
                                      
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <label className="font-medium block mb-2 text-gray-300">Correct Answer</label>
                                <div className="grid grid-cols-2 gap-2">
                                  {quiz.questions[activeQuestionIndex].options.map((option, oIndex) => (
                                    <div
                                      key={oIndex}
                                      onClick={() => handleCorrectAnswerChange(quiz.questions[activeQuestionIndex]._id, option)}
                                      className={`p-2 border rounded-md cursor-pointer flex items-center gap-2 ${
                                        quiz.questions[activeQuestionIndex].answer === option
                                          ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/50 text-green-400'
                                          : 'border-gray-700 hover:bg-gray-700/30 text-gray-300'
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
                
                <div className="p-6 border-t border-gray-800/50 flex justify-end">
                  <div className="flex gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/myQuizzes')}
                      className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
                    >
                      Update Quiz
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-300">No quiz found with the provided ID.</p>
                <Button 
                  onClick={() => navigate('/myQuizzes')} 
                  className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
                >
                  Return to My Quizzes
                </Button>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export { UpdateQuiz };