import { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { bus } from '../../lib/bus';
import { EVENTS } from '../../lib/events';
import { useCaptchaTimer } from './useCaptchaTimer';
import EmojiGridPuzzle from './puzzles/EmojiGridPuzzle';
import DistortedTextPuzzle from './puzzles/DistortedTextPuzzle';
import ReverseSliderPuzzle from './puzzles/ReverseSliderPuzzle';
import MathPuzzle from './puzzles/MathPuzzle';
import NotAButtonPuzzle from './puzzles/NotAButtonPuzzle';
import HumanWordPuzzle from './puzzles/HumanWordPuzzle';
import HoldButtonPuzzle from './puzzles/HoldButtonPuzzle';
import TrafficLightPuzzle from './puzzles/TrafficLightPuzzle';
import BisayaPhrasePuzzle from './puzzles/BisayaPhrasePuzzle';
import ChickenCrossingPuzzle from './puzzles/ChickenCrossingPuzzle';
import './captcha.css';

const puzzles = [
  EmojiGridPuzzle,
  DistortedTextPuzzle,
  ReverseSliderPuzzle,
  MathPuzzle,
  NotAButtonPuzzle,
  HumanWordPuzzle,
  HoldButtonPuzzle,
  TrafficLightPuzzle,
  BisayaPhrasePuzzle,
  ChickenCrossingPuzzle,
];

const captchaJokes = [
  'Ayaw kabalaka, mas lisod pa pilion asa moagi sa Cebu.',
  'Human ba ka? Ang robot diri kay naglibog pud sa traffic.',
  'Tubaga lang. Dili ni exam sa LTO, kunohay.',
  'Ang captcha ra ang hunongon, dili ang imong pasensya.',
];

export default function CaptchaModal() {
  useCaptchaTimer();
  const blocked = useStore((state) => state.blocked);
  const setBlocked = useStore((state) => state.setBlocked);
  const [Puzzle, setPuzzle] = useState(() => puzzles[0]);
  const [message, setMessage] = useState('');
  const [joke, setJoke] = useState(() => captchaJokes[Math.floor(Math.random() * captchaJokes.length)]);

  const chooseNewPuzzle = (avoid) => {
    const choices = puzzles.filter((item) => item !== avoid);
    setPuzzle(() => choices[Math.floor(Math.random() * choices.length)]);
  };

  useEffect(() => {
    if (blocked) {
      setMessage('');
      setJoke(captchaJokes[Math.floor(Math.random() * captchaJokes.length)]);
      chooseNewPuzzle(Puzzle);
    }
  }, [blocked]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'k') {
        setBlocked(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setBlocked]);

  useEffect(() => {
    const offReset = bus.on(EVENTS.TRIP_RESET, () => {
      setBlocked(false);
      setMessage('');
    });
    return offReset;
  }, [setBlocked]);

  if (!blocked) return null;

  const onSuccess = () => {
    setBlocked(false);
    bus.emit(EVENTS.CAPTCHA_RESULT, { success: true });
  };

  const onFail = (text) => {
    setMessage(text || 'Robot gyud ka, ayaw pag-deny.');
    bus.emit(EVENTS.CAPTCHA_RESULT, { success: false });
    chooseNewPuzzle(Puzzle);
  };

  return (
    <div className="cap-overlay" role="dialog" aria-modal="true" aria-label="Are you a robot?">
      <div className="cap-modal panel">
        <div className="cap-header">
          <span className="cap-check">✓</span>
          <h2>Are you a robot?</h2>
        </div>
        <p className="cap-joke">{joke}</p>
        {message && <p className="cap-message" role="alert">{message}</p>}
        <Puzzle onSuccess={onSuccess} onFail={onFail} />
      </div>
    </div>
  );
}
