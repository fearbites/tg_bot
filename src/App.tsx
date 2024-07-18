import React, { useEffect, useState } from 'react';
import './App.css';
import Arrow from './icons/Arrow';
import { bear, coin, highVoltage, notcoin, rocket, trophy } from './images';

const App: React.FC = () => {
  const [points, setPoints] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [click, setClick] = useState<{ id: number, x: number, y: number }[]>([]);
  const pointsToAdd = 12;
  const energyToReduce = 12;
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Проверка на доступность Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      const telegram = window.Telegram.WebApp;
      telegram.ready();
      const user = telegram.initDataUnsafe?.user;
      
      if (user) {
        setUserId(user.id);
        console.log(`ID пользователя: ${user.id}`);
      } else {
        console.error('Пользователь не найден в Telegram WebApp initData');
      }

      // Загрузка очков пользователя с сервера
      console.log('Загрузка очков...');
      fetch(`/api/points/${user.id}`)
        .then(response => response.json())
        .then(data => {
          setPoints(data.points);
          console.log(`Очки загружены: ${data.points}`);
        })
        .catch(error => console.error('Ошибка при загрузке очков:', error));
    } else {
      console.error('Telegram WebApp недоступен');
    }
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!userId) {
      console.error('ID пользователя равен null. Невозможно сохранить очки.');
      return;
    }

    if (energy - energyToReduce < 0) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPoints = points + pointsToAdd;
    setPoints(newPoints);
    console.log(`OK - Очки сохранены: ${newPoints}`);

    // Сохранение очков на сервере
    fetch(`/api/points/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ points: newPoints }),
    })
      .then(response => response.json())
      .then(data => console.log('Сервер ответил:', data))
      .catch(error => console.error('Ошибка при сохранении очков:', error));
  };

  const handleAnimationEnd = (id: number) => {
    setClick(prevClicks => prevClicks.filter(click => click.id !== id));
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prevEnergy) => Math.min(prevEnergy + 1, 6500));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-main min-h-screen px-4 flex flex-col items-center text-white font-medium">
      <div className="absolute inset-0 h-1/2 bg-gradient-overlay z-0"></div>
      <div className="absolute inset-0 flex items-center justify-center z-0"></div>
      <div className="radial-gradient-overlay"></div>
      <div className="w-full z-10 min-h-screen flex flex-col items-center text-white">
        <div className="fixed top-0 left-0 w-full px-4 pt-8 z-10 flex flex-col items-center text-white">
          <div className="w-full cursor-pointer">
            <div className="bg-[#1f1f1f] text-center py-2 rounded-xl">
              <p className="text-lg">Click! Click! Click! <Arrow size={18} className="ml-0 mb- inline-block" /></p>
            </div>
          </div>
          <div className="mt-12 text-5xl font-bold flex items-center">
            <img src={coin} width={44} height={44} alt="coin" />
            <span className="ml-2">{points.toLocaleString()}</span>
          </div>
          <div className="text-base mt-2 flex items-center">
            <img src={trophy} width={24} height={24} alt="trophy" />
            <span className="ml-1">Gold <Arrow size={18} className="m1-0 mb-1 inline block" /></span>
          </div>
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
                  <img src={bear} width={24} height={24} alt="bear" />
                  <span>Frends</span>
                </button>
                <button className="flex flex-col items-center gap-1">
                  <img src={coin} width={24} height={24} alt="coin" />
                  <span>Earn</span>
                </button>
                <button className="flex flex-col items-center gap-1">
                  <img src={rocket} width={24} height={24} alt="rocket" />
                  <span>Boosts</span>
                </button>
              </div>
            </div>
          </div>
          <div className="w-full bg-[#f9c035] rounded-full mt-4">
            <div className="bg-gradient-to-r from-[#f3c45a] to-[#fffad0] h-4 rounded-full" style={{ width: `${(energy / 6500) * 100}%` }}></div>
          </div>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="relative mt-4" onClick={handleClick}>
            <img src={notcoin} width={256} height={256} alt="notcoin" />
            {click.map((click) => (
              <div
                key={click.id}
                className="absolute text-5xl font-bold opacity-0"
                style={{
                  top: `${click.y - 42}px`,
                  left: `${click.x - 28}px`,
                  animation: `float 1s ease-out`
                }}
                onAnimationEnd={() => handleAnimationEnd(click.id)}
              >
                12
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
