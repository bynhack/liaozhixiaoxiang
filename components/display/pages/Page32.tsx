'use client';

import { useEffect, useState, useRef } from 'react';

export default function Page32() {
  const [teams, setTeams] = useState([
    { id: 1, score: 0, trunkLength: 40 },
    { id: 2, score: 0, trunkLength: 40 },
    { id: 3, score: 0, trunkLength: 40 },
  ]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const celebrationRef = useRef<HTMLDivElement>(null);

  // 创建音效
  const playClickSound = () => {
    if (!soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      console.log('音效播放失败:', e);
    }
  };

  const playCelebrationSound = () => {
    if (!soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 创建欢快的音效
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.3); // C6

      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('庆祝音效播放失败:', e);
    }
  };

  // 奖励小组函数
  const rewardTeam = (teamId: number) => {
    setTeams((prevTeams) => {
      const newTeams = prevTeams.map((team) => {
        if (team.id === teamId) {
          let newTrunkLength = team.trunkLength + 20;
          if (newTrunkLength > 160) {
            newTrunkLength = 160;
          }
          return {
            ...team,
            score: team.score + 1,
            trunkLength: newTrunkLength,
          };
        }
        return team;
      });
      return newTeams;
    });

    showCelebration();
    playCelebrationSound();
  };

  // 重置所有小组
  const resetAll = () => {
    setTeams([
      { id: 1, score: 0, trunkLength: 40 },
      { id: 2, score: 0, trunkLength: 40 },
      { id: 3, score: 0, trunkLength: 40 },
    ]);
    playClickSound();
  };

  // 显示庆祝效果
  const showCelebration = () => {
    if (!celebrationRef.current) return;

    celebrationRef.current.style.display = 'block';

    // 创建一些庆祝元素
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        createCelebrationElement();
      }, i * 100);
    }

    // 3秒后隐藏庆祝效果
    setTimeout(() => {
      if (celebrationRef.current) {
        celebrationRef.current.style.display = 'none';
        celebrationRef.current.innerHTML = '';
      }
    }, 3000);
  };

  // 创建庆祝元素
  const createCelebrationElement = () => {
    if (!celebrationRef.current) return;

    const types = ['🌟', '⭐', '🎉', '✨', '🥳'];
    const element = document.createElement('div');
    element.textContent = types[Math.floor(Math.random() * types.length)];
    element.style.position = 'fixed';
    element.style.fontSize = `${Math.random() * 30 + 20}px`;
    element.style.left = `${Math.random() * 100}vw`;
    element.style.top = `${Math.random() * 100}vh`;
    element.style.opacity = '1';
    element.style.transition = 'all 1s';

    celebrationRef.current.appendChild(element);

    // 动画效果
    setTimeout(() => {
      element.style.transform = 'translateY(-100px)';
      element.style.opacity = '0';
    }, 10);

    // 移除元素
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }, 1100);
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
        width: '100vw',
        height: '56.25vw',
        maxHeight: '100vh',
        maxWidth: '177.78vh',
        margin: '0 auto',
        padding: '1.5%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
        fontFamily: "'Comic Sans MS', '微软雅黑', sans-serif",
      }}
    >
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .header {
          text-align: center;
          margin-bottom: 1.5%;
          width: 100%;
        }

        h1 {
          color: #ff6b6b;
          font-size: 1.8vw;
          text-shadow: 2px 2px 0 #fff;
          margin-bottom: 0.5%;
        }

        .subtitle {
          color: #5a67d8;
          font-size: 1vw;
          margin-bottom: 1%;
        }

        .container {
          display: flex;
          justify-content: center;
          gap: 20px;
          width: 95%;
          height: 70%;
          flex-grow: 1;
        }

        .team {
          background-color: white;
          border-radius: 18px;
          padding: 15px;
          width: 280px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          text-align: center;
          transition: transform 0.3s;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .team:hover {
          transform: translateY(-5px);
        }

        .team-1 {
          border-top: 8px solid #ff6b6b;
        }

        .team-2 {
          border-top: 8px solid #4ecdc4;
        }

        .team-3 {
          border-top: 8px solid #ffd166;
        }

        .team-name {
          font-size: 1.4rem;
          margin-bottom: 12px;
          color: #2d3748;
        }

        .elephant-container {
          position: relative;
          height: 65%;
          margin: 15px 0;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          flex-grow: 1;
        }

        .elephant {
          position: relative;
          width: 180px;
          height: 200px;
        }

        .elephant-head {
          position: absolute;
          width: 140px;
          height: 120px;
          background: linear-gradient(to bottom, #a0aec0, #8a9cb0);
          border-radius: 60% 60% 50% 50%;
          top: 20px;
          left: 20px;
          z-index: 3;
          box-shadow: inset -5px -5px 10px rgba(0, 0, 0, 0.1),
            inset 5px 5px 10px rgba(255, 255, 255, 0.5);
        }

        .elephant-ear {
          position: absolute;
          width: 60px;
          height: 60px;
          background: linear-gradient(to bottom, #a0aec0, #8a9cb0);
          border-radius: 50%;
          z-index: 2;
          box-shadow: inset -5px -5px 10px rgba(0, 0, 0, 0.1),
            inset 5px 5px 10px rgba(255, 255, 255, 0.5);
        }

        .ear-left {
          top: 15px;
          left: 0;
        }

        .ear-right {
          top: 15px;
          right: 0;
        }

        .ear-inner {
          position: absolute;
          width: 40px;
          height: 40px;
          background: linear-gradient(to bottom, #d1d9e6, #b8c4d9);
          border-radius: 50%;
          top: 10px;
          left: 10px;
        }

        .elephant-eye {
          position: absolute;
          width: 20px;
          height: 20px;
          background-color: #2d3748;
          border-radius: 50%;
          z-index: 4;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }

        .eye-left {
          top: 55px;
          left: 50px;
        }

        .eye-right {
          top: 55px;
          right: 50px;
        }

        .eye-highlight {
          position: absolute;
          width: 6px;
          height: 6px;
          background-color: white;
          border-radius: 50%;
          top: 4px;
          left: 5px;
        }

        .elephant-trunk-container {
          position: absolute;
          top: 125px;
          left: 50%;
          transform: translateX(-50%);
          height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1;
        }

        .elephant-trunk {
          width: 45px;
          background: linear-gradient(to bottom, #a0aec0, #8a9cb0);
          border-radius: 22px 22px 12px 12px;
          transition: height 0.5s ease-out;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: inset -3px -3px 5px rgba(0, 0, 0, 0.1),
            inset 3px 3px 5px rgba(255, 255, 255, 0.5);
        }

        .trunk-line {
          width: 30px;
          height: 6px;
          background-color: #8a9cb0;
          border-radius: 3px;
          margin-top: 8px;
        }

        .trunk-end {
          width: 40px;
          height: 22px;
          background: linear-gradient(to bottom, #a0aec0, #8a9cb0);
          border-radius: 50%;
          position: absolute;
          bottom: -11px;
          box-shadow: inset -3px -3px 5px rgba(0, 0, 0, 0.1),
            inset 3px 3px 5px rgba(255, 255, 255, 0.5);
        }

        .elephant-mouth {
          position: absolute;
          width: 40px;
          height: 15px;
          border-bottom: 4px solid #2d3748;
          border-radius: 0 0 20px 20px;
          bottom: 25px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 4;
        }

        .score-container {
          margin: 12px 0;
        }

        .score-label {
          font-size: 1rem;
          color: #4a5568;
          margin-bottom: 4px;
        }

        .score {
          font-size: 2rem;
          font-weight: bold;
          color: #2d3748;
        }

        .reward-btn {
          background: linear-gradient(to right, #ff6b6b, #ff8e8e);
          border: none;
          border-radius: 50px;
          color: white;
          font-size: 1.1rem;
          padding: 10px 25px;
          cursor: pointer;
          box-shadow: 0 4px 0 #e53e3e;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .reward-btn:active {
          transform: translateY(4px);
          box-shadow: 0 0 0 #e53e3e;
        }

        .reset-btn {
          background: linear-gradient(to right, #4a5568, #718096);
          border: none;
          border-radius: 50px;
          color: white;
          font-size: 0.95rem;
          padding: 8px 20px;
          cursor: pointer;
          box-shadow: 0 4px 0 #2d3748;
          transition: all 0.2s;
          margin-top: 15px;
        }

        .reset-btn:active {
          transform: translateY(4px);
          box-shadow: 0 0 0 #2d3748;
        }

        .celebration {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 100;
          display: none;
        }

        .sound-control {
          position: fixed;
          bottom: 15px;
          right: 15px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          z-index: 10;
        }

        .sound-control svg {
          width: 24px;
          height: 24px;
        }
      `}</style>

      <div className="header">
        <h1>比比哪组的鼻子长</h1>
        <p className="subtitle">华老师的音乐课堂</p>
      </div>

      <div className="container">
        {teams.map((team) => (
          <div key={team.id} className={`team team-${team.id}`}>
            <h2 className="team-name">第{team.id === 1 ? '一' : team.id === 2 ? '二' : '三'}小组</h2>
            <div className="elephant-container">
              <div className="elephant">
                <div className="elephant-ear ear-left">
                  <div className="ear-inner"></div>
                </div>
                <div className="elephant-ear ear-right">
                  <div className="ear-inner"></div>
                </div>
                <div className="elephant-head"></div>
                <div className="elephant-eye eye-left">
                  <div className="eye-highlight"></div>
                </div>
                <div className="elephant-eye eye-right">
                  <div className="eye-highlight"></div>
                </div>
                <div className="elephant-mouth"></div>
                <div className="elephant-trunk-container">
                  <div
                    className="elephant-trunk"
                    style={{ height: `${team.trunkLength}px` }}
                  >
                    <div className="trunk-line"></div>
                    <div className="trunk-end"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="score-container">
              <div className="score-label">小组积分</div>
              <div className="score">{team.score}</div>
            </div>
            <button
              className="reward-btn"
              onClick={() => {
                rewardTeam(team.id);
                playClickSound();
              }}
            >
              奖励！
            </button>
          </div>
        ))}
      </div>

      <button className="reset-btn" onClick={resetAll}>
        全部重置
      </button>

      <div className="celebration" ref={celebrationRef}></div>

      <div
        className="sound-control"
        onClick={() => {
          setSoundEnabled(!soundEnabled);
          playClickSound();
        }}
      >
        {soundEnabled ? (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M11 5L6 9H2V15H6L11 19V5Z"
              stroke="#4a5568"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 12C17.004 13.3308 16.4774 14.6024 15.54 15.54"
              stroke="#4a5568"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M11 5L6 9H2V15H6L11 19V5Z"
              stroke="#4a5568"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M23 9L17 15"
              stroke="#4a5568"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 9L23 15"
              stroke="#4a5568"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
}

