/**
 * WhatsApp system event phrases (English and Italian).
 * If a parsed line or sender contains any of these substrings (case-insensitive),
 * the entire line is treated as a system event and excluded from the dataset.
 */
const SYSTEM_MESSAGE_PHRASES = [
  // English
  'changed the group description',
  'changed the subject',
  'changed this group\'s icon',
  'changed the group settings',
  'changed their phone number',
  'changed to ',
  ' added ',
  ' removed ',
  ' left',
  ' joined using this group\'s invite link',
  ' was added',
  ' was removed',
  'pinned a message',
  'unpinned a message',
  'messages and calls are end-to-end encrypted',
  'security code changed',
  'your security code with',
  'turned on disappearing messages',
  'turned off disappearing messages',
  'changed the disappearing messages timer',
  'created a poll',
  'this business is a verified business',
  'you\'re now an admin',
  'is no longer an admin',
  'message was deleted',
  'you deleted this message',
  'created group',

  // Italian
  'i messaggi e le chiamate sono crittografati',
  'crittografati end-to-end',
  'ha cambiato la descrizione',
  'ha cambiato l\'oggetto',
  'ha cambiato l\'immagine',
  'ha cambiato l\'icona',
  'ha cambiato le impostazioni',
  'ha cambiato il suo numero',
  'ha cambiato numero',
  'ha aggiunto',
  'ti ha aggiunto',
  'è stato aggiunto',
  'è stata aggiunta',
  'sei stato aggiunto',
  'sei stata aggiunta',
  'ha rimosso',
  'ti ha rimosso',
  'è stato rimosso',
  'è stata rimossa',
  'sei stato rimosso',
  'sei stata rimossa',
  'ha abbandonato',
  'hai abbandonato',
  'è entrato tramite',
  'è entrata tramite',
  'link di invito',
  'ha fissato un messaggio',
  'ha rimosso un messaggio fissato',
  'codice di sicurezza cambiato',
  'il tuo codice di sicurezza',
  'ha attivato i messaggi effimeri',
  'ha disattivato i messaggi effimeri',
  'ha creato un sondaggio',
  'ora sei un amministratore',
  'ora sei un\'amministratrice',
  'non sei più un amministratore',
  'non sei più un\'amministratrice',
  'questo messaggio è stato eliminato',
  'hai eliminato questo messaggio',
  'ha creato il gruppo',
  'hai creato il gruppo',
  'tocca per saperne di più',
];

/**
 * Returns true if the message body is a WhatsApp system event
 * rather than genuine user content.
 */
function isSystemMessage(messageText) {
  if (!messageText) return false;
  const lower = messageText.toLowerCase();
  return SYSTEM_MESSAGE_PHRASES.some(phrase => lower.includes(phrase));
}

/**
 * Normalizes date string into DD/MM/YYYY format.
 * Converts 2-digit years (e.g. 19 -> 2019) and standardizes delimiters (., - -> /).
 */
export function normalizeDate(dateStr) {
  if (!dateStr) return dateStr;
  const clean = dateStr.trim().replace(/[.-]/g, '/');
  const parts = clean.split('/');
  if (parts.length !== 3) return dateStr;

  // Handle YYYY/MM/DD
  if (parts[0].length === 4) {
    const year = parts[0];
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  const p0 = parts[0].padStart(2, '0');
  const p1 = parts[1].padStart(2, '0');
  let p2 = parts[2];
  if (p2.length === 2) {
    const yr = parseInt(p2, 10);
    p2 = (yr < 70 ? 2000 + yr : 1900 + yr).toString();
  }

  return `${p0}/${p1}/${p2}`;
}

/**
 * Normalizes time string to 24-hour HH:MM or HH:MM:SS format.
 * Handles 12-hour AM/PM and removes extraneous whitespace.
 */
export function normalizeTime(timeStr) {
  if (!timeStr) return timeStr;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?$/);
  if (!match) return timeStr.trim();

  let [, hourStr, minStr, secStr, meridiem] = match;
  let hour = parseInt(hourStr, 10);

  if (meridiem) {
    const isPm = meridiem.toLowerCase() === 'pm';
    if (isPm && hour < 12) hour += 12;
    if (!isPm && hour === 12) hour = 0;
  }

  const h = hour.toString().padStart(2, '0');
  const s = secStr !== undefined ? `:${secStr.padStart(2, '0')}` : '';
  return `${h}:${minStr}${s}`;
}

/**
 * Identifies media category and flags whether the message is a media attachment.
 * Supports Italian, English and international WhatsApp export tags.
 */
