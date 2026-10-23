import { useMemo } from 'react';
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
 * Custom dark tooltip for Recharts.
 */
function DarkTooltip({ active, payload, label, formatter }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950/95 border border-zinc-800 text-zinc-100 p-3 rounded-xl shadow-2xl backdrop-blur-md font-mono text-xs space-y-1">
        {label && <p className="text-zinc-400 border-b border-zinc-900 pb-1 mb-1 font-semibold">{label}</p>}
        {payload.map((entry, idx) => (
          <div key={`tip-${entry.dataKey || entry.name || idx}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5" style={{ color: entry.color || entry.stroke || '#10b981' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color || entry.stroke || '#10b981' }} />
              {entry.name}:
            </span>
            <span className="text-white font-bold">
              {formatter ? formatter(entry.value, entry.name)[0] : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function Dashboard({ messages, onBack }) {
  const analytics = useMemo(() => computeAllAnalytics(messages), [messages]);
  const { stats, userVolume, hourlyData, mediaBreakdown, topEmojis, topWords } = analytics;

  const maxWordCount = topWords[0]?.count || 1;
  const maxEmojiCount = topEmojis[0]?.count || 1;

  return (
    <div className="w-full max-w-7xl mx-auto pb-16 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900/80 pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 uppercase tracking-wider mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>ANALISI DELLA CHAT</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Panoramica Statistiche</h2>
          <p className="text-zinc-400 text-sm font-mono mt-1">
            <span className="text-emerald-400 font-semibold">{stats.totalMessages.toLocaleString()}</span> messaggi in <span className="text-white font-semibold">{stats.totalDays.toLocaleString()}</span> giorni attivi
          </p>
        </div>

        <button 
          onClick={onBack}
          className="bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white px-5 py-2.5 rounded-xl transition-all border border-zinc-800 hover:border-zinc-700 font-mono text-xs flex items-center gap-2 cursor-pointer shadow-sm group"
        >
          <RotateCcw className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
          <span>Carica un altro file</span>
        </button>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Messages */}
        <div className="bg-zinc-950/70 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">Totale Messaggi</span>
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono text-white tracking-tight">{stats.totalMessages.toLocaleString()}</p>
          <p className="text-[11px] font-mono text-zinc-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Messaggi registrati</span>
          </p>
        </div>
        
        {/* Participants */}
        <div className="bg-zinc-950/70 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">Partecipanti</span>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono text-white tracking-tight">{stats.totalParticipants}</p>
          <p className="text-[11px] font-mono text-zinc-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Persone nella chat</span>
          </p>
        </div>

        {/* Active Days */}
        <div className="bg-zinc-950/70 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">Giorni Attivi</span>
            <div className="p-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono text-white tracking-tight">{stats.totalDays.toLocaleString()}</p>
          <p className="text-[11px] font-mono text-zinc-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span>Giorni con messaggi</span>
          </p>
        </div>

        {/* Daily Cadence */}
        <div className="bg-zinc-950/70 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">Media Giornaliera</span>
            <div className="p-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold font-mono text-white tracking-tight">{stats.averageMessagesPerDay.toLocaleString()}</p>
            <span className="font-mono text-xs text-zinc-500">msg/giorno</span>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span>Media messaggi al giorno</span>
          </p>
        </div>
      </div>

      {/* Records and Periods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Day Record */}
        <div className="bg-zinc-950/70 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl flex flex-col justify-between group hover:border-amber-500/40 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber-400/90 font-medium">Record in un Giorno</span>
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold font-mono text-white">{stats.recordDay.count.toLocaleString()}</p>
              <span className="font-mono text-xs text-zinc-400">messaggi</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-900/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-500">Data del record:</span>
            <span className="font-mono text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
              {stats.recordDay.date || 'N/D'}
            </span>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-zinc-950/70 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl flex flex-col justify-between group hover:border-emerald-500/40 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400/90 font-medium">Serie Consecutiva più Lunga</span>
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold font-mono text-white">{stats.longestStreak.count}</p>
              <span className="font-mono text-xs text-zinc-400">{stats.longestStreak.count === 1 ? 'giorno' : 'giorni consecutivi'}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-900/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-500">Periodo:</span>
            <span className="font-mono text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              {stats.longestStreak.startDate && stats.longestStreak.endDate
                ? `${stats.longestStreak.startDate} → ${stats.longestStreak.endDate}`
                : 'Sessione singola'}
            </span>
          </div>
        </div>

        {/* Longest Silence / Gap */}
        <div className="bg-zinc-950/70 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl flex flex-col justify-between group hover:border-indigo-500/40 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-indigo-400/90 font-medium">Pausa più Lunga</span>
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold font-mono text-white">{stats.maxInactivityGap.days}</p>
              <span className="font-mono text-xs text-zinc-400">{stats.maxInactivityGap.days === 1 ? 'giorno' : 'giorni senza messaggi'}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-900/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-500">Intervallo:</span>
            <span className="font-mono text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
              {stats.maxInactivityGap.fromDate && stats.maxInactivityGap.toDate
                ? `${stats.maxInactivityGap.fromDate} → ${stats.maxInactivityGap.toDate}`
                : 'Nessuna pausa'}
            </span>
          </div>
        </div>
      </div>

      {/* Hourly Activity Stream (AreaChart) */}
      <div className="bg-zinc-950/70 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <Clock3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Attività per Fascia Oraria</h3>
              <p className="text-xs font-mono text-zinc-500">Distribuzione dei messaggi nelle 24 ore della giornata</p>
            </div>
          </div>
          <span className="font-mono text-[11px] text-zinc-400 px-2.5 py-1 rounded-md border border-zinc-800 bg-zinc-900">
            24 ORE
          </span>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cyberAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="#18181b" vertical={false} />
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
              <RechartsTooltip content={<DarkTooltip formatter={(value) => [`${value.toLocaleString()} messaggi`, 'Messaggi']} />} />
              <Area 
                type="monotone" 
                dataKey="count" 
                name="Messaggi" 
                stroke="#10b981" 
                strokeWidth={2}
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
        <div className="bg-zinc-950/70 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg">
                <Type className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Parole Più Usate</h3>
                <p className="text-xs font-mono text-zinc-500">Le 10 parole più ripetute (escluse congiunzioni e parole comuni)</p>
              </div>
            </div>
            <span className="font-mono text-[11px] text-cyan-400 border border-cyan-500/20 bg-cyan-500/5 px-2 py-0.5 rounded">
              TOP 10
            </span>
          </div>

          <div className="space-y-2">
            {topWords.length > 0 ? topWords.map((item, index) => {
              const percentage = Math.max(5, Math.round((item.count / maxWordCount) * 100));
              return (
                <div 
                  key={item.word} 
                  className="relative overflow-hidden flex items-center justify-between p-3 rounded-xl border border-zinc-900 bg-zinc-900/40 hover:border-zinc-800 transition-colors"
                >
                  {/* Frequency fill bar */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-cyan-500/[0.06] pointer-events-none transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />

                  <div className="flex items-center gap-3 relative z-10">
                    <span className="font-mono text-xs text-zinc-600 font-semibold w-7">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-sm text-zinc-200 capitalize font-medium">
                      {item.word}
                    </span>
                  </div>

                  <span className="relative z-10 font-mono text-xs text-zinc-300 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-md shadow-inner">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              );
            }) : (
              <div className="text-center font-mono text-xs text-zinc-600 py-12">Nessuna parola trovata nella chat.</div>
            )}
          </div>
        </div>

        {/* Top Emojis Leaderboard */}
        <div className="bg-zinc-950/70 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-lg">
                <Smile className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Emoji Più Usate</h3>
                <p className="text-xs font-mono text-zinc-500">Le 10 emoji più frequenti nella conversazione</p>
              </div>
            </div>
            <span className="font-mono text-[11px] text-pink-400 border border-pink-500/20 bg-pink-500/5 px-2 py-0.5 rounded">
              TOP 10
            </span>
          </div>

          <div className="space-y-2">
            {topEmojis.length > 0 ? topEmojis.map((item, index) => {
              const percentage = Math.max(5, Math.round((item.count / maxEmojiCount) * 100));
              return (
                <div 
                  key={item.emoji} 
                  className="relative overflow-hidden flex items-center justify-between p-3 rounded-xl border border-zinc-900 bg-zinc-900/40 hover:border-zinc-800 transition-colors"
                >
                  {/* Frequency fill bar */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-pink-500/[0.06] pointer-events-none transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />

                  <div className="flex items-center gap-3 relative z-10">
                    <span className="font-mono text-xs text-zinc-600 font-semibold w-7">
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

                  <span className="relative z-10 font-mono text-xs text-zinc-300 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-md shadow-inner">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              );
            }) : (
              <div className="text-center font-mono text-xs text-zinc-600 py-12">Nessuna emoji rilevata nella chat.</div>
            )}
          </div>
        </div>
      </div>

      {/* Participants & Media Volume Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages by Participant (Donut Chart) */}
        <div className="bg-zinc-950/70 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl min-w-0 overflow-hidden flex flex-col justify-between group hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Messaggi per Partecipante</h3>
              <p className="text-xs md:text-[13px] font-mono text-zinc-400 mt-1">
                Percentuale e quota di messaggi inviati da ciascun utente
              </p>
            </div>
            <span className="font-mono text-xs text-zinc-300 px-2.5 py-1 rounded-lg border border-white/10 bg-zinc-900/60 backdrop-blur-sm tracking-wider font-medium shadow-xs">
              QUOTE
            </span>
          </div>

          <MessagesDonutChart data={userVolume} totalMessages={stats.totalMessages} />
        </div>

        {/* Media Shared by Participant (Stacked BarChart) */}
        <div className="bg-zinc-950/70 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl min-w-0 overflow-hidden flex flex-col justify-between group hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Media Condivisi per Partecipante</h3>
              <p className="text-xs md:text-[13px] font-mono text-zinc-400 mt-1">
                Immagini, video, messaggi vocali e sticker inviati
              </p>
            </div>
            <span className="font-mono text-xs text-zinc-300 px-2.5 py-1 rounded-lg border border-white/10 bg-zinc-900/60 backdrop-blur-sm tracking-wider font-medium shadow-xs">
              MEDIA
            </span>
          </div>

          <MediaStackedBarChart data={mediaBreakdown} />
        </div>
      </div>
    </div>
  );
}
