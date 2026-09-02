/**
 * Voice Orb Component
 * The main interaction UI for voice input
 */

"use client";

import { useRef, useState } from "react";
import { useLocalParticipant, useDataChannel } from "@livekit/components-react";

interface VoiceOrbProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  onTranscript: (text: string) => void;
  onResults: (results: any[]) => void;
}

export default function VoiceOrb({
  isListening,
  onStart,
  onStop,
  onTranscript,
  onResults,
}: VoiceOrbProps) {
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleClick = async () => {
    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setIsRecording(true);
        onStart();

        // TODO: Send audio to LiveKit agent
      } catch (error) {
        console.error("Microphone access denied:", error);
      }
    } else {
      // Stop recording
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setIsRecording(false);
      onStop();

      // TODO: Process audio with agent
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Voice Orb Button */}
      <button
        onClick={handleClick}
        className={`w-24 h-24 rounded-full transition-all duration-200 flex items-center justify-center text-4xl ${
          isRecording
            ? "bg-red-600 shadow-lg shadow-red-600/50 scale-110"
            : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30"
        }`}
      >
        🎤
      </button>

      {/* Status Text */}
      <div className="text-sm font-medium">
        {isRecording ? (
          <span className="text-red-400 animate-pulse">🔴 Recording...</span>
        ) : (
          <span className="text-slate-400">Click to speak</span>
        )}
      </div>
    </div>
  );
}
