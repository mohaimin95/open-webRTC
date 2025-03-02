import React from 'react';
import RtcVideoChat from '../components/RtcVideoChat';
import { iceServers } from '../utils/constants';

const VideoChat: React.FC = () => {
  // Create a new RTCPeerConnection
  const peerConnection = new RTCPeerConnection(iceServers);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Video Chat</h1>
        <p className="text-white/70 mt-2">
          Connect with video and audio in real-time
        </p>
      </div>
      
      <RtcVideoChat peerConnection={peerConnection} />
    </div>
  );
};

export default VideoChat;