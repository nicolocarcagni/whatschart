import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseWhatsAppChat } from '../src/utils/parser.js';
import { computeAllAnalytics } from '../src/utils/analytics.js';

describe('WhatsApp Chat Parser - Pasted Chat Logs', () => {
  it('should treat pasted chat log as single message and not create phantom participants', () => {
    const rawChat = `[15/08/2026, 00:52:57] pisolo: [15/08/26, 00:50:28] Rakazzo Serf: Ehi
 [15/08/26, 00:50:37] Eli: eii
 [15/08/26, 00:50:53] Rakazzo Serf: Io balda Chris Luca Le Torre e la sorella di le stiamo facendo un giro a santa cate siamo appena arrivati il treno di trovare parcheggio
 [15/08/26, 00:51:01] Rakazzo Serf: Ti serve passaggio? Vuoi farti un giro?
 [15/08/26, 00:51:02] Eli: boooh
 [15/08/26, 00:51:09] Eli: no ormai no
 [15/08/26, 00:51:16] Eli: mi fa piacere che ho chiesto e nessuno voleva
 [15/08/26, 00:51:17] Eli: vabbuo
 [15/08/26, 00:51:42] Rakazzo Serf: Che se mo siamo arrivati
 [15/08/26, 00:51:57] Eli: si vi ho scritto sul gruppo se uscivamo qua e nessuno voleva
 [15/08/26, 00:51:58] Eli: vabbe.`;

    const messages = parseWhatsAppChat(rawChat);

    // 1. messages.length must be exactly 1
    assert.strictEqual(messages.length, 1, 'Expected exactly 1 message');

    // 2. Only sender is pisolo
    assert.strictEqual(messages[0].sender, 'pisolo');
    assert.strictEqual(messages[0].date, '15/08/2026');
    assert.strictEqual(messages[0].time, '00:52:57');

    // 3. The entire pasted conversation is preserved in message body
    assert.ok(messages[0].message.includes('Rakazzo Serf: Ehi'));
    assert.ok(messages[0].message.includes('Eli: vabbe.'));

    // 4. Analytics: only legitimate participants
    const analytics = computeAllAnalytics(messages);
    assert.strictEqual(analytics.stats.totalParticipants, 1);
    assert.strictEqual(analytics.participantsMeta.allParticipants.length, 1);
    assert.strictEqual(analytics.participantsMeta.allParticipants[0].name, 'pisolo');
  });

  it('should correctly close the pasted block when a subsequent real message arrives', () => {
    const rawChat = `[15/08/2026, 00:50:00] Marco: ciao a tutti
[15/08/2026, 00:52:57] pisolo: [15/08/26, 00:50:28] Rakazzo Serf: Ehi
 [15/08/26, 00:50:37] Eli: eii
 [15/08/26, 00:51:58] Eli: vabbe.
[15/08/2026, 00:53:10] Mario: ahahah ma davvero?`;

    const messages = parseWhatsAppChat(rawChat);

    assert.strictEqual(messages.length, 3, 'Expected 3 real messages');
    assert.strictEqual(messages[0].sender, 'Marco');
    assert.strictEqual(messages[1].sender, 'pisolo');
    assert.strictEqual(messages[2].sender, 'Mario');
    assert.strictEqual(messages[2].message, 'ahahah ma davvero?');

    const analytics = computeAllAnalytics(messages);
    assert.strictEqual(analytics.stats.totalParticipants, 3);
    const participantNames = analytics.participantsMeta.allParticipants.map((p) => p.name);
    assert.deepStrictEqual(participantNames.sort(), ['Marco', 'Mario', 'pisolo'].sort());
  });

  it('should handle pasted chat log with introductory text on first line', () => {
    const rawChat = `[15/08/2026, 00:52:57] pisolo: Guardate cosa si dicevano:
[15/08/26, 00:50:28] Rakazzo Serf: Ehi
 [15/08/26, 00:50:37] Eli: eii
 [15/08/26, 00:51:58] Eli: vabbe.
[15/08/2026, 00:55:00] Mario: assurdo`;

    const messages = parseWhatsAppChat(rawChat);

    assert.strictEqual(messages.length, 2, 'Expected 2 messages (pisolo and Mario)');
    assert.strictEqual(messages[0].sender, 'pisolo');
    assert.ok(messages[0].message.includes('Guardate cosa si dicevano:'));
    assert.ok(messages[0].message.includes('Rakazzo Serf: Ehi'));
    assert.strictEqual(messages[1].sender, 'Mario');

    const analytics = computeAllAnalytics(messages);
    assert.strictEqual(analytics.stats.totalParticipants, 2);
  });

  it('should handle Android chat log pasted into Android conversation', () => {
    const rawChat = `15/08/2026, 10:00 - Alice: 15/08/2026, 09:30 - Bob: Incontro alle 11
 15/08/2026, 09:35 - Charlie: Va bene
15/08/2026, 10:05 - David: Ricevuto`;

    const messages = parseWhatsAppChat(rawChat);

    assert.strictEqual(messages.length, 2, 'Expected 2 messages (Alice and David)');
    assert.strictEqual(messages[0].sender, 'Alice');
    assert.ok(messages[0].message.includes('Bob: Incontro alle 11'));
    assert.ok(messages[0].message.includes('Charlie: Va bene'));
    assert.strictEqual(messages[1].sender, 'David');

    const analytics = computeAllAnalytics(messages);
    assert.strictEqual(analytics.stats.totalParticipants, 2);
    const participantNames = analytics.participantsMeta.allParticipants.map((p) => p.name);
    assert.deepStrictEqual(participantNames.sort(), ['Alice', 'David'].sort());
  });
});
