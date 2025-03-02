import React, { useEffect, useState } from 'react';
import { Copy, Video, VideoOff, Users, Mic, MicOff } from 'lucide-react';

export default function RtcComponent({ peerConnection }: { peerConnection: RTCPeerConnection }) {
  const localVideoRef = React.useRef<HTMLVideoElement>(null);
  const remoteVideoRef = React.useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [offerValue, setOfferValue] = useState<string>('');
  const [answerValue, setAnswerValue] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  const createPeerConnection = (setValue: React.Dispatch<React.SetStateAction<string>>) => {
    if (!remoteVideoRef.current) {
      return;
    }
    const remoteStream = new MediaStream();
    remoteVideoRef.current.srcObject = remoteStream;

    localStream?.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
      setConnectionStatus('Connected');
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        setValue(JSON.stringify(peerConnection.localDescription));
      }
    };
  };

  const createOffer = async () => {
    setConnectionStatus('Creating offer...');
    createPeerConnection(setOfferValue);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    setOfferValue(JSON.stringify(offer));
    setConnectionStatus('Offer created');
  };

  const createAnswer = async () => {
    setConnectionStatus('Creating answer...');
    createPeerConnection(setAnswerValue);

    await peerConnection.setRemoteDescription(JSON.parse(offerValue));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    setAnswerValue(JSON.stringify(answer));
    setConnectionStatus('Answer created');
  };

  const addAnswer = async () => {
    setConnectionStatus('Connecting...');
    if (!peerConnection.currentRemoteDescription) {
      await peerConnection.setRemoteDescription(JSON.parse(answerValue));
      setConnectionStatus('Connected');
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    if (localVideoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        setLocalStream(stream);
        localVideoRef.current!.srcObject = stream;
      });
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
              <Users className="mr-2" /> Video Chat
            </h1>
            <div className="bg-indigo-600/80 text-white px-3 py-1 rounded-full text-sm">
              {connectionStatus}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="relative group">
              <div className="bg-black rounded-lg overflow-hidden aspect-video">
                <video 
                  className="w-full h-full object-cover" 
                  autoPlay 
                  playsInline 
                  ref={localVideoRef}
                ></video>
              </div>
              <div className="absolute bottom-3 left-3 flex space-x-2">
                <button 
                  onClick={toggleVideo} 
                  className="bg-gray-800/80 hover:bg-gray-700 text-white p-2 rounded-full"
                >
                  {videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                </button>
                <button 
                  onClick={toggleAudio} 
                  className="bg-gray-800/80 hover:bg-gray-700 text-white p-2 rounded-full"
                >
                  {audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
              </div>
              <div className="absolute top-3 left-3 bg-indigo-600/80 text-white px-2 py-1 rounded text-xs">
                You
              </div>
            </div>

            <div className="relative">
              <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video 
                  className="w-full h-full object-cover" 
                  autoPlay 
                  playsInline 
                  ref={remoteVideoRef}
                ></video>
              </div>
              <div className="absolute top-3 left-3 bg-indigo-600/80 text-white px-2 py-1 rounded text-xs">
                Remote
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-white font-medium">Connection Offer</label>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => copyToClipboard(offerValue)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-sm flex items-center"
                    disabled={!offerValue}
                  >
                    <Copy size={14} className="mr-1" /> Copy
                  </button>
                  <button 
                    onClick={createOffer}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Create Offer
                  </button>
                </div>
              </div>
              <textarea 
                value={offerValue} 
                onChange={e => setOfferValue(e.target.value)}
                className="w-full bg-gray-900 text-gray-300 rounded p-2 text-sm font-mono h-24"
                placeholder="The connection offer will appear here..."
              ></textarea>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-white font-medium">Connection Answer</label>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => copyToClipboard(answerValue)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-sm flex items-center"
                    disabled={!answerValue}
                  >
                    <Copy size={14} className="mr-1" /> Copy
                  </button>
                  <button 
                    onClick={createAnswer}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                    disabled={!offerValue}
                  >
                    Create Answer
                  </button>
                </div>
              </div>
              <textarea 
                value={answerValue} 
                onChange={e => setAnswerValue(e.target.value)}
                className="w-full bg-gray-900 text-gray-300 rounded p-2 text-sm font-mono h-24"
                placeholder="The connection answer will appear here..."
              ></textarea>
            </div>

            <div className="flex justify-center">
              <button 
                onClick={addAnswer}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium text-lg"
                disabled={!answerValue}
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center text-white/70 text-sm">
        Share the offer with your peer and paste their answer to establish a connection.
      </div>
    </div>
  );
}