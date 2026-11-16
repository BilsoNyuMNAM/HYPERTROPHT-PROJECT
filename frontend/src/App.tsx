
import Frequency from "../pages/noofdays"
import Musclepriority from "../pages/priorities"
import AddExercise from "../pages/Fillexercise"
import ContextProvider from "../helper/context"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import WorkoutUi from "../pages/WorkoutUi"
import Homepage from "../pages/Homepage"
import Pagenotfound from "../pages/PagenotFound"
function App() {
  return (
    <ContextProvider>
      <BrowserRouter>
        <div>
          <Routes>
            <Route path="/mesocycles/builder" element={<Frequency />} />
            <Route path="/mesocycles/plan/builder/priorities" element={<Musclepriority />} />
            <Route path="/mesocycles/new" element={<AddExercise />} />
            <Route path="/mesocycles/:mesocycleId/week/:weeknumber/days/:daynumber" element={<WorkoutUi/>}/>
            <Route path="/home" element={<Homepage/>}/>
            <Route path="*" element={<Pagenotfound/>}/>
          </Routes>
        </div>
      </BrowserRouter>
    </ContextProvider>
  )
}

export default App
