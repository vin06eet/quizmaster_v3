import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

function Landing(){
    return (
        <div className="bg-gray-400 w-screen h-screen">
            <div className="flex justify-between bg-gray-500 w-screen h-12">
                <div className="p-1 sm:invisible">
                <Button className="menu bg-gray-500 hover:bg-gray-600 border-none">Menu</Button>
                </div>
                <div className=" hidden sm:flex space-x-8 p-1 ">
                    <Button className="bg-gray-500 hover:bg-gray-600 border-none">About Us</Button>
                    <Link to="/upload">
                        <Button className="bg-gray-500 hover:bg-gray-600 border-none">Upload</Button>
                    </Link>
                    <Link to="/browse">
                        <Button className="bg-gray-500 hover:bg-gray-600 border-none">Browse</Button>
                    </Link>
                    <Link to="/myQuizzes">
                        <Button className="bg-gray-500 hover:bg-gray-600 border-none">My Quizzes</Button>
                    </Link>
                </div>
                <div className="p-1">
                <Button className="bg-gray-500 hover:bg-gray-600 border-none">Profile</Button>
                </div>
            </div>
            <div>
                
            </div>
        </div>
    )
}

export { Landing }