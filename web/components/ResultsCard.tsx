/**
 * Results Card Component
 * Displays individual job listing cards
 */

"use client";

interface ResultsCardProps {
  job: {
    job_id: string;
    title: string;
    company: string;
    location: string;
    relevance_score: number;
    ats_keyword_match?: number;
    status: "new" | "seen" | "applied" | "rejected";
  };
  isSelected: boolean;
  onSelect: () => void;
}

export default function ResultsCard({
  job,
  isSelected,
  onSelect,
}: ResultsCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-900/20"
          : "border-slate-600 bg-slate-900/30 hover:border-slate-500"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-lg">{job.title}</h4>
          <p className="text-sm text-slate-300">{job.company}</p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            job.status === "new"
              ? "bg-green-600/30 text-green-200"
              : job.status === "applied"
                ? "bg-blue-600/30 text-blue-200"
                : "bg-slate-600/30 text-slate-200"
          }`}
        >
          {job.status.toUpperCase()}
        </span>
      </div>

      <p className="text-sm text-slate-400 mb-3">{job.location}</p>

      <div className="flex gap-3 text-xs">
        <div>
          <span className="text-slate-400">Relevance:</span>
          <div className="w-24 h-2 bg-slate-700 rounded-full mt-1">
            <div
              className="h-2 bg-green-500 rounded-full"
              style={{ width: `${job.relevance_score}%` }}
            />
          </div>
        </div>

        {job.ats_keyword_match !== undefined && (
          <div>
            <span className="text-slate-400">ATS Match:</span>
            <p className="font-semibold">{job.ats_keyword_match.toFixed(0)}%</p>
          </div>
        )}
      </div>
    </div>
  );
}
