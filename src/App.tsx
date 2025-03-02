import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import VideoChat from './pages/VideoChat';
import TextChat from './pages/TextChat';
import FileTransfer from './pages/FileTransfer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="video-chat" element={<VideoChat />} />
          <Route path="text-chat" element={<TextChat />} />
          <Route path="file-transfer" element={<FileTransfer />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;