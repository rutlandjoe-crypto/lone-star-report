import EditorialStandard from "@/components/EditorialStandard";

const GSR_NETWORK = [
  ["Sports", "https://globalsportsreport.com"],
  ["AI", "https://globalaireport.news"],
  ["Politics", "https://globalpoliticsreport.com"],
  ["Entertainment", "https://globalentertainmentreport.com"],
  ["Betting", "https://globalbettingreport.com"],
];

const SECTIONS = [
  {
    title: "State News",
    description:
      "Breaking and consequential reporting from communities and newsrooms across Texas.",
  },
  {
    title: "State Politics",
    description:
      "The governor, Legislature, statewide offices, elections, courts, agencies and Texas policy.",
  },
  {
    title: "State Business",
    description:
      "Texas companies, energy, technology, real estate, jobs, investment and the statewide economy.",
  },
  {
    title: "State Weather",
    description:
      "A statewide weather snapshot focused on conditions and verified severe-weather developments.",
  },
];

const SPORTS = [
  ["NFL", "Dallas Cowboys and Houston Texans"],
  ["MLB", "Houston Astros and Texas Rangers"],
  ["NBA", "Dallas Mavericks, Houston Rockets and San Antonio Spurs"],
  ["College Football", "Statewide Texas college football coverage"],
  ["High School Football", "Statewide Texas high school football coverage"],
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

function SectionCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="gsr-card texas-red-rule p-5">
      <p className="texas-section-label">{title}</p>
      <h2 className="mt-3 text-xl font-black text-slate-950">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>

      <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-400">
        Development placeholder - verified live reporting will populate this module.
      </p>
    </article>
  );
}

function PartnerSpotlight() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-3">
      <div className="gsr-card border-l-4 border-l-[#bf0a30] p-5">
        <p className="texas-section-label">Partner Spotlight</p>
        <h2 className="mt-2 text-xl font-black">
          Statewide partnership opportunities are available.
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
          GSR Lone Star Report will offer clearly labeled commercial placements
          for Texas businesses, sports businesses, real estate companies,
          technology firms, professional services and other brands seeking
          statewide visibility without compromising editorial independence.
        </p>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="texas-topbar">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-5 py-3 text-xs font-bold uppercase tracking-wide">
          <span className="text-slate-300">GSR Network:</span>

          {GSR_NETWORK.map(([name, url]) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-200"
            >
              {name}
            </a>
          ))}

          <span className="rounded-full bg-white px-3 py-1 text-[#002868]">
            Lone Star
          </span>
        </div>
      </div>

      <header className="texas-hero text-white">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 py-10 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-red-200">
              GSR Network
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
              GSR Lone Star Report
            </h1>

            <p className="mt-4 max-w-3xl text-xl font-semibold leading-8 text-white">
              Texas news, data and context.
            </p>

            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-200">
              Statewide straight-news coverage built around journalistic
              integrity, trusted sourcing and practical utility for journalists
              and Texans.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#002868]">
                Built for journalists, by a journalist.
              </span>

              <span className="rounded-full bg-[#bf0a30] px-4 py-2 text-sm font-black text-white">
                The Great State of Texas
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-black/20 p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-200">
              Live Texas Newsroom Briefing
            </p>

            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-100">
              <p>Statewide news and breaking developments.</p>
              <p>Texas government, politics and public policy.</p>
              <p>Business, energy, technology, jobs and real estate.</p>
              <p>Weather and severe-weather developments.</p>
              <p>NFL, MLB, NBA, college football and high school football.</p>
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-300">
              Live verified feeds coming during V1 integration.
            </p>
          </div>
        </div>
      </header>

      <EditorialStandard />

      <PartnerSpotlight />

      <section className="mx-auto max-w-7xl px-5 py-6">
        <div className="mb-5">
          <p className="texas-section-label">Texas Desk</p>
          <h2 className="mt-2 text-3xl font-black">Statewide Coverage</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {SECTIONS.map((section) => (
            <SectionCard
              key={section.title}
              title={section.title}
              description={section.description}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6">
        <div className="gsr-card texas-blue-rule p-6">
          <p className="texas-section-label">State Sports</p>
          <h2 className="mt-2 text-3xl font-black">Texas Sports Desk</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {SPORTS.map(([sport, coverage]) => (
              <div
                key={sport}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="font-black text-[#002868]">{sport}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {coverage}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-2">
        <div className="gsr-card p-5">
          <p className="texas-section-label">Texas Newsroom Signals</p>

          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <p>Breaking statewide developments</p>
            <p>Governor, Legislature and state government</p>
            <p>Texas economy and major employers</p>
            <p>Energy, ERCOT and infrastructure</p>
            <p>Severe weather and public safety</p>
            <p>Major professional and amateur sports developments</p>
          </div>
        </div>

        <div className="gsr-card p-5">
          <p className="texas-section-label">Statewide Watch</p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-bold text-slate-700">
            {REGIONS.map((region) => (
              <div
                key={region}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"
              >
                {region}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6">
        <div className="gsr-card p-5">
          <p className="texas-section-label">Texas Reporter Toolkit</p>
          <h2 className="mt-2 text-xl font-black">
            Primary and authoritative Texas resources
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            The live toolkit will prioritize authoritative government, weather,
            election, economic, sports and public-data resources useful to
            working journalists. Source links will be added only after
            verification.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6">
        <div className="rounded-2xl bg-[#bf0a30] p-6 text-white">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-red-100">
            Advertise With GSR Lone Star Report
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Connect your business with a statewide Texas news audience.
          </h2>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-red-50">
            Sponsorship, partnership and clearly labeled advertising
            opportunities will be available for Texas businesses and brands.
            Advertising remains separate from Lone Star Report editorial
            judgment and news coverage.
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
