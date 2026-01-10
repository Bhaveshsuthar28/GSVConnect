import {Route , Routes} from "react-router-dom"
import { Home } from "./pages/Home.page.jsx"
import AuthPage from "./pages/Auth.page.jsx"
import ProfilePage from "./pages/Profile.page.jsx"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchProfile } from "./redux/slices/authSlice.js"

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Try to fetch profile on mount to check for existing session (cookie or localStorage)
    if (!user) {
        dispatch(fetchProfile());
    }
  }, [dispatch, user]);

  return (
    <>
      <Routes>
        <Route path="" element={<Home/>}/>
        <Route path="/auth" element={<AuthPage/>}/>
        <Route path="/profile" element={<ProfilePage/>}/>
      </Routes>
    </>
  )
}

export default App
