import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/navbar.components.jsx";
import { BackgroundVideo } from "../components/video.background.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const heroVideoUrl = `${import.meta.env.VITE_IMAGEKIT_URL}/induction-video.mp4`;

const stats = [
  { label: "Alumni Connected", value: "12k+" },
  { label: "Cities Represented", value: "85" },
  { label: "Mentors Active", value: "640" },
  { label: "Opportunities Shared", value: "3.2k" },
];

const features = [
  {
    title: "Explore the Directory",
    desc: "Search alumni by batch, branch, city, or company to reconnect instantly.",
  },
  {
    title: "Join the Community",
    desc: "Hop into forums, meetups, and reunions designed to keep you in the loop.",
  },
  {
    title: "Give Back",
    desc: "Offer mentorship, post internships, and open doors for current students.",
  },
];

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProtectedNav = (path) => {
    if (!user) return navigate("/auth");
    navigate(path);
  };

  return (
    <div className="relative min-h-screen bg-[#f2f5fb] text-slate-900 dark:bg-[#0b1224] dark:text-white">
      {/* HERO */}
      <div className="relative min-h-screen overflow-hidden">
        <BackgroundVideo />
        <div className="absolute inset-0 bg-gradient-to-b
            from-white/80 via-white/50 to-[#f2f5fb]/85
            dark:from-[#0a1733]/75 dark:via-[#0a1733]/65 dark:to-[#0b1224]/85"
        />


        <Navbar />

        <section className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-24 pb-16">
          <div className="max-w-5xl text-center space-y-6">
            <p className="text-blue-600 dark:text-blue-300 text-xs uppercase tracking-[0.2em] font-semibold">
              Gati Shakti Vishwavidyalaya Alumni Network
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold">
              Connect, Celebrate, and Grow Together
            </h1>

            <p className="text-slate-700 dark:text-blue-100/90 text-base sm:text-lg max-w-3xl mx-auto">
              Join a vibrant community where memories are made, careers accelerate,
              and support never stops.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                onClick={() => handleProtectedNav("/directory")}
                className="px-8 py-3 rounded-full font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                Explore Directory
              </button>

              {user ? (
                <button
                  onClick={() => navigate("/events")}
                  className="px-8 py-3 rounded-full font-semibold border border-slate-400 dark:border-white/40
                  text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10"
                >
                  Events
                </button>
              ) : (
                <button
                  onClick={() => handleProtectedNav("/auth")}
                  className="px-8 py-3 rounded-full font-semibold border border-slate-400 dark:border-white/40
                  text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10"
                >
                  Join Community
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* STATS */}
      <section className="py-12 sm:py-16 bg-[#e9eef8] dark:bg-[#0c1936]/80">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-300 dark:border-blue-400/15
              bg-[#fdfefe] dark:bg-blue-900/20 p-5 text-center shadow-md"
            >
              <div className="text-2xl sm:text-3xl font-bold">
                {item.value}
              </div>
              <p className="text-slate-700 dark:text-blue-100/80 text-sm mt-1">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-14 sm:py-20 bg-gradient-to-b
        from-[#f2f5fb] via-[#eef2f9] to-[#e9eef8]
        dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-blue-600 dark:text-blue-300 text-xs uppercase tracking-[0.2em] font-semibold mb-2">
              Connect & Celebrate
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              What you can do here
            </h2>
            <p className="text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
              Stay updated with alumni achievements and give back through mentorship.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="rounded-2xl p-6 shadow-lg border
                bg-[#fdfefe] dark:bg-white/5
                border-slate-300 dark:border-white/10"
              >
                <h3 className="text-xl font-semibold mb-2">
                  {feat.title}
                </h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className="py-14 sm:py-20 bg-[#eef2f9] dark:bg-slate-900/80">
        <div className="max-w-5xl mx-auto px-4">
          <div className="rounded-3xl overflow-hidden border
            border-slate-300 dark:border-white/10 shadow-2xl bg-black/40"
          >
            <video
              className="w-full h-full object-cover"
              src={heroVideoUrl}
              {/* controls
              preload="metadata" */}
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </div>
      </section>

      {/* CONTACT US */}
    <section className="
    py-16 sm:py-20
    bg-gradient-to-b
    from-[#f2f5fb] via-[#eef2f9] to-[#e9eef8]
    dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
    ">
    <div className="max-w-7xl mx-auto px-4">
        
        {/* Heading */}
        <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            Contact Us
        </h2>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Get in touch with Gati Shakti Vishwavidyalaya. We’re here to help and answer any questions you may have.
        </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">

        {/* LEFT: INFO */}
        <div className="
            rounded-3xl p-8
            bg-[#fdfefe] dark:bg-white/5
            border border-slate-300 dark:border-white/10
            shadow-lg
        ">
            <div className="flex items-center gap-4 mb-6">
            <img
              src={`${import.meta.env.VITE_IMAGEKIT_URL}/Gati_Shakti_Vishwavidyalaya_Logo.png`}
              alt="GSV Logo"
              className="w-14 h-14 object-contain"
            />
            <div>
                <h3 className="text-xl font-bold">
                Gati Shakti Vishwavidyalaya
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                Where Memories Meet Futures
                </p>
            </div>
            </div>

            <div className="space-y-6 text-sm">

            <div>
                <p className="font-semibold mb-1">Address</p>
                <p className="text-slate-700 dark:text-slate-300">
                76J2+P3P, Dr Venibhai Modi Marg,<br />
                Lalbaug, Manjalpur,<br />
                Vadodara, Gujarat 390004
                </p>
            </div>

            <div>
                <p className="font-semibold mb-1">Phone</p>
                <p className="text-slate-700 dark:text-slate-300">
                +91 6202269313
                </p>
            </div>

            <div>
                <p className="font-semibold mb-1">Email</p>
                <p className="text-blue-600 dark:text-blue-400">
                info@gsv.ac.in
                </p>
            </div>

            <div>
                <p className="font-semibold mb-1">Website</p>
                <a
                href="https://www.gsv.ac.in"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                www.gsv.ac.in
                </a>
            </div>

            </div>
        </div>

        {/* RIGHT: MAP */}
        <div className="
            rounded-3xl overflow-hidden
            border border-slate-300 dark:border-white/10
            shadow-lg
            bg-black/10
        ">
            <iframe
            title="Gati Shakti Vishwavidyalaya Map"
            src="https://www.google.com/maps?q=Gati+Shakti+Vishwavidyalaya&output=embed"
            className="w-full h-[360px] sm:h-[420px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            />
        </div>

        </div>
    </div>
    </section>

    </div>
  );
};
