const fs = require("fs");

const REPORT = "public/latest_report.json";

if (!fs.existsSync(REPORT)) {
  throw new Error("latest_report.json not found");
}

const report = JSON.parse(
  fs.readFileSync(REPORT, "utf8")
);

const texasSignals = [
  "texas",
  "houston",
  "dallas",
  "fort worth",
  "austin",
  "san antonio",
  "el paso",
  "beaumont",
  "amarillo",
  "lubbock",
  "waco",
  "corpus christi",
  "laredo",
  "mcallen",
  "rio grande valley",
  "midland",
  "odessa",
  "permian",
  "bexar",
  "harris county",
  "travis county",
  "tarrant county",
  "dallas county",
  "el paso county",
  "ercot",
  "tceq",
  "texas legislature",
  "texas senate",
  "texas house",
  "greg abbott",
  "dan patrick",
  "ken paxton",
  "texas supreme court",
  "texas comptroller",
  "texas workforce",
  "texas education agency",
  "texas parks and wildlife",
  "border",
  "big bend"
];

const opinionSignals = [
  "opinion:",
  "editorial:",
  "commentary:",
  "column:",
  "letters to the editor",
  "guest column",
  "our view",
  "endorsement",
  "bias is hindering journalism"
];

const businessSignals = [
  "business",
  "economy",
  "economic",
  "jobs",
  "employment",
  "company",
  "companies",
  "corporate",
  "industry",
  "bank",
  "banking",
  "finance",
  "financial",
  "market",
  "retail",
  "development",
  "real estate",
  "housing",
  "energy",
  "oil",
  "gas",
  "electricity",
  "ercot",
  "port",
  "shipping",
  "trade",
  "investment",
  "manufacturing",
  "construction",
  "workforce",
  "revenue",
  "earnings",
  "tax",
  "spending",
  "comptroller"
];

const politicsSignals = [
  "governor",
  "lieutenant governor",
  "attorney general",
  "legislature",
  "lawmakers",
  "senate",
  "house",
  "election",
  "campaign",
  "ballot",
  "voters",
  "republican",
  "democrat",
  "abbott",
  "patrick",
  "paxton",
  "state government",
  "bill",
  "law",
  "school district",
  "state board"
];

const nflSignals = [
  "dallas cowboys",
  "cowboys",
  "houston texans"
];

const mlbSignals = [
  "houston astros",
  "astros",
  "texas rangers"
];

const nbaSignals = [
  "san antonio spurs",
  "spurs",
  "wembanyama",
  "wemby",
  "dallas mavericks",
  "mavericks",
  "mavs",
  "houston rockets"
];

const collegeTeams = [
  "texas longhorns",
  "longhorns",
  "texas a&m",
  "aggies",
  "texas tech",
  "red raiders",
  "tcu",
  "horned frogs",
  "baylor",
  "smu",
  "mustangs",
  "houston cougars",
  "rice owls",
  "utsa",
  "utep",
  "north texas",
  "mean green",
  "sam houston",
  "texas state"
];

