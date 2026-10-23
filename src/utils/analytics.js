/**
 * WhatsApp system stop words and common frequent words (Italian and English)
 * used to filter out noise from the top words frequency analysis.
 */
const STOP_WORDS = new Set([
  // Italian stop words
  'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'un\'', 'dei', 'degli', 'delle', 'del', 'dello', 'della', 'dell',
  'al', 'allo', 'alla', 'ai', 'agli', 'alle', 'dal', 'dallo', 'dalla', 'dai', 'dagli', 'dalle',
  'nel', 'nello', 'nella', 'nei', 'negli', 'nelle', 'sul', 'sullo', 'sulla', 'sui', 'sugli', 'sulle',
  'col', 'coi',
  'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
  'e', 'ed', 'o', 'od', 'ma', 'se', 'perché', 'perche', 'poiché', 'anche', 'pure', 'neanche', 'nemmeno', 'neppure',
  'che', 'chi', 'cui', 'quale', 'quali', 'quanto', 'quanti', 'quanta', 'quante', 'cosa', 'come', 'dove', 'quando',
  'non', 'più', 'piu', 'meno', 'molto', 'poco', 'troppo', 'tutto', 'tutti', 'tutta', 'tutte', 'niente', 'nulla',
  'io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro', 'mi', 'ti', 'si', 'ci', 'vi', 'li', 'me', 'te', 'sé',
  'mio', 'tuo', 'suo', 'nostro', 'vostro', 'mia', 'tua', 'sua', 'nostra', 'vostra',
  'miei', 'tuoi', 'suoi', 'nostri', 'vostri', 'mie', 'tue', 'sue', 'nostre', 'vostre',
  'questo', 'questa', 'questi', 'queste', 'quello', 'quella', 'quelli', 'quelle', 'quest', 'quell',
  'ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno', 'avevo', 'avevi', 'aveva', 'avevamo', 'avevate', 'avevano',
  'avuto', 'avuta', 'avuti', 'avute',
  'sono', 'sei', 'è', 'era', 'eri', 'eravamo', 'eravate', 'erano', 'stato', 'stata', 'stati', 'state',
  'siamo', 'siete', 'sarò', 'sarai', 'sarà', 'saremo', 'sarete', 'saranno', 'sia', 'siano', 'fosse', 'fossi',
  'fare', 'fatto', 'fatta', 'fatti', 'fatte', 'faccio', 'fai', 'fa', 'facciamo', 'fate', 'fanno',
  'va', 'vai', 'vado', 'andare', 'andato', 'andata', 'andati', 'andate', 'andiamo', 'vanno',
  'dire', 'detto', 'dice', 'dici', 'dico', 'diciamo',
  'bene', 'male', 'così', 'cosi', 'solo', 'ora', 'adesso', 'poi', 'prima', 'dopo', 'sempre', 'mai',
  'gia', 'già', 'ancora', 'forse', 'quasi', 'tipo', 'cmq', 'comunque', 'infatti', 'quindi', 'allora',
  'ok', 'okay', 'si', 'sì', 'no', 'ah', 'aha', 'ahah', 'ahaha', 'ahahah', 'eh', 'ehi', 'boh', 'grazie', 'prego',
  // English stop words
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
  'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
  'about', 'who', 'get', 'which', 'go', 'when', 'make', 'can', 'like', 'time', 'just', 'him',
  'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use',
  'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
  'give', 'day', 'most', 'us', 'are', 'was', 'were', 'been', 'has', 'had',
  // WhatsApp system terms and edit markers
  'message', 'messages', 'edited', 'omitted',
  'messaggio', 'messaggi', 'modificato', 'modificata', 'modificati', 'modificate'
]);

/**
 * Converts a DD/MM/YYYY date string into a UTC midnight timestamp.
 */
function parseDateToUtc(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  return Date.UTC(year, month, day);
}

const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter
  ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  : null;

