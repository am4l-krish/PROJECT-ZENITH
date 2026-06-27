import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TopNav from './components/TopNav.jsx'

import AsteroidMonitor from './pages/AsteroidMonitor.jsx'
import ISSTracker from './pages/ISSTracker.jsx'
import SpaceWeather from './pages/SpaceWeather.jsx'
import OrbitExplorer from './pages/OrbitExplorer.jsx'
import ObservationPlanner from './pages/ObservationPlanner.jsx'
import AISpaceGuide from './pages/AISpaceGuide.jsx'
import CosmicLearningHub from './pages/CosmicLearningHub.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000810' }}>
        <TopNav />
        <div style={{ width: '100%', height: '100%' }}>
          <Routes>
            <Route path="/"          element={<AsteroidMonitor />} />
            <Route path="/asteroids" element={<AsteroidMonitor />} />
            <Route path="/iss"       element={<ISSTracker />} />
            <Route path="/weather"   element={<SpaceWeather />} />
            <Route path="/orbit"     element={<OrbitExplorer />} />
            <Route path="/planner"   element={<ObservationPlanner />} />
            <Route path="/guide"     element={<AISpaceGuide />} />
            <Route path="/learn"     element={<CosmicLearningHub />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
