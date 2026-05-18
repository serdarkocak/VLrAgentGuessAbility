import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Game from './pages/Game.jsx';
import Result from './pages/Result.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import BattleRoom from './pages/BattleRoom.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<Game />} />
        <Route path="/result" element={<Result />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/battle" element={<BattleRoom />} />
      </Routes>
    </Layout>
  );
}
