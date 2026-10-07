"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { marquee, projects, site, type Mode } from "@/lib/content";
import { runtime } from "@/lib/runtime";

const WebGLField = dynamic(
  () => import("@/components/webgl-field").then((mod) => mod.WebGLField),
  { ssr: false },
);

gsap.registerPlugin(ScrollTrigger, useGSAP);

const theme: Record<Mode, string> = {
  design: "#f1f0eb",
  dev: "#121210",
};

export function Portfolio() {
  const root = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLFieldSetElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const switching = useRef(false);
  const [mode, setMode] = useState<Mode>("design");

  useEffect(() => {
    const stored = document.documentElement.dataset.mode;
    if (stored === "dev" || stored === "design") {
      setMode(stored);
      const meta = document.querySelector('meta[name="theme-color"]');
      meta?.setAttribute("content", theme[stored]);
    }
  }, []);

  const choose = (next: Mode) => {
    if (document.documentElement.dataset.mode === next || switching.current) return;

    const rect = toggleRef.current?.getBoundingClientRect();
    const point = pointer.current;
    pointer.current = null;
    const x = point?.x ?? (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
    const y = point?.y ?? (rect ? rect.top + rect.height / 2 : 72);
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const apply = () => {
      document.documentElement.classList.add("theme-snap");
      document.documentElement.dataset.mode = next;
      localStorage.setItem("dm-mode", next);
      setMode(next);
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme[next]);
      runtime.setMode(next === "dev" ? 1 : 0);
      window.dispatchEvent(new CustomEvent("dm-mode", { detail: next }));
    };

    const release = () => {
      document.documentElement.classList.remove("theme-snap");
      switching.current = false;
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = (
      document as Document & {
        startViewTransition?: (callback: () => void) => {
          ready: Promise<void>;
          finished: Promise<void>;
        };
      }
    ).startViewTransition;

    if (reduce || !start) {
      apply();
      release();
      return;
    }

    switching.current = true;
    let transition: { ready: Promise<void>; finished: Promise<void> };
    try {
      transition = start.call(document, () => {
        flushSync(apply);
      });
    } catch {
      apply();
      release();
      return;
    }

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: "cubic-bezier(0.76, 0, 0.24, 1)",
          pseudoElement: "::view-transition-new(root)",
          fill: "both",
        },
      );
    });

    transition.finished.finally(release);
  };

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const header = root.current?.querySelector(".header");

      const lenis = reduce
        ? null
        : new Lenis({
            lerp: 0.085,
            smoothWheel: true,
            syncTouch: false,
          });

      const readScroll = (scroll: number) => {
        const limit = document.documentElement.scrollHeight - window.innerHeight;
        runtime.scroll = limit > 0 ? scroll / limit : 0;
        header?.classList.toggle("is-scrolled", scroll > 8);
      };

      let tick: ((time: number) => void) | null = null;
      const onNativeScroll = () => readScroll(window.scrollY);

      if (lenis) {
        lenis.on("scroll", (instance) => {
          runtime.scroll = instance.progress;
          header?.classList.toggle("is-scrolled", instance.scroll > 8);
          ScrollTrigger.update();
        });
        tick = (time: number) => {
          lenis.raf(time * 1000);
        };
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
      } else {
        window.addEventListener("scroll", onNativeScroll, { passive: true });
      }

      const scrollTo = (target: HTMLElement | number) => {
        if (lenis) {
          lenis.scrollTo(target, { offset: typeof target === "number" ? 0 : -24 });
          return;
        }
        if (typeof target === "number") {
          window.scrollTo({ top: target });
          return;
        }
        target.scrollIntoView();
      };

      const links = root.current?.querySelectorAll<HTMLAnchorElement>('a[href^="#"]') ?? [];
      const onClick = (event: Event) => {
        const href = (event.currentTarget as HTMLAnchorElement).getAttribute("href");
        if (!href || href === "#") return;
        const target = href === "#top" ? 0 : document.querySelector(href);
        if (target === null) return;
        if (typeof target !== "number" && !(target instanceof HTMLElement)) return;
        event.preventDefault();
        scrollTo(target);
      };
      links.forEach((link) => link.addEventListener("click", onClick));

      const cues = root.current?.querySelectorAll<HTMLButtonElement>("[data-scroll]") ?? [];
      const onCue = (event: Event) => {
        const id = (event.currentTarget as HTMLButtonElement).dataset.scroll;
        if (!id) return;
        const target = document.querySelector(id);
        if (!target) return;
        scrollTo(target);
      };
      cues.forEach((cue) => cue.addEventListener("click", onCue));

      if (!reduce) {
        gsap.from(".line-inner", {
          yPercent: 110,
          duration: 1.2,
          stagger: 0.08,
          ease: "power4.out",
        });

        gsap.from(".hero-copy, .scroll-cue", {
          y: 18,
          opacity: 0,
          duration: 0.9,
          delay: 0.35,
          ease: "power3.out",
        });

        const track = root.current?.querySelector(".marquee-track");
        if (track) {
          gsap.to(track, {
            xPercent: -50,
            duration: 36,
            ease: "none",
            repeat: -1,
          });
        }

        gsap.utils.toArray<HTMLElement>(".work-row").forEach((row, index) => {
          gsap.from(row, {
            y: 48,
            opacity: 0,
            duration: 0.95,
            delay: index * 0.04,
            ease: "power3.out",
            scrollTrigger: {
              trigger: row,
              start: "top 88%",
              once: true,
            },
          });
        });

        gsap.from(".contact-copy", {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".contact",
            start: "top 75%",
            once: true,
          },
        });

        gsap.to(".hero-title", {
          yPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      const refresh = () => ScrollTrigger.refresh();
      document.fonts.ready.then(refresh);

      return () => {
        links.forEach((link) => link.removeEventListener("click", onClick));
        cues.forEach((cue) => cue.removeEventListener("click", onCue));
        window.removeEventListener("scroll", onNativeScroll);
        if (tick) gsap.ticker.remove(tick);
        lenis?.destroy();
      };
    },
    { scope: root },
  );

  const [firstName, ...restName] = site.name.split(" ");
  const lastName = restName.join(" ");
  const loop = [...marquee, ...marquee];

  return (
    <div ref={root}>
      <a className="skip" href="#work">
        Skip to work
      </a>
      <WebGLField />
      <div className="page">
        <header className="header">
          <div className="header-inner gutter">
            <a className="brand" href="#top">
              {site.name}
            </a>
            <div className="header-actions">
              <nav className="nav" aria-label="Sections">
                <a href="#work">Work</a>
                <a href="#contact">Contact</a>
              </nav>
              <fieldset
                ref={toggleRef}
                className="toggle"
                onPointerDown={(event) => {
                  pointer.current = { x: event.clientX, y: event.clientY };
                }}
                onClick={(event) => {
                  const label = (event.target as HTMLElement).closest("label");
                  if (!label) return;
                  const next: Mode = label.htmlFor === "mode-dev" ? "dev" : "design";
                  if (!pointer.current) {
                    pointer.current = { x: event.clientX, y: event.clientY };
                  }
                  choose(next);
                }}
              >
                <legend className="sr-only">Interface</legend>
                <span className="toggle-thumb" aria-hidden="true" />
                <input
                  id="mode-dev"
                  type="radio"
                  name="mode"
                  value="dev"
                  checked={mode === "dev"}
                  onChange={() => choose("dev")}
                />
                <label htmlFor="mode-dev">Development</label>
                <input
                  id="mode-design"
                  type="radio"
                  name="mode"
                  value="design"
                  checked={mode === "design"}
                  onChange={() => choose("design")}
                />
                <label htmlFor="mode-design">Design</label>
              </fieldset>
            </div>
          </div>
        </header>

        <main id="top">
          <section className="hero gutter" aria-labelledby="name">
            <h1 className="hero-title" id="name">
              <span className="line">
                <span className="line-inner">{firstName}</span>
              </span>
              <span className="line">
                <span className="line-inner line-shift">{lastName}</span>
              </span>
            </h1>
            <div className="hero-foot">
              <div className="hero-copy">
                <p className="role swap">
                  <span className="only-dev" aria-hidden={mode !== "dev"}>
                    {site.roles.dev}
                  </span>
                  <span className="only-design" aria-hidden={mode !== "design"}>
                    {site.roles.design}
                  </span>
                </p>
                <p className="role-line swap">
                  <span className="only-dev" aria-hidden={mode !== "dev"}>
                    {site.lines.dev}
                  </span>
                  <span className="only-design" aria-hidden={mode !== "design"}>
                    {site.lines.design}
                  </span>
                </p>
              </div>
              <button className="scroll-cue" type="button" data-scroll="#work">
                Scroll
                <span className="scroll-line" aria-hidden="true" />
              </button>
            </div>
          </section>

          <div className="marquee" aria-hidden="true">
            <div className="marquee-track">
              {loop.map((item, index) => (
                <span className="marquee-item" key={`${item}-${index}`}>
                  {item}
                  <span aria-hidden="true"> — </span>
                </span>
              ))}
              {loop.map((item, index) => (
                <span className="marquee-item" key={`${item}-copy-${index}`}>
                  {item}
                  <span aria-hidden="true"> — </span>
                </span>
              ))}
            </div>
          </div>

          <section className="work gutter" id="work" aria-labelledby="work-title">
            <h2 className="eyebrow" id="work-title">
              Work
            </h2>
            <div className="work-list">
              {projects.map((project) => (
                <article className="work-row" key={project.index}>
                  <span className="work-index">{project.index}</span>
                  <div>
                    <h3 className="work-title">{project.title}</h3>
                    <p className="work-meta swap">
                      <span className="only-dev" aria-hidden={mode !== "dev"}>
                        {project.dev}
                      </span>
                      <span className="only-design" aria-hidden={mode !== "design"}>
                        {project.design}
                      </span>
                    </p>
                  </div>
                  <span className="work-year">{project.year}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="contact gutter" id="contact" aria-labelledby="contact-title">
            <div className="contact-copy">
              <p className="eyebrow">Contact</p>
              <h2 id="contact-title">Let's talk.</h2>
              <a className="contact-link" href={`mailto:${site.email}`}>
                {site.email}
              </a>
              <p className="available">{site.available}</p>
            </div>
          </section>

          <footer className="footer gutter">
            <span>© {new Date().getFullYear()} {site.name}</span>
            <span>Development and design</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
