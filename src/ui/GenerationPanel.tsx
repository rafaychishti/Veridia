interface GenerationPanelProps {
  seaLevel: number;
  mountainLevel: number;
  onSeaLevelChange: (value: number) => void;
  onMountainLevelChange: (value: number) => void;
}

export function GenerationPanel({
  seaLevel,
  mountainLevel,
  onSeaLevelChange,
  onMountainLevelChange,
}: GenerationPanelProps) {
  return (
    <div className="panel gen-panel">
      <h3>Generation</h3>
      <div className="slider-row">
        <label>
          <span>sea level</span>
          <span>{seaLevel.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min={0.15}
          max={0.55}
          step={0.01}
          value={seaLevel}
          onChange={(e) => onSeaLevelChange(Number(e.target.value))}
        />
      </div>
      <div className="slider-row">
        <label>
          <span>mountain level</span>
          <span>{mountainLevel.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min={0.55}
          max={0.88}
          step={0.01}
          value={mountainLevel}
          onChange={(e) => onMountainLevelChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
