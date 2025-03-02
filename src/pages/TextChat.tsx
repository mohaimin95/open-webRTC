import React from 'react';
import RtcTextChat from '../components/RtcTextChat';
import { iceServers } from '../utils/constants';

const TextChat: React.FC = () => {
  // Create a new RTCPeerConnection
  const peerConnection = new RTCPeerConnection(iceServers);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Text Chat</h1>
        <p className="text-white/70 mt-2">
          Exchange messages in real-time without servers.
        </p>
      </div>
      
      <RtcTextChat peerConnection={peerConnection} />
    </div>
  );
};

export default TextChat;