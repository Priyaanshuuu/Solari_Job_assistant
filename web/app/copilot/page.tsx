/**
 * Web Frontend - Next.js Pages
 * Entry point for the voice UI
 */

"use client";

import { useState } from "react";
import VoiceOrb from "@/components/VoiceOrb";
import TranscriptPanel from "@/components/TranscriptPanel";
import ResultsCard from "@/components/ResultsCard";

export default function CopilotPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready for your next search.");

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
                  isListening={isListening}
                  onStart={() => setIsListening(true)}
                  onStop={() => setIsListening(false)}
                  onTranscript={setTranscript}
                  onResults={setResults}
                  onError={(message) => setStatus(message)}
                />
              </div>

              {/* Quick Actions */}
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
              {!results.length && !transcript && (
                <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
                  <p className="text-slate-400">{status}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
