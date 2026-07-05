
import CreateMesocycle from './pages/Createmesocycle'
import Performance from './pages/Performance'
import Mesocycleui from './pages/Mesocycleui'
import { Routes, Route, BrowserRouter} from 'react-router-dom'
import {QueryClientProvider,QueryClient} from '@tanstack/react-query' 
import Allmesocycle from './pages/Allmesocycle'
import './App.css'
import Weekpage from './pages/Weekpage'
import Sessionpage from './pages/Sessionpage'
import LandingPage from './pages/LandingPage'
import Signup from './pages/Singup'
import Login from './pages/Login'
import PagenotFound from './pages/PagenotFound'


const queryClient = new QueryClient();
function App(){
  return (
    <QueryClientProvider client={queryClient}>
    <div className='h-screen w-full bg-black'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/Allmesocycle" element={<Allmesocycle/>} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/create-mesocycle" element = {<CreateMesocycle/>}/>
          <Route path="/mesocycle/week/:weekId" element={<Weekpage/>}/>
          <Route path="/mesocycle/display/:id" element = {<Mesocycleui/>}/>
          <Route path="/mesocycle/week/session/:sessionId" element={<Sessionpage/>}/>
          <Route path="/performance" element={<Performance/>}/>
          <Route path="*" element={<PagenotFound />} />
         
        </Routes>
      </BrowserRouter>
    </div>
    </QueryClientProvider>
  )
}

export default App
