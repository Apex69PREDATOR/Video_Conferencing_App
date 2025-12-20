import {BrowserRouter as Router, Route,Routes} from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import './App.css'
import Authenticaion from './pages/authentication'
import AuthProvider from './Context/AuthContext'
import VideoMeet from './pages/VideoMeet'
function App() {

  return (
    <>
      <Router>
        <AuthProvider>
         <Routes>
          <Route path='/' element={<LandingPage/>}/>
          <Route path='/auth' element={<Authenticaion/>}/>
          <Route path='/:code' element = {<VideoMeet/>} />
         </Routes>
         </AuthProvider>
      </Router>
    </>
  )
}

export default App
