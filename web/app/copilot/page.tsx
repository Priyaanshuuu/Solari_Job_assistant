/**
 * Web Frontend - Next.js Pages
 * Entry point for the voice UI
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Room } from "livekit-client";
import VoiceOrb from "@/components/VoiceOrb";
import TranscriptPanel from "@/components/TranscriptPanel";
import ResultsCard from "@/components/ResultsCard";

interface JobResult {
  job_id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  relevance_score: number;
  ats_keyword_match?: number;
  status: "new" | "seen" | "applied" | "rejected";
}

export default function CopilotPage() {
  const [transcript, setTranscript] = useState("");
  const [results, setResults] = useState<JobResult[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready for your next search.");
  const [connectionState, setConnectionState] = useState<"offline" | "connecting" | "connected">("offline");
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
    };
  }, []);

  const connectToLiveKit = async () => {
    if (roomRef.current?.state === "connected") {
      await roomRef.current.localParticipant.setMicrophoneEnabled(true);
      return;
    }

    const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
    if (!liveKitUrl) {
      setStatus("LiveKit is not configured. Add NEXT_PUBLIC_LIVEKIT_URL to .env.local.");
      return;
    }

    setConnectionState("connecting");
    try {
      const participantName = `user-${crypto.randomUUID().slice(0, 8)}`;
      const roomName = `job-copilot-${crypto.randomUUID()}`;
      const response = await fetch("/api/livekit-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, participantName }),
      });

      if (!response.ok) {
        throw new Error("LiveKit token request failed");
      }

      const { token, serverUrl } = await response.json();
      const room = new Room();
      room.on("dataReceived", (payload, _participant, _kind, topic) => {
        if (topic !== "job-results") return;
        try {
          const message = JSON.parse(new TextDecoder().decode(payload)) as { type?: string; listings?: JobResult[] };
          if (message.type === "job-results") {
            setResults(message.listings ?? []);
            setStatus(`${message.listings?.length ?? 0} job openings found.`);
          }
        } catch {
          setStatus("Received an invalid job-results message.");
        }
      });
      room.on("trackSubscribed", (track) => {
        if (track.kind === "audio") {
          const audioElement = track.attach();
          document.body.appendChild(audioElement);
          setStatus("The agent is responding.");
        }
      });
      room.on("trackUnsubscribed", (track) => {
        track.detach().forEach((element) => element.remove());
      });
      room.on("activeSpeakersChanged", (speakers) => {
        if (speakers.some((speaker) => speaker !== room.localParticipant)) {
          setStatus("The agent is responding.");
        }
      });
      room.on("localAudioSilenceDetected", () => {
        setStatus("No microphone audio detected. Check your microphone and try again.");
      });
      await room.connect(serverUrl ?? liveKitUrl, token);
      await room.localParticipant.setMicrophoneEnabled(true);
      roomRef.current = room;
      setConnectionState("connected");
      setStatus("Listening for your request.");
    } catch (error) {
      console.error("LiveKit connection error:", error);
      setConnectionState("offline");
      setStatus("LiveKit could not connect. Check your credentials and try again.");
    }
  };

  const disconnectFromLiveKit = async () => {
    const room = roomRef.current;
    if (!room) return;

    await room.localParticipant.setMicrophoneEnabled(false);
    await room.disconnect();
    roomRef.current = null;
    setConnectionState("offline");
    setStatus("Ready for your next search.");
  };

  const handleQuickAction = (prompt: string) => {
    setTranscript(prompt);
    setStatus("Request ready. Use the microphone to send it.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-2">🎤 Job Copilot</h1>
          <p className="text-lg text-slate-300">
            Voice-first job search with AI resume tailoring
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Voice Input Section */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
              <h2 className="text-xl font-semibold mb-6">Voice Control</h2>

              {/* Voice Orb */}
              <div className="mb-8">
                <VoiceOrb
                  onStart={() => {
                    void connectToLiveKit();
                  }}
                  onStop={() => {
                    void disconnectFromLiveKit();
                  }}
                  onProcessing={() => setStatus("Request received. The agent is processing it.")}
                  onTranscript={setTranscript}
                  onError={(message) => setStatus(message)}
                />
              </div>

              {/* Quick Actions */}
              <div className="mb-5 flex items-center justify-center gap-2 text-xs text-slate-400">
                <span className={`h-2 w-2 rounded-full ${connectionState === "connected" ? "bg-green-400" : connectionState === "connecting" ? "bg-yellow-400" : "bg-slate-500"}`} />
                {connectionState === "connected" ? "LiveKit connected" : connectionState === "connecting" ? "Connecting to LiveKit..." : "LiveKit offline"}
              </div>
              <div className="space-y-2">
                <button onClick={() => handleQuickAction("Find new backend roles in my preferred locations.")} className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition">
                  Find New Jobs
                </button>
                <button onClick={() => handleQuickAction("Tailor my resume for the selected job.")} className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition">
                  Tailor Resume
                </button>
                <button onClick={() => setStatus("Your saved opportunities will appear here after the first search.")} className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition">
                  View Results
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Transcript Panel */}
              {transcript && (
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold mb-3">Transcript</h3>
                  <TranscriptPanel transcript={transcript} />
                </div>
              )}

              {/* Results */}
              {results.length > 0 && (
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold mb-4">
                    Results ({results.length})
                  </h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {results.map((job) => (
                      <ResultsCard
                        key={job.job_id}
                        job={job}
                        isSelected={selectedJob === job.job_id}
                        onSelect={() => setSelectedJob(job.job_id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Status Message */}
              <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
                <p className="text-slate-400">{status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
