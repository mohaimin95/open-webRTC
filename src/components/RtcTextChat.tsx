import React, { useEffect, useState, useRef } from 'react';
import { Send, User } from 'lucide-react';
import ConnectionPanel from './ConnectionPanel';

interface RtcTextChatProps {
  peerConnection: RTCPeerConnection;
}

interface Message {
  id: string;
  text: string;
  sender: 'local' | 'remote';
  timestamp: Date;
}

const RtcTextChat: React.FC<RtcTextChatProps> = ({ peerConnection }) => {
  // State for connection and messages
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle connection status changes
  const handleStatusChange = (status: string) => {
    setConnectionStatus(status);
    if (status === 'Connected') {
      setIsConnected(true);
    }
  };

  // Send a message through the data channel
  const sendMessage = () => {
    if (!dataChannel || !newMessage.trim()) return;
    
    // Create message object
    const messageObj: Message = {
      id: crypto.randomUUID(),
      text: newMessage,
      sender: 'local',
      timestamp: new Date()
    };
    
    // Add to local messages
    setMessages(prev => [...prev, messageObj]);
    
    // Send through data channel
    dataChannel.send(JSON.stringify(messageObj));
    
    // Clear input
    setNewMessage('');
  };

  // Handle pressing Enter to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Set up data channel for text chat
  useEffect(() => {
    // Create data channel for sending messages
    const channel = peerConnection.createDataChannel('textChat', {
      ordered: true
    });
    
    // Set up channel event handlers
    channel.onopen = () => {
      console.log('Data channel opened');
      setDataChannel(channel);
      setIsConnected(true);
    };
    
    channel.onclose = () => {
      console.log('Data channel closed');
      setIsConnected(false);
    };

    channel.onmessage = (messageEvent) => {
      try {
        // Parse incoming message
        const messageObj = JSON.parse(messageEvent.data);
        // Add to messages with remote sender
        setMessages(prev => [...prev, {
          ...messageObj,
          sender: 'remote',
          timestamp: new Date(messageObj.timestamp)
        }]);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    }
    
    // Handle incoming data channels
    peerConnection.ondatachannel = (event) => {
      const receivedChannel = event.channel;
      setDataChannel(receivedChannel);
      
      receivedChannel.onmessage = (messageEvent) => {
        try {
          // Parse incoming message
          const messageObj = JSON.parse(messageEvent.data);
          // Add to messages with remote sender
          setMessages(prev => [...prev, {
            ...messageObj,
            sender: 'remote',
            timestamp: new Date(messageObj.timestamp)
          }]);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
      
      receivedChannel.onopen = () => {
        setIsConnected(true);
      };
      
      receivedChannel.onclose = () => {
        setIsConnected(false);
      };
    };
    
    // Clean up on unmount
    return () => {
      if (channel.readyState === 'open') {
        channel.close();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format timestamp for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <User className="mr-2" /> Text Chat
            </h2>
            <div className="bg-indigo-600/80 text-white px-3 py-1 rounded-full text-sm">
              {connectionStatus}
            </div>
          </div>

          {/* Messages area */}
          <div className="bg-gray-900/50 rounded-lg mb-4 h-80 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white/50">
                No messages yet. Connect with a peer to start chatting.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.sender === 'local' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.sender === 'local' 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-700 text-white/90'
                      }`}
                    >
                      <div className="text-sm break-words">{message.text}</div>
                      <div className="text-xs mt-1 opacity-70 text-right">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message input */}
          <div className="mb-6">
            <div className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={!isConnected}
                className="flex-grow bg-gray-800/70 text-white rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={sendMessage}
                disabled={!isConnected || !newMessage.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800/50 disabled:cursor-not-allowed text-white rounded-r-lg px-4 flex items-center transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Connection panel for offer/answer exchange */}
          <ConnectionPanel 
            peerConnection={peerConnection} 
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
      
      <div className="mt-4 text-center text-white/70 text-sm">
        Share the offer with your peer and paste their answer to establish a connection.
      </div>
    </div>
  );
};

export default RtcTextChat;