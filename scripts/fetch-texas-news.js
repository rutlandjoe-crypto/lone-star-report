const fs = require("fs");
const https = require("https");

const OUTPUT = "public/latest_report.json";

const SOURCES = [
  {
    name: "The Texas Tribune",
    url: "https://feeds.texastribune.org/feeds/main/",
    type: "straight-news",
    scope: "statewide"
  }
];

const BLOCKED_TITLE_PHRASES = [
  "opinion",
  "commentary",
  "editorial",
  "letters to the editor",
  "podcast",
  "tribcast",
  "sponsored",
  "advertisement"
];

const POLITICS_TERMS = [
  "abbott",
  "patrick",
  "paxton",
  "legislature",
  "legislative",
  "capitol",
  "election",
  "campaign",
  "senate",
  "house",
  "congress",
  "governor",
  "attorney general",
  "redistrict",
  "primary",
  "ballot",
  "voting"
];

const BUSINESS_TERMS = [
  "business",
  "economy",
  "economic",
  "jobs",
  "company",
  "companies",
  "energy",
  "ercot",
  "oil",
  "gas",
  "real estate",
  "housing",
  "development",
  "data center",
  "technology",
  "investment",
  "employer",
  "workforce"
];

const SPORTS_TERMS = [
  "cowboys",
  "texans",
  "astros",
  "rangers",
  "mavericks",
  "rockets",
  "spurs",
  "football",
  "baseball",
  "basketball",
  "nfl",
  "mlb",
  "nba",
  "college football",
  "high school football"
];

function decodeEntities(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block, tag) {
  const pattern = new RegExp(
    `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
    "i"
  );

  const match = block.match(pattern);
  return match ? decodeEntities(match[1]) : "";
}

function extractLink(block) {
  const direct = extractTag(block, "link");
  if (direct.startsWith("http")) return direct;

  const guid = extractTag(block, "guid");
  if (guid.startsWith("http")) return guid;

  return "";
}

function classify(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  if (SPORTS_TERMS.some(term => text.includes(term))) {
    return "State Sports";
  }

  if (POLITICS_TERMS.some(term => text.includes(term))) {
    return "State Politics";
  }

  if (BUSINESS_TERMS.some(term => text.includes(term))) {
    return "State Business";
  }

  return "State News";
}

function isPublishable(title, url) {
  if (!title || !url) return false;

  const lower = title.toLowerCase();

  return !BLOCKED_TITLE_PHRASES.some(
    phrase => lower.includes(phrase)
  );
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "GSR-Lone-Star-Report/1.0 (+news aggregation; source links preserved)"
        }
      },
      response => {
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          response.resume();
          return resolve(fetchText(response.headers.location));
        }

        if (response.statusCode !== 200) {
          reject(
            new Error(
              `HTTP ${response.statusCode} fetching ${url}`
            )
          );
          response.resume();
          return;
        }

        let data = "";

        response.setEncoding("utf8");

        response.on("data", chunk => {
          data += chunk;
        });

        response.on("end", () => {
          resolve(data);
        });
      }
    );

    request.setTimeout(20000, () => {
      request.destroy(
        new Error(`Timeout fetching ${url}`)
      );
    });

    request.on("error", reject);
  });
}

function parseRss(xml, source) {
  const itemRegex = /<item\b[\s\S]*?<\/item>/gi;
  const items = xml.match(itemRegex) || [];

  return items
    .map(block => {
      const title = extractTag(block, "title");
      const url = extractLink(block);
      const published =
        extractTag(block, "pubDate") ||
        extractTag(block, "dc:date");
      const description =
        extractTag(block, "description");

      return {
        headline: title,
        title,
        url,
        source: source.name,
        source_type: source.type,
        source_scope: source.scope,
        published_at: published,
        section: classify(title, description)
      };
    })
    .filter(story =>
      isPublishable(story.title, story.url)
    );
}

function uniqueStories(stories) {
  const seen = new Set();

  return stories.filter(story => {
    const key = `${story.title}|${story.url}`.toLowerCase();

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

async function main() {
  const gathered = [];

  for (const source of SOURCES) {
    console.log(`Fetching: ${source.name}`);

    try {
      const xml = await fetchText(source.url);
      const stories = parseRss(xml, source);

      console.log(
        `Accepted ${stories.length} publishable items from ${source.name}`
      );

      gathered.push(...stories);
    } catch (error) {
      console.error(
        `Source failed: ${source.name}: ${error.message}`
      );
    }
  }

  const stories = uniqueStories(gathered)
    .sort((a, b) => {
      const ad = Date.parse(a.published_at || "") || 0;
      const bd = Date.parse(b.published_at || "") || 0;

      return bd - ad;
    })
    .slice(0, 30);

  if (!stories.length) {
    throw new Error(
      "No verified Texas stories were collected. No fallback content will be invented."
    );
  }

  const sections = {
    "State News": [],
    "State Politics": [],
    "State Business": [],
    "State Sports": []
  };

  for (const story of stories) {
    if (!sections[story.section]) {
      sections[story.section] = [];
    }

    sections[story.section].push(story);
  }

  const report = {
    platform: "GSR Lone Star Report",
    generated_at: new Date().toISOString(),
    editorial_standard:
      "Journalistic integrity first. Straight-news and authoritative sources only.",
    sourcing_policy:
      "Source headlines and URLs are preserved. No fabricated summaries, facts or links.",
    homepage_cards: stories,
    sections
  };

  fs.writeFileSync(
    OUTPUT,
    JSON.stringify(report, null, 2),
    "utf8"
  );

  console.log("");
  console.log(`Wrote ${stories.length} verified stories to ${OUTPUT}`);

  for (const [section, items] of Object.entries(sections)) {
    console.log(`${section}: ${items.length}`);
  }
}

main().catch(error => {
  console.error("");
  console.error(error.message);
  process.exit(1);
});