import React from 'react';

interface VippsQRCodeProps {
  value: string;
  size?: number;
  vippsNumber?: string;
  amount?: number;
  title?: string;
}

// Generates a deterministic visual QR-style pattern based on input string
export const VippsQRCode: React.FC<VippsQRCodeProps> = ({
  value,
  size = 200,
  vippsNumber = '614920',
  amount,
  title
}) => {
  // Deterministic hash to generate crisp, QR matrix blocks
  const gridSize = 25;
  const hashVal = value.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 7919);

  const isDark = (row: number, col: number) => {
    // 3 Corner Finder Patterns (standard QR markers)
    // Top-left
    if (row < 7 && col < 7) {
      if (row === 0 || row === 6 || col === 0 || col === 6) return true;
      if (row >= 2 && row <= 4 && col >= 2 && col <= 4) return true;
      return false;
    }
    // Top-right
    if (row < 7 && col >= gridSize - 7) {
      const c = col - (gridSize - 7);
      if (row === 0 || row === 6 || c === 0 || c === 6) return true;
      if (row >= 2 && row <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    // Bottom-left
    if (row >= gridSize - 7 && col < 7) {
      const r = row - (gridSize - 7);
      if (r === 0 || r === 6 || col === 0 || col === 6) return true;
      if (r >= 2 && r <= 4 && col >= 2 && col <= 4) return true;
      return false;
    }

    // Center logo cutout placeholder
    if (row >= 10 && row <= 14 && col >= 10 && col <= 14) {
      return false;
    }

    // Timing lines
    if (row === 6 || col === 6) {
      return (row + col) % 2 === 0;
    }

    // Pseudo-random pseudo-QR data matrix
    const pseudo = (row * 37 + col * 43 + hashVal) % 100;
    return pseudo % 2 === 0 || pseudo % 5 === 0;
  };

  const cellSize = size / gridSize;

  return (
    <div className="flex flex-col items-center bg-white p-5 rounded-2xl shadow-sm border border-stone-200 inline-block text-center">
      {/* Vipps Brand Badge */}
      <div className="flex items-center gap-2 mb-3 px-3 py-1 bg-[#ff5b24]/10 rounded-full text-[#ff5b24] font-semibold text-xs tracking-wider uppercase">
        <span className="w-2 h-2 rounded-full bg-[#ff5b24] animate-pulse"></span>
        Vipps QR-Betaling
      </div>

      <div className="relative p-2 bg-white rounded-xl border-2 border-stone-100 shadow-inner">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="mx-auto select-none"
        >
          {/* Background */}
          <rect width={size} height={size} fill="#ffffff" rx={8} />

          {/* Matrix Cells */}
          {Array.from({ length: gridSize }).map((_, r) =>
            Array.from({ length: gridSize }).map((_, c) => {
              if (!isDark(r, c)) return null;
              return (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize + 0.5}
                  y={r * cellSize + 0.5}
                  width={cellSize - 1}
                  height={cellSize - 1}
                  rx={cellSize > 8 ? 1.5 : 0.8}
                  fill="#1c1917"
                />
              );
            })
          )}

          {/* Vipps Center Emblem */}
          <circle cx={size / 2} cy={size / 2} r={size * 0.13} fill="#ffffff" />
          <circle cx={size / 2} cy={size / 2} r={size * 0.11} fill="#ff5b24" />
          <text
            x={size / 2}
            y={size / 2 + 4}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={size * 0.08}
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            v:
          </text>
        </svg>
      </div>

      <div className="mt-3 text-stone-800 font-mono text-sm font-bold tracking-wider">
        Vipps #<span className="text-[#ff5b24] font-extrabold">{vippsNumber}</span>
      </div>

      {amount !== undefined && (
        <div className="text-stone-900 font-extrabold text-lg mt-0.5">
          {amount.toLocaleString('no-NO')} kr
        </div>
      )}

      {title && (
        <div className="text-stone-500 text-xs mt-1 max-w-[200px] truncate" title={title}>
          {title}
        </div>
      )}
    </div>
  );
};
