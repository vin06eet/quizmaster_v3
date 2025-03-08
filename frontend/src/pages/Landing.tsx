import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Landing() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/islogged', { withCredentials: true });
                setIsLoggedIn(response.data.isTrue); 
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
                    <Button className="menu bg-transparent hover:bg-gray-700 border border-gray-500 text-white transition-all duration-300 ease-in-out">
                        Menu
                    </Button>
                </div>
                <div className="hidden sm:flex space-x-6">
                    <Button className="bg-transparent hover:bg-gray-700 border border-gray-500 text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out">
                        About Us
                    </Button>
                    <Link to="/upload">
                        <Button className="bg-transparent hover:bg-gray-700 border border-gray-500 text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out">
                            Upload
                        </Button>
                    </Link>
                    <Link to="/browse">
                        <Button className="bg-transparent hover:bg-gray-700 border border-gray-500 text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out">
                            Browse
                        </Button>
                    </Link>
                    <Link to="/myQuizzes">
                        <Button className="bg-transparent hover:bg-gray-700 border border-gray-500 text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out">
                            My Quizzes
                        </Button>
                    </Link>
                </div>
                <div className="p-1">
                    {isLoggedIn ? (
                        <Button className="bg-transparent hover:bg-gray-700 border border-gray-500 text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out">
                            Profile
                        </Button>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button className="bg-transparent hover:bg-gray-700 border border-gray-500 text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button className="bg-transparent hover:bg-gray-700 border border-gray-500 text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out">
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
                <div className="hidden sm:block w-1/5 opacity-50 m-2 rounded-lg  bg-transparent border">
                </div>
            </div> 
        </div>
    );
}

export { Landing };
