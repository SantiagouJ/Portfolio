export type Mode = "dev" | "design";

export type Project = {
  index: string;
  title: string;
  year: string;
  meta: string;
  detail: string;
  image: string;
  visit: string | null;
};

export const site = {
  name: "Santiago Jurado",
  email: "hey@santiagojurado.com",
  available: "Available for new projects.",
  roles: {
    dev: "Full-stack developer",
    design: "UX/UI",
  },
  lines: {
    dev: "From the interface to the server.",
    design: "From the problem to the screen.",
  },
  socials: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/santiago-jurado-rodríguez-b56450269/",
    },
    {
      label: "GitHub",
      href: "https://github.com/SantiagouJ",
    },
    {
      label: "Behance",
      href: "https://www.behance.net/santiagjurado5",
    },
  ],
};

export const sections = [
  { index: "01", label: "Work", href: "#work" },
  { index: "02", label: "Contact", href: "#contact" },
] as const;

export const work: Record<Mode, readonly Project[]> = {
  design: [
    {
      index: "01",
      title: "Boreal",
      year: "2026",
      meta: "Space is free. The resources to rest are not.",
      detail:
        "Boreal redesigns the flow of a shared place so access to rest stays fair, even when the room is already full.",
      image: "/work/boreal.png",
      visit: "https://www.behance.net/gallery/250621707/Boreal-UI-UX-Case-study",
    },
    {
      index: "02",
      title: "hema",
      year: "2026",
      meta: "Independence for older adults, with family still close",
      detail:
        "hema is a care system that shortens the distance between generations, through smart care and a quieter interface.",
      image: "/work/hema.png",
      visit: "https://www.behance.net/gallery/248468629/hema-UI-UX-Case-Study",
    },
    {
      index: "03",
      title: "Kooli",
      year: "2025",
      meta: "What is in the kitchen, before it goes to waste",
      detail:
        "Kooli tracks food at home, expiration dates, and the next shop, so a busy kitchen stays readable.",
      image: "/work/kooli.png",
      visit: "https://www.behance.net/gallery/239461841/Kooli-UI-UX-Research",
    },
    {
      index: "04",
      title: "Moodj",
      year: "2025",
      meta: "A song, posted with the mood you are in",
      detail:
        "Moodj is a social network where a song you like goes up with a mood, an emoji or a face, that says how you feel.",
      image: "/work/moodj.png",
      visit: "https://www.behance.net/gallery/236562013/Moodj-UIFront-end",
    },
    {
      index: "05",
      title: "Titi!",
      year: "2025",
      meta: "A screen to watch, a phone as the controller",
      detail:
        "Titi! is an interactive game played in real time over WebSockets, on two devices: a screen, and a phone that becomes the controller.",
      image: "/work/titi.png",
      visit: "https://www.behance.net/gallery/234180851/Titi-UIFront-end",
    },
    {
      index: "06",
      title: "BUDDYUP",
      year: "2025",
      meta: "Exercise, shared challenges, and time to study",
      detail:
        "BuddyUp is an exercise platform with gamification built in. People take on challenges together, and a Pomodoro section keeps study in the same place.",
      image: "/work/buddyup.jpg",
      visit: "https://www.behance.net/gallery/207274865/BUDDYUP-UI-UX",
    },
    {
      index: "07",
      title: "Clip",
      year: "2025",
      meta: "Bulletins, alerts, and grades in one place",
      detail:
        "Clip gathers reports, early alerts, and student achievements for Camino a la U, built with Fanalca, Metalsur, and Jóvenes con Propósito.",
      image: "/work/clip.png",
      visit: "https://www.behance.net/gallery/239336329/Clip-UI-UX-Case-Study",
    },
    {
      index: "08",
      title: "Vibra vé",
      year: "2025",
      meta: "Cultural events, attended in groups",
      detail:
        "Museums and cultural spaces publish their own events. People show up together, in groups they create.",
      image: "/work/vibra.png",
      visit: "https://www.behance.net/gallery/234835725/Vibra-v",
    }
  ],
  dev: [
    {
      index: "01",
      title: "NestJS Study",
      year: "2026",
      meta: "Next.js / TypeScript / Monaco / WebContainers",
      detail:
        "A platform in the browser for learning NestJS and TypeORM, from the first module through a working API.",
      image: "/work/nestjs-study.png",
      visit: "https://nestjs-study.vercel.app",
    },
    {
      index: "02",
      title: "Buzzer Bite",
      year: "2026",
      meta: "NestJS / TypeScript / TypeORM / Postgres",
      detail:
        "Buzzer Bite is for local bakeries, cafés, and restaurants that finish the day with food still good to eat. They pack the surplus into surprise or fixed packs, at a discount, and publish a strict pickup window. People nearby reserve one and collect it in the shop with a QR code.",
      image: "/work/relay.svg",
      visit: null,
    },
    {
      index: "03",
      title: "Moodj",
      year: "2025",
      meta: "TypeScript / Firebase / Webpack / Deezer API",
      detail:
        "Moodj is a social network where a song you like goes up with a mood, an emoji or a face, that says how you feel.",
      image: "/work/moodj.png",
      visit: "https://moodjsocial.netlify.app/",
    },
    {
      index: "04",
      title: "CR7",
      year: "2026",
      meta: "React / TypeScript / GSAP / Vite",
      detail:
        "A cinematic site for Cristiano Ronaldo's path from Sporting CP to Al-Nassr, built with React, GSAP, and scroll-driven motion.",
      image: "/work/cr7.jpg",
      visit: "https://cr-7-1f3n.vercel.app",
    },
    {
      index: "05",
      title: "Skema Reality",
      year: "2026",
      meta: "Next.js / TypeScript / Three.js",
      detail:
        "Skema Reality adds a 3D view to the Skema site. In the browser, people walk through a project and edit the finishes. In the sales room, a headset lets them walk the model apartment and change those finishes there too.",
      image: "/work/field.svg",
      visit: null,
    },
  ],
};

export const marquee = [
  "Full-stack developer",
  "UX/UI",
  "Interfaces",
  "Products",
];
