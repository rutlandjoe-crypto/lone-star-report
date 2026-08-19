const fs = require("fs");
const https = require("https");
const http = require("http");

const OUTPUT = "public/latest_report.json";
const STATUS_OUTPUT = "public/source_status.json";

const MAX_PER_SOURCE = 5;
const MAX_TOTAL = 50;
const MIN_WORKING_SOURCES = 4;

const SOURCES = [
  {
    name: "The Texas Tribune",
    url: "https://feeds.texastribune.org/feeds/main/",
    region: "Statewide",
    type: "straight-news"
  },
  {
    name: "KUT",
    url: "https://www.kut.org/index.rss",
    region: "Central Texas",
    type: "public-media"
  },
  {
    name: "KERA",
    url: "https://www.keranews.org/index.rss",
    region: "North Texas",
    type: "public-media"
  },
  {
    name: "Houston Public Media",
    url: "https://www.houstonpublicmedia.org/feed/",
    region: "Houston / Gulf Coast",
    type: "public-media"
  },
  {
    name: "Texas Public Radio",
    url: "https://www.tpr.org/index.rss",
    region: "San Antonio / South Central Texas",
    type: "public-media"
  },
  {
    name: "San Antonio Report",
    url: "https://sanantonioreport.org/feed/",
    region: "San Antonio",
    type: "nonprofit-news"
  },
  {
    name: "El Paso Matters",
    url: "https://elpasomatters.org/feed/",
    region: "El Paso / Border",
    type: "nonprofit-news"
  },
  {
    name: "Marfa Public Radio",
    url: "https://www.marfapublicradio.org/index.rss",
    region: "Far West Texas",
    type: "public-media"
  },
  {
    name: "High Plains Public Radio",
    url: "https://www.hppr.org/index.rss",
    region: "Panhandle / High Plains",
    type: "public-media"
  },
  {
    name: "Laredo Morning Times",
    url: "https://www.lmtonline.com/default/feed/news/",
    region: "Laredo / South Texas Border",
    type: "straight-news"
  }
];

const BLOCKED_PHRASES = [
  "opinion",
  "commentary",
  "editorial:",
  "editorial ",
  "letters to the editor",
  "letter to the editor",
  "guest column",
  "guest commentary",
  "sponsored",
  "advertisement",
  "advertorial",
  "paid content",
  "brand studio",
  "horoscope",
  "crossword"
];

const POLITICS_TERMS = [
  "abbott",
  "dan patrick",
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
  "voting",
  "republican",
  "democrat",
  "state representative",
  "state senator"
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
  "workforce",
  "property",
  "construction",
  "industry"
];

const SPORTS_TERMS = [
  "cowboys",
  "texans",
  "astros",
  "rangers",
  "mavericks",
  "rockets",
  "spurs",
  "nfl",
  "mlb",
  "nba",
  "college football",
  "high school football",
  "longhorns",
  "aggies",
  "red raiders",
  "horned frogs",
  "mustangs",
  "cougars",
  "utsa",
  "utep",
  "baylor",
  "smu",
  "tcu",
  "texas tech"
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
  const escaped = tag.replace(":", "\\:");
  const pattern = new RegExp(
    `<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`,
    "i"
  );

  const match = block.match(pattern);
  return match ? decodeEntities(match[1]) : "";
}

function extractLink(block) {
  const rssLink = extractTag(block, "link");

  if (rssLink.startsWith("http")) {
    return rssLink;
  }

  const atomMatch = block.match(
    /<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i
  );

  if (atomMatch && atomMatch[1].startsWith("http")) {
    return decodeEntities(atomMatch[1]);
  }

  const guid = extractTag(block, "guid");

  if (guid.startsWith("http")) {
    return guid;
  }

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

function isBlocked(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  return BLOCKED_PHRASES.some(
    phrase => text.includes(phrase)
  );
}

function isPublishable(title, url, description) {
  if (!title) return false;
  if (!url) return false;
  if (!url.startsWith("http")) return false;
  if (isBlocked(title, description)) return false;

  return true;
}

function fetchText(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) {
      reject(new Error("Too many redirects"));
      return;
    }

    const transport = url.startsWith("https:")
      ? https
      : http;

    const request = transport.get(
      url,
      {
        headers: {
          "User-Agent":
            "GSR-Lone-Star-Report/1.0 Texas journalism aggregator"
        }
      },
      response => {
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          const redirectUrl = new URL(
            response.headers.location,
            url
          ).toString();

          response.resume();

          resolve(
            fetchText(redirectUrl, redirects + 1)
          );

          return;
        }

        if (response.statusCode !== 200) {
          response.resume();

          reject(
            new Error(
              `HTTP ${response.statusCode}`
            )
          );

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
        new Error("Request timeout")
      );
    });

    request.on("error", reject);
  });
}

