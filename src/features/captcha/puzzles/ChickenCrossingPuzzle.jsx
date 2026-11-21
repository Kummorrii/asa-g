export default function ChickenCrossingPuzzle({ onSuccess, onFail }) {
  const options = [
    { label: 'Wait and let it cross', correct: true },
    { label: 'Honk until it files a complaint', correct: false },
    { label: 'Ask it for directions', correct: false },
    { label: 'Follow it; it knows a shortcut', correct: false },
  ];

  return (
    <div className="cap-puzzle">
      <p>Naay manok nitabok sa dalan. Unsa may buhaton?</p>
      <div className="cap-button-row">
        {options.map(({ label, correct }) => (
          <button
            className="cap-not-button"
            key={label}
            onClick={() => correct ? onSuccess() : onFail('Ayaw businahi ang manok, boss. Siya pa gani ang naay right of way!')}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}