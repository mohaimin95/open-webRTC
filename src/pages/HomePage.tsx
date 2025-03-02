import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Radio, FileText, ArrowRight } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          WebRTC Communication Platform
        </h1>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Connect directly with peers, real-time video chats, messaging, and file transfers - no servers needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Video Chat Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden transition-transform hover:scale-105">
          <div className="p-6">
            <div className="w-16 h-16 bg-indigo-600/30 rounded-full flex items-center justify-center mb-4">
              <Video className="h-8 w-8 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Video Chat</h2>
            <p className="text-white/70 mb-6">
              Connect face-to-face with crystal clear video and audio communication.
            </p>
            <Link 
              to="/video-chat" 
              className="inline-flex items-center text-indigo-300 hover:text-indigo-200"
            >
              Start video chat <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Text Chat Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden transition-transform hover:scale-105">
          <div className="p-6">
            <div className="w-16 h-16 bg-indigo-600/30 rounded-full flex items-center justify-center mb-4">
              <Radio className="h-8 w-8 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Text Chat</h2>
            <p className="text-white/70 mb-6">
              Exchange messages in real-time without servers.
            </p>
            <Link 
              to="/text-chat" 
              className="inline-flex items-center text-indigo-300 hover:text-indigo-200"
            >
              Start text chat <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* File Transfer Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden transition-transform hover:scale-105">
          <div className="p-6">
            <div className="w-16 h-16 bg-indigo-600/30 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">File Transfer</h2>
            <p className="text-white/70 mb-6">
              Share files directly between peers with no size limits or storage concerns.
            </p>
            <Link 
              to="/file-transfer" 
              className="inline-flex items-center text-indigo-300 hover:text-indigo-200"
            >
              Start file transfer <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-900/30 rounded-lg p-4">
            <div className="text-indigo-300 font-bold text-lg mb-2">1. Create Connection</div>
            <p className="text-white/70">
              Generate a connection offer and share it with your peer through any channel.
            </p>
          </div>
          <div className="bg-indigo-900/30 rounded-lg p-4">
            <div className="text-indigo-300 font-bold text-lg mb-2">2. Exchange Details</div>
            <p className="text-white/70">
              Your peer creates an answer and sends it back to you to establish the connection.
            </p>
          </div>
          <div className="bg-indigo-900/30 rounded-lg p-4">
            <div className="text-indigo-300 font-bold text-lg mb-2">3. Connect</div>
            <p className="text-white/70">
              Once connected, enjoy peer-to-peer communication without any intermediary servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;