import React from 'react';
import RtcFileTransfer from '../components/RtcFileTransfer';
import { iceServers } from '../utils/constants';

const FileTransfer: React.FC = () => {
  // Create a new RTCPeerConnection
  const peerConnection = new RTCPeerConnection(iceServers);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">File Transfer</h1>
        <p className="text-white/70 mt-2">
          Share files directly between peers with no size limits
        </p>
      </div>
      
      <RtcFileTransfer peerConnection={peerConnection} />
    </div>
  );
};

export default FileTransfer;