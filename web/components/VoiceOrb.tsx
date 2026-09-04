/**
 * Voice Orb Component
 * The main interaction UI for voice input
 */

"use client";

import { useEffect, useRef, useState } from "react";

interface SpeechRecognitionResultEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: { transcript: string };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface VoiceOrbProps {
  onStart: () => void;
  onStop: () => void;
  onTranscript: (text: string) => void;
  onError: (message: string) => void;
}

export default function VoiceOrb({
  onStart,
  onStop,
  onTranscript,
  onError,
}: VoiceOrbProps) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleClick = async () => {
    if (!isRecording) {
      const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

      if (!Recognition) {
        onError("Speech recognition is unavailable in this browser. Try Chrome or Edge.");
        return;
      }

      const recognition = new Recognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        const transcript = Array.from({ length: event.results.length }, (_, index) =>
          event.results[index][0].transcript,
        ).join(" ");
        onTranscript(transcript.trim());
      };
      recognition.onerror = (event) => {
        setIsRecording(false);
        onError(event.error === "not-allowed" ? "Microphone access was denied." : "We could not hear that. Please try again.");
      };
      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      setIsRecording(true);
      onStart();
      recognition.start();
    } else {
      recognitionRef.current?.stop();
      setIsRecording(false);
      onStop();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Voice Orb Button */}
      <button
        onClick={handleClick}
        type="button"
        aria-label={isRecording ? "Stop listening" : "Start listening"}
        aria-pressed={isRecording}
        className={`flex h-28 w-28 items-center justify-center rounded-full text-3xl transition-all duration-200 ${
          isRecording
            ? "scale-105 bg-[#ee7655] shadow-lg shadow-[#ee7655]/30"
            : "bg-[#75d19b] shadow-lg shadow-[#75d19b]/20 hover:scale-105"
        }`}
      >
        {isRecording ? "■" : "●"}
      </button>

      {/* Status Text */}
      <div className="text-sm font-medium">
        {isRecording ? (
          <span className="animate-pulse text-[#ee7655]">Listening...</span>
        ) : (
          <span className="text-[#aebbb5]">Tap to speak</span>
        )}
      </div>
    </div>
  );
}