export function detectMediaType(messageText) {
  const lower = messageText.toLowerCase().trim();

  // Stickers
  if (
    lower.includes('sticker omitted') ||
    lower.includes('adesivo omesso') ||
    lower.includes('sticker omesso') ||
    lower.includes('<adesivo omesso>') ||
    lower.includes('<sticker omesso>') ||
    /\.(webp)>?$/i.test(lower)
  ) {
    return { type: 'Sticker', isMedia: true };
  }

  // Images
  if (
    lower.includes('image omitted') ||
    lower.includes('immagine omessa') ||
    lower.includes('foto omessa') ||
    lower.includes('<immagine omessa>') ||
    lower.includes('<foto omessa>') ||
    /\.(jpe?g|png|heic|gif)>?$/i.test(lower) ||
    lower.includes('photo omitted') ||
    lower.includes('gif omitted') ||
    lower.includes('gif omessa')
  ) {
    return { type: 'Image', isMedia: true };
  }

  // Audio
  if (
    lower.includes('audio omitted') ||
    lower.includes('audio omesso') ||
    lower.includes('<audio omesso>') ||
    lower.includes('vocale omesso') ||
    lower.includes('registrazione vocale') ||
    /\.(opus|m4a|mp3|aac|ogg|wav)>?$/i.test(lower)
  ) {
    return { type: 'Audio', isMedia: true };
  }

  // Video
  if (
    lower.includes('video omitted') ||
    lower.includes('video omesso') ||
    lower.includes('<video omesso>') ||
    /\.(mp4|mov|3gp|avi|mkv)>?$/i.test(lower)
  ) {
    return { type: 'Video', isMedia: true };
  }

  // Generic Media (Android exports: "<Media omessi>", "<Media omitted>", iOS "<allegato: ...>", etc.)
  if (
    lower.includes('<media omessi>') ||
    lower.includes('media omessi') ||
    lower.includes('<media omitted>') ||
    lower.includes('media omitted') ||
    lower.includes('<multimedia omitido>') ||
    lower.includes('multimedia omitido') ||
    lower.includes('document omitted') ||
    lower.includes('documento omesso') ||
    lower.includes('contact card omitted') ||
    lower.includes('contatto omesso') ||
    lower.startsWith('<allegato:') ||
    lower.startsWith('<attached:') ||
    /^<.*(?:omess[ioae]|omitted).*>/i.test(lower)
  ) {
    return { type: 'Media', isMedia: true };
  }

  return { type: 'Text', isMedia: false };
}

// Regex definitions for distinct chat export formats
// iOS format: [DD/MM/YYYY, HH:MM:SS] Sender: Message or [DD/MM/YYYY, HH:MM:SS] System message
const IOS_LINE_REGEX = /^\[(\d{1,4}[/.-]\d{1,2}[/.-]\d{2,4})[,\s]+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\]\s*(?:-\s*)?(?:([^:]+?):\s*(.*)|(.*))$/;

// Modern Android format: DD/MM/YYYY, HH:MM - Sender: Message (strict 4-digit year)
const ANDROID_MODERN_REGEX = /^(\d{1,4}[/.-]\d{1,2}[/.-]\d{4})(?:,\s*|\s*-\s*|\s+)(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\s*-\s*(?:([^:]+?):\s*(.*)|(.*))$/;

// Legacy Android format: DD/MM/YY, HH:MM - Sender: Message (allows 2-digit and 4-digit years)
const ANDROID_LEGACY_REGEX = /^(\d{1,4}[/.-]\d{1,2}[/.-]\d{2,4})(?:,\s*|\s*-\s*|\s+)(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\s*-\s*(?:([^:]+?):\s*(.*)|(.*))$/;

/**
 * Converts a DD/MM/YYYY date string into a UTC midnight timestamp.
 */
function parseDateToUtc(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  let year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (year < 100) year += (year < 70 ? 2000 : 1900);
  return Date.UTC(year, month, day);
}

/**
 * Converts HH:MM or HH:MM:SS string to milliseconds from midnight.
 */
function parseTimeToMs(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  const s = parseInt(parts[2], 10) || 0;
  return (h * 3600 + m * 60 + s) * 1000;
}

/**
 * Returns UTC timestamp (ms) for a normalized date and time string.
 */
function getMessageTimestamp(dateStr, timeStr) {
  const dateUtc = parseDateToUtc(dateStr);
  if (dateUtc === null) return null;
  return dateUtc + parseTimeToMs(timeStr);
}

/**
 * Inspects a sample of the export file to detect the platform format and version.
 * Returns { format: 'modern_ios' | 'modern_android' | 'legacy_android', isLegacy: boolean }.
 */
export function detectChatFormat(text) {
  const lines = text.split('\n').slice(0, 100);
  let iosCount = 0;
  let modernAndroidCount = 0;
  let legacyAndroidCount = 0;

  const iosRegex = /^\[\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}[,\s]+\d{1,2}:\d{2}/;
  const modernAndroidRegex = /^\d{1,2}[/.-]\d{1,2}[/.-]\d{4}(?:,\s*|\s*-\s*|\s+)\d{1,2}:\d{2}/;
  const legacyAndroidRegex = /^\d{1,2}[/.-]\d{1,2}[/.-]\d{2}(?:,\s*|\s*-\s*|\s+)\d{1,2}:\d{2}/;

  for (const rawLine of lines) {
    const line = rawLine
      .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
      .replace(/[\u00A0\u202F]/g, ' ')
      .trim();
    if (!line) continue;

    if (line.startsWith('[')) {
      if (iosRegex.test(line)) iosCount++;
    } else {
      if (modernAndroidRegex.test(line)) {
        modernAndroidCount++;
      } else if (legacyAndroidRegex.test(line)) {
        legacyAndroidCount++;
      }
    }
  }

  if (iosCount > modernAndroidCount && iosCount > legacyAndroidCount) {
    return { format: 'modern_ios', isLegacy: false };
  }
  if (legacyAndroidCount > modernAndroidCount) {
    return { format: 'legacy_android', isLegacy: true };
  }
  return { format: 'modern_android', isLegacy: false };
}

/**
 * Attempts to parse a line matching the designated format mode.
 */
function parseLine(line, effectiveFormat) {
  if (effectiveFormat === 'modern_ios') {
    if (line.startsWith('[')) {
      const match = line.match(IOS_LINE_REGEX);
      if (match) {
        return {
          isMatch: true,
          date: match[1],
          time: match[2],
          sender: match[3],
          messageText: match[4] !== undefined ? match[4] : match[5],
          isSystem: match[3] === undefined || isSystemMessage(match[3]) || isSystemMessage(match[4] || match[5])
        };
      }
    }
    return { isMatch: false };
  }

  if (effectiveFormat === 'modern_android') {
    if (!line.startsWith('[')) {
      const match = line.match(ANDROID_MODERN_REGEX);
      if (match) {
        return {
          isMatch: true,
          date: match[1],
          time: match[2],
          sender: match[3],
          messageText: match[4] !== undefined ? match[4] : match[5],
          isSystem: match[3] === undefined || isSystemMessage(match[3]) || isSystemMessage(match[4] || match[5])
        };
      }
    }
    return { isMatch: false };
  }

  // legacy_android format
  if (line.startsWith('[')) {
    const match = line.match(IOS_LINE_REGEX);
    if (match) {
      return {
        isMatch: true,
        date: match[1],
        time: match[2],
        sender: match[3],
        messageText: match[4] !== undefined ? match[4] : match[5],
        isSystem: match[3] === undefined || isSystemMessage(match[3]) || isSystemMessage(match[4] || match[5])
      };
    }
  } else {
    const match = line.match(ANDROID_LEGACY_REGEX);
    if (match) {
      return {
        isMatch: true,
        date: match[1],
        time: match[2],
        sender: match[3],
        messageText: match[4] !== undefined ? match[4] : match[5],
        isSystem: match[3] === undefined || isSystemMessage(match[3]) || isSystemMessage(match[4] || match[5])
      };
    }
  }

  return { isMatch: false };
}

/**
 * Parses exported WhatsApp chat text into structured message objects.
 * Supports auto-detection and manual format modes ('auto', 'modern', 'legacy').
 * Prevents forwarded/quoted message excerpts from creating phantom participants.
 */
export function parseWhatsAppChat(text, options = {}) {
  const { mode = 'auto' } = options;
  const detected = detectChatFormat(text);

  let effectiveFormat = detected.format;
  if (mode === 'legacy') {
    effectiveFormat = 'legacy_android';
  } else if (mode === 'modern') {
    effectiveFormat = detected.format === 'modern_ios' ? 'modern_ios' : 'modern_android';
  }

  const isLegacy = effectiveFormat === 'legacy_android';

  const lines = text.split('\n');
  const messages = [];
  let currentMessage = null;
  let lastTimestamp = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    // Strip hidden Unicode directionality marks and normalize non-breaking spaces
    const line = rawLine
      .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
      .replace(/[\u00A0\u202F]/g, ' ')
      .trim();

    if (!line) continue;

    const parsed = parseLine(line, effectiveFormat);

    if (parsed.isMatch) {
      const normDate = normalizeDate(parsed.date);
      const normTime = normalizeTime(parsed.time);
      const candidateTs = getMessageTimestamp(normDate, normTime);

      // Chronological sanity check:
      // If currentMessage exists and candidate timestamp is strictly in the past (by > 60s),
      // this line is an embedded quote/forwarded excerpt from an earlier conversation, NOT a new chat message.
      if (currentMessage && candidateTs !== null && lastTimestamp > 0 && candidateTs < lastTimestamp - 60000) {
        currentMessage.message += '\n' + rawLine;
        continue;
      }

      if (currentMessage) {
        messages.push(currentMessage);
        currentMessage = null;
      }

      if (parsed.isSystem) {
        continue;
      }

      if (candidateTs !== null) {
        lastTimestamp = candidateTs;
      }

      const messageText = parsed.messageText || '';
      const { type, isMedia } = detectMediaType(messageText);

      currentMessage = {
        date: normDate,
        time: normTime,
        sender: parsed.sender.trim(),
        message: messageText,
        type,
        isMedia
      };
    } else {
      if (currentMessage) {
        currentMessage.message += '\n' + rawLine; // Retain original line break formatting
      }
    }
  }

  if (currentMessage) {
    messages.push(currentMessage);
  }

  // Attach metadata properties for flexible consumption (array or object destructuring)
  messages.detectedFormat = detected.format;
  messages.effectiveFormat = effectiveFormat;
  messages.isLegacy = isLegacy;
  messages.messages = messages;

  return messages;
}
