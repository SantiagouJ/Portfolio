export type Mode = "dev" | "design";

export type Project = {
  index: string;
  title: string;
  year: string;
  meta: string;
  detail: string;
  stack: string;
  image: string;
  visit: string;
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
      stack: "UI/UX, case study",
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
      stack: "UI/UX, case study",
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
      stack: "UI/UX, research",
      image: "/work/kooli.png",
      visit: "https://www.behance.net/gallery/239461841/Kooli-UI-UX-Research",
    },
    {
      index: "04",
      title: "Moodj",
      year: "2025",
      meta: "Interface and front-end",
      detail: "Interface and front-end for Moodj.",
      stack: "UI, front-end",
      image: "/work/moodj.png",
      visit: "https://www.behance.net/gallery/236562013/Moodj-UIFront-end",
    },
    {
      index: "05",
      title: "Titi!",
      year: "2025",
      meta: "Interface and front-end",
      detail: "Interface and front-end for Titi!.",
      stack: "UI, front-end",
      image: "/work/titi.png",
      visit: "https://www.behance.net/gallery/234180851/Titi-UIFront-end",
    },
    {
      index: "06",
      title: "BUDDYUP",
      year: "2025",
      meta: "UI and UX",
      detail: "UI and UX for BUDDYUP.",
      stack: "UI, UX",
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
      stack: "UI/UX, case study",
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
      stack: "UI/UX",
      image: "/work/vibra.png",
      visit: "https://www.behance.net/gallery/234835725/Vibra-v",
    }
  ],
  dev: [
    {
      index: "01",
      title: "Relay",
      year: "2026",
      meta: "Next.js / TypeScript / Postgres",
      detail:
        "A booking service from the page to the database. Next.js draws the interface, TypeScript holds the contracts, and Postgres stores every reservation.",
      stack: "Next.js, TypeScript, Postgres",
      image: "/work/relay.svg",
      visit: "#",
    },
    {
      index: "02",
      title: "Channel",
      year: "2025",
      meta: "React / Node / WebSockets",
      detail:
        "Live updates over WebSockets. The client stays thin. The server owns the stream, the room, and what each connection is allowed to see.",
      stack: "React, Node, WebSockets",
      image: "/work/channel.svg",
      visit: "#",
    },
    {
      index: "03",
      title: "Vault",
      year: "2025",
      meta: "API / Auth / Panel",
      detail:
        "Sign-in, roles, and an admin panel on one API. Access is explicit. The panel only shows what the current session is allowed to touch.",
      stack: "API, auth, admin panel",
      image: "/work/vault.svg",
      visit: "#",
    },
    {
      index: "04",
      title: "Trace",
      year: "2024",
      meta: "TypeScript / REST / UI",
      detail:
        "A typed REST surface with a small interface on top. The routes follow the screens, so a change in the data shows up in the same place on the page.",
      stack: "TypeScript, REST, interface",
      image: "/work/trace.svg",
      visit: "#",
    },
  ],
};

export const marquee = [
  "Full-stack developer",
  "UX/UI",
  "Interfaces",
  "Products",
];
