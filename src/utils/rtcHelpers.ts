/**
 * Helper functions for WebRTC connections
 */

/**
 * Creates a new RTCPeerConnection with standard configuration
 * @returns A configured RTCPeerConnection instance
 */
export const createPeerConnection = (): RTCPeerConnection => {
  return new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.stunprotocol.org"
      },
      {
        urls: "stun:stun.l.google.com:19302"
      }
    ]
  });
};

/**
 * Requests access to user media (camera and microphone)
 * @param video Whether to request video access
 * @param audio Whether to request audio access
 * @returns Promise resolving to a MediaStream
 */
export const getUserMedia = async (
  video: boolean = true, 
  audio: boolean = true
): Promise<MediaStream> => {
  try {
    return await navigator.mediaDevices.getUserMedia({ video, audio });
  } catch (error) {
    console.error('Error accessing media devices:', error);
    throw error;
  }
};

/**
 * Adds tracks from a media stream to a peer connection
 * @param peerConnection The RTCPeerConnection to add tracks to
 * @param stream The MediaStream containing tracks to add
 */
export const addTracksToConnection = (
  peerConnection: RTCPeerConnection,
  stream: MediaStream
): void => {
  stream.getTracks().forEach(track => {
    peerConnection.addTrack(track, stream);
  });
};

/**
 * Stops all tracks in a media stream
 * @param stream The MediaStream to stop
 */
export const stopMediaStream = (stream: MediaStream | null): void => {
  if (!stream) return;
  stream.getTracks().forEach(track => track.stop());
};

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

/**
 * Generates a random session ID for identifying connections
 * @returns A random string ID
 */
export const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};