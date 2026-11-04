import { useState, useMemo } from 'react';
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
 * Rich, semantic color scheme for media categories:
 * - Audio: Emerald WhatsApp green
 * - Images: Vivid Sky Blue
 * - Videos: Energetic Rose Coral
 * - Stickers: Playful Violet
 */
const MEDIA_CONFIG = [
  { key: 'Audio', name: 'Audio', color: '#10b981' },
  { key: 'Image', name: 'Images', color: '#0ea5e9' },
  { key: 'Video', name: 'Videos', color: '#f43f5e' },
  { key: 'Sticker', name: 'Stickers', color: '#a855f7' },
  { key: 'Media', name: 'Media', color: '#f59e0b' }
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
      dy={16}
      textAnchor="middle"
      fill="#71717a"
      fontSize={11}
      fontFamily="var(--font-mono)"
    >
      {truncateLabel(payload.value, 12)}
    </text>
  );
}

/**
 * Custom Label component rendered on top of each stacked bar.
 */
function CustomBarTotalLabel(props) {
  const { x, y, width, value } = props;
  if (!value || value === 0) return null;

  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#a1a1aa"
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
 * Custom Tooltip for Stacked BarChart with proportional visual progress bars.
 */
function MediaCustomTooltip({ active, payload, label, visibleKeys }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const participantName = label || data.name || 'Participant';
  const total = MEDIA_CONFIG.reduce((acc, cat) => acc + (data[cat.key] || 0), 0);

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 text-zinc-100 p-4 rounded-xl shadow-2xl backdrop-blur-md font-mono text-xs min-w-[240px] space-y-4">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-2">
        <p className="text-white font-semibold text-sm tracking-tight truncate max-w-[210px]">
          {participantName}
        </p>
        <div className="text-zinc-400 text-xs mt-2 flex items-center justify-between font-normal">
          <span>Total media sent:</span>
          <span className="text-emerald-400 font-semibold bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-lg text-xs">
            {total.toLocaleString('en-US')}
          </span>
        </div>
      </div>

      {/* Itemized media category rows with mini progress bars */}
      <div className="space-y-2">
        {MEDIA_CONFIG.map((category) => {
          const isVisible = visibleKeys.has(category.key);
          const count = data[category.key] || 0;
          const percent = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
          const isZero = count === 0;

          if (!isVisible) return null;

          return (
            <div
              key={category.key}
              className={`space-y-1 transition-opacity ${isZero ? 'opacity-35' : 'opacity-100'}`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-zinc-300 font-normal">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{count.toLocaleString('en-US')}</span>
                  <span className="text-zinc-500 font-normal text-xs">({percent}%)</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(isZero ? 0 : 3, parseFloat(percent))}%`, backgroundColor: category.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Custom Interactive Legend Renderer.
 * Supports toggling categories on click and segment dimming on hover.
 */
function CustomMediaLegend({ hoveredKey, onHoverKey, visibleKeys, onToggleKey }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 pt-4 px-2">
      {MEDIA_CONFIG.map((item) => {
        const isVisible = visibleKeys.has(item.key);
        const isHovered = hoveredKey === item.key;

        return (
          <button
            key={`media-legend-${item.key}`}
            type="button"
            onClick={() => onToggleKey(item.key)}
            onMouseEnter={() => onHoverKey(item.key)}
            onMouseLeave={() => onHoverKey(null)}
            className={`flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-lg backdrop-blur-sm cursor-pointer transition-all duration-200 select-none ${
              !isVisible
                ? 'opacity-40 bg-zinc-950/40 border border-zinc-900 text-zinc-600 line-through'
                : isHovered
                ? 'bg-zinc-800 border-zinc-600 shadow-md scale-105 text-white'
                : 'bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 text-zinc-300'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0 transition-transform duration-200"
              style={{
                backgroundColor: item.color,
                transform: isHovered ? 'scale(1.3)' : 'scale(1)'
              }}
            />
            <span className={isHovered ? 'font-semibold' : 'font-normal'}>{item.name}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * MediaStackedBarChart Component
 * Visualizes media distribution with interactive category filtering,
 * hover highlighting, and rich progress bars in tooltips.
 */
export default function MediaStackedBarChart({ data = [] }) {
  const [hoveredKey, setHoveredKey] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState(() => new Set(['Audio', 'Image', 'Video', 'Sticker', 'Media']));

  const handleToggleKey = (key) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        // Prevent deselecting all categories
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const enrichedData = useMemo(() => {
    return data.map((item) => {
      const total = MEDIA_CONFIG.reduce((acc, cat) => {
        return acc + (visibleKeys.has(cat.key) ? (item[cat.key] || 0) : 0);
      }, 0);
      return {
        ...item,
        total
      };
    });
  }, [data, visibleKeys]);

  const activeKeys = MEDIA_CONFIG.map((c) => c.key).filter((k) => visibleKeys.has(k));
  const topKey = activeKeys[activeKeys.length - 1];

  return (
    <div className="h-80 w-full select-none">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={enrichedData}
          margin={{ top: 24, right: 16, left: -24, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.4} vertical={false} />

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

          <RechartsTooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.04)', rx: 6, ry: 6 }}
            content={<MediaCustomTooltip visibleKeys={visibleKeys} />}
          />

          <Legend
            verticalAlign="bottom"
            content={
              <CustomMediaLegend
                hoveredKey={hoveredKey}
                onHoverKey={setHoveredKey}
                visibleKeys={visibleKeys}
                onToggleKey={handleToggleKey}
              />
            }
          />

          {/* Segment: Audio */}
          {visibleKeys.has('Audio') && (
            <Bar
              dataKey="Audio"
              name="Audio"
              stackId="mediaStack"
              fill="#10b981"
              opacity={!hoveredKey || hoveredKey === 'Audio' ? 1 : 0.3}
              radius={topKey === 'Audio' ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              isAnimationActive={true}
            >
              {topKey === 'Audio' && (
                <LabelList
                  dataKey="total"
                  position="top"
                  content={<CustomBarTotalLabel />}
                />
              )}
            </Bar>
          )}

          {/* Segment: Images */}
          {visibleKeys.has('Image') && (
            <Bar
              dataKey="Image"
              name="Images"
              stackId="mediaStack"
              fill="#0ea5e9"
              opacity={!hoveredKey || hoveredKey === 'Image' ? 1 : 0.3}
              radius={topKey === 'Image' ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              isAnimationActive={true}
            >
              {topKey === 'Image' && (
                <LabelList
                  dataKey="total"
                  position="top"
                  content={<CustomBarTotalLabel />}
                />
              )}
            </Bar>
          )}

          {/* Segment: Videos */}
          {visibleKeys.has('Video') && (
            <Bar
              dataKey="Video"
              name="Videos"
              stackId="mediaStack"
              fill="#f43f5e"
              opacity={!hoveredKey || hoveredKey === 'Video' ? 1 : 0.3}
              radius={topKey === 'Video' ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              isAnimationActive={true}
            >
              {topKey === 'Video' && (
                <LabelList
                  dataKey="total"
                  position="top"
                  content={<CustomBarTotalLabel />}
                />
              )}
            </Bar>
          )}

          {/* Segment: Stickers */}
          {visibleKeys.has('Sticker') && (
            <Bar
              dataKey="Sticker"
              name="Stickers"
              stackId="mediaStack"
              fill="#a855f7"
              opacity={!hoveredKey || hoveredKey === 'Sticker' ? 1 : 0.3}
              radius={topKey === 'Sticker' ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              isAnimationActive={true}
            >
              {topKey === 'Sticker' && (
                <LabelList
                  dataKey="total"
                  position="top"
                  content={<CustomBarTotalLabel />}
                />
              )}
            </Bar>
          )}

          {/* Segment: Media */}
          {visibleKeys.has('Media') && (
            <Bar
              dataKey="Media"
              name="Media"
              stackId="mediaStack"
              fill="#f59e0b"
              opacity={!hoveredKey || hoveredKey === 'Media' ? 1 : 0.3}
              radius={topKey === 'Media' ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              isAnimationActive={true}
            >
              {topKey === 'Media' && (
                <LabelList
                  dataKey="total"
                  position="top"
                  content={<CustomBarTotalLabel />}
                />
              )}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