// Pattern that identifies genuine emoji graphemes including pictographs, flags, keycaps and standard ranges
const EMOJI_DETECTION_REGEX = /^\p{Extended_Pictographic}|\p{Regional_Indicator}{2}|\u20E3|[\u{1F300}-\u{1FAFF}]/u;
const NON_EMOJI_SYMBOLS = new Set(['©', '®', '™']);

/**
 * Normalizes an emoji grapheme cluster to ensure proper color presentation in browsers.
 * Single-codepoint BMP pictographs (like U+2764 for heart, U+2615 for coffee, U+26A0 for warning)
 * require U+FE0F (Variation Selector-16) to render as colored emojis rather than monochrome text dingbats.
 */
function normalizeEmoji(emojiGrapheme) {
  if (!emojiGrapheme) return '';
  if (emojiGrapheme.length === 1) {
    const cp = emojiGrapheme.codePointAt(0);
    if ((cp >= 0x2000 && cp <= 0x3299) || cp === 0x00A9 || cp === 0x00AE) {
      return emojiGrapheme + '\uFE0F';
    }
  }
  return emojiGrapheme;
}

/**
 * Extracts all proper emoji grapheme clusters from a message text.
 * Preserves skin tone modifiers, ZWJ sequences, flags and variation selectors.
 */
