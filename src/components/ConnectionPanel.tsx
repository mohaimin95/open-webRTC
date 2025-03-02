import React, { useState } from 'react';
import { Copy } from 'lucide-react';

interface ConnectionPanelProps {
  peerConnection: RTCPeerConnection;
  onStatusChange?: (status: string) => void;
}

/**
 * Reusable component for WebRTC connection establishment
 * Handles the creation and exchange of SDP offers and answers
 */
const ConnectionPanel: React.FC<ConnectionPanelProps> = ({ 
  peerConnection,
  onStatusChange = () => {} 
}) => {
  const [offerValue, setOfferValue] = useState<string>('');
  const [answerValue, setAnswerValue] = useState<string>('');

  // Update both local state and parent component
  const updateStatus = (status: string) => {
    onStatusChange(status);
  };

  /**
   * Creates a connection offer and sets local description
   * The offer should be shared with the remote peer
   */
  const createOffer = async () => {
    try {
      updateStatus('Creating offer...');
      
      // Create the offer
      const offer = await peerConnection.createOffer();
      
      // Set as local description
      await peerConnection.setLocalDescription(offer);
      
      // Set up ICE candidate handler
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // Update the offer value with the complete description including ICE candidates
          setOfferValue(JSON.stringify(peerConnection.localDescription));
        }
      };
      
      // Set initial offer value
      setOfferValue(JSON.stringify(offer));
      updateStatus('Offer created');
    } catch (error) {
      console.error('Error creating offer:', error);
      updateStatus('Error creating offer');
    }
  };

  /**
   * Creates an answer in response to a received offer
   * Sets the remote description from the offer and creates a local answer
   */
  const createAnswer = async () => {
    try {
      updateStatus('Creating answer...');
      
      // Parse and set the remote description from the offer
      await peerConnection.setRemoteDescription(JSON.parse(offerValue));
      
      // Create an answer
      const answer = await peerConnection.createAnswer();
      
      // Set as local description
      await peerConnection.setLocalDescription(answer);
      
      // Set up ICE candidate handler
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // Update the answer value with the complete description including ICE candidates
          setAnswerValue(JSON.stringify(peerConnection.localDescription));
        }
      };
      
      // Set initial answer value
      setAnswerValue(JSON.stringify(answer));
      updateStatus('Answer created');
    } catch (error) {
      console.error('Error creating answer:', error);
      updateStatus('Error creating answer');
    }
  };

  /**
   * Completes the connection by setting the remote description from the answer
   */
  const addAnswer = async () => {
    try {
      updateStatus('Connecting...');
      
      // Only set remote description if not already set
      if (!peerConnection.currentRemoteDescription) {
        await peerConnection.setRemoteDescription(JSON.parse(answerValue));
        updateStatus('Connected');
      }
    } catch (error) {
      console.error('Error adding answer:', error);
      updateStatus('Error connecting');
    }
  };

  /**
   * Copies text to clipboard
   */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4">
      {/* Offer section */}
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

      {/* Answer section */}
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

      {/* Connect button */}
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
  );
};

export default ConnectionPanel;