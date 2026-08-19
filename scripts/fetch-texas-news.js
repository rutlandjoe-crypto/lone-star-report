const fs = require("fs");
const https = require("https");
const http = require("http");

const OUTPUT = "public/latest_report.json";
const STATUS_OUTPUT = "public/source_status.json";

const MAX_PER_SOURCE = 6;
const MAX_TOTAL = 80;
const MIN_WORKING_SOURCES = 5;

function googleNewsSiteFeed(domain, extra = "") {
  const query = `site:${domain} ${extra} when:3d`.trim();

  return (
    "https://news.google.com/rss/search?q=" +
    encodeURIComponent(query) +
    "&hl=en-US&gl=US&ceid=US:en"
  );
}

const SOURCES = [
  // ----------------------------------------------------------
  // KNOWN DIRECT TEXAS NEWS FEEDS
  // ----------------------------------------------------------
  {
    name: "The Texas Tribune",
    url: "https://feeds.texastribune.org/feeds/main/",
    region: "Statewide",
    type: "straight-news",
    mode: "direct"
  },
  {
    name: "Houston Public Media",
    url: "https://www.houstonpublicmedia.org/feed/",
    region: "Houston / Gulf Coast",
    type: "public-media",
    mode: "direct"
  },
  {
    name: "Texas Public Radio",
    url: "https://www.tpr.org/index.rss",
    region: "San Antonio / South Central Texas",
    type: "public-media",
    mode: "direct"
  },
  {
    name: "San Antonio Report",
    url: "https://sanantonioreport.org/feed/",
    region: "San Antonio",
    type: "nonprofit-news",
    mode: "direct"
  },
  {
    name: "El Paso Matters",
    url: "https://elpasomatters.org/feed/",
    region: "El Paso / Border",
    type: "nonprofit-news",
    mode: "direct"
  },

  // ----------------------------------------------------------
  // REQUIRED TEXAS METRO NEWSPAPERS
  // Google News is discovery only.
  // Attribution must match the requested newsroom.
  // ----------------------------------------------------------
  {
    name: "Houston Chronicle",
    url: googleNewsSiteFeed("houstonchronicle.com"),
    region: "Houston / Gulf Coast",
    type: "straight-news",
    mode: "discovery",
    requiredSourceMatch: ["Houston Chronicle"]
  },
  {
    name: "The Dallas Morning News",
    url: googleNewsSiteFeed("dallasnews.com"),
    region: "North Texas / DFW",
    type: "straight-news",
    mode: "discovery",
    requiredSourceMatch: [
      "The Dallas Morning News",
      "Dallas Morning News"
    ]
  },
  {
    name: "Beaumont Enterprise",
    url: googleNewsSiteFeed("beaumontenterprise.com"),
    region: "Southeast Texas / Beaumont",
    type: "straight-news",
    mode: "discovery",
    requiredSourceMatch: ["Beaumont Enterprise"]
  },
  {
    name: "Austin American-Statesman",
    url: googleNewsSiteFeed("statesman.com"),
    region: "Austin / Central Texas",
    type: "straight-news",
    mode: "discovery",
    requiredSourceMatch: [
      "Austin American-Statesman",
      "Austin American Statesman"
    ]
  },
  {
    name: "El Paso Times",
    url: googleNewsSiteFeed("elpasotimes.com"),
    region: "El Paso / West Texas",
    type: "straight-news",
    mode: "discovery",
    requiredSourceMatch: ["El Paso Times"]
  },
  {
    name: "San Antonio Express-News",
    url: googleNewsSiteFeed("expressnews.com"),
    region: "San Antonio / South Central Texas",
    type: "straight-news",
    mode: "discovery",
    requiredSourceMatch: [
      "San Antonio Express-News",
      "Express-News"
    ]
  },

  // ----------------------------------------------------------
  // TEXAS FOOTBALL
  // SPORTS ONLY
  // ----------------------------------------------------------
  {
    name: "Dave Campbell's Texas Football",
    url: googleNewsSiteFeed("texasfootball.com", "football"),
    region: "Statewide",
    type: "sports-specialty",
    mode: "discovery",
    forceSection: "State Sports",
    sportDesk: "Texas Football",
    requiredSourceMatch: [
      "Dave Campbell's Texas Football",
      "Texas Football"
    ]
  },

  // ----------------------------------------------------------
  // ON3 TEXAS COLLEGE FOOTBALL
  // SPORTS ONLY
  // ----------------------------------------------------------
  {
    name: "On3 - Texas Longhorns",
    url: googleNewsSiteFeed(
      "on3.com/teams/texas-longhorns",
      "football"
    ),
    region: "Austin / Central Texas",
    type: "sports-specialty",
    mode: "discovery",
    forceSection: "State Sports",
    sportDesk: "College Football",
    requiredSourceMatch: ["On3"]
  },
  {
    name: "On3 - Texas A&M Aggies",
    url: googleNewsSiteFeed(
      "on3.com",
      '"Texas A&M" football'
    ),
    region: "Central Texas",
    type: "sports-specialty",
    mode: "discovery",
    forceSection: "State Sports",
    sportDesk: "College Football",
    requiredSourceMatch: ["On3"]
  },
  {
    name: "On3 - Texas Tech Red Raiders",
    url: googleNewsSiteFeed(
      "on3.com",
      '"Texas Tech" football'
    ),
    region: "West Texas / Lubbock",
    type: "sports-specialty",
    mode: "discovery",
    forceSection: "State Sports",
    sportDesk: "College Football",
    requiredSourceMatch: ["On3"]
  },
  {
    name: "On3 - TCU Horned Frogs",
    url: googleNewsSiteFeed(
      "on3.com",
      '"TCU" football'
    ),
    region: "North Texas / DFW",
    type: "sports-specialty",
    mode: "discovery",
    forceSection: "State Sports",
    sportDesk: "College Football",
    requiredSourceMatch: ["On3"]
  },
  {
    name: "On3 - Baylor Bears",
    url: googleNewsSiteFeed(
      "on3.com",
      '"Baylor" football'
    ),
    region: "Central Texas / Waco",
    type: "sports-specialty",
    mode: "discovery",
    forceSection: "State Sports",
    sportDesk: "College Football",
    requiredSourceMatch: ["On3"]
  },
  {
    name: "On3 - SMU Mustangs",
    url: googleNewsSiteFeed(
      "on3.com",
      '"SMU" football'
    ),
    region: "North Texas / DFW",
    type: "sports-specialty",
    mode: "discovery",
    forceSection: "State Sports",
    sportDesk: "College Football",
    requiredSourceMatch: ["On3"]
  },
  {
    name: "On3 - Houston Cougars",
    url: googleNewsSiteFeed(
      "on3.com",
      '"Houston Cougars" football'
    ),
    region: "Houston / Gulf Coast",
    type: "sports-specialty",
    mode: "discovery",
    forceSection: "State Sports",
    sportDesk: "College Football",
    requiredSourceMatch: ["On3"]
  }  ,
  {
    name: "Houston Business Journal",
    url: googleNewsSiteFeed(
      "bizjournals.com/houston",
      "business OR real estate OR energy OR technology OR jobs"
    ),
    region: "Houston / Gulf Coast",
    type: "business-news",
    mode: "discovery",
    forceSection: "State Business",
    requiredSourceMatch: [
      "Houston Business Journal"
    ]
  },
  {
    name: "Austin Business Journal",
    url: googleNewsSiteFeed(
      "bizjournals.com/austin",
      "business OR real estate OR technology OR jobs OR development"
    ),
    region: "Austin / Central Texas",
    type: "business-news",
    mode: "discovery",
    forceSection: "State Business",
    requiredSourceMatch: [
      "Austin Business Journal"
    ]
  },
  {
    name: "El Paso Inc.",
    url: googleNewsSiteFeed(
      "elpasoinc.com",
      "business OR economy OR real estate OR jobs OR development"
    ),
    region: "El Paso / West Texas",
    type: "business-news",
    mode: "discovery",
    forceSection: "State Business",
    requiredSourceMatch: [
      "El Paso Inc.",
      "El Paso Inc"
    ]
  }
];