export function extractEmojis(text) {
  if (!text) return [];

  if (segmenter) {
    const emojis = [];
    for (const { segment } of segmenter.segment(text)) {
      if (NON_EMOJI_SYMBOLS.has(segment)) continue;
      if (EMOJI_DETECTION_REGEX.test(segment) && !/^[0-9a-zA-Z\s.,!?:;'"\-()+=\\/]+$/.test(segment)) {
        emojis.push(normalizeEmoji(segment));
      }
    }
    return emojis;
  }

  // Fallback regex matching composite emojis, flags, keycaps and skin tones
  const fallbackRegex = /(\p{Regional_Indicator}{2}|[0-9#*]\uFE0F?\u20E3|\p{Extended_Pictographic}(?:\uFE0F|[\u{1F3FB}-\u{1F3FF}])?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|[\u{1F3FB}-\u{1F3FF}])?)*)/gu;
  const matches = text.match(fallbackRegex) || [];
  return matches
    .filter(m => !NON_EMOJI_SYMBOLS.has(m) && !/^[0-9a-zA-Z\s]+$/.test(m))
    .map(normalizeEmoji);
}

/**
 * Single-pass analytics computation.
 * Walks the messages array once and accumulates all metrics to avoid multiple O(n) passes.
 */
export function computeAllAnalytics(messages) {
  const senders = new Set();
  const days = new Set();
  const userCounts = {};
  const messagesPerDay = {};
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: i.toString().padStart(2, '0') + ':00',
    count: 0
  }));
  const mediaByUser = {};
  const emojiCounts = {};
  const wordCounts = {};

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const { sender, date, time, type, isMedia, message } = msg;

    senders.add(sender);
    days.add(date);

    userCounts[sender] = (userCounts[sender] || 0) + 1;
    messagesPerDay[date] = (messagesPerDay[date] || 0) + 1;

    if (time) {
      const hourInt = parseInt(time.split(':')[0], 10);
      if (!isNaN(hourInt) && hourInt >= 0 && hourInt < 24) {
        hours[hourInt].count += 1;
      }
    }

    if (!mediaByUser[sender]) {
      mediaByUser[sender] = { name: sender, Image: 0, Video: 0, Audio: 0, Sticker: 0 };
    }
    if (isMedia) {
      mediaByUser[sender][type] += 1;
    }

    if (!isMedia && message) {
      // Emoji extraction
      const emojis = extractEmojis(message);
      for (let j = 0; j < emojis.length; j++) {
        emojiCounts[emojis[j]] = (emojiCounts[emojis[j]] || 0) + 1;
      }

      // Word extraction: clean URLs, WhatsApp edit tags and system artifacts
      const cleanText = message
        .replace(/https?:\/\/\S+/gi, ' ')
        .replace(/<[^>]*(?:message|messaggio)[^>]*>/gi, ' ')
        .replace(/\b(?:this )?message (?:was )?edited\b/gi, ' ')
        .replace(/\b(?:questo )?messaggio (?:è stato )?modificato\b/gi, ' ')
        .replace(/\b\w+ omitted\b/gi, ' ');
      const words = cleanText.toLowerCase().match(/[\p{L}]{3,}/gu);
      if (words) {
        for (let j = 0; j < words.length; j++) {
          const word = words[j];
          if (!STOP_WORDS.has(word)) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
          }
        }
      }
    }
  }

  // Day record
  let recordDay = { date: null, count: 0 };
  for (const [date, count] of Object.entries(messagesPerDay)) {
    if (count > recordDay.count) {
      recordDay = { date, count };
    }
  }

  // Chronological analysis for streak and inactivity gap
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const sortedDays = Array.from(days)
    .map(dStr => ({ dateStr: dStr, ts: parseDateToUtc(dStr) }))
    .filter(item => item.ts !== null)
    .sort((a, b) => a.ts - b.ts);

  let longestStreak = {
    count: sortedDays.length > 0 ? 1 : 0,
    startDate: sortedDays[0]?.dateStr || null,
    endDate: sortedDays[0]?.dateStr || null
  };

  let currentStreakCount = 1;
  let currentStreakStart = sortedDays[0]?.dateStr || null;

  let maxInactivityGap = {
    days: 0,
    fromDate: null,
    toDate: null
  };

  for (let i = 1; i < sortedDays.length; i++) {
    const prev = sortedDays[i - 1];
    const curr = sortedDays[i];
    const diffDays = Math.round((curr.ts - prev.ts) / ONE_DAY_MS);

    // Streak calculation (consecutive days)
    if (diffDays === 1) {
      currentStreakCount += 1;
    } else {
      currentStreakCount = 1;
      currentStreakStart = curr.dateStr;
    }

    if (currentStreakCount > longestStreak.count) {
      longestStreak = {
        count: currentStreakCount,
        startDate: currentStreakStart,
        endDate: curr.dateStr
      };
    }

    // Inactivity gap: days between messages (diffDays - 1)
    const gap = diffDays - 1;
    if (gap > maxInactivityGap.days) {
      maxInactivityGap = {
        days: gap,
        fromDate: prev.dateStr,
        toDate: curr.dateStr
      };
    }
  }

  const activeDaysCount = days.size;
  const averageMessagesPerDay = activeDaysCount > 0
    ? Number((messages.length / activeDaysCount).toFixed(1))
    : 0;

  const stats = {
    totalMessages: messages.length,
    totalParticipants: senders.size,
    totalDays: activeDaysCount,
    averageMessagesPerDay,
    recordDay,
    longestStreak,
    maxInactivityGap
  };

  const threshold = messages.length * 0.02;
  let othersCount = 0;
  const filteredUserVolume = [];

  Object.entries(userCounts).forEach(([name, value]) => {
    if (value < threshold) {
      othersCount += value;
    } else {
      filteredUserVolume.push({ name, value });
    }
  });

  if (othersCount > 0) {
    filteredUserVolume.push({ name: 'Others', value: othersCount });
  }

  const userVolume = filteredUserVolume.sort((a, b) => b.value - a.value);

  const mediaBreakdown = Object.values(mediaByUser).sort((a, b) => {
    const totalA = a.Image + a.Video + a.Audio + a.Sticker;
    const totalB = b.Image + b.Video + b.Audio + b.Sticker;
    return totalB - totalA;
  });

  const topEmojis = Object.entries(emojiCounts)
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topWords = Object.entries(wordCounts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    stats,
    userVolume,
    hourlyData: hours,
    mediaBreakdown,
    topEmojis,
    topWords
  };
}
