import { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Sector,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

/**
 * Rich, modern multi-color palette for chat participants.
 * Vibrant yet refined hues tailored for dark surfaces, providing clear visual differentiation.
 */
const PARTICIPANT_PALETTE = [
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#38bdf8', // Sky Blue
  '#84cc16', // Lime
];

const OTHERS_COLOR = '#71717a'; // Zinc-500 neutral for aggregated group

/**
 * Resolves slice color ensuring 'Others'/'Altri' receives a neutral muted tone.
 */
function getParticipantColor(name, index) {
  if (name && (name.toLowerCase() === 'others' || name.toLowerCase() === 'altri')) {
    return OTHERS_COLOR;
  }
  return PARTICIPANT_PALETTE[index % PARTICIPANT_PALETTE.length];
}

/**
 * Truncates string appending ellipsis if exceeds maxLen.
 */
function truncateLabel(str, maxLen = 14) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

/**
 * Custom active sector renderer for smooth hover expansion.
 */
function renderActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#09090b"
        strokeWidth={2}
        cornerRadius={6}
      />
    </g>
  );
}

/**
 * Custom dark glassmorphic tooltip for Donut chart.
 */
function DonutCustomTooltip({ active, payload, totalMessages }) {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];
  const count = entry.value ?? 0;
  const percent = totalMessages > 0 ? ((count / totalMessages) * 100).toFixed(1) : '0.0';
  const color = entry.payload?.fill || entry.color || '#10b981';
  const name = entry.name || entry.payload?.name || '';

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 text-zinc-100 p-4 rounded-xl shadow-2xl backdrop-blur-md font-mono text-xs space-y-2 min-w-[180px]">
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-white font-semibold truncate max-w-[160px]">{name}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-zinc-400 font-normal">Messages:</span>
        <span className="text-white font-semibold">{count.toLocaleString('en-US')}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-zinc-400 font-normal">Share:</span>
        <span className="font-semibold" style={{ color }}>{percent}%</span>
      </div>
    </div>
  );
}

/**
 * MessagesDonutChart Component
 * Refined donut chart with rich participant colors, active sector highlighting,
 * interactive HTML legend link, and strictly concentric center KPI display.
 */
export default function MessagesDonutChart({ data = [], totalMessages }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const computedTotal = useMemo(() => {
    if (typeof totalMessages === 'number' && totalMessages > 0) {
      return totalMessages;
    }
    return data.reduce((acc, curr) => acc + (curr.value || 0), 0);
  }, [data, totalMessages]);

  const activeParticipant = activeIndex !== null && data[activeIndex] ? data[activeIndex] : null;

  if (!data || data.length === 0 || computedTotal === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center font-mono text-xs text-zinc-500">
        No message data available
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Donut Chart Container: Strictly centered coordinates without internal Recharts legend displacement */}
      <div className="relative h-64 w-full select-none">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={96}
              paddingAngle={2}
              cornerRadius={4}
              dataKey="value"
              stroke="#09090b"
              strokeWidth={1.5}
              activeIndex={activeIndex !== null ? activeIndex : undefined}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              isAnimationActive={true}
            >
              {data.map((entry, index) => {
                const isDimmed = activeIndex !== null && activeIndex !== index;
                return (
                  <Cell
                    key={`donut-cell-${entry.name || index}`}
                    fill={getParticipantColor(entry.name, index)}
                    opacity={isDimmed ? 0.35 : 1}
                    style={{ transition: 'opacity 0.2s ease-in-out' }}
                  />
                );
              })}
            </Pie>

            <RechartsTooltip
              content={<DonutCustomTooltip totalMessages={computedTotal} />}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Concentric Center KPI: Mathematically centered with Pie (50% / 50%) */}
        <div
          className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center transition-all duration-200"
          aria-hidden="true"
        >
          {activeParticipant ? (
            <>
              <span
                className="text-xs font-mono font-semibold max-w-[130px] truncate px-1"
                style={{ color: getParticipantColor(activeParticipant.name, activeIndex) }}
              >
                {activeParticipant.name}
              </span>
              <span className="text-2xl sm:text-3xl font-semibold font-mono text-white tracking-tight leading-none mt-1">
                {(activeParticipant.value || 0).toLocaleString('en-US')}
              </span>
              <span className="text-[11px] font-mono text-zinc-400 font-normal uppercase tracking-wider mt-1">
                {computedTotal > 0 ? ((activeParticipant.value / computedTotal) * 100).toFixed(1) : 0}% share
              </span>
            </>
          ) : (
            <>
              <span className="text-2xl sm:text-3xl font-semibold font-mono text-white tracking-tight leading-none drop-shadow-md">
                {computedTotal.toLocaleString('en-US')}
              </span>
              <span className="text-[11px] font-mono text-zinc-400 font-normal uppercase tracking-wider mt-1.5">
                Total Messages
              </span>
            </>
          )}
        </div>
      </div>

      {/* Interactive Legend in normal document flow: Never clips or shifts pie center regardless of participant count */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-4 px-2 w-full">
        {data.map((entry, index) => {
          const count = entry.value ?? 0;
          const percent = computedTotal > 0 ? Math.round((count / computedTotal) * 100) : 0;
          const color = getParticipantColor(entry.name, index);
          const isHovered = activeIndex === index;

          return (
            <div
              key={`donut-legend-${entry.name || index}`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm cursor-pointer transition-all duration-200 ${
                isHovered
                  ? 'bg-zinc-800 border-zinc-600 shadow-md scale-105'
                  : 'bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0 transition-transform duration-200"
                style={{ backgroundColor: color, transform: isHovered ? 'scale(1.3)' : 'scale(1)' }}
              />
              <span className={`font-normal truncate max-w-[120px] ${isHovered ? 'text-white font-semibold' : 'text-zinc-300'}`}>
                {truncateLabel(entry.name, 14)}:
              </span>
              <span className="text-white font-semibold">{percent}%</span>
              <span className="text-zinc-400 font-normal">({count.toLocaleString('en-US')})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
