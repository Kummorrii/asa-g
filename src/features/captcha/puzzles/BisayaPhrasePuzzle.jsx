export default function BisayaPhrasePuzzle({ onSuccess, onFail }) {
  const options = ['Hinay-hinay', 'Dali-dali', 'Lami kaayo', 'Asa ang jeep?'];

  return (
    <div className="cap-puzzle">
      <p>Unsa ang Bisaya sa “slow down”?</p>
      <div className="cap-button-row">
        {options.map((option) => (
          <button
            className="cap-not-button"
            key={option}
            onClick={() => option === 'Hinay-hinay' ? onSuccess() : onFail('Dili na mao. Hinay-hinay lang, pati sa pagtubag!')}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}