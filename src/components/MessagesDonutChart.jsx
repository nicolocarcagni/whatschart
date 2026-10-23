import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

/**
 * Dedicated color palette for participants / chat users.
 * High-contrast neon hues tailored for dark surfaces (#09090b, #121212)
 * completely distinct from media type indicators (audio, video, stickers, images).
 */
const PARTICIPANT_PALETTE = [
  '#818cf8', // Electric Indigo
  '#f59e0b', // Sunset Amber
  '#f472b6', // Neon Fuchsia
  '#2dd4bf', // Luminous Teal
  '#a78bfa', // Lavender Violet
  '#fb923c', // Warm Tangerine
  '#60a5fa', // Soft Blue
  '#a3e635', // Cyber Lime
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
 * Custom dark glassmorphic tooltip for Donut chart.
 */
function DonutCustomTooltip({ active, payload, totalMessages }) {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];
  const count = entry.value ?? 0;
  const percent = totalMessages > 0 ? ((count / totalMessages) * 100).toFixed(1) : '0.0';
  const color = entry.payload?.fill || entry.color || '#818cf8';
  const name = entry.name || entry.payload?.name || '';

  return (
    <div className="bg-zinc-950/95 border border-zinc-800 text-zinc-100 p-3 rounded-xl shadow-2xl backdrop-blur-md font-mono text-xs space-y-1.5 min-w-[170px]">
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-1.5">
        <span className="w-2 h-2 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: color }} />
        <span className="text-white font-bold text-sm truncate max-w-[160px]">{name}</span>
      </div>
      <div className="flex items-center justify-between gap-4 pt-0.5">
        <span className="text-zinc-400">Messages:</span>
        <span className="text-white font-bold">{count.toLocaleString('en-US')}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-zinc-400">Share:</span>
        <span className="text-emerald-400 font-bold">{percent}%</span>
      </div>
    </div>
  );
}

/**
 * Custom Legend Renderer displaying username, percentage and absolute volume
 * formatted in standard layout (e.g. "nico: 52% (2,506)").
 */
function CustomDonutLegend({ payload, totalMessages }) {
  if (!payload || !payload.length) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 pt-3 px-2">
      {payload.map((entry, index) => {
        const item = entry.payload || {};
        const count = item.value ?? 0;
        const percent = totalMessages > 0 ? Math.round((count / totalMessages) * 100) : 0;
        const displayName = truncateLabel(entry.value || item.name || '', 14);

        return (
          <div
            key={`donut-legend-${entry.value || index}`}
            className="flex items-center gap-1.5 font-mono text-xs bg-zinc-900/60 border border-white/5 hover:border-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm transition-colors shadow-xs"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-zinc-300 font-medium">{displayName}:</span>
            <span className="text-white font-bold">{percent}%</span>
            <span className="text-zinc-400 font-normal">({count.toLocaleString('en-US')})</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * MessagesDonutChart Component
 * Visualizes messages sent per participant using a refined dark donut chart.
 */
export default function MessagesDonutChart({ data = [], totalMessages }) {
  // Aggregate total messages if not provided explicitly
  const computedTotal = useMemo(() => {
    if (typeof totalMessages === 'number' && totalMessages > 0) {
      return totalMessages;
    }
    return data.reduce((acc, curr) => acc + (curr.value || 0), 0);
  }, [data, totalMessages]);

  return (
    <div className="relative h-[340px] w-full select-none">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={3}
            cornerRadius={4}
            dataKey="value"
            stroke="#09090b"
            strokeWidth={2}
            isAnimationActive={true}
          >
            {data.map((entry, index) => (
              <Cell
                key={`donut-cell-${entry.name || index}`}
                fill={getParticipantColor(entry.name, index)}
              />
            ))}
          </Pie>

          <RechartsTooltip
            content={<DonutCustomTooltip totalMessages={computedTotal} />}
          />

          <Legend
            verticalAlign="bottom"
            content={<CustomDonutLegend totalMessages={computedTotal} />}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Donut Center Label (Aggregate KPI Summary) */}
      <div
        className="absolute pointer-events-none flex flex-col items-center justify-center text-center"
        style={{
          left: '50%',
          top: '45%',
          transform: 'translate(-50%, -50%)',
        }}
        aria-hidden="true"
      >
        <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight leading-none drop-shadow-md">
          {computedTotal.toLocaleString('en-US')}
        </span>
        <span className="text-[11px] font-mono text-zinc-400 font-medium uppercase tracking-wider mt-1">
          Total Messages
        </span>
      </div>
    </div>
  );
}
