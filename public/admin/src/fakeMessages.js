// src/fakeMessages.js

/* ---------------------------------------------------------------
 * ULID-like generator (ίδιος αλγόριθμος με το MessagingContext)
 * Sortable, μονοτονικό, Couch-friendly.
 * ------------------------------------------------------------- */
export function ulid(now = Date.now()) {
    const t = now.toString(36).toUpperCase().padStart(10, "0");
    const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    let r = "";
    for (let i = 0; i < 16; i++) {
        r += alphabet[(Math.random() * 32) | 0];
    }
    return t + r;
}

/* ---------------------------------------------------------------
 * UUID v4 generator (για cid — conversation id)
 * ------------------------------------------------------------- */
export function uuid() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
}

/* ---------------------------------------------------------------
 * makeMessage — ΑΚΡΙΒΩΣ το schema που στέλνει το MessagingContext:
 *
 * {
 *   _id:  "msg:<cid>:<ULID>",
 *   type: "message",
 *   uid:  "<sender>",
 *   c:    "<content>",
 *   t:    <unix seconds>,
 *   // envelope (routing):
 *   to, cid, system:"chat", cast:"one", domaffect:"*"
 * }
 * ------------------------------------------------------------- */
export function makeMessage({
                                cid,
                                uid,
                                to,
                                c,
                                t = Math.floor(Date.now() / 1000),
                                domaffect = "*",
                            }) {
    return {
        _id: `msg:${cid}:${ulid(t * 1000)}`,
        type: "message",
        uid,
        c,
        t,

        // envelope — ίδιο με το sendChat του MessagingContext
        to,
        cid,
        system: "chat",
        cast: "one",
        domaffect,
    };
}

/* ---------------------------------------------------------------
 * seedConversation — γεμίζει μια συνομιλία με εναλλασσόμενα
 * μηνύματα me/peer, χρονολογικά ταξινομημένα.
 * ------------------------------------------------------------- */
export function seedConversation({
                                     cid = uuid(),
                                     meUid = "a1f3",
                                     peerUid = "b7c9",
                                     n = 8,
                                     startAgo = n * 45, // seconds πριν το now
                                     texts = null,
                                 } = {}) {
    const now = Math.floor(Date.now() / 1000);
    const msgs = [];

    const defaultTexts = [
        "Hey 👋",
        "Hi! How are you?",
        "Doing great, thanks!",
        "Working on the chat UI",
        "Nice — how's it going?",
        "Almost done, sending test now",
        "Looks good 👍",
        "Thanks!",
        "Talk soon",
        "Bye 👋",
    ];

    const pool = texts || defaultTexts;

    for (let i = 0; i < n; i++) {
        const isMine = i % 2 === 1;
        const t = now - (startAgo - i * 45);
        msgs.push(
            makeMessage({
                cid,
                uid: isMine ? meUid : peerUid,
                to: isMine ? peerUid : meUid,
                c: pool[i % pool.length],
                t,
            })
        );
    }

    return msgs;
}

/* ---------------------------------------------------------------
 * seedMultipleConversations — για ChatList testing
 * Επιστρέφει array από { cid, peerUid, peerName, messages }
 * ------------------------------------------------------------- */
export function seedMultipleConversations({
                                              meUid = "a1f3",
                                              peers = [
                                                  { uid: "b7c9", name: "Venus" },
                                                  { uid: "c8d0", name: "Apollo" },
                                                  { uid: "d9e1", name: "Hermes" },
                                              ],
                                              perConv = 6,
                                          } = {}) {
    return peers.map((p) => {
        const cid = uuid();
        return {
            cid,
            peerUid: p.uid,
            peerName: p.name,
            messages: seedConversation({
                cid,
                meUid,
                peerUid: p.uid,
                n: perConv,
            }),
        };
    });
}