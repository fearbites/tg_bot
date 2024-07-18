import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Arrow from './icons/Arrow';
import { bear, coin, highVoltage, notcoin, rocket, trophy } from './images';

interface ClickPosition {
  id: number;
  x: number;
  y: number;
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

function App() {
  const [points, setPoints] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(0);
  const [clicks, setClicks] = useState<ClickPosition[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);

  const pointsToAdd = 12;
  const energyToReduce = 12;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const telegramAuthData = Object.fromEntries(urlParams.entries());

    if (telegramAuthData.hasOwnProperty('user')) {
      // User is authenticated via Telegram
      const user = JSON.parse(telegramAuthData['user']);
      setTelegramUser(user);
      // Set userId to the Telegram user's id
      setUserId(user.id.toString());
    }
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (energy - energyToReduce < 0) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPoints((prevPoints) => prevPoints + pointsToAdd);
    setEnergy((prevEnergy) => Math.max(prevEnergy - energyToReduce, 0));

    const newClick: ClickPosition = { id: Date.now(), x, y };
    setClicks((prevClicks) => [...prevClicks, newClick]);

    console.log(`User ${userId} sent data to server. Points: ${points + pointsToAdd}`);
  };

  const handleAnimationEnd = (id: number) => {
    setClicks((prevClicks) => prevClicks.filter((click) => click.id !== id));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prevEnergy) => Math.min(prevEnergy + 1, 6500));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userId) {
      const updateProgress = () => {
        axios
          .post(`http://localhost:5173/updateProgress/${userId}`, { points, energy })
          .then(() => {
            console.log(`User ${userId} points updated: ${points}`);
          })
          .catch((error) => {
            console.error('Failed to update progress', error);
          });
      };

      window.addEventListener('beforeunload', updateProgress);

      return () => {
        updateProgress();
        window.removeEventListener('beforeunload', updateProgress);
      };
    }
  }, [points, energy, userId]);

  return (
    <div className="bg-gradient-main min-h-screen px-4 flex flex-col items-center text-white font-medium">
      <div className="absolute inset-0 h-1/2 bg-gradient-overlay z-0"></div>
      <div className="absolute inset-0 flex items-center justify-center z-0"></div>
      <div className="radial-gradient-overlay"></div>
      <div className="w-full z-10 min-h-screen flex flex-col items-center text-white">
        <div className="fixed top-0 left-0 w-full px-4 pt-8 z-10 flex flex-col items-center text-white">
          <div className="w-full cursor-pointer">
            <div className="bg-[#1f1f1f] text-center py-2 rounded-xl">
              <p className="text-lg">
                Click! Click! Click! <Arrow size={18} className="ml-0 mb- inline-block" />
              </p>
            </div>
          </div>
          <div className="mt-12 text-5xl font-bold flex items-center">
            <img src={coin} width={44} height={44} alt="Coin" />
            <span className="ml-2">{points.toLocaleString()}</span>
          </div>
          {telegramUser && (
            <div className="text-base mt-2 flex items-center">
              <img src={trophy} width={24} height={24} alt="Trophy" />
              <span className="ml-1"> Hello, {telegramUser.first_name}! <Arrow size={18} className="m1-0 mb-1 inline block" /></span>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 w-full px-4 pb-4 z-10">
          <div className="w-full flex justify-between gap-2">
            <div className="w-1/3 flex items-center justify-start max-w-32">
              <div className="flex items-center justify-center">
                <img src={highVoltage} width={44} height={44} alt="High Voltage" />
                <div className="ml-2 text-left">
                  <span className="text-white text-2xl font-bold block">{energy}</span>
                  <span className="text-white text-large opacity-75">/ 6500</span>
                </div>
              </div>
            </div>
            <div className="flex-grow flex items-center max-w-60 text-sm">
              <div className="w-full bg-[#fad258] py-4 rounded-2xl flex justify-around">
                <button className="flex flex-col items-center gap-1">
                  <img src={bear} width={24} height={24} alt="Bear" />
                  <span>Frends</span>
                </button>
                <button className="flex flex-col items-center gap-1">
                  <img src={coin} width={24} height={24} alt="Coin" />
                  <span>Earn</span>
                </button>
                <button className="flex flex-col items-center gap-1">
                  <img src={rocket} width={24} height={24} alt="Rocket" />
                  <span>Boosts</span>
                </button>
              </div>
            </div>
          </div>
          <div className="w-full bg-[#f9c035] rounded-full mt-4">
            <div
              className="bg-gradient-to-r from-[#f3c45a] to-[#fffad0] h-4 rounded-full"
              style={{ width: `${(energy / 6500) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center">
          <div className="relative mt-4" onClick={handleClick}>
            <img src={notcoin} width={256} height={256} alt="notcoin" />
            {clicks.map((click) => (
              <div
                key={click.id}
                className="absolute text-5xl font-bold opacity-0"
                style={{
                  top: `${click.y - 42}px`,
                  left: `${click.x - 28}px`,
                  animation: `float 1s ease-out`,
                }}
                onAnimationEnd={() => handleAnimationEnd(click.id)}
              >
                {pointsToAdd}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
