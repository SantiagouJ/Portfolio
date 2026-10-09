export type Mode = "dev" | "design";

export type Project = {
  index: string;
  title: string;
  year: string;
  meta: string;
  detail: string;
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
      title: "Table",
      year: "2026",
      meta: "Bookings in three steps, with nothing hidden in a menu",
      detail:
        "The booking path stays on one surface. Date, party size, and the table are the only decisions, in that order. Confirmation is the last screen, not a step buried in a menu.",
      image: "/work/table.svg",
      visit: "#",
    },
    {
      index: "02",
      title: "Signal",
      year: "2025",
      meta: "System status, readable at a glance",
      detail:
        "Status is one reading, not a dashboard. The state that matters sits first. Everything else waits until someone asks for it.",
      image: "/work/signal.svg",
      visit: "#",
    },
    {
      index: "03",
      title: "Field",
      year: "2025",
      meta: "Long forms, split into decisions",
      detail:
        "A long form becomes a sequence of small choices. Each step shows one decision, why it matters, and a way back without losing what was already answered.",
      image: "/work/field.svg",
      visit: "#",
    },
    {
      index: "04",
      title: "North",
      year: "2024",
      meta: "From the data flow to the interface",
      detail:
        "The interface follows the record. Screens are grouped by how the data moves, from entry to review, so the layout matches the work instead of a menu.",
      image: "/work/north.svg",
      visit: "#",
    },
  ],
  dev: [
    {
      index: "01",
      title: "Relay",
      year: "2026",
      meta: "Next.js / TypeScript / Postgres",
      detail:
        "A booking service from the page to the database. Next.js draws the interface, TypeScript holds the contracts, and Postgres stores every reservation.",
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
