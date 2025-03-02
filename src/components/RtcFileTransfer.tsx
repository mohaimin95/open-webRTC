import React, { useEffect, useState, useRef } from 'react';
import { File, Upload, Download, FileText, X, Check } from 'lucide-react';
import ConnectionPanel from './ConnectionPanel';

interface RtcFileTransferProps {
  peerConnection: RTCPeerConnection;
}

interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface FileTransfer {
  id: string;
  fileInfo: FileInfo;
  progress: number;
  status: 'pending' | 'transferring' | 'complete' | 'error';
  direction: 'upload' | 'download';
  data?: Blob;
}

const RtcFileTransfer: React.FC<RtcFileTransferProps> = ({ peerConnection }) => {
  // State for connection and file transfers
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [transfers, setTransfers] = useState<FileTransfer[]>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentFile = useRef<{
    arrayBuffer: ArrayBuffer,
    info: FileInfo,
    transferId: string
  } | null>(null);

  // Constants for chunking files
  const CHUNK_SIZE = 16384; // 16KB chunks

  // Handle connection status changes
  const handleStatusChange = (status: string) => {
    setConnectionStatus(status);
    if (status === 'Connected') {
      setIsConnected(true);
    } else if (status === 'Disconnected') {
      setIsConnected(false);
    }
  };

  // Trigger file input click
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !dataChannel) return;

    const file = files[0];
    const reader = new FileReader();

    // Create file info object
    const fileInfo: FileInfo = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type
    };

    // Create transfer ID
    const transferId = crypto.randomUUID();

    // Add to transfers list
    setTransfers(prev => [
      ...prev,
      {
        id: transferId,
        fileInfo,
        progress: 0,
        status: 'pending',
        direction: 'upload'
      }
    ]);

    // Read file as array buffer
    reader.onload = () => {
      if (!reader.result || typeof reader.result === 'string') return;

      // Store file data for sending
      currentFile.current = {
        arrayBuffer: reader.result,
        info: fileInfo,
        transferId
      };

      // Send file info to peer
      dataChannel.send(JSON.stringify({
        type: 'file-info',
        transferId,
        fileInfo
      }));

      // Update transfer status
      setTransfers(prev =>
        prev.map(t =>
          t.id === transferId
            ? { ...t, status: 'transferring' }
            : t
        )
      );

      // Start sending file chunks
      sendFileChunks();
    };

    reader.readAsArrayBuffer(file);

    // Reset file input
    e.target.value = '';
  };

  // Send file in chunks
  const sendFileChunks = () => {
    if (!currentFile.current || !dataChannel) return;

    const { arrayBuffer, transferId } = currentFile.current;
    let offset = 0;
    let chunkNumber = 0;
    const totalChunks = Math.ceil(arrayBuffer.byteLength / CHUNK_SIZE);

    // Function to send next chunk
    const sendNextChunk = () => {
      if (offset >= arrayBuffer.byteLength) {
        // All chunks sent
        dataChannel.send(JSON.stringify({
          type: 'file-complete',
          transferId
        }));

        // Update transfer status
        setTransfers(prev =>
          prev.map(t =>
            t.id === transferId
              ? { ...t, status: 'complete', progress: 100 }
              : t
          )
        );

        // Clear current file
        currentFile.current = null;
        return;
      }

      // Calculate chunk size
      const chunk = arrayBuffer.slice(offset, offset + CHUNK_SIZE);

      // Send chunk metadata
      dataChannel.send(JSON.stringify({
        type: 'file-chunk-info',
        transferId,
        chunkNumber,
        totalChunks
      }));

      // Send chunk data
      dataChannel.send(chunk);

      // Update offset and chunk number
      offset += chunk.byteLength;
      chunkNumber++;

      // Update progress
      const progress = Math.round((offset / arrayBuffer.byteLength) * 100);
      setTransfers(prev =>
        prev.map(t =>
          t.id === transferId
            ? { ...t, progress }
            : t
        )
      );

      // Schedule next chunk
      setTimeout(sendNextChunk, 0);
    };

    // Start sending chunks
    sendNextChunk();
  };

  // Download a completed file
  const downloadFile = (transfer: FileTransfer) => {
    if (!transfer.data || transfer.status !== 'complete') return;

    const { name, type } = transfer.fileInfo;
    const blob = new Blob([transfer.data], { type });
    const url = URL.createObjectURL(blob);

    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();

    // Clean up
    URL.revokeObjectURL(url);
  };

  // Remove a transfer from the list
  const removeTransfer = (id: string) => {
    setTransfers(prev => prev.filter(t => t.id !== id));
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  // Set up data channel for file transfers
  useEffect(() => {
    // Create data channel for file transfers
    const channel = peerConnection.createDataChannel('fileTransfer', {
      ordered: true
    });

    // Variables for receiving files
    let currentReceivingFile: {
      transferId: string,
      fileInfo: FileInfo,
      chunks: ArrayBuffer[],
      totalChunks: number
    } | null = null;

    const handleFileChange = (messageEvent: MessageEvent<unknown>) => {
      // Handle binary data (file chunks)
      if (messageEvent.data instanceof ArrayBuffer) {
        if (!currentReceivingFile) return;

        // Store chunk
        currentReceivingFile.chunks.push(messageEvent.data);

        // Update progress
        const progress = Math.round(
          (currentReceivingFile.chunks.length / currentReceivingFile.totalChunks) * 100
        );

        setTransfers(prev =>
          prev.map(t =>
            t.id === currentReceivingFile?.transferId
              ? { ...t, progress }
              : t
          )
        );

        return;
      }

      // Handle JSON messages
      try {
        const message = JSON.parse(messageEvent.data as string);
        console.log(message);
        

        switch (message.type) {
          case 'file-info':
            // Peer is sending a file
            currentReceivingFile = {
              transferId: message.transferId,
              fileInfo: message.fileInfo,
              chunks: [],
              totalChunks: 0
            };

            // Add to transfers list
            setTransfers(prev => [
              ...prev,
              {
                id: message.transferId,
                fileInfo: message.fileInfo,
                progress: 0,
                status: 'transferring',
                direction: 'download'
              }
            ]);
            break;

          case 'file-chunk-info':
            if (!currentReceivingFile || currentReceivingFile.transferId !== message.transferId) return;

            // Store total chunks info
            currentReceivingFile.totalChunks = message.totalChunks;
            break;

          case 'file-complete':
            {
              if (!currentReceivingFile || currentReceivingFile.transferId !== message.transferId) return;

              // Combine chunks into a single blob
              const blob = new Blob(currentReceivingFile.chunks, {
                type: currentReceivingFile.fileInfo.type
              });

              // Update transfer with completed file
              setTransfers(prev =>
                prev.map(t =>
                  t.id === currentReceivingFile?.transferId
                    ? {
                      ...t,
                      status: 'complete',
                      progress: 100,
                      data: blob
                    }
                    : t
                )
              );

              // Reset current receiving file
              setTimeout(() => {
                currentReceivingFile = null;
              },1000);
              break;
            }
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    // Set up channel event handlers
    channel.onopen = () => {
      console.log('File transfer data channel opened');
      setDataChannel(channel);
      setIsConnected(true);
    };

    channel.onclose = () => {
      console.log('File transfer data channel closed');
      setIsConnected(false);
    };

    channel.onmessage = handleFileChange;

    // Handle incoming data channels
    peerConnection.ondatachannel = (event) => {
      const receivedChannel = event.channel;
      setDataChannel(receivedChannel);

      receivedChannel.onmessage = handleFileChange;

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

  return (
    <div>
      <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <File className="mr-2" /> File Transfer
            </h2>
            <div className="bg-indigo-600/80 text-white px-3 py-1 rounded-full text-sm">
              {connectionStatus}
            </div>
          </div>

          {/* File upload button */}
          <div className="mb-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={handleSelectFile}
              disabled={!isConnected}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800/50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-3 flex items-center transition-colors"
            >
              <Upload className="mr-2" size={18} />
              Select File to Send
            </button>
            {!isConnected && (
              <p className="text-white/70 text-sm mt-2">
                Connect with a peer to enable file transfers.
              </p>
            )}
          </div>

          {/* Transfers list */}
          <div className="bg-gray-900/50 rounded-lg mb-6 overflow-hidden">
            <div className="p-4">
              <h3 className="text-white font-medium mb-3">File Transfers</h3>

              {transfers.length === 0 ? (
                <div className="text-white/50 text-center py-8">
                  No file transfers yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {transfers.map((transfer) => (
                    <div key={transfer.id} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <FileText className="text-indigo-400 mr-2" size={20} />
                          <div>
                            <div className="text-white font-medium truncate max-w-[200px]">
                              {transfer.fileInfo.name}
                            </div>
                            <div className="text-white/60 text-xs">
                              {formatFileSize(transfer.fileInfo.size)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {transfer.status === 'complete' && transfer.direction === 'download' && (
                            <button
                              onClick={() => downloadFile(transfer)}
                              className="text-indigo-400 hover:text-indigo-300 mr-2"
                              title="Download file"
                            >
                              <Download size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => removeTransfer(transfer.id)}
                            className="text-gray-400 hover:text-gray-300"
                            title="Remove from list"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="flex-grow mr-3">
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${transfer.status === 'complete'
                                ? 'bg-green-500'
                                : 'bg-indigo-500'
                                }`}
                              style={{ width: `${transfer.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-white/70 text-xs w-12 text-right">
                          {transfer.status === 'complete' ? (
                            <span className="text-green-400 flex items-center justify-end">
                              <Check size={14} className="mr-1" /> Done
                            </span>
                          ) : (
                            `${transfer.progress}%`
                          )}
                        </div>
                      </div>

                      <div className="mt-1 text-xs text-white/50 flex items-center">
                        {transfer.direction === 'upload' ? (
                          <Upload size={12} className="mr-1" />
                        ) : (
                          <Download size={12} className="mr-1" />
                        )}
                        {transfer.direction === 'upload' ? 'Sending' : 'Receiving'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

export default RtcFileTransfer;