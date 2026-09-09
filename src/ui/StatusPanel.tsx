interface StatusPanelProps {
  seed: number;
  day: number;
  hour: number;
  cars: number;
  pedestrians: number;
  fps: number;
}

function formatHour(hour: number): string {
  const h = Math.floor(hour) % 24;
  const m = Math.floor((hour % 1) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function StatusPanel({ seed, day, hour, cars, pedestrians, fps }: StatusPanelProps) {
  return (
    <div className="panel status-panel">
      <p className="status-title">WORLD SIMULATOR // v0.1</p>
      <div className="status-row">
        <span>seed</span>
        <span>{seed}</span>
      </div>
      <div className="status-row">
        <span>day</span>
        <span>{day}</span>
      </div>
      <div className="status-row">
        <span>time</span>
        <span>{formatHour(hour)}</span>
      </div>
      <div className="status-row">
        <span>cars</span>
        <span>{cars}</span>
      </div>
      <div className="status-row">
        <span>pedestrians</span>
        <span>{pedestrians}</span>
      </div>
      <div className="status-row">
        <span>fps</span>
        <span>{fps}</span>
      </div>
    </div>
  );
}
