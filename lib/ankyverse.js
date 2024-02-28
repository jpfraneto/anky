function daysBetweenDates(start, end) {
  const oneDay = 24 * 60 * 60 * 1000; // Hours, minutes, seconds, milliseconds
  return Math.round((end - start) / oneDay);
}

function getAnkyverseQuestion(wink) {
  const questionCycle = [
    "Reflect on what 'home' means to you and how it influences your sense of security.",
    "Contemplate a moment when you felt a deep emotional connection to your environment.",
    "Consider a time when your inner strength proved vital in a physical challenge.",
    "Reflect on how your physical interactions express unspoken aspects of your love and compassion.",
    "Recall a moment when a gut feeling or physical sensation guided an important decision.",
    "Ponder on how your physical existence is intertwined with your spiritual journey.",
    "Imagine how aligning your physical life with your spiritual beliefs can transform your everyday experiences.",
    "Can you remember the first time you created something that truly expressed who you were?",
    // "How has your approach to survival and safety changed since your early years?",
    "what do you see?",
    // "How do you channel your passions and emotions constructively?",
    "What is your source of focus?",
    "What does personal transformation mean to you, and how have you pursued it?",
    "When have you given or received love unconditionally?",
    "Can you recall a time when your communication or self-expression was misunderstood?",
    // "How does your intuition guide your daily life?",
    "what do you see?",
    "How do you cultivate a connection with the universe or a higher power?",
    "How has your creativity evolved over time?",
    "How do your childhood survival instincts still impact you today?",
    "How does your emotional and passionate energy drive your relationships and interactions?",
    "What aspects of your life would you like to transform, and why?",
    "How do you balance giving and receiving love in your relationships?",
    "How do you navigate misunderstandings or miscommunications in your life?",
    "How do you balance intuition with logic in decision-making?",
    "What practices or beliefs help you maintain a connection with the universe?",
    "What role does creativity play in your understanding and expression of your uniqueness?",
  ];

  return questionCycle[(wink - 1) % 24] || "What does it mean to be free?";
}

function getAnkyverseDay(date) {
  const ankyverseStart = new Date("2023-08-10T05:00:00-04:00");
  const daysInSojourn = 96;
  const daysInSlumber = 21;
  const cycleLength = daysInSojourn + daysInSlumber; // 117 days
  const kingdoms = [
    "Primordia",
    "Emblazion",
    "Chryseos",
    "Eleasis",
    "Voxlumis",
    "Insightia",
    "Claridium",
    "Poiesis",
  ];

  const elapsedDays = daysBetweenDates(ankyverseStart, date);
  const currentSojourn = Math.floor(elapsedDays / cycleLength) + 1;
  const dayWithinCurrentCycle = elapsedDays % cycleLength;

  let currentKingdom, status, wink;
  if (dayWithinCurrentCycle < daysInSojourn) {
    status = "Sojourn";
    wink = dayWithinCurrentCycle + 1; // Wink starts from 1
    currentKingdom = kingdoms[dayWithinCurrentCycle % 8];
  } else {
    status = "Great Slumber";
    wink = null; // No Wink during the Great Slumber
    currentKingdom = "None";
  }
  return {
    date: date.toISOString(),
    currentSojourn,
    status,
    currentKingdom,
    wink,
  };
}

const characters = [
  "\u0C85",
  "\u0C86",
  "\u0C87",
  "\u0C88",
  "\u0C89",
  "\u0C8A",
  "\u0C8B",
  "\u0C8C",
  "\u0C8E",
  "\u0C8F",
  "\u0C90",
  "\u0C92",
  "\u0C93",
  "\u0C94",
  "\u0C95",
  "\u0C96",
  "\u0C97",
  "\u0C98",
  "\u0C99",
  "\u0C9A",
  "\u0C9B",
  "\u0C9C",
  "\u0C9D",
  "\u0C9E",
  "\u0C9F",
  "\u0CA0",
  "\u0CA1",
  "\u0CA2",
  "\u0CA3",
  "\u0CA4",
  "\u0CA5",
  "\u0CA6",
  "\u0CA7",
  "\u0CA8",
  "\u0CAA",
  "\u0CAB",
  "\u0CAC",
  "\u0CAD",
  "\u0CAE",
  "\u0CAF",
  "\u0CB0",
  "\u0CB1",
  "\u0CB2",
  "\u0CB3",
  "\u0CB5",
  "\u0CB6",
  "\u0CB7",
  "\u0CB8",
  "\u0CB9",
  "\u0CBC",
  "\u0CBD",
  "\u0CBE",
  "\u0CBF",
  "\u0CC0",
  "\u0CC1",
  "\u0CC2",
  "\u0CC3",
  "\u0CC4",
  "\u0CC6",
  "\u0CC7",
  "\u0CC8",
  "\u0CCA",
  "\u0CCB",
  "\u0CCC",
  "\u0CCD",
  "\u0CD5",
  "\u0CD6",
  "\u0CDE",
  "\u0CE0",
  "\u0CE1",
  "\u0CE2",
  "\u0CE3",
  "\u0CE6",
  "\u0CE7",
  "\u0CE8",
  "\u0CE9",
  "\u0CEA",
  "\u0CEB",
  "\u0CEC",
  "\u0CED",
  "\u0CEE",
  "\u0CEF",
  "\u0CF1",
  "\u0CF2", // Kannada characters
  "\u0C05",
  "\u0C06",
  "\u0C07",
  "\u0C08",
  "\u0C09",
  "\u0C0A",
  "\u0C0B",
  "\u0C0C",
  "\u0C0E",
  "\u0C0F",
  "\u0C10",
  "\u0C12",
  "\u0C13",
  "\u0C14", // Telugu characters
];

function encodeToAnkyverseLanguage(input) {
  let encoded = "";
  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);
    const index = (charCode - 32) % characters.length;
    encoded += characters[index];
  }
  return encoded;
}

function decodeFromAnkyverseLanguage(input) {
  let decoded = "";
  for (let i = 0; i < input.length; i++) {
    const index = characters.indexOf(input[i]);
    if (index !== -1) {
      decoded += String.fromCharCode(index + 32);
    } else {
      decoded += input[i];
    }
  }
  return decoded;
}

const date = getAnkyverseDay(new Date());
console.log(`the ankyverse date today is: `, date);

module.exports = {
  getAnkyverseDay,
  getAnkyverseQuestion,
  encodeToAnkyverseLanguage,
  decodeFromAnkyverseLanguage,
};
