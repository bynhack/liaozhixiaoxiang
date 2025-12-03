'use client';

import { useState } from 'react';
import { Slide } from '@/types';

interface SlideListProps {
  slides: Slide[];
  currentSlide: number;
  onSelect: (index: number) => void;
  onUpdate: (index: number, slide: Partial<Slide>) => void;
  onDelete: (index: number) => void;
}

export default function SlideList({
  slides,
  currentSlide,
  onSelect,
  onUpdate,
  onDelete,
}: SlideListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  if (slides.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
        暂无幻灯片，点击"添加幻灯片"开始创建
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          onClick={() => onSelect(index)}
          style={{
            border: '2px solid',
            borderColor: currentSlide === index ? '#1890ff' : '#e8e8e8',
            borderRadius: '8px',
            padding: '12px',
            cursor: 'pointer',
            background: currentSlide === index ? '#e6f7ff' : '#fff',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '120px',
                height: '80px',
                background: '#f5f5f5',
                borderRadius: '4px',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {slide.url ? (
                slide.type === 'image' ? (
                  <img
                    src={slide.url}
                    alt={`Slide ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#000',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  >
                    视频
                  </div>
                )
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '12px',
                  }}
                >
                  暂无预览
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#999', marginRight: '8px' }}>
                  类型:
                </span>
                <select
                  value={slide.type}
                  onChange={(e) =>
                    onUpdate(index, { type: e.target.value as 'image' | 'video' })
                  }
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  <option value="image">图片</option>
                  <option value="video">视频</option>
                </select>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <input
                  type="text"
                  value={slide.url}
                  onChange={(e) => onUpdate(index, { url: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="输入图片或视频 URL"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                />
              </div>

              <div style={{ fontSize: '12px', color: '#666' }}>
                幻灯片 {index + 1}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(index);
              }}
              style={{
                padding: '4px 8px',
                background: '#ff4d4f',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              删除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

