import { useMemo, useState } from "react";
import { Navbar } from "../components/navbar.components.jsx";

const typeOptions = [
  { value: "all", label: "All" },
  { value: "photo", label: "Photos" },
  { value: "video", label: "Videos" },
];

const EventsPage = () => {
  const [filters, setFilters] = useState({ type: "all", year: "" });

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const start = 2020;
    const count = Math.max(0, current - start + 1);
    return Array.from({ length: count }, (_, idx) => current - idx);
  }, []);

  const events = [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#eef2f9] to-[#dfe7fb] text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pb-20 pt-24">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">Events</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold dark:text-blue-600">Gallery & Highlights</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mt-2">
              Browse photos and videos from alumni meetups, convocations, hackathons, and more. Use filters to narrow down by media type or year.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/[0.04] p-6 shadow-md mb-10">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-300">Media type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 dark:text-slate-300">Year</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters((prev) => ({ ...prev, year: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Any year</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              className="w-full md:w-auto px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:shadow-lg"
            >
              Apply
            </button>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-white/15 bg-white/85 dark:bg-white/5 p-14 text-center shadow-sm">
            <p className="text-xl font-semibold text-slate-800 dark:text-white">No events yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-300 mt-3">Check back soon for photos and videos from upcoming events.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {events.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/[0.04] shadow-lg"
              >
                <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-800" />
                <div className="p-5 space-y-2">
                  <p className="text-xs uppercase tracking-[0.15em] text-blue-600 dark:text-blue-300">{item.type}</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-300">{item.year}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
