const SPEEDS = [1, 10, 100];

interface ControlBarProps {
  paused: boolean;
  speed: number;
  seedText: string;
  onTogglePause: () => void;
  onSetSpeed: (speed: number) => void;
  onSeedTextChange: (value: string) => void;
  onRegenerate: () => void;
  onSave: () => void;
  onLoadClick: () => void;
}

export function ControlBar({
  paused,
  speed,
  seedText,
  onTogglePause,
  onSetSpeed,
  onSeedTextChange,
  onRegenerate,
  onSave,
  onLoadClick,
}: ControlBarProps) {
  return (
    <div className="panel control-bar">
      <button className="btn play" onClick={onTogglePause} aria-label={paused ? "Play" : "Pause"}>
        {paused ? "▶" : "❙❙"}
      </button>

      <div className="control-group">
        {SPEEDS.map((s) => (
          <button
            key={s}
            className={`btn ${speed === s && !paused ? "active" : ""}`}
            onClick={() => onSetSpeed(s)}
          >
            {s}×
          </button>
        ))}
      </div>

      <div className="divider" />

      <input
        className="seed-input"
        value={seedText}
        onChange={(e) => onSeedTextChange(e.target.value)}
        placeholder="seed"
        onKeyDown={(e) => e.key === "Enter" && onRegenerate()}
      />
      <button className="btn" onClick={onRegenerate}>
        Regenerate
      </button>

      <div className="divider" />

      <button className="btn" onClick={onSave}>
        Save
      </button>
      <button className="btn" onClick={onLoadClick}>
        Load
      </button>
    </div>
  );
}
