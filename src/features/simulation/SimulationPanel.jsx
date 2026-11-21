import { CONFIG } from '../../config';
import { cumulativeKm } from '../../lib/geo';
import { useStore } from '../../store';
import './simulation.css';

export default function SimulationPanel() {
  const route = useStore((state) => state.route);
  const mode = useStore((state) => state.mode);
  const sim = useStore((state) => state.sim);
  const routeInfo = useStore((state) => state.routeInfo);
  const blocked = useStore((state) => state.blocked);
  const setSim = useStore((state) => state.setSim);

  if (!Array.isArray(route) || route.length === 0) {
    return (
      <div className="panel sim-panel sim-panel-empty">
        <span>🚗</span> Naa pa tay biyahe. Unya na!
      </div>
    );
  }

  const cum = cumulativeKm(route);
  const totalKm = cum[cum.length - 1] || routeInfo?.distanceKm || 0;
  const traveledKm = totalKm * (sim.progress || 0);
  const remainingKm = Math.max(0, totalKm - traveledKm);
  const progressPercent = Math.round((sim.progress || 0) * 100);
  const canRestart = route.length >= 2;

  const handleRestart = () => {
    if (!canRestart) return;
    setSim({
      status: 'running',
      index: 0,
      pos: [...route[0]],
      heading: 0,
      speedKmh: 0,
      progress: 0,
    });
  };

  return (
    <div className="panel sim-panel">
      {blocked && (
        <div className="sim-blocked">Captcha in progress: car stopped</div>
      )}

      <div className="sim-speed-row">
        <div className="sim-mode-icon" aria-hidden="true">
          {mode === 'walk' ? '🚶' : '🚗'}
        </div>
        <div className="sim-speed">
          <strong>{Math.round(sim.speedKmh || 0)}</strong>
          <span>km/h</span>
        </div>
        <div className="sim-timescale-badge">x{sim.timeScale}</div>
      </div>

      <div
        className="sim-progress"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={progressPercent}
      >
        <div
          className="sim-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="sim-progress-meta">
        <span>{progressPercent}% paingon</span>
        <span>{remainingKm.toFixed(1)} km pa</span>
      </div>

      <div className="sim-controls">
        {sim.status === 'running' ? (
          <button
            type="button"
            className="btn sim-control-main"
            onClick={() => setSim({ status: 'paused', speedKmh: 0 })}
          >
            Ⅱ Pause
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary sim-control-main"
            onClick={() => setSim({ status: 'running', speedKmh: 0 })}
          >
            ▶ Play
          </button>
        )}
        <button
          type="button"
          className="btn"
          onClick={handleRestart}
          disabled={!canRestart}
        >
          ↻ Restart
        </button>
      </div>

      <div className="sim-time-scales" aria-label="Time scale">
        {CONFIG.SIM_TIME_SCALES.map((scale) => (
          <button
            type="button"
            key={scale}
            className={`btn sim-scale-btn ${sim.timeScale === scale ? 'is-active' : ''}`}
            onClick={() => setSim({ timeScale: scale })}
          >
            {scale}x
          </button>
        ))}
      </div>

      <button
        type="button"
        className={`btn sim-follow-btn ${sim.follow ? 'is-active' : ''}`}
        onClick={() => setSim({ follow: true })}
      >
        {sim.follow ? '◎ Following' : '◎ Recenter'}
      </button>

      <div className="sim-caption">
        {sim.status === 'arrived'
          ? 'Niabot na! Murag milagro.'
          : sim.status === 'paused'
            ? 'Naa na ba ta? Wala pa. (paused)'
            : 'Naa na ba ta? Wala pa.'}
      </div>
    </div>
  );
}
