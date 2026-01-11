import {Route , Routes} from "react-router-dom"
import { Home } from "./pages/Home.page.jsx"
import AuthPage from "./pages/Auth.page.jsx"
import ProfilePage from "./pages/Profile.page.jsx"
import DirectoryPage from "./pages/Directory.page.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import EventsPage from "./pages/Events.page.jsx"
import StoriesPage from "./pages/Stories.page.jsx"
import JobsPage from "./pages/Jobs.page.jsx"
import AboutPage from "./pages/About.page.jsx"

const App = () => {
  return (
    <>
      <Routes>
        <Route path="" element={<Home/>}/>
        <Route path="/auth" element={<AuthPage/>}/>
        <Route
          path="/profile"
          element={(
            <ProtectedRoute>
              <ProfilePage/>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/directory"
          element={(
            <ProtectedRoute>
              <DirectoryPage/>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/events"
          element={(
            <ProtectedRoute>
              <EventsPage/>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/stories"
          element={(
            <ProtectedRoute>
              <StoriesPage/>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/jobs"
          element={(
            <ProtectedRoute>
              <JobsPage/>
            </ProtectedRoute>
          )}
        />
        <Route path="/about" element={<AboutPage/>}/>
      </Routes>
    </>
  )
}

export default App
