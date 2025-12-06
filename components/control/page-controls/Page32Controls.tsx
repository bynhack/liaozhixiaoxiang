'use client';

import { useControlSocket } from '@/hooks/useControlSocket';

export default function Page32Controls() {
  const { setPageControl } = useControlSocket();

  // 给小组加分
  const handleRewardTeam = (teamId: number) => {
    setPageControl(32, { type: 'reward-team', value: teamId });
  };

  // 全部重置
  const handleResetAll = () => {
    setPageControl(32, { type: 'reset-all' });
  };

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <h3
        style={{
          margin: '0 0 12px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#fff',
        }}
      >
        激励控制
      </h3>

      {/* 小组加分按钮 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '8px',
          }}
        >
          小组加分
        </div>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => handleRewardTeam(1)}
            style={{
              flex: '1',
              minWidth: '100px',
              padding: '12px 20px',
              background: 'linear-gradient(to right, #ff6b6b, #ff8e8e)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 0 #e53e3e',
              transition: 'all 0.2s',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(4px)';
              e.currentTarget.style.boxShadow = '0 0 0 #e53e3e';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 0 #e53e3e';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 0 #e53e3e';
            }}
          >
            第一小组
          </button>
          <button
            onClick={() => handleRewardTeam(2)}
            style={{
              flex: '1',
              minWidth: '100px',
              padding: '12px 20px',
              background: 'linear-gradient(to right, #4ecdc4, #6ee7e0)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 0 #2d9d94',
              transition: 'all 0.2s',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(4px)';
              e.currentTarget.style.boxShadow = '0 0 0 #2d9d94';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 0 #2d9d94';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 0 #2d9d94';
            }}
          >
            第二小组
          </button>
          <button
            onClick={() => handleRewardTeam(3)}
            style={{
              flex: '1',
              minWidth: '100px',
              padding: '12px 20px',
              background: 'linear-gradient(to right, #ffd166, #ffe085)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 0 #e6b84f',
              transition: 'all 0.2s',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(4px)';
              e.currentTarget.style.boxShadow = '0 0 0 #e6b84f';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 0 #e6b84f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 0 #e6b84f';
            }}
          >
            第三小组
          </button>
        </div>
      </div>

      {/* 全部重置按钮 */}
      <div
        style={{
          marginTop: '8px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <button
          onClick={handleResetAll}
          style={{
            width: '100%',
            padding: '12px 20px',
            background: 'linear-gradient(to right, #4a5568, #718096)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 0 #2d3748',
            transition: 'all 0.2s',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(4px)';
            e.currentTarget.style.boxShadow = '0 0 0 #2d3748';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 0 #2d3748';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 0 #2d3748';
          }}
        >
          全部重置
        </button>
      </div>
    </div>
  );
}
