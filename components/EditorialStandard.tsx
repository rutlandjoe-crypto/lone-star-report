export default function EditorialStandard() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-6">
      <div className="rounded-2xl border border-white/10 bg-[#001f52] p-6 text-white shadow-md">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-red-200">
          Our Standard
        </p>

        <h2 className="mt-2 text-2xl font-black">
          GSR Lone Star Report Editorial Standards
        </h2>

        <div className="mt-5 grid gap-5 text-sm leading-6 text-slate-200 md:grid-cols-2">
          <div>
            <strong className="text-white">Journalistic Integrity:</strong>{" "}
            Journalistic integrity is the No. 1 standard. Reporting must be
            factual, attributable, current and grounded in credible straight-news
            organizations or authoritative primary sources.
          </div>

          <div>
            <strong className="text-white">No Opinion Slop:</strong>{" "}
            Opinion-driven material, low-quality blogs, unsupported claims,
            speculation, manufactured controversy and filler do not belong in
            the Lone Star Report news pipeline.
          </div>

          <div>
            <strong className="text-white">Statewide Texas:</strong>{" "}
            Coverage must reflect the entire state, from Amarillo to Laredo and
            El Paso to Beaumont, including the Panhandle, West Texas, North
            Texas, East Texas, Central Texas, the Gulf Coast, South Texas and
            the border.
          </div>

          <div>
            <strong className="text-white">Journalist Utility:</strong>{" "}
            Stories and data modules should help reporters, editors and readers
            understand what happened, why it matters, what the verified data
            shows and what deserves attention next.
          </div>
        </div>
      </div>
    </section>
  );
}