const footballSignals = [
  "football",
  "quarterback",
  "qb",
  "wide receiver",
  "receiver",
  "running back",
  "linebacker",
  "defensive back",
  "defensive end",
  "offensive line",
  "edge rusher",
  "touchdown",
  "recruit",
  "commit",
  "transfer portal",
  "kickoff",
  "playoff"
];
function textOf(story) {
  return [
    story.headline,
    story.title,
    story.description
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function hasAny(text, terms) {
  return terms.some(term =>
    text.includes(term)
  );
}

function normalizeText(value) {
  return String(value || "")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€™/g, "'")
    .replace(/â€˜/g, "'")
    .replace(/â€“/g, "-")
    .replace(/â€”/g, "-")
    .trim();
}

function normalizeStory(story) {
  return {
    ...story,
    headline: normalizeText(story.headline),
    title: story.title
      ? normalizeText(story.title)
      : story.title,
    description: story.description
      ? normalizeText(story.description)
      : story.description
  };
}

function hasTexasSignal(text) {
  return hasAny(text, texasSignals);
}

function isOpinion(text) {
  return hasAny(text, opinionSignals);
}

function dedicatedSportsFeedCheck(story, text) {
  const source =
    String(story.source || "")
      .toLowerCase();

  if (source.includes("texans desk")) {
    return hasAny(text, nflSignals.filter(x =>
      x.includes("texans")
    ));
  }

  if (source.includes("cowboys desk")) {
    return text.includes("cowboys");
  }

  if (source.includes("astros desk")) {
    return text.includes("astros");
  }

  if (source.includes("rangers desk")) {
    return text.includes("texas rangers");
  }

  if (source.includes("rockets desk")) {
    return text.includes("houston rockets") ||
           text.includes("rockets");
  }

  if (source.includes("mavericks desk")) {
    return text.includes("mavericks") ||
           text.includes("mavs");
  }

  if (source.includes("spurs desk")) {
    return text.includes("spurs") ||
           text.includes("wembanyama") ||
           text.includes("wemby");
  }

  if (source.includes("high school football")) {
    return (
      text.includes("high school football") ||
      text.includes("uil football")
    ) &&
    hasTexasSignal(text);
  }

  if (source.includes("on3 - texas longhorns")) {
    return (
      text.includes("texas") ||
      text.includes("longhorns")
    ) &&
    hasAny(text, footballSignals);
  }

  if (source.includes("on3 - texas a&m")) {
    return (
      text.includes("texas a&m") ||
      text.includes("aggies")
    ) &&
    hasAny(text, footballSignals);
  }

  if (source.includes("on3 - texas tech")) {
    return (
      text.includes("texas tech") ||
      text.includes("red raiders")
    ) &&
    hasAny(text, footballSignals);
  }

  if (source.includes("on3 - tcu")) {
    return (
      text.includes("tcu") ||
      text.includes("horned frogs")
    ) &&
    hasAny(text, footballSignals);
  }

  if (source.includes("on3 - baylor")) {
    return text.includes("baylor") &&
           hasAny(text, footballSignals);
  }

  if (source.includes("on3 - smu")) {
    return (
      text.includes("smu") ||
      text.includes("mustangs")
    ) &&
    hasAny(text, footballSignals);
  }

  if (source.includes("on3 - houston cougars")) {
    return (
      text.includes("houston") ||
      text.includes("cougars")
    ) &&
    hasAny(text, footballSignals);
  }

  return null;
}

function allowStory(story, section) {
  const text = textOf(story);

  if (!text.trim()) {
    return false;
  }

  if (isOpinion(text)) {
    return false;
  }

  if (section === "State Sports") {
    const dedicated =
      dedicatedSportsFeedCheck(
        story,
        text
      );

    if (dedicated !== null) {
      return dedicated;
    }

    if (hasAny(text, nflSignals)) {
      return true;
    }

    if (hasAny(text, mlbSignals)) {
      return true;
    }

    if (hasAny(text, nbaSignals)) {
      return true;
    }

    if (
      hasAny(text, collegeTeams) &&
      hasAny(text, footballSignals)
    ) {
      return true;
    }

    if (
      text.includes("high school football") &&
      hasTexasSignal(text)
    ) {
      return true;
    }

    return false;
  }

  if (section === "State Business") {
    const authoritative =
      String(story.source || "")
        .toLowerCase();

    if (
      authoritative.includes("texas comptroller") ||
      authoritative.includes("dallas fed")
    ) {
      return true;
    }

    return (
      hasTexasSignal(text) &&
      hasAny(text, businessSignals)
    );
  }

  if (section === "State Politics") {
    return (
      hasTexasSignal(text) &&
      hasAny(text, politicsSignals)
    );
  }

  if (section === "State News") {
    return hasTexasSignal(text);
  }

  return false;
}

const removed = [];

for (const section of [
  "State News",
  "State Politics",
  "State Business",
  "State Sports"
]) {
  const original =
    report.sections?.[section] || [];

  const cleaned = [];

  for (const rawStory of original) {
    const story =
      normalizeStory(rawStory);

    if (allowStory(story, section)) {
      cleaned.push(story);
    }
    else {
      removed.push({
        section,
        source: story.source,
        headline: story.headline
      });
    }
  }

  report.sections[section] =
    cleaned;
}

// Rebuild homepage_cards from the cleaned sections
// if that field exists in the report.

if (Array.isArray(report.homepage_cards)) {
  const validUrls =
    new Set(
      Object.values(report.sections)
        .flat()
        .map(story => story.url)
        .filter(Boolean)
    );

  report.homepage_cards =
    report.homepage_cards
      .map(normalizeStory)
      .filter(story =>
        !story.url ||
        validUrls.has(story.url)
      );
}

fs.writeFileSync(
  REPORT,
  JSON.stringify(
    report,
    null,
    2
  ) + "\n",
  "utf8"
);

console.log("");
console.log(
  "FINAL EDITORIAL GATE"
);

for (const section of [
  "State News",
  "State Politics",
  "State Business",
  "State Sports"
]) {
  console.log(
    `${section}: ${report.sections[section].length}`
  );
}

console.log(
  `Removed as off-topic/opinion: ${removed.length}`
);

console.log("");

for (const item of removed.slice(0, 40)) {
  console.log(
    `REJECTED | ${item.section} | ${item.source} | ${item.headline}`
  );
}