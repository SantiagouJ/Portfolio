export type Mode = "dev" | "design";

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
};

export const projects = [
  {
    index: "01",
    title: "Table",
    year: "2026",
    dev: "Next.js / TypeScript / Postgres",
    design: "Bookings in three steps, with nothing hidden in a menu",
  },
  {
    index: "02",
    title: "Signal",
    year: "2025",
    dev: "React / Node / WebSockets",
    design: "System status, readable at a glance",
  },
  {
    index: "03",
    title: "Field",
    year: "2025",
    dev: "API / Auth / Panel",
    design: "Long forms, split into decisions",
  },
  {
    index: "04",
    title: "North",
    year: "2024",
    dev: "TypeScript / REST / UI",
    design: "From the data flow to the interface",
  },
] as const;

export const marquee = [
  "Full-stack developer",
  "UX/UI",
  "Interfaces",
  "Products",
];
