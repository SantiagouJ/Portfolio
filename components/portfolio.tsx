"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { marquee, site, work, type Mode } from "@/lib/content";
import { runtime } from "@/lib/runtime";
import { PixelReveal } from "@/components/pixel-reveal";

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
  const previewRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const switching = useRef(false);
  const [mode, setMode] = useState<Mode>("design");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const stored = document.documentElement.dataset.mode;
    if (stored === "dev" || stored === "design") {
      setMode(stored);
      const meta = document.querySelector('meta[name="theme-color"]');
      meta?.setAttribute("content", theme[stored]);
    }
  }, []);

  useEffect(() => {
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 520);
    ScrollTrigger.refresh();
    return () => window.clearTimeout(refresh);
  }, [openId]);

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
      setOpenId(null);
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

      let onRevealDone: (() => void) | null = null;
      if (lenis) {
        if (document.documentElement.classList.contains("is-pixel-reveal")) {
          lenis.stop();
          onRevealDone = () => lenis.start();
          window.addEventListener("pixel-reveal-done", onRevealDone, { once: true });
        }
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
        scrollTo(target as HTMLElement);
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
        if (onRevealDone) window.removeEventListener("pixel-reveal-done", onRevealDone);
        links.forEach((link) => link.removeEventListener("click", onClick));
        cues.forEach((cue) => cue.removeEventListener("click", onCue));
        window.removeEventListener("scroll", onNativeScroll);
        if (tick) gsap.ticker.remove(tick);
        lenis?.destroy();
      };
    },
    { scope: root },
  );

  useGSAP(
    () => {
      const preview = previewRef.current;
      const frame = frameRef.current;
      const image = imageRef.current;
      const list = root.current?.querySelector(".work-list");
      if (!preview || !frame || !image || !list) return;

      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const xSet = gsap.quickSetter(preview, "x", "px");
        const ySet = gsap.quickSetter(preview, "y", "px");
        let current: HTMLElement | null = null;
        let open = false;

        const hide = () => {
          if (!open) return;
          open = false;
          current = null;
          gsap.killTweensOf(frame);
          gsap.to(frame, {
            autoAlpha: 0,
            scale: 0.92,
            duration: 0.16,
            ease: "power2.out",
          });
        };

        const show = (row: HTMLElement, event: PointerEvent) => {
          const src = row.dataset.image;
          if (!src) return;
          if (image.getAttribute("src") !== src) image.src = src;
          xSet(event.clientX);
          ySet(event.clientY);
          if (row === current && open) return;
          current = row;
          if (open) return;
          open = true;
          gsap.killTweensOf(frame);
          gsap.fromTo(
            frame,
            { autoAlpha: 0, scale: 0.86 },
            { autoAlpha: 1, scale: 1, duration: 0.26, ease: "power3.out" },
          );
        };

        let hot: HTMLElement | null = null;

        const barOf = (row: HTMLElement) => row.querySelector<HTMLElement>(".work-row-bg");

        const enteredFromTop = (row: HTMLElement, y: number) => {
          const rect = row.getBoundingClientRect();
          return y < rect.top + rect.height / 2;
        };

        const slideBar = (row: HTMLElement, y: number, enter: boolean) => {
          const bar = barOf(row);
          if (!bar) return;
          const parked = enteredFromTop(row, y) ? "-100%" : "100%";
          if (enter) {
            gsap.fromTo(
              bar,
              { top: parked },
              { top: "0%", duration: 0.2, ease: "power1.out", overwrite: true },
            );
            return;
          }
          gsap.to(bar, { top: parked, duration: 0.2, ease: "power1.out", overwrite: true });
        };

        const resetBars = () => {
          gsap.utils.toArray<HTMLElement>(".work-row-bg", list).forEach((bar) => {
            gsap.killTweensOf(bar);
            gsap.set(bar, { top: "-100%" });
          });
        };

        const arm = (row: HTMLElement, y: number) => {
          if (row === hot) return;
          if (hot) {
            hot.classList.remove("is-hot");
            slideBar(hot, y, false);
          }
          row.classList.add("is-hot");
          slideBar(row, y, true);
          hot = row;
        };

        const disarm = (y: number) => {
          if (!hot) return;
          hot.classList.remove("is-hot");
          slideBar(hot, y, false);
          hot = null;
        };

        const sync = (event: PointerEvent) => {
          const target = event.target;
          if (!(target instanceof Element)) {
            hide();
            disarm(event.clientY);
            return;
          }
          const row = target.closest(".work-row");
          if (!(row instanceof HTMLElement)) {
            hide();
            disarm(event.clientY);
            return;
          }
          const set = row.closest(".work-set");
          if (!(set instanceof HTMLElement) || set.dataset.set !== document.documentElement.dataset.mode) {
            hide();
            disarm(event.clientY);
            return;
          }
          arm(row, event.clientY);
          if (row !== current) show(row, event);
          else {
            xSet(event.clientX);
            ySet(event.clientY);
          }
        };

        const onLeave = (event: PointerEvent) => {
          hide();
          disarm(event.clientY);
        };

        const onMode = () => {
          hide();
          if (hot) hot.classList.remove("is-hot");
          hot = null;
          resetBars();
        };

        list.addEventListener("pointermove", sync);
        list.addEventListener("pointerleave", onLeave);
        window.addEventListener("dm-mode", onMode);

        return () => {
          list.removeEventListener("pointermove", sync);
          list.removeEventListener("pointerleave", onLeave);
          window.removeEventListener("dm-mode", onMode);
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  const [firstName, ...restName] = site.name.split(" ");
  const lastName = restName.join(" ");
  const loop = [...marquee, ...marquee];

  return (
    <div ref={root}>
      <PixelReveal />
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
              <div className="work-sets">
                {(Object.keys(work) as Mode[]).map((set) => (
                  <div
                    className="work-set"
                    data-set={set}
                    key={set}
                    aria-hidden={mode !== set}
                  >
                    {work[set].map((project) => {
                      const id = `${set}-${project.title}`;
                      const panelId = `work-panel-${set}-${project.index}`;
                      const open = openId === id;
                      return (
                        <article className={`work-item${open ? " is-open" : ""}`} key={project.title}>
                          <button
                            className="work-row"
                            type="button"
                            data-image={project.image}
                            aria-expanded={open}
                            aria-controls={panelId}
                            onClick={() => setOpenId((current) => (current === id ? null : id))}
                          >
                            <span className="work-row-bg" aria-hidden="true" />
                            <span className="work-index">{project.index}</span>
                            <span className="work-lead">
                              <span className="work-title">{project.title}</span>
                              <span className="work-meta">{project.meta}</span>
                            </span>
                            <span className="work-year">{project.year}</span>
                          </button>
                          <div
                            className="work-panel"
                            id={panelId}
                            role="region"
                            aria-label={project.title}
                            aria-hidden={!open}
                            inert={!open}
                          >
                            <div className="work-panel-clip">
                              <div className="work-detail">
                                <div>
                                  <p className="work-copy">{project.detail}</p>
                                  <a
                                    className="work-visit"
                                    href={project.visit}
                                    onClick={(event) => {
                                      if (project.visit === "#") event.preventDefault();
                                    }}
                                  >
                                    Visit
                                  </a>
                                </div>
                                <img className="work-shot" src={project.image} alt="" />
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="work-preview" ref={previewRef} aria-hidden="true">
              <div className="work-preview-frame" ref={frameRef}>
                <img ref={imageRef} alt="" draggable={false} />
              </div>
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
            <nav className="footer-links" aria-label="Social">
              {site.socials.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer">
                  {social.label}
                </a>
              ))}
            </nav>
            <span>Development and design</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
