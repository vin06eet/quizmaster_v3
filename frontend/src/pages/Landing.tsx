import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Landing() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
   
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/islogged', { withCredentials: true });
                setIsLoggedIn(response.data.final); 
            } catch (error) {
                console.error("Error checking login status:", error);
            }
        };
        checkLoginStatus();
    }, []);

    return ( 
        <div className="relative w-screen h-screen flex flex-col text-white overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Navigation Bar */}
            <div className="relative flex justify-between items-center bg-opacity-50 backdrop-blur-md px-6 py-4 shadow-lg border-b border-gray-700">
                <div className="p-1 sm:hidden">
                    <Button
                        className="menu bg-transparent hover:bg-gray-700 border border-gray-500 text-white transition-all duration-300 ease-in-out"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        Menu
                    </Button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute top-full left-0 w-48 mt-2 bg-gray-800 border border-gray-700 shadow-lg flex flex-col z-50 rounded-lg">
                            <Link to="/upload">
                                <Button className="w-full bg-transparent hover:bg-gray-700 border border-gray-500 text-white px-4 py-2 text-left">
                                    Upload
                                </Button>
                            </Link>
                            <Link to="/browse">
                                <Button className="w-full bg-transparent hover:bg-gray-700 border border-gray-500 text-white px-4 py-2 text-left">
                                    Browse
                                </Button>
                            </Link>
                            <Link to="/myQuizzes">
                                <Button className="w-full bg-transparent hover:bg-gray-700 border border-gray-500 text-white px-4 py-2 text-left">
                                    My Quizzes
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                <div className="hidden sm:flex space-x-6">
                    <Button className="bg-transparent hover:bg-gray-700 border border-gray-500 text-white px-4 py-2 rounded-lg">
                        About Us
                    </Button>
                    <Link to="/upload">
                        <Button className="bg-transparent hover:bg-gray-700 border border-gray-500 text-white px-4 py-2 rounded-lg">
                            Upload
                        </Button>
                    </Link>
                    <Link to="/browse">
                        <Button className="bg-transparent hover:bg-gray-700 border border-gray-500 text-white px-4 py-2 rounded-lg">
                            Browse
                        </Button>
                    </Link>
                    <Link to="/myQuizzes">
                        <Button className="bg-transparent hover:bg-gray-700 border border-gray-500 text-white px-4 py-2 rounded-lg">
                            My Quizzes
                        </Button>
                    </Link>
                </div>

                <div className="p-1">
                    {isLoggedIn ? (
                        <Link to="/profile">
                            <Button className="bg-transparent hover:bg-gray-700 border border-gray-500 text-white px-4 py-2 rounded-lg">
                                Profile
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button className="bg-transparent hover:bg-gray-700 border border-gray-500 text-white px-4 py-2 rounded-lg">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button className="bg-transparent hover:bg-gray-700 border border-gray-500 text-white px-4 py-2 rounded-lg">
                                    Register
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Hero Section */}
            <div className="flex justify-center w-screen h-full">
                <div className="relative flex flex-col items-center justify-center flex-grow text-center">
                    <h1 className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse">
                        Welcome to QuizMaster
                    </h1>
                    <p className="mt-4 text-lg text-gray-300 max-w-xl">
                        Your ultimate destination for fun and challenging quizzes! Create, share, and test your knowledge.
                    </p>
                    <Link to="/browse">
                        <Button className="mt-6 px-6 py-3 text-lg rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 shadow-lg transform transition duration-300 ease-in-out hover:scale-105">
                            Explore Quizzes
                        </Button>
                    </Link>
                </div>
            </div> 
        </div>
    );
}

export { Landing };
