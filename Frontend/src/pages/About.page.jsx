import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Compass,
  Github,
  Instagram,
  Linkedin,
  Quote,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Navbar } from "../components/navbar.components.jsx";

/* -------------------- Tabs -------------------- */
const tabs = [
  { id: "vision", label: "Our Vision" },
  { id: "leadership", label: "Leadership Message" },
  { id: "team", label: "Our Team" },
];

/* -------------------- Vision -------------------- */
const visionContent = {
  headline: "World-class transportation university for India and the world",
  pillars: [
    "Future-ready curriculum spanning mobility, logistics, and sustainability.",
    "Research and innovation that move policy, infrastructure, and industry forward.",
    "Inclusive growth through industry partnerships, executive education, and community impact.",
  ],
  mission: [
    "Deliver experiential learning and domain depth across transport and logistics.",
    "Build an innovation pipeline that connects labs, startups, and industry needs.",
    "Shape leaders who champion safe, efficient, and sustainable mobility ecosystems.",
  ],
};

/* -------------------- Leadership -------------------- */
const leadershipMessages = [
  {
    title: "Chancellor's Message",
    name: "Shri Ashwini Vaishnaw",
    subtitle:
      "Hon'ble Minister for Railways, Information & Broadcasting, Electronics & IT, Government of India",
    message:
      "Gati Shakti Vishwavidyalaya (GSV) is set up to create specialized, talented human resources that accelerate the development of India's transportation and logistics sector.",
    body:
      "The university’s scope covers railways, aviation, roadways, maritime and beyond with strong industry collaboration.",
    image: "https://ik.imagekit.io/z124gop4xq/chancellor.png",
  },
  {
    title: "Vice Chancellor's Message",
    name: "Prof. Manoj Choudhary",
    subtitle: "Gati Shakti Vishwavidyalaya",
    message:
      "India's first university dedicated to transport and logistics delivers applied education and industry-aligned skilling.",
    body:
      "Through experiential learning and research, we are building a future-ready logistics workforce.",
    image: "https://ik.imagekit.io/z124gop4xq/vice-chancellor.png",
  },
];

/* -------------------- Team -------------------- */
const teamMembers = [
  {
    name: "Ravi Panchal",
    role: "Team Member",
    bio: "Experienced team leader overseeing the development and success of GSVConnect.",
    avatar: "https://ik.imagekit.io/z124gop4xq/team-ravi.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/in/ravixpanchal/",
      instagram: "https://www.instagram.com/ravixpanchal/",
      github: "https://github.com/ravixpanchal",
    },
  },
  {
    name: "Pratik Ranjan",
    role: "Team Member",
    bio: "Contributor bringing innovative ideas and strong technical skills.",
    avatar: "https://ik.imagekit.io/z124gop4xq/team-pratik.jpg",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/pratik-ranjan3011",
      instagram: "https://www.instagram.com/pratik_ranjan_34",
      github: "https://github.com/pratik3011622",
    },
  },
  {
    name: "Bhavesh Jangid",
    role: "Team Member",
    bio: "Shapes product visuals and interactions for intuitive experiences.",
    avatar: "https://ik.imagekit.io/z124gop4xq/Bhavesh.jpeg",
    socials: {
      linkedin: "https://www.linkedin.com/in/bhaveshjangid",
      instagram: "https://www.instagram.com/bhavesh.kulariya.28",
      github: "https://github.com/Bhaveshsuthar28",
    },
  },
];