// ============================================================
// EDITORIAL FIREWALL
// ============================================================

const BLOCKED_TITLE_PHRASES = [
  "opinion:",
  "opinion |",
  "opinion -",
  "editorial:",
  "editorial |",
  "editorial -",
  "commentary:",
  "commentary |",
  "commentary -",
  "column:",
  "column |",
  "column -",
  "guest column",
  "guest commentary",
  "guest essay",
  "letters to the editor",
  "letter to the editor",
  "endorsement:",
  "endorsement |",
  "endorsement -",
  "our view:",
  "our view |",
  "our view -",
  "reader opinion",
  "reader letter",
  "sponsored",
  "advertisement",
  "advertorial",
  "paid content",
  "brand studio",
  "partner content"
];

const BLOCKED_URL_PATHS = [
  "/opinion/",
  "/opinions/",
  "/editorial/",
  "/editorials/",
  "/commentary/",
  "/column/",
  "/columns/",
  "/letters/",
  "/letters-to-the-editor/",
  "/endorsements/",
  "/sponsored/",
  "/sponsor/",
  "/advertorial/",
  "/paid-content/",
  "/brand-studio/"
];

const BLOCKED_CATEGORIES = [
  "opinion",
  "opinions",
  "editorial",
  "editorials",
  "commentary",
  "columns",
  "letters",
  "letters to the editor",
  "endorsements",
  "sponsored",
  "paid content"
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
  "state representative",
  "state senator",
  "supreme court",
  "fifth circuit"
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
  "industry",
  "commercial real estate",
  "bank",
  "banking"
];

const SPORTS_TERMS = [
  "cowboys",
  "houston texans",
  "astros",
  "texas rangers",
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
  "houston cougars",
  "utsa",
  "utep",
  "baylor",
  "smu",
  "tcu",
  "texas tech",
  "touchdown",
  "quarterback",
  "coach",
  "season opener",
  "football recruiting",
  "recruiting class"
];

const FALSE_SPORT_TERMS = [
  "permian basin",
  "water",
  "radium",
  "drinking water",
  "oil",
  "gas",
  "energy",
  "ercot"
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

  return match
    ? decodeEntities(match[1])
    : "";
}

function extractCategories(block) {
  const matches = [
    ...block.matchAll(
      /<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/gi
    )
  ];

  return matches
    .map(match =>
      decodeEntities(match[1]).toLowerCase()
    )
    .filter(Boolean);
}

function extractGoogleSource(block) {
  const match = block.match(
    /<source[^>]*>([\s\S]*?)<\/source>/i
  );

  return match
    ? decodeEntities(match[1])
    : "";
}

function extractLink(block) {
  const rssLink = extractTag(block, "link");

  if (rssLink.startsWith("http")) {
    return rssLink;
  }

  const atomMatch = block.match(
    /<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i
  );

  if (
    atomMatch &&
    atomMatch[1].startsWith("http")
  ) {
    return decodeEntities(atomMatch[1]);
  }

  const guid = extractTag(block, "guid");

  if (guid.startsWith("http")) {
    return guid;
  }

  return "";
}

function cleanGoogleNewsTitle(title) {
  return String(title || "")
    .replace(
      /\s+-\s+[^-]+$/,
      ""
    )
    .trim();
}

function sourceMatches(
  actualSource,
  requiredMatches
) {
  if (
    !requiredMatches ||
    !requiredMatches.length
  ) {
    return true;
  }

  const actual =
    String(actualSource || "")
      .toLowerCase();

  return requiredMatches.some(
    allowed =>
      actual.includes(
        allowed.toLowerCase()
      )
  );
}

function firewallCheck({
  title,
  url,
  description,
  categories
}) {
  const text =
    `${title} ${description}`
      .toLowerCase();

  const lowerUrl =
    String(url || "")
      .toLowerCase();

  if (
    BLOCKED_TITLE_PHRASES.some(
      phrase => text.includes(phrase)
    )
  ) {
    return {
      allowed: false,
      reason: "blocked editorial/opinion phrase"
    };
  }

  if (
    BLOCKED_URL_PATHS.some(
      path => lowerUrl.includes(path)
    )
  ) {
    return {
      allowed: false,
      reason: "blocked editorial/opinion URL path"
    };
  }

  if (
    categories.some(category =>
      BLOCKED_CATEGORIES.some(
        blocked =>
          category.includes(blocked)
      )
    )
  ) {
    return {
      allowed: false,
      reason: "blocked editorial/opinion category"
    };
  }

  return {
    allowed: true,
    reason: ""
  };
}

function classify(
  title,
  description,
  source
) {
  if (source.forceSection) {
    return source.forceSection;
  }

  const text =
    `${title} ${description}`
      .toLowerCase();

  const falseSport =
    FALSE_SPORT_TERMS.some(
      term => text.includes(term)
    );

  const strongSport =
    SPORTS_TERMS.some(
      term => text.includes(term)
    );

  if (
    strongSport &&
    !falseSport
  ) {
    return "State Sports";
  }

  if (
    POLITICS_TERMS.some(
      term => text.includes(term)
    )
  ) {
    return "State Politics";
  }

  if (
    BUSINESS_TERMS.some(
      term => text.includes(term)
    )
  ) {
    return "State Business";
  }

  return "State News";
}

function fetchText(
  url,
  redirects = 0
) {
  return new Promise(
    (resolve, reject) => {
      if (redirects > 5) {
        reject(
          new Error(
            "Too many redirects"
          )
        );

        return;
      }

      const transport =
        url.startsWith("https:")
          ? https
          : http;

      const request =
        transport.get(
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
              const redirectUrl =
                new URL(
                  response.headers.location,
                  url
                ).toString();

              response.resume();

              resolve(
                fetchText(
                  redirectUrl,
                  redirects + 1
                )
              );

              return;
            }

            if (
              response.statusCode !== 200
            ) {
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

            response.on(
              "data",
              chunk => {
                data += chunk;
              }
            );

            response.on(
              "end",
              () => {
                resolve(data);
              }
            );
          }
        );

      request.setTimeout(
        20000,
        () => {
          request.destroy(
            new Error(
              "Request timeout"
            )
          );
        }
      );

      request.on(
        "error",
        reject
      );
    }
  );
}

function parseFeed(
  xml,
  source
) {
  let blocks =
    xml.match(
      /<item\b[\s\S]*?<\/item>/gi
    ) || [];

  if (!blocks.length) {
    blocks =
      xml.match(
        /<entry\b[\s\S]*?<\/entry>/gi
      ) || [];
  }

  const accepted = [];
  const rejected = [];

  for (
    const block of blocks
  ) {
    let title =
      extractTag(
        block,
        "title"
      );

    const description =
      extractTag(
        block,
        "description"
      ) ||
      extractTag(
        block,
        "summary"
      ) ||
      extractTag(
        block,
        "content"
      );

    const url =
      extractLink(block);

    const published =
      extractTag(
        block,
        "pubDate"
      ) ||
      extractTag(
        block,
        "published"
      ) ||
      extractTag(
        block,
        "updated"
      ) ||
      extractTag(
        block,
        "dc:date"
      );

    const categories =
      extractCategories(block);

    const actualSource =
      source.mode === "discovery"
        ? extractGoogleSource(block)
        : source.name;

    if (
      source.mode === "discovery" &&
      !sourceMatches(
        actualSource,
        source.requiredSourceMatch
      )
    ) {
      continue;
    }

    if (
      source.mode === "discovery"
    ) {
      title =
        cleanGoogleNewsTitle(title);
    }

    if (!title || !url) {
      continue;
    }

    const firewall =
      firewallCheck({
        title,
        url,
        description,
        categories
      });

    if (!firewall.allowed) {
      rejected.push({
        title,
        reason:
          firewall.reason
      });

      continue;
    }

    accepted.push({
      headline: title,
      title,
      url,
      source: source.name,
      source_attribution:
        actualSource ||
        source.name,
      source_type:
        source.type,
      region:
        source.region,
      published_at:
        published,
      section:
        classify(
          title,
          description,
          source
        ),
      sport_desk:
        source.sportDesk || null,
      ingestion_mode:
        source.mode,
      editorial_firewall:
        "passed"
    });
  }

  return {
    accepted,
    rejected
  };
}

function uniqueStories(
  stories
) {
  const seenUrls =
    new Set();

  const seenTitles =
    new Set();

  return stories.filter(
    story => {
      const urlKey =
        story.url.toLowerCase();

      const titleKey =
        story.title
          .toLowerCase()
          .replace(
            /[^a-z0-9 ]/g,
            ""
          )
          .replace(
            /\s+/g,
            " "
          )
          .trim();

      if (
        seenUrls.has(urlKey)
      ) {
        return false;
      }

      if (
        seenTitles.has(
          titleKey
        )
      ) {
        return false;
      }

      seenUrls.add(urlKey);
      seenTitles.add(titleKey);

      return true;
    }
  );
}

function validDate(value) {
  const time =
    Date.parse(
      value || ""
    );

  return Number.isFinite(time)
    ? time
    : 0;
}

async function main() {
  const gathered = [];
  const sourceStatus = [];
  const firewallRejections = [];

  for (
    const source of SOURCES
  ) {
    process.stdout.write(
      `Fetching ${source.name} ... `
    );

    try {
      const xml =
        await fetchText(
          source.url
        );

      const parsed =
        parseFeed(
          xml,
          source
        );

      const stories =
        parsed.accepted
          .sort(
            (a, b) =>
              validDate(
                b.published_at
              ) -
              validDate(
                a.published_at
              )
          )
          .slice(
            0,
            MAX_PER_SOURCE
          );

      firewallRejections.push(
        ...parsed.rejected.map(
          item => ({
            source:
              source.name,
            ...item
          })
        )
      );

      if (
        !stories.length
      ) {
        throw new Error(
          "no straight-news items accepted"
        );
      }

      console.log(
        `${stories.length} accepted`
      );

      gathered.push(
        ...stories
      );

      sourceStatus.push({
        source:
          source.name,
        region:
          source.region,
        mode:
          source.mode,
        status:
          "working",
        accepted:
          stories.length,
        firewall_rejected:
          parsed.rejected.length
      });
    } catch (error) {
      console.log(
        `FAILED: ${error.message}`
      );

      sourceStatus.push({
        source:
          source.name,
        region:
          source.region,
        mode:
          source.mode,
        status:
          "failed",
        error:
          error.message
      });
    }
  }

  const workingSources =
    sourceStatus.filter(
      source =>
        source.status ===
        "working"
    );

  const stories =
    uniqueStories(gathered)
      .sort(
        (a, b) =>
          validDate(
            b.published_at
          ) -
          validDate(
            a.published_at
          )
      )
      .slice(
        0,
        MAX_TOTAL
      );

  const sections = {
    "State News": [],
    "State Politics": [],
    "State Business": [],
    "State Sports": []
  };

  for (
    const story of stories
  ) {
    sections[
      story.section
    ].push(story);
  }

  const sourceCounts = {};

  const regionCounts = {};

  for (
    const story of stories
  ) {
    sourceCounts[
      story.source
    ] =
      (
        sourceCounts[
          story.source
        ] || 0
      ) + 1;

    regionCounts[
      story.region
    ] =
      (
        regionCounts[
          story.region
        ] || 0
      ) + 1;
  }

  fs.writeFileSync(
    STATUS_OUTPUT,
    JSON.stringify(
      {
        checked_at:
          new Date()
            .toISOString(),

        editorial_firewall:
          "ACTIVE",

        working_sources:
          workingSources.length,

        sources:
          sourceStatus,

        firewall_rejections:
          firewallRejections.slice(
            0,
            100
          )
      },
      null,
      2
    ),
    "utf8"
  );

  if (
    workingSources.length <
    MIN_WORKING_SOURCES
  ) {
    throw new Error(
      `Only ${workingSources.length} sources produced straight-news content. Minimum is ${MIN_WORKING_SOURCES}.`
    );
  }

  if (!stories.length) {
    throw new Error(
      "No publishable straight-news stories collected."
    );
  }

  const report = {
    platform:
      "GSR Lone Star Report",

    generated_at:
      new Date()
        .toISOString(),

    editorial_standard:
      "Journalistic integrity is the No. 1 standard.",

    editorial_firewall:
      "Opinion, editorial, commentary, columns, endorsements, letters, sponsored content and advertorial material are excluded.",

    sourcing_policy:
      "Straight-news reporting from credible Texas newsrooms and approved Texas sports sources only.",

    source_headline_policy:
      "Original source headlines are preserved.",

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
    `Working sources: ${workingSources.length}`
  );

  console.log(
    `Published stories: ${stories.length}`
  );

  console.log(
    `Editorial Firewall rejections: ${firewallRejections.length}`
  );

  console.log("");

  console.log(
    "SECTION COUNTS"
  );

  for (
    const [
      section,
      items
    ] of Object.entries(
      sections
    )
  ) {
    console.log(
      `${section}: ${items.length}`
    );
  }
}

main().catch(
  error => {
    console.error("");
    console.error(
      `PIPELINE FAILED: ${error.message}`
    );
    process.exit(1);
  }
);