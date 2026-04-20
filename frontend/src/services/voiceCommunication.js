import io from 'socket.io-client';

class VoiceCommunicationService {
  constructor() {
    this.socket = null;
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.isCallActive = false;
    this.currentCall = null;
    
    // WebRTC configuration
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }

  // Initialize voice communication
  initialize(userId) {
    try {
      this.socket = io('http://localhost:5000', {
        query: { userId }
      });

      this.setupSocketListeners();
      console.log('Voice communication initialized');
    } catch (error) {
      console.error('Failed to initialize voice communication:', error);
    }
  }

  // Setup socket event listeners
  setupSocketListeners() {
    if (!this.socket) return;

    // Incoming call
    this.socket.on('incoming-call', (data) => {
      this.handleIncomingCall(data);
    });

    // Call accepted
    this.socket.on('call-accepted', (data) => {
      this.handleCallAccepted(data);
    });

    // Call rejected
    this.socket.on('call-rejected', (data) => {
      this.handleCallRejected(data);
    });

    // ICE candidate
    this.socket.on('ice-candidate', (data) => {
      this.handleIceCandidate(data);
    });

    // Offer
    this.socket.on('offer', (data) => {
      this.handleOffer(data);
    });

    // Answer
    this.socket.on('answer', (data) => {
      this.handleAnswer(data);
    });

    // Call ended
    this.socket.on('call-ended', (data) => {
      this.handleCallEnded(data);
    });

    // Voice activity
    this.socket.on('voice-activity', (data) => {
      this.handleVoiceActivity(data);
    });
  }

  // Start voice call with another user
  async initiateCall(targetUserId, callType = 'voice') {
    try {
      if (!this.socket) {
        throw new Error('Socket not initialized');
      }

      // Get local media stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.configuration);
      
      // Add local stream
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Setup peer connection events
      this.setupPeerConnectionEvents();

      // Create offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // Send call request
      this.socket.emit('initiate-call', {
        targetUserId,
        callType,
        offer: offer,
        callerId: this.getCurrentUserId()
      });

      this.isCallActive = true;
      this.currentCall = {
        targetUserId,
        callType,
        startTime: Date.now(),
        direction: 'outgoing'
      };

      return { success: true, callId: this.generateCallId() };

    } catch (error) {
      console.error('Failed to initiate call:', error);
      return { success: false, error: error.message };
    }
  }

  // Accept incoming call
  async acceptCall(callId) {
    try {
      if (!this.socket || !this.currentCall) {
        throw new Error('No incoming call to accept');
      }

      // Get local media stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.configuration);
      
      // Add local stream
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Setup peer connection events
      this.setupPeerConnectionEvents();

      // Set remote description (offer)
      if (this.currentCall.offer) {
        await this.peerConnection.setRemoteDescription(this.currentCall.offer);
      }

      // Create answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      // Send answer
      this.socket.emit('accept-call', {
        callId,
        answer: answer,
        targetUserId: this.currentCall.callerId
      });

      this.isCallActive = true;
      this.currentCall.status = 'connected';

      return { success: true };

    } catch (error) {
      console.error('Failed to accept call:', error);
      return { success: false, error: error.message };
    }
  }

  // Reject incoming call
  rejectCall(callId, reason = 'User rejected') {
    if (this.socket) {
      this.socket.emit('reject-call', {
        callId,
        reason,
        targetUserId: this.currentCall?.callerId
      });
    }
    
    this.endCall();
  }

  // End current call
  endCall(reason = 'Call ended') {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.socket && this.currentCall) {
      this.socket.emit('end-call', {
        callId: this.currentCall.callId,
        reason,
        targetUserId: this.currentCall.targetUserId || this.currentCall.callerId
      });
    }

    this.isCallActive = false;
    this.currentCall = null;
  }

  // Setup WebRTC peer connection events
  setupPeerConnectionEvents() {
    if (!this.peerConnection) return;

    // ICE candidate
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('ice-candidate', {
          candidate: event.candidate,
          targetUserId: this.getTargetUserId()
        });
      }
    };

    // Connection state change
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection.connectionState);
      
      if (this.peerConnection.connectionState === 'connected') {
        this.onCallConnected();
      } else if (this.peerConnection.connectionState === 'disconnected' || 
                 this.peerConnection.connectionState === 'failed') {
        this.onCallDisconnected();
      }
    };

    // Track events
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.onRemoteStreamAdded();
      }
    };
  }

  // Handle incoming call
  handleIncomingCall(data) {
    this.currentCall = {
      ...data,
      direction: 'incoming',
      status: 'ringing'
    };

    // Trigger incoming call event for UI
    this.onIncomingCall(data);
  }

  // Handle call accepted
  handleCallAccepted(data) {
    if (this.currentCall) {
      this.currentCall.status = 'connected';
      this.onCallAccepted(data);
    }
  }

  // Handle call rejected
  handleCallRejected(data) {
    this.onCallRejected(data);
    this.endCall('Call rejected');
  }

  // Handle ICE candidate
  async handleIceCandidate(data) {
    if (this.peerConnection && data.candidate) {
      try {
        await this.peerConnection.addIceCandidate(data.candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  }

  // Handle offer
  async handleOffer(data) {
    if (this.peerConnection && data.offer) {
      try {
        await this.peerConnection.setRemoteDescription(data.offer);
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    }
  }

  // Handle answer
  async handleAnswer(data) {
    if (this.peerConnection && data.answer) {
      try {
        await this.peerConnection.setRemoteDescription(data.answer);
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    }
  }

  // Handle call ended
  handleCallEnded(data) {
    this.onCallEnded(data);
    this.endCall();
  }

  // Handle voice activity
  handleVoiceActivity(data) {
    this.onVoiceActivity(data);
  }

  // Event handlers (to be overridden by components)
  onIncomingCall(data) {
    console.log('Incoming call:', data);
  }

  onCallAccepted(data) {
    console.log('Call accepted:', data);
  }

  onCallRejected(data) {
    console.log('Call rejected:', data);
  }

  onCallConnected() {
    console.log('Call connected');
  }

  onCallDisconnected() {
    console.log('Call disconnected');
  }

  onCallEnded(data) {
    console.log('Call ended:', data);
  }

  onRemoteStreamAdded() {
    console.log('Remote stream added');
  }

  onVoiceActivity(data) {
    console.log('Voice activity:', data);
  }

  // Utility methods
  getCurrentUserId() {
    return localStorage.getItem('userId') || 'anonymous';
  }

  getTargetUserId() {
    return this.currentCall?.targetUserId || this.currentCall?.callerId;
  }

  generateCallId() {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get call duration
  getCallDuration() {
    if (!this.currentCall?.startTime) return 0;
    return Math.floor((Date.now() - this.currentCall.startTime) / 1000);
  }

  // Check if in call
  isInCall() {
    return this.isCallActive;
  }

  // Get current call info
  getCurrentCall() {
    return this.currentCall;
  }

  // Mute/unmute local audio
  toggleMute() {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      return !audioTracks[0]?.enabled;
    }
    return false;
  }

  // Get mute status
  isMuted() {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      return audioTracks.length > 0 ? !audioTracks[0].enabled : true;
    }
    return true;
  }

  // Cleanup
  disconnect() {
    this.endCall('User disconnected');
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Export singleton instance
const voiceCommunication = new VoiceCommunicationService();
export default voiceCommunication;
