interface RecordingIndicatorProps {
  duration: string;
}

export function RecordingIndicator({ duration }: RecordingIndicatorProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="
        flex items-center gap-2 rounded-full border border-red-100 bg-red-50
        px-3 py-1.5 text-red-600
        dark:border-red-800 dark:bg-red-900/20 dark:text-red-400
      ">
        <div className="relative flex size-2.5">
          <span className="
            absolute inline-flex size-full animate-ping rounded-full bg-red-400
            opacity-75
          " />
          <span className="
            relative inline-flex size-2.5 rounded-full bg-red-500
          " />
        </div>
        <span className="text-xs font-bold tracking-wider uppercase">
          Recording
        </span>
      </div>
      <span className="text-2xl font-bold tracking-tight tabular-nums">
        {duration}
      </span>
    </div>
  );
}
