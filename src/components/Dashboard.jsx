import { useState, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  Users, MessageSquare, Calendar, TrendingUp, Trophy, Flame, Clock, Type, Smile, RotateCcw, Clock3
} from 'lucide-react';
import { computeAllAnalytics } from '../utils/analytics';
import MessagesDonutChart from './MessagesDonutChart';
import MediaStackedBarChart from './MediaStackedBarChart';

/**
 * Custom dark tooltip for Hourly Activity with peak marker and share percentage.
 */
function HourlyTooltip({ active, payload, label, peakHour, totalMessages }) {
  if (active && payload && payload.length) {
    const value = payload[0].value || 0;
    const isPeak = label === peakHour?.hour && value > 0;
    const percentOfDay = totalMessages > 0 ? ((value / totalMessages) * 100).toFixed(1) : '0.0';

    return (
      <div className="bg-zinc-900/90 border border-zinc-800 text-zinc-100 p-4 rounded-xl shadow-2xl backdrop-blur-md font-mono text-xs space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-2">
          <span className="text-zinc-400 font-normal">{label}:00 – {label}:59</span>
          {isPeak && (
            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-semibold">
              Peak
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-zinc-300 font-normal">Messages:</span>
          </span>
          <span className="text-white font-semibold">{value.toLocaleString('en-US')}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400 font-normal">Share of Day:</span>
          <span className="text-emerald-400 font-semibold">{percentOfDay}%</span>
        </div>
      </div>
    );
  }
  return null;
}

function getFormatLabel(format) {
  switch (format) {
    case 'modern_ios':
      return 'iOS Moderno';
    case 'modern_android':
      return 'Android Moderno';
    case 'legacy_android':
      return 'Android Legacy';
    default:
      return 'Standard';
  }
}

export default function Dashboard({ 
  messages, 
  onBack, 
  formatMode = 'auto', 
  detectedFormat = 'modern_ios', 
  isLegacy = false, 
  onModeChange 
}) {
  const [excludedSenders, setExcludedSenders] = useState(() => new Set());

  const analytics = useMemo(
    () => computeAllAnalytics(messages, { excludedSenders }),
    [messages, excludedSenders]
  );
  const { stats, userVolume, hourlyData, mediaBreakdown, topEmojis, topWords, participantsMeta } = analytics;

  const maxWordCount = topWords[0]?.count || 1;
  const maxEmojiCount = topEmojis[0]?.count || 1;

  const peakHour = useMemo(() => {
    if (!hourlyData || hourlyData.length === 0) return null;
    return hourlyData.reduce((max, item) => (item.count > (max?.count || 0) ? item : max), hourlyData[0]);
  }, [hourlyData]);

  const handleToggleParticipant = (senderName) => {
    setExcludedSenders((prev) => {
      const next = new Set(prev);
      if (next.has(senderName)) {
        next.delete(senderName);
      } else {
        // Prevent excluding all participants
        const activeCount = (participantsMeta?.allParticipants?.length || 0) - next.size;
        if (activeCount > 1) {
          next.add(senderName);
        }
      }
      return next;
    });
  };

  const handleToggleAllForwarded = () => {
    const suspected = participantsMeta?.suspectedForwardedSenders || [];
    const hasAnyExcluded = suspected.some(s => excludedSenders.has(s));

    setExcludedSenders((prev) => {
      const next = new Set(prev);
      if (hasAnyExcluded) {
        suspected.forEach(s => next.delete(s));
      } else {
        suspected.forEach(s => next.add(s));
      }
      return next;
    });
  };

  const hasAnyForwardedExcluded = (participantsMeta?.suspectedForwardedSenders || []).some(s => excludedSenders.has(s));

  return (
    <div className="w-full max-w-7xl mx-auto pb-16 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900/80 pb-8">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-emerald-400">Chat Analysis</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">{getFormatLabel(detectedFormat)}</span>
          </div>
          <h2 className="text-3xl font-semibold text-white tracking-tight">Statistics Overview</h2>
          <p className="text-zinc-400 text-sm font-mono mt-2 font-normal">
            <span className="text-emerald-400 font-semibold">{stats.totalMessages.toLocaleString('en-US')}</span> messages across <span className="text-white font-semibold">{stats.totalDays.toLocaleString('en-US')}</span> active days
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Format Mode Switcher */}
          {onModeChange && (
            <div className="bg-zinc-900/80 border border-zinc-800 p-1 rounded-xl flex items-center gap-1 font-mono text-xs">
              <span className="text-zinc-500 text-[11px] px-2 uppercase font-medium select-none">
                Modalità:
              </span>
              <button
                type="button"
                onClick={() => onModeChange('auto')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                  formatMode === 'auto'
                    ? 'bg-emerald-500 text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => onModeChange('modern')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                  formatMode === 'modern'
                    ? 'bg-emerald-500 text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                Moderno
              </button>
              <button
                type="button"
                onClick={() => onModeChange('legacy')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                  formatMode === 'legacy'
                    ? 'bg-emerald-500 text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                Legacy
              </button>
            </div>
          )}

          <button 
            onClick={onBack}
            className="bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 hover:text-white px-4 py-2 rounded-xl transition-all duration-200 border border-zinc-800 hover:border-emerald-500/40 font-mono text-xs flex items-center gap-2 cursor-pointer shadow-sm group active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" strokeWidth={1.5} />
            <span className="font-semibold">Upload another file</span>
          </button>
        </div>
      </div>

      {/* Direct Chat / Forwarded Messages Detection Alert */}
      {participantsMeta?.isDirectChat && participantsMeta?.suspectedForwardedSenders?.length > 0 && (
        <div className="bg-zinc-900/60 border border-amber-500/20 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg shrink-0">
              <Users className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <span className="text-white font-semibold">Chat tra 2 partecipanti principali</span>
              <p className="text-zinc-400 mt-0.5 font-normal">
                Rilevati possibili messaggi inoltrati o citati da: <span className="text-amber-400 font-semibold">{participantsMeta.suspectedForwardedSenders.join(', ')}</span>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleAllForwarded}
            className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors shrink-0 cursor-pointer"
          >
            {hasAnyForwardedExcluded ? 'Ripristina tutti i partecipanti' : 'Escludi inoltri dai grafici'}
          </button>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Messages */}
        <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-normal">Total Messages</span>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-3xl font-semibold font-mono text-white tracking-tight">{stats.totalMessages.toLocaleString('en-US')}</p>
          <p className="text-xs font-mono text-zinc-400 mt-2 flex items-center gap-2 font-normal">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Messages logged</span>
          </p>
        </div>
        
        {/* Participants */}
        <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-normal">Participants</span>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <Users className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-3xl font-semibold font-mono text-white tracking-tight">{stats.totalParticipants}</p>
          <p className="text-xs font-mono text-zinc-400 mt-2 flex items-center gap-2 font-normal">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>People in chat</span>
          </p>
        </div>

        {/* Active Days */}
        <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-normal">Active Days</span>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <Calendar className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-3xl font-semibold font-mono text-white tracking-tight">{stats.totalDays.toLocaleString('en-US')}</p>
          <p className="text-xs font-mono text-zinc-400 mt-2 flex items-center gap-2 font-normal">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Days with messages</span>
          </p>
        </div>

        {/* Daily Cadence */}
        <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-normal">Daily Average</span>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-semibold font-mono text-white tracking-tight">{stats.averageMessagesPerDay.toLocaleString('en-US')}</p>
            <span className="font-mono text-xs text-zinc-400 font-normal">msg/day</span>
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-2 flex items-center gap-2 font-normal">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Average messages per day</span>
          </p>
        </div>
      </div>

      {/* Records and Periods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Day Record */}
        <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-normal">Single-Day Record</span>
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                <Trophy className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-2xl font-semibold font-mono text-white">{stats.recordDay.count.toLocaleString('en-US')}</p>
              <span className="font-mono text-xs text-zinc-400 font-normal">messages</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-900/80 flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 font-normal">Record date:</span>
            <span className="font-mono text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded font-semibold">
              {stats.recordDay.date || 'N/A'}
            </span>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-normal">Longest Streak</span>
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                <Flame className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-2xl font-semibold font-mono text-white">{stats.longestStreak.count}</p>
              <span className="font-mono text-xs text-zinc-400 font-normal">{stats.longestStreak.count === 1 ? 'day' : 'consecutive days'}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-900/80 flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 font-normal">Period:</span>
            <span className="font-mono text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded font-semibold">
              {stats.longestStreak.startDate && stats.longestStreak.endDate
                ? `${stats.longestStreak.startDate} → ${stats.longestStreak.endDate}`
                : 'Single day'}
            </span>
          </div>
        </div>

        {/* Longest Silence / Gap */}
        <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-normal">Longest Silence</span>
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                <Clock className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-2xl font-semibold font-mono text-white">{stats.maxInactivityGap.days}</p>
              <span className="font-mono text-xs text-zinc-400 font-normal">{stats.maxInactivityGap.days === 1 ? 'day' : 'days of inactivity'}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-900/80 flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 font-normal">Interval:</span>
            <span className="font-mono text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded font-semibold">
              {stats.maxInactivityGap.fromDate && stats.maxInactivityGap.toDate
                ? `${stats.maxInactivityGap.fromDate} → ${stats.maxInactivityGap.toDate}`
                : 'No pause'}
            </span>
          </div>
        </div>
      </div>

      {/* Hourly Activity Stream (AreaChart) */}
      <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <Clock3 className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white tracking-tight">Hourly Activity</h3>
              <p className="text-xs font-mono text-zinc-400 font-normal">Message distribution across the 24 hours of the day</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {peakHour && peakHour.count > 0 && (
              <span className="font-mono text-xs text-emerald-400 px-4 py-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Peak: {peakHour.hour}:00 ({peakHour.count.toLocaleString('en-US')})</span>
              </span>
            )}
            <span className="font-mono text-xs text-zinc-400 px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 font-semibold">
              24 HOURS
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="cyberAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.32}/>
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.14}/>
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="hourlyLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981"/>
                  <stop offset="50%" stopColor="#06b6d4"/>
                  <stop offset="100%" stopColor="#38bdf8"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.4} vertical={false} />
              <XAxis 
                dataKey="hour" 
                stroke="#71717a" 
                fontSize={11} 
                fontFamily="var(--font-mono)" 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#71717a" 
                fontSize={11} 
                fontFamily="var(--font-mono)" 
                tickLine={false} 
                axisLine={false} 
              />
              <RechartsTooltip content={<HourlyTooltip peakHour={peakHour} totalMessages={stats.totalMessages} />} />
              <Area 
                type="monotone" 
                dataKey="count" 
                name="Messages" 
                stroke="url(#hourlyLineGradient)" 
                strokeWidth={1.5}
                activeDot={{
                  r: 5,
                  fill: '#10b981',
                  stroke: '#09090b',
                  strokeWidth: 2
                }}
                fillOpacity={1} 
                fill="url(#cyberAreaGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lexical Analysis: Top Repeated Words & Top Emojis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Words Leaderboard */}
        <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                <Type className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white tracking-tight">Top Words</h3>
                <p className="text-xs font-mono text-zinc-400 font-normal">Top 10 repeated words (excluding stop words)</p>
              </div>
            </div>
            <span className="font-mono text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 rounded-lg font-semibold">
              TOP 10
            </span>
          </div>

          <div className="space-y-2">
            {topWords.length > 0 ? topWords.map((item, index) => {
              const percentage = Math.max(5, Math.round((item.count / maxWordCount) * 100));
              return (
                <div 
                  key={item.word} 
                  className="relative overflow-hidden flex items-center justify-between p-4 rounded-xl border border-zinc-900 bg-zinc-900/30 hover:border-zinc-800 transition-colors"
                >
                  {/* Frequency fill bar */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-emerald-500/[0.08] pointer-events-none transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />

                  <div className="flex items-center gap-4 relative z-10">
                    <span className="font-mono text-xs text-zinc-500 font-semibold w-8">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-sm text-zinc-200 capitalize font-semibold">
                      {item.word}
                    </span>
                  </div>

                  <span className="relative z-10 font-mono text-xs text-zinc-300 bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-lg font-normal shadow-inner">
                    {item.count.toLocaleString('en-US')}
                  </span>
                </div>
              );
            }) : (
              <div className="text-center font-mono text-xs text-zinc-500 py-16 font-normal">No words found in the chat.</div>
            )}
          </div>
        </div>

        {/* Top Emojis Leaderboard */}
        <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                <Smile className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white tracking-tight">Top Emojis</h3>
                <p className="text-xs font-mono text-zinc-400 font-normal">Top 10 frequent emojis in the conversation</p>
              </div>
            </div>
            <span className="font-mono text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 rounded-lg font-semibold">
              TOP 10
            </span>
          </div>

          <div className="space-y-2">
            {topEmojis.length > 0 ? topEmojis.map((item, index) => {
              const percentage = Math.max(5, Math.round((item.count / maxEmojiCount) * 100));
              return (
                <div 
                  key={item.emoji} 
                  className="relative overflow-hidden flex items-center justify-between p-4 rounded-xl border border-zinc-900 bg-zinc-900/30 hover:border-zinc-800 transition-colors"
                >
                  {/* Frequency fill bar */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-emerald-500/[0.08] pointer-events-none transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />

                  <div className="flex items-center gap-4 relative z-10">
                    <span className="font-mono text-xs text-zinc-500 font-semibold w-8">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                    <span 
                      className="text-2xl inline-flex items-center justify-center select-none leading-none emoji-render" 
                      role="img" 
                      aria-label={`Emoji ranked ${index + 1}`}
                    >
                      {item.emoji}
                    </span>
                  </div>

                  <span className="relative z-10 font-mono text-xs text-zinc-300 bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-lg font-normal shadow-inner">
                    {item.count.toLocaleString('en-US')}
                  </span>
                </div>
              );
            }) : (
              <div className="text-center font-mono text-xs text-zinc-500 py-16 font-normal">No emojis detected in the chat.</div>
            )}
          </div>
        </div>
      </div>

      {/* Participants & Media Volume Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages by Participant (Donut Chart) */}
        <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl min-w-0 overflow-hidden flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white tracking-tight">Messages by Participant</h3>
              <p className="text-xs font-mono text-zinc-400 mt-2 font-normal">
                Percentage and share of messages sent by each participant
              </p>
            </div>
            <span className="font-mono text-xs text-zinc-300 px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 font-semibold">
              SHARE
            </span>
          </div>

          {/* Participant Filter Chips */}
          {participantsMeta?.allParticipants?.length > 1 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-zinc-500 mr-1 select-none">Filtro:</span>
              {participantsMeta.allParticipants.map((item) => {
                const name = typeof item === 'string' ? item : item.name;
                const isExcluded = excludedSenders.has(name);
                const isSuspected = participantsMeta.suspectedForwardedSenders?.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleToggleParticipant(name)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                      isExcluded
                        ? 'bg-zinc-950/60 border-zinc-800 text-zinc-500 line-through opacity-60 hover:opacity-100'
                        : isSuspected
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:border-amber-500/50'
                        : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-200 hover:border-emerald-500/40 hover:text-white'
                    }`}
                    title={isExcluded ? `Clicca per includere ${name}` : `Clicca per escludere ${name}`}
                  >
                    <span className="max-w-[120px] truncate">{name}</span>
                    {isSuspected && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded font-sans">
                        Inoltro?
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <MessagesDonutChart data={userVolume} totalMessages={stats.totalMessages} />
        </div>

        {/* Media Shared by Participant (Stacked BarChart) */}
        <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl min-w-0 overflow-hidden flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white tracking-tight">Media Shared by Participant</h3>
              <p className="text-xs font-mono text-zinc-400 mt-2 font-normal">
                Images, videos, voice notes, and stickers sent
              </p>
            </div>
            <span className="font-mono text-xs text-zinc-300 px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 font-semibold">
              MEDIA
            </span>
          </div>

          <MediaStackedBarChart data={mediaBreakdown} isLegacy={isLegacy} />
        </div>
      </div>
    </div>
  );
}