function parseFeed(xml, source) {
  let blocks =
    xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

  if (!blocks.length) {
    blocks =
      xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];
  }

  return blocks
    .map(block => {
      const title = extractTag(block, "title");

      const description =
        extractTag(block, "description") ||
        extractTag(block, "summary") ||
        extractTag(block, "content");

      const url = extractLink(block);

      const published =
        extractTag(block, "pubDate") ||
        extractTag(block, "published") ||
        extractTag(block, "updated") ||
        extractTag(block, "dc:date");

      return {
        headline: title,
        title,
        url,
        source: source.name,
        source_type: source.type,
        region: source.region,
        published_at: published,
        section: classify(title, description)
      };
    })
    .filter(story =>
      isPublishable(
        story.title,
        story.url,
        ""
      )
    );
}

function uniqueStories(stories) {
  const seenUrls = new Set();
  const seenTitles = new Set();

  return stories.filter(story => {
    const urlKey = story.url.toLowerCase();

    const titleKey = story.title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (seenUrls.has(urlKey)) return false;
    if (seenTitles.has(titleKey)) return false;

    seenUrls.add(urlKey);
    seenTitles.add(titleKey);

    return true;
  });
}

function validDate(value) {
  const time = Date.parse(value || "");
  return Number.isFinite(time) ? time : 0;
}

async function main() {
  const gathered = [];
  const sourceStatus = [];

  for (const source of SOURCES) {
    process.stdout.write(
      `Fetching ${source.name} (${source.region}) ... `
    );

    try {
      const xml = await fetchText(source.url);

      const stories = parseFeed(xml, source)
        .sort(
          (a, b) =>
            validDate(b.published_at) -
            validDate(a.published_at)
        )
        .slice(0, MAX_PER_SOURCE);

      if (!stories.length) {
        throw new Error(
          "feed returned no publishable stories"
        );
      }

      console.log(`${stories.length} accepted`);

      gathered.push(...stories);

      sourceStatus.push({
        source: source.name,
        region: source.region,
        url: source.url,
        status: "working",
        accepted: stories.length
      });
    } catch (error) {
      console.log(`FAILED: ${error.message}`);

      sourceStatus.push({
        source: source.name,
        region: source.region,
        url: source.url,
        status: "failed",
        error: error.message
      });
    }
  }

  const workingSources = sourceStatus.filter(
    source => source.status === "working"
  );

  fs.writeFileSync(
    STATUS_OUTPUT,
    JSON.stringify(
      {
        checked_at: new Date().toISOString(),
        minimum_required: MIN_WORKING_SOURCES,
        working_sources: workingSources.length,
        sources: sourceStatus
      },
      null,
      2
    ),
    "utf8"
  );

  console.log("");
  console.log(
    `Working Texas sources: ${workingSources.length}/${SOURCES.length}`
  );

  if (
    workingSources.length <
    MIN_WORKING_SOURCES
  ) {
    throw new Error(
      `Only ${workingSources.length} Texas sources worked. ` +
      `Minimum is ${MIN_WORKING_SOURCES}. ` +
      `No commit should be made.`
    );
  }

  const stories = uniqueStories(gathered)
    .sort(
      (a, b) =>
        validDate(b.published_at) -
        validDate(a.published_at)
    )
    .slice(0, MAX_TOTAL);

  if (!stories.length) {
    throw new Error(
      "No verified Texas stories collected."
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

  const regionCounts = {};

  for (const story of stories) {
    regionCounts[story.region] =
      (regionCounts[story.region] || 0) + 1;
  }

  const sourceCounts = {};

  for (const story of stories) {
    sourceCounts[story.source] =
      (sourceCounts[story.source] || 0) + 1;
  }

  const report = {
    platform: "GSR Lone Star Report",

    generated_at:
      new Date().toISOString(),

    editorial_standard:
      "Journalistic integrity first. Straight-news, nonprofit-news and public-media sources only.",

    sourcing_policy:
      "Original source headlines and URLs are preserved. Opinion, commentary, sponsored content and unsupported material are excluded.",

    diversity_policy:
      `Maximum ${MAX_PER_SOURCE} homepage stories per source in this source-network pass.`,

    working_source_count:
      workingSources.length,

    source_counts:
      sourceCounts,

    region_counts:
      regionCounts,

    homepage_cards:
      stories,

    sections:
      sections
  };

  fs.writeFileSync(
    OUTPUT,
    JSON.stringify(
      report,
      null,
      2
    ),
    "utf8"
  );

  console.log("");
  console.log(
    `Wrote ${stories.length} verified Texas stories.`
  );

  console.log("");

  for (
    const [source, count]
    of Object.entries(sourceCounts)
  ) {
    console.log(
      `${source}: ${count}`
    );
  }

  console.log("");
  console.log("SECTION COUNTS");

  for (
    const [section, items]
    of Object.entries(sections)
  ) {
    console.log(
      `${section}: ${items.length}`
    );
  }
}

main().catch(error => {
  console.error("");
  console.error(
    `SOURCE NETWORK FAILED: ${error.message}`
  );

  process.exit(1);
});