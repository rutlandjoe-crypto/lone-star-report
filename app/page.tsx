import fs from "fs";
import path from "path";
import EditorialStandard from "@/components/EditorialStandard";

type Story = {
  headline: string;
  title?: string;
  url: string;
  source: string;
  region?: string;
  published_at?: string;
  section: string;
  sport_desk?: string | null;
};

type WeatherLocation = {
  name: string;
  region: string;
  temperature: number;
  temperature_unit: string;
  forecast: string;
  wind_speed: string;
  wind_direction: string;
  period: string;
  next_period?: {
    name: string;
    temperature: number;
    temperature_unit: string;
    forecast: string;
  } | null;
};

type WeatherReport = {
  generated_at: string;
  source: string;
  source_url: string;
  editorial_note: string;
  locations: WeatherLocation[];
};
type Report = {
  platform: string;
  generated_at: string;
  homepage_cards: Story[];
  sections: {
    "State News": Story[];
    "State Politics": Story[];
    "State Business": Story[];
    "State Sports": Story[];
  };
};

const GSR_NETWORK = [
  ["Sports", "https://globalsportsreport.com"],
  ["AI", "https://globalaireport.news"],
  ["Politics", "https://globalpoliticsreport.com"],
  ["Entertainment", "https://globalentertainmentreport.com"],
  ["Betting", "https://globalbettingreport.com"],
];

const SPORTS_DESKS = [
  "NFL",
  "MLB",
  "NBA",
  "College Football",
  "High School Football",
];

const REGIONS = [
  "Panhandle",
  "West Texas",
  "North Texas",
  "East Texas",
  "Central Texas",
  "Gulf Coast",
  "South Texas",
  "Rio Grande Valley",
  "Texas Border",
];

function loadReport(): Report {
  const filePath = path.join(
    process.cwd(),
    "public",
    "latest_report.json"
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(
      "latest_report.json is missing. Run npm run fetch:texas first."
    );
  }

  return JSON.parse(
    fs.readFileSync(filePath, "utf8")
  ) as Report;
}

function loadWeather(): WeatherReport {
  const filePath = path.join(
    process.cwd(),
    "public",
    "texas_weather.json"
  );

  if (!fs.existsSync(filePath)) {
    return {
      generated_at: "",
      source: "National Weather Service",
      source_url: "https://www.weather.gov/",
      editorial_note: "Official National Weather Service forecast data.",
      locations: []
    };
  }

  return JSON.parse(
    fs.readFileSync(filePath, "utf8")
  ) as WeatherReport;
}
function formatDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}

function StoryCard({
  story,
}: {
  story: Story;
}) {
  return (
    <article className="gsr-card texas-red-rule p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        <span className="text-[#bf0a30]">
          {story.source}
        </span>

        {story.region ? (
          <>
            <span>Ã¢â‚¬Â¢</span>
            <span>{story.region}</span>
          </>
        ) : null}
      </div>

      <h3 className="mt-3 text-xl font-black leading-7 text-slate-950">
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#002868]"
        >
          {story.headline}
        </a>
      </h3>

      {formatDate(story.published_at) ? (
        <p className="mt-3 text-xs font-semibold text-slate-400">
          {formatDate(story.published_at)}
        </p>
      ) : null}

      <div className="mt-4">
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-black text-[#002868] hover:underline"
        >
          Read original report Ã¢â€ â€™
        </a>
      </div>
    </article>
  );
}

function NewsSection({
  label,
  title,
  stories,
}: {
  label: string;
  title: string;
  stories: Story[];
}) {
  const displayStories = stories.slice(0, 8);

  return (
    <section className="mx-auto max-w-7xl px-5 py-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="texas-section-label">
            {label}
          </p>

          <h2 className="mt-2 text-3xl font-black text-slate-950">
            {title}
          </h2>
        </div>

        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {stories.length} verified stories available
        </span>
      </div>

      {displayStories.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {displayStories.map(
            (story, index) => (
              <StoryCard
                key={`${story.url}-${index}`}
                story={story}
              />
            )
          )}
        </div>
      ) : (
        <div className="gsr-card p-5 text-sm text-slate-600">
          No verified stories currently available.
        </div>
      )}
    </section>
  );
}

function TexasWeatherDesk({
  weather,
}: {
  weather: WeatherReport;
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-7">
      <div className="mb-5">
        <p className="texas-section-label">
          Statewide Forecast
        </p>

        <h2 className="mt-2 text-3xl font-black text-slate-950">
          Texas Weather Desk
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Official National Weather Service forecasts from key regions
          across Texas.
        </p>
      </div>

      {weather.locations.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {weather.locations.map((location) => (
            <article
              key={location.name}
              className="gsr-card texas-blue-rule p-5"
            >
              <p className="text-xs font-black uppercase tracking-wide text-[#bf0a30]">
                {location.region}
              </p>

              <h3 className="mt-2 text-xl font-black text-slate-950">
                {location.name}
              </h3>

              <div className="mt-4 flex items-end gap-2">
                <span className="text-4xl font-black text-[#002868]">
                  {location.temperature}Â°
                </span>

                <span className="pb-1 text-sm font-bold text-slate-500">
                  {location.temperature_unit}
                </span>
              </div>

              <p className="mt-3 text-sm font-bold leading-5 text-slate-700">
                {location.forecast}
              </p>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Wind: {location.wind_direction} {location.wind_speed}
              </p>

              {location.next_period ? (
                <div className="mt-4 border-t border-slate-200 pt-3">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    {location.next_period.name}
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-700">
                    {location.next_period.temperature}Â°{" "}
                    {location.next_period.forecast}
                  </p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="gsr-card p-5 text-sm text-slate-600">
          Statewide weather data is temporarily unavailable.
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <span>
          Source: National Weather Service
        </span>

        <a
          href="https://www.weather.gov/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-black text-[#002868] hover:underline"
        >
          National Weather Service â†’
        </a>
      </div>
    </section>
  );
}
function classifyTexasSport(story: Story) {
  const text = [
    story.headline,
    story.title,
    story.source,
    story.region,
    story.sport_desk
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const nflTerms = [
    "dallas cowboys",
    "cowboys",
    "houston texans",
    "texans",
    "nfl"
  ];

  const mlbTerms = [
    "texas rangers",
    "rangers",
    "houston astros",
    "astros",
    "mlb",
    "major league baseball"
  ];

  const nbaTerms = [
    "dallas mavericks",
    "mavericks",
    "mavs",
    "houston rockets",
    "rockets",
    "san antonio spurs",
    "spurs",
    "wembanyama",
    "wemby",
    "nba"
  ];

  const highSchoolTerms = [
    "high school football",
    "texas high school football",
    "friday night",
    "uil football",
    "uil",
    "6a football",
    "5a football",
    "4a football",
    "3a football",
    "2a football",
    "1a football"
  ];

  const collegeTerms = [
    "college football",
    "texas longhorns",
    "longhorns",
    "texas a&m",
    "aggies",
    "texas tech",
    "red raiders",
    "tcu",
    "horned frogs",
    "baylor",
    "bears",
    "smu",
    "mustangs",
    "houston cougars",
    "rice owls",
    "utsa",
    "north texas",
    "mean green",
    "utep",
    "sam houston",
    "texas state",
    "sec football",
    "big 12",
    "acc football",
    "ncaa football",
    "on3"
  ];

  if (highSchoolTerms.some(term => text.includes(term))) {
    return "High School Football";
  }

  if (mlbTerms.some(term => text.includes(term))) {
    return "MLB";
  }

  if (nbaTerms.some(term => text.includes(term))) {
    return "NBA";
  }

  if (nflTerms.some(term => text.includes(term))) {
    return "NFL";
  }

  if (collegeTerms.some(term => text.includes(term))) {
    return "College Football";
  }

  return null;
}

function sportDeskId(desk: string) {
  return `sports-${desk
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function TexasSportsDesk({
  stories,
}: {
  stories: Story[];
}) {
  const deskStories = SPORTS_DESKS.map(
    desk => ({
      desk,
      stories: stories.filter(
        story =>
          classifyTexasSport(story) === desk
      )
    })
  );

  const classifiedCount =
    deskStories.reduce(
      (total, group) =>
        total + group.stories.length,
      0
    );

  return (
    <section className="mx-auto max-w-7xl px-5 py-7">
      <div className="gsr-card texas-blue-rule p-6">
        <p className="texas-section-label">
          State Sports
        </p>

        <h2 className="mt-2 text-3xl font-black">
          Texas Sports Desk
        </h2>

        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
          NFL, MLB, NBA, college football and high school football
          coverage from across Texas.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {deskStories.map(
            ({ desk, stories: deskItems }) => (
              <a
                key={desk}
                href={`#${sportDeskId(desk)}`}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-[#002868] hover:bg-white"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-black text-[#002868]">
                    {desk}
                  </p>

                  <span className="rounded-full bg-[#002868] px-2 py-1 text-xs font-black text-white">
                    {deskItems.length}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  View desk →
                </p>
              </a>
            )
          )}
        </div>

        <p className="mt-4 text-xs font-semibold text-slate-500">
          {classifiedCount} of {stories.length} current State Sports
          stories assigned to a Lone Star sports desk.
        </p>
      </div>

      <div className="mt-8 space-y-10">
        {deskStories.map(
          ({ desk, stories: deskItems }) => (
            <section
              key={desk}
              id={sportDeskId(desk)}
              className="scroll-mt-6"
            >
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="texas-section-label">
                    Texas Sports
                  </p>

                  <h3 className="mt-1 text-2xl font-black text-slate-950">
                    {desk}
                  </h3>
                </div>

                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {deskItems.length} verified stories
                </span>
              </div>

              {deskItems.length ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {deskItems
                    .slice(0, 8)
                    .map(
                      (story, index) => (
                        <StoryCard
                          key={`${desk}-${story.url}-${index}`}
                          story={story}
                        />
                      )
                    )}
                </div>
              ) : (
                <div className="gsr-card p-5">
                  <p className="font-black text-slate-800">
                    No current verified {desk} stories.
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Lone Star will display coverage here when a verified
                    story enters the State Sports feed.
                  </p>
                </div>
              )}
            </section>
          )
        )}
      </div>
    </section>
  );
}
export default function Page() {
  const report = loadReport();
  const weather = loadWeather();

  const news =
    report.sections?.["State News"] || [];

  const politics =
    report.sections?.["State Politics"] || [];

  const business =
    report.sections?.["State Business"] || [];

  const sports =
    report.sections?.["State Sports"] || [];

  return (
    <main className="min-h-screen">
      <div className="texas-topbar">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-5 py-3 text-xs font-bold uppercase tracking-wide">
          <span className="text-slate-300">
            GSR Network:
          </span>

          {GSR_NETWORK.map(
            ([name, url]) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-200"
              >
                {name}
              </a>
            )
          )}

          <span className="rounded-full bg-white px-3 py-1 text-[#002868]">
            Lone Star
          </span>
        </div>
      </div>

      <header className="texas-hero text-white">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 py-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-red-200">
              GSR Network
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
              GSR Lone Star Report
            </h1>

            <p className="mt-4 max-w-3xl text-xl font-semibold leading-8">
              Texas news, data and context.
            </p>

            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-200">
              Statewide straight-news coverage built around journalistic
              integrity, trusted sourcing and practical utility for
              journalists and Texans.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#002868]">
                Built for journalists, by a journalist.
              </span>

              <span className="rounded-full bg-[#bf0a30] px-4 py-2 text-sm font-black">
                The Great State of Texas
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-black/20 p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-200">
              Live Texas Newsroom Briefing
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div>
                <p className="text-3xl font-black">
                  {news.length}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-300">
                  State News
                </p>
              </div>

              <div>
                <p className="text-3xl font-black">
                  {politics.length}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-300">
                  Politics
                </p>
              </div>

              <div>
                <p className="text-3xl font-black">
                  {business.length}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-300">
                  Business
                </p>
              </div>

              <div>
                <p className="text-3xl font-black">
                  {sports.length}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-300">
                  Sports
                </p>
              </div>
            </div>

            <p className="mt-5 text-xs text-slate-300">
              Updated from the latest verified Lone Star ingestion run.
            </p>
          </div>
        </div>
      </header>

      <EditorialStandard />

      <section className="mx-auto max-w-7xl px-5 py-3">
        <div className="gsr-card border-l-4 border-l-[#bf0a30] p-5">
          <p className="texas-section-label">
            Partner Spotlight
          </p>

          <h2 className="mt-2 text-xl font-black">
            Reach audiences across the Great State of Texas.
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            GSR Lone Star Report offers clearly labeled advertising and
            partnership opportunities for Texas businesses, sports businesses,
            real estate companies, technology firms and other statewide brands.
            Advertising remains separate from editorial judgment.
          </p>
        </div>
      </section>

      <TexasWeatherDesk
        weather={weather}
      />

      <NewsSection
        label="Texas Desk"
        title="State News"
        stories={news}
      />

      <NewsSection
        label="Texas Government"
        title="State Politics"
        stories={politics}
      />

      <NewsSection
        label="Texas Economy"
        title="State Business"
        stories={business}
      />

      <TexasSportsDesk
        stories={sports}
      />

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-7 lg:grid-cols-2">
        <div className="gsr-card p-5">
          <p className="texas-section-label">
            Texas Newsroom Signals
          </p>

          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <p>Breaking statewide developments</p>
            <p>Governor, Legislature and state government</p>
            <p>Texas economy and major employers</p>
            <p>Energy, ERCOT and infrastructure</p>
            <p>Weather and public safety</p>
            <p>Professional, college and high school sports</p>
          </div>
        </div>

        <div className="gsr-card p-5">
          <p className="texas-section-label">
            Statewide Watch
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-bold text-slate-700">
            {REGIONS.map(
              (region) => (
                <div
                  key={region}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  {region}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-7">
        <div className="rounded-2xl bg-[#bf0a30] p-6 text-white">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-red-100">
            Advertise With GSR Lone Star Report
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Put your business in front of a statewide Texas audience.
          </h2>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-red-50">
            Sponsorship, advertising and commercial partnership opportunities
            are available across the GSR Lone Star Report platform.
          </p>
        </div>
      </section>

      <footer className="mt-8 border-t-4 border-[#bf0a30] bg-[#001f52] text-white">
        <div className="mx-auto max-w-7xl px-5 py-7">
          <p className="font-black">
            GSR Lone Star Report
          </p>

          <p className="mt-2 text-sm text-slate-300">
            Texas news, data and context. Built for journalists, by a journalist.
          </p>

          <p className="mt-3 text-xs text-slate-400">
            A GSR Network digital media platform.
          </p>
        </div>
      </footer>
    </main>
  );
}