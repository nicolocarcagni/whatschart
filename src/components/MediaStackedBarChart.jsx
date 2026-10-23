import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';

/**
 * Semantic, distinct color scheme for media categories.
 * Crafted with high contrast against dark (#09090b / #121212) backgrounds
 * and completely segregated from the participant entity palette.
 */
const MEDIA_CONFIG = [
  { key: 'Image', name: 'Images', color: '#38bdf8' }, // Sky Blue / Neon Cyan
  { key: 'Video', name: 'Videos', color: '#f43f5e' },  // Vivid Coral / Rose
  { key: 'Audio', name: 'Audio', color: '#10b981' },   // Emerald (WhatsApp voice notes)
  { key: 'Sticker', name: 'Stickers', color: '#a855f7' } // Neon Purple
];

/**
 * Truncates text exceeding maxLen with an ellipsis.
 */
function truncateLabel(str, maxLen = 14) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

/**
 * Monospace X-Axis tick renderer with proper dark contrast.
 */
function TruncatedAxisTick({ x, y, payload }) {
  return (
    <text
      x={x}
      y={y}
      dy={14}
      textAnchor="middle"
      fill="#a1a1aa"
      fontSize={11}
      fontFamily="var(--font-mono)"
    >
      {truncateLabel(payload.value, 12)}
    </text>
  );
}

/**
 * Custom Label component rendered on top of each stacked bar,
 * displaying the aggregate media count for that participant.
 */
function CustomBarTotalLabel(props) {
  const { x, y, width, value } = props;
  if (!value || value === 0) return null;

  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#f4f4f5"
      textAnchor="middle"
      fontSize={11}
      fontFamily="var(--font-mono)"
      fontWeight={600}
    >
      {value.toLocaleString('en-US')}
    </text>
  );
}

/**
 * Custom Tooltip for Stacked BarChart:
 * Displays participant name, aggregated total media,
 * and a rich breakdown list with colored indicators, counts, and percentages.
 */
function MediaCustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const participantName = label || data.name || 'Participant';
  const total = (data.Image || 0) + (data.Video || 0) + (data.Audio || 0) + (data.Sticker || 0);

  return (
    <div className="bg-zinc-950/95 border border-zinc-800 text-zinc-100 p-3.5 rounded-xl shadow-2xl backdrop-blur-md font-mono text-xs min-w-[220px] space-y-2.5">
      {/* Header: Participant name and aggregate total */}
      <div className="border-b border-zinc-800/80 pb-2">
        <p className="text-white font-bold text-sm tracking-tight truncate max-w-[200px]">
          {participantName}
        </p>
        <div className="text-zinc-400 text-[11px] mt-1 flex items-center justify-between">
          <span>Total media sent:</span>
          <span className="text-white font-bold bg-zinc-900 border border-zinc-800/80 px-1.5 py-0.5 rounded text-xs shadow-xs">
            {total.toLocaleString('en-US')}
          </span>
        </div>
      </div>

      {/* Itemized media category rows */}
      <div className="space-y-1.5 pt-0.5">
        {MEDIA_CONFIG.map((category) => {
          const count = data[category.key] || 0;
          const percent = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
          const isZero = count === 0;

          return (
            <div
              key={category.key}
              className={`flex items-center justify-between gap-3 text-xs transition-opacity ${
                isZero ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-zinc-300 font-medium">{category.name}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="text-white font-semibold">{count.toLocaleString('en-US')}</span>
                <span className="text-zinc-500 text-[10px]">({percent}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Custom Legend Renderer to guarantee visual synchronization:
 * Items are read in the exact order the stack grows from bottom to top:
 * Images (base) -> Videos -> Audio -> Stickers (top).
 */
function CustomMediaLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-3 px-2">
      {MEDIA_CONFIG.map((item) => (
        <div
          key={`media-legend-${item.key}`}
          className="flex items-center gap-1.5 font-mono text-xs text-zinc-300 bg-zinc-900/40 border border-white/5 px-2.5 py-1 rounded-lg backdrop-blur-sm shadow-xs"
        >
          <span
            className="w-2 h-2 rounded-full shrink-0 shadow-xs"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-zinc-200 font-medium">{item.name}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * MediaStackedBarChart Component
 * Renders an optimized stacked bar chart showing media distribution per user.
 */
export default function MediaStackedBarChart({ data = [] }) {
  // Pre-calculate aggregated total on each data record for LabelList display
  const enrichedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      total: (item.Image || 0) + (item.Video || 0) + (item.Audio || 0) + (item.Sticker || 0)
    }));
  }, [data]);

  return (
    <div className="h-[340px] w-full select-none">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={enrichedData}
          margin={{ top: 25, right: 20, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="2 2" stroke="#18181b" vertical={false} />

          <XAxis
            dataKey="name"
            stroke="#71717a"
            fontSize={11}
            fontFamily="var(--font-mono)"
            tickLine={false}
            axisLine={false}
            tick={<TruncatedAxisTick />}
          />

          <YAxis
            stroke="#71717a"
            fontSize={11}
            fontFamily="var(--font-mono)"
            tickLine={false}
            axisLine={false}
            domain={[0, (dataMax) => Math.max(5, Math.ceil(dataMax * 1.15))]}
          />

          <RechartsTooltip content={<MediaCustomTooltip />} />

          {/* Legend aligned with stack order from bottom to top */}
          <Legend
            verticalAlign="bottom"
            content={<CustomMediaLegend />}
          />

          {/* Stack segment 1: Images (base of stack, square corners) */}
          <Bar
            dataKey="Image"
            name="Images"
            stackId="mediaStack"
            fill="#38bdf8"
            radius={[0, 0, 0, 0]}
            isAnimationActive={true}
          />

          {/* Stack segment 2: Videos (intermediate, square corners) */}
          <Bar
            dataKey="Video"
            name="Videos"
            stackId="mediaStack"
            fill="#f43f5e"
            radius={[0, 0, 0, 0]}
            isAnimationActive={true}
          />

          {/* Stack segment 3: Audio (intermediate, square corners) */}
          <Bar
            dataKey="Audio"
            name="Audio"
            stackId="mediaStack"
            fill="#10b981"
            radius={[0, 0, 0, 0]}
            isAnimationActive={true}
          />

          {/* Stack segment 4: Stickers (top of stack, rounded top corners & aggregate label) */}
          <Bar
            dataKey="Sticker"
            name="Stickers"
            stackId="mediaStack"
            fill="#a855f7"
            radius={[6, 6, 0, 0]}
            isAnimationActive={true}
          >
            <LabelList
              dataKey="total"
              position="top"
              content={<CustomBarTotalLabel />}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
