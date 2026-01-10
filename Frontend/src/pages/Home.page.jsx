import { Navbar } from "../components/navbar.components.jsx";
import {BackgroundVideo} from "../components/video.background.jsx"

export const Home = () => {
    return (
        <div className="relative min-h-screen">
            <BackgroundVideo />
            <Navbar/>
        </div>
    ); 
}