/**
 * Transcript Panel Component
 * Displays the transcribed text from the user
 */

"use client";

interface TranscriptPanelProps {
  transcript: string;
}

export default function TranscriptPanel({ transcript }: TranscriptPanelProps) {
  return (
    <div className="bg-slate-900 rounded border border-slate-600 p-4">
      <p className="text-slate-100 leading-relaxed">{transcript}</p>
    </div>
  );
}