/* ==================== Component ==================== */
const AboutPage = () => {
  const [activeTab, setActiveTab] = useState("vision");

  const tabContent = useMemo(() => {
    /* ---------- Vision ---------- */
    if (activeTab === "vision") {
      return (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-lg dark:border-white/10 dark:bg-white/10 dark:backdrop-blur-lg dark:shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                <Compass size={22} className="text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold">Vision</h3>
            </div>
            <p className="text-slate-700 dark:text-slate-200">{visionContent.headline}</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {visionContent.pillars.map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-lg dark:border-white/10 dark:bg-white/10 dark:backdrop-blur-lg dark:shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-300" />
              </div>
              <h3 className="text-lg font-semibold">Mission</h3>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {visionContent.mission.map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    /* ---------- Leadership ---------- */
    if (activeTab === "leadership") {
      return (
        <div className="grid lg:grid-cols-2 gap-6">
          {leadershipMessages.map((leader) => (
            <article
              key={leader.name}
              className="rounded-3xl border border-slate-200/80 bg-white shadow-lg overflow-hidden dark:border-white/10 dark:bg-white/10 dark:backdrop-blur-lg dark:shadow-2xl"
            >
              <div className="h-56 bg-gradient-to-br from-slate-200 via-slate-100 to-white flex items-center justify-center dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="h-32 w-32 rounded-full border-4 border-white/30 object-cover shadow-xl"
                />
              </div>

              <div className="p-6 space-y-3">
                <p className="text-xs uppercase tracking-widest text-blue-700 dark:text-blue-300">
                  {leader.title}
                </p>
                <h3 className="text-2xl font-bold">{leader.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{leader.subtitle}</p>
                <div className="text-sm text-slate-700 space-y-2 dark:text-slate-200">
                  <p className="flex gap-2">
                    <Quote size={16} className="text-blue-600 dark:text-blue-400 mt-1" />
                    {leader.message}
                  </p>
                  <p>{leader.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      );
    }

    /* ---------- Team ---------- */
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <article
            key={member.name}
            className="rounded-3xl border border-slate-200/80 bg-white shadow-lg dark:border-white/10 dark:bg-white/10 dark:backdrop-blur-lg dark:shadow-2xl"
          >
            <div className="h-48 flex items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
              <img
                src={member.avatar}
                alt={member.name}
                className="h-28 w-28 rounded-full border-4 border-white/30 object-cover"
              />
            </div>
            <div className="p-6 space-y-3">
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">{member.role}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{member.bio}</p>

              <div className="flex gap-3 pt-2">
                <a className="text-slate-700 hover:text-blue-700 dark:text-slate-200 dark:hover:text-blue-300" href={member.socials.linkedin}><Linkedin size={18} /></a>
                <a className="text-slate-700 hover:text-blue-700 dark:text-slate-200 dark:hover:text-blue-300" href={member.socials.instagram}><Instagram size={18} /></a>
                <a className="text-slate-700 hover:text-blue-700 dark:text-slate-200 dark:hover:text-blue-300" href={member.socials.github}><Github size={18} /></a>
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 dark:from-[#04152f] dark:via-[#0b1d3d] dark:to-[#071427] dark:text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-16 space-y-12">
        <section className="text-center space-y-4">
          <p className="text-sm uppercase tracking-widest text-emerald-600 dark:text-emerald-300">
            Community Blueprint
          </p>
          <h1 className="text-4xl font-extrabold">
            Vision, Leadership & Team
          </h1>
          <p className="max-w-3xl mx-auto text-slate-700 dark:text-slate-200">
            Learn about our vision, leadership, and the team powering GSVConnect.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white shadow-xl p-6 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-lg dark:shadow-2xl">
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {tabContent}
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          <InfoCard icon={<Target size={18} />} title="Outcome-focused" />
          <InfoCard icon={<Users size={18} />} title="Collaborative" />
          <InfoCard icon={<Sparkles size={18} />} title="Adaptive" />
        </section>
      </main>
    </div>
  );
};

/* -------------------- Small Card -------------------- */
const InfoCard = ({ icon, title }) => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-4 flex items-center gap-3 shadow-sm dark:border-white/10 dark:bg-white/5">
    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center dark:bg-white/10">
      {icon}
    </div>
    <p className="text-sm font-semibold">{title}</p>
  </div>
);

export default AboutPage;