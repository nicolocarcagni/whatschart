/**
 * WhatsApp system event phrases.
 * If a parsed "message" body contains any of these substrings (case-insensitive),
 * the entire line is treated as a system event and excluded from the dataset.
 */
const SYSTEM_MESSAGE_PHRASES = [
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
];

/**
 * Returns true if the message body is a WhatsApp system event
 * rather than genuine user content.
 */
function isSystemMessage(messageText) {
  const lower = messageText.toLowerCase();
  return SYSTEM_MESSAGE_PHRASES.some(phrase => lower.includes(phrase));
}

/**
 * Parses exported WhatsApp chat text into structured message objects.
 * Format expected: [DD/MM/YYYY, HH:MM:SS] SenderName: Message
 * Handles invisible Unicode control characters (e.g. LRM \u200E) and multiline continuations.
 */
export function parseWhatsAppChat(text) {
  const lines = text.split('\n');
  const messages = [];
  
  // Strict format matching: [DD/MM/YYYY, HH:MM:SS] SenderName: Message
  // Strips hidden Unicode directionality marks (\u200E, \u200F, \u202A-\u202E, \u2066-\u2069) common in WhatsApp exports
  const regex = /^\[(\d{2}\/\d{2}\/\d{4}),\s(\d{2}:\d{2}:\d{2})\]\s([^:]+):\s(.*)$/;
  
  let currentMessage = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '').trim();
    
    if (!line) continue;
    
    const match = line.match(regex);
    
    if (match) {
      if (currentMessage) {
        messages.push(currentMessage);
      }
      
      const [, date, time, sender, messageText] = match;

      if (isSystemMessage(messageText)) {
        currentMessage = null;
        continue;
      }
      
      const lowerMessage = messageText.toLowerCase();
      let type = "Text";
      let isMedia = false;
      
      if (lowerMessage.includes("sticker omitted")) {
        type = "Sticker";
        isMedia = true;
      } else if (lowerMessage.includes("image omitted")) {
        type = "Image";
        isMedia = true;
      } else if (lowerMessage.includes("audio omitted")) {
        type = "Audio";
        isMedia = true;
      } else if (lowerMessage.includes("video omitted")) {
        type = "Video";
        isMedia = true;
      }
      
      currentMessage = {
        date,
        time,
        sender: sender.trim(),
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
  
  return messages;
}
