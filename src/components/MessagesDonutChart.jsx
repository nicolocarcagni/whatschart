import { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Sector,
  Tooltip as RechartsTooltip,
  Legend,
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
 * Custom Interactive Legend Renderer.
 * Hovering any badge dynamically highlights that participant's slice in the donut chart.
 */
function CustomDonutLegend({ payload, totalMessages, activeIndex, onHoverIndex }) {
  if (!payload || !payload.length) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-4 px-2">
      {payload.map((entry, index) => {
        const item = entry.payload || {};
        const count = item.value ?? 0;
        const percent = totalMessages > 0 ? Math.round((count / totalMessages) * 100) : 0;
        const displayName = truncateLabel(entry.value || item.name || '', 14);
        const isHovered = activeIndex === index;

        return (
          <div
            key={`donut-legend-${entry.value || index}`}
            onMouseEnter={() => onHoverIndex(index)}
            onMouseLeave={() => onHoverIndex(null)}
            className={`flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-lg backdrop-blur-sm cursor-pointer transition-all duration-200 ${
              isHovered
                ? 'bg-zinc-800 border-zinc-600 shadow-md scale-105'
                : 'bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0 transition-transform duration-200"
              style={{ backgroundColor: entry.color, transform: isHovered ? 'scale(1.3)' : 'scale(1)' }}
            />
            <span className={`font-normal ${isHovered ? 'text-white font-semibold' : 'text-zinc-300'}`}>
              {displayName}:
            </span>
            <span className="text-white font-semibold">{percent}%</span>
            <span className="text-zinc-400 font-normal">({count.toLocaleString('en-US')})</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * MessagesDonutChart Component
 * Refined donut chart with rich participant colors, active sector highlighting,
 * interactive legend link, and reactive center KPI display.
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

  return (
    <div className="relative h-80 w-full select-none">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius="60%"
            outerRadius="80%"
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

          <Legend
            verticalAlign="bottom"
            content={
              <CustomDonutLegend
                totalMessages={computedTotal}
                activeIndex={activeIndex}
                onHoverIndex={setActiveIndex}
              />
            }
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Donut Center Label: Dynamically displays hovered participant or overall total */}
      <div
        className="absolute pointer-events-none flex flex-col items-center justify-center text-center transition-all duration-200"
        style={{
          left: '50%',
          top: '45%',
          transform: 'translate(-50%, -50%)',
        }}
        aria-hidden="true"
      >
        {activeParticipant ? (
          <>
            <span
              className="text-xs font-mono font-semibold max-w-[130px] truncate"
              style={{ color: getParticipantColor(activeParticipant.name, activeIndex) }}
            >
              {activeParticipant.name}
            </span>
            <span className="text-2xl sm:text-3xl font-semibold font-mono text-white tracking-tight leading-none mt-2">
              {(activeParticipant.value || 0).toLocaleString('en-US')}
            </span>
            <span className="text-xs font-mono text-zinc-400 font-normal uppercase tracking-wider mt-2">
              {computedTotal > 0 ? ((activeParticipant.value / computedTotal) * 100).toFixed(1) : 0}% share
            </span>
          </>
        ) : (
          <>
            <span className="text-2xl sm:text-3xl font-semibold font-mono text-white tracking-tight leading-none drop-shadow-md">
              {computedTotal.toLocaleString('en-US')}
            </span>
            <span className="text-xs font-mono text-zinc-400 font-normal uppercase tracking-wider mt-2">
              Total Messages
            </span>
          </>
        )}
      </div>
    </div>
  );
}
