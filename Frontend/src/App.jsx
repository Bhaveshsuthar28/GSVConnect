import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "./pages/Home.page.jsx"
import AuthPage from "./pages/Auth.page.jsx"
import ProfilePage from "./pages/Profile.page.jsx"
import DirectoryPage from "./pages/Directory.page.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import EventsPage from "./pages/Events.page.jsx"
import StoriesPage from "./pages/Stories.page.jsx"
import JobsPage from "./pages/Jobs.page.jsx"
import AboutPage from "./pages/About.page.jsx"
import { useAuth } from "./context/AuthContext.jsx";

const App = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const appName = "GSVConnect";
    const pathname = location.pathname || "/";

    const baseTitleMap = {
      "/": "Home",
      "/auth": "Auth",
      "/directory": "Directory",
      "/events": "Events",
      "/stories": "Stories",
      "/jobs": "Jobs",
      "/about": "About",
    };

    if (pathname === "/profile") {
      const name = user?.name?.trim();
      document.title = name
        ? `${appName} | Profile - ${name}`
        : `${appName} | Profile`;
      return;
    }

    const page = baseTitleMap[pathname];
    document.title = page ? `${appName} | ${page}` : appName;
  }, [location.pathname, user?.name]);

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
