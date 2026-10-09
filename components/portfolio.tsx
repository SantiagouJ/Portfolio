"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import { flushSync } from "react-dom";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { marquee, sections, site, work, type Mode } from "@/lib/content";
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

const menuHalf = Array.from({ length: 3 }, () => sections).flat();

function ModeToggle({
  mode,
  idPrefix,
  fieldRef,
  onPointer,
  onChoose,
}: {
  mode: Mode;
  idPrefix: string;
  fieldRef?: Ref<HTMLFieldSetElement>;
  onPointer: (point: { x: number; y: number }) => void;
  onChoose: (next: Mode) => void;
}) {
  return (
    <fieldset
      ref={fieldRef}
      className="toggle"
      onPointerDown={(event) => onPointer({ x: event.clientX, y: event.clientY })}
      onClick={(event) => {
        const label = (event.target as HTMLElement).closest("label");
        if (!label) return;
        const next: Mode = label.htmlFor.endsWith("-dev") ? "dev" : "design";
        onPointer({ x: event.clientX, y: event.clientY });
        onChoose(next);
      }}
    >
      <legend className="sr-only">Interface</legend>
      <span className="toggle-thumb" aria-hidden="true" />
      <input
        id={`${idPrefix}-dev`}
        type="radio"
        name={idPrefix}
        value="dev"
        checked={mode === "dev"}
        onChange={() => onChoose("dev")}
      />
      <label htmlFor={`${idPrefix}-dev`}>Development</label>
      <input
        id={`${idPrefix}-design`}
        type="radio"
        name={idPrefix}
        value="design"
        checked={mode === "design"}
        onChange={() => onChoose("design")}
      />
      <label htmlFor={`${idPrefix}-design`}>Design</label>
    </fieldset>
  );
}

export function Portfolio() {
  const root = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLFieldSetElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const contactTrailRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const switching = useRef(false);
  const menuOpenRef = useRef(false);
  const menuActions = useRef({
    open: () => {},
    close: (_href?: string | null) => {},
  });
  const menuDrag = useRef(false);
  const [mode, setMode] = useState<Mode>("design");
  const [openId, setOpenId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    const section = contactRef.current;
    const canvas = contactTrailRef.current;
    const context = canvas?.getContext("2d");
    if (!section || !canvas || !context) return;

    const query = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    type Pixel = {
      x: number;
      y: number;
      size: number;
      born: number;
      duration: number;
      opacity: number;
    };

    let pixels: Pixel[] = [];
    let frame = 0;
    let lastPoint: { x: number; y: number } | null = null;
    let removeInteraction = () => {};

    const resize = () => {
      const rect = section.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (time: number) => {
      const width = canvas.width / Math.min(window.devicePixelRatio || 1, 2);
      const height = canvas.height / Math.min(window.devicePixelRatio || 1, 2);
      context.clearRect(0, 0, width, height);
      pixels = pixels.filter((pixel) => time - pixel.born < pixel.duration);

      pixels.forEach((pixel) => {
        const progress = (time - pixel.born) / pixel.duration;
        context.globalAlpha = Math.max(0, 1 - progress) * pixel.opacity;
        context.fillStyle = "#ffffff";
        context.fillRect(
          Math.round(pixel.x - pixel.size / 2),
          Math.round(pixel.y - pixel.size / 2),
          Math.round(pixel.size),
          Math.round(pixel.size),
        );
      });
      context.globalAlpha = 1;

      if (pixels.length > 0) frame = requestAnimationFrame(draw);
      else frame = 0;
    };

    const addPixel = (x: number, y: number, time: number) => {
      const size = 70;
      pixels.push({
        x: Math.round(x / size) * size,
        y: Math.round(y / size) * size,
        size,
        born: time,
        duration: 620 + Math.random() * 320,
        opacity: 0.42 + Math.random() * 0.24,
      });
      if (pixels.length > 120) pixels.splice(0, pixels.length - 120);
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const setupInteraction = () => {
      removeInteraction();
      if (!query.matches) {
        pixels = [];
        context.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      const onMove = (event: PointerEvent) => {
        const rect = section.getBoundingClientRect();
        const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        const time = performance.now();

        if (!lastPoint) {
          addPixel(point.x, point.y, time);
          lastPoint = point;
          return;
        }

        const dx = point.x - lastPoint.x;
        const dy = point.y - lastPoint.y;
        const distance = Math.hypot(dx, dy);
        const steps = Math.max(1, Math.floor(distance / 18));
        for (let step = 1; step <= steps; step += 1) {
          const progress = step / steps;
          addPixel(
            lastPoint.x + dx * progress,
            lastPoint.y + dy * progress,
            time - (steps - step) * 8,
          );
        }
        lastPoint = point;
      };

      const onLeave = () => {
        lastPoint = null;
      };

      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerleave", onLeave);
      removeInteraction = () => {
        section.removeEventListener("pointermove", onMove);
        section.removeEventListener("pointerleave", onLeave);
      };
    };

    resize();
    setupInteraction();
    const observer = new ResizeObserver(resize);
    observer.observe(section);
    query.addEventListener("change", setupInteraction);

    return () => {
      removeInteraction();
      observer.disconnect();
      query.removeEventListener("change", setupInteraction);
      if (frame) cancelAnimationFrame(frame);
    };
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

      const brand = header?.querySelector<HTMLElement>(".brand");
      const navLinks = header?.querySelectorAll<HTMLElement>(".nav a") ?? [];
      const toggleClip = header?.querySelector<HTMLElement>(".toggle-clip");
      const menuBtn = header?.querySelector<HTMLElement>(".menu-toggle");
      const desktopQuery = window.matchMedia("(min-width: 1080px)");
      let compact = false;
      let headTl: gsap.core.Timeline | null = null;

      const layoutHead = () => {
        headTl?.kill();
        headTl = null;
        const nodes = [brand, toggleClip, menuBtn, ...navLinks].filter(
          (node): node is HTMLElement => node instanceof HTMLElement,
        );
        gsap.set(nodes, { clearProps: "all" });
        compact = false;
        header?.classList.remove("is-scrolled");
        if (reduce || !desktopQuery.matches || !menuBtn || !toggleClip) return;
        gsap.set(menuBtn, { autoAlpha: 0 });
        headTl = gsap.timeline({ paused: true, defaults: { duration: 0.75, ease: "expo.out" } });
        headTl
          .to([brand, ...navLinks].filter((node): node is HTMLElement => node instanceof HTMLElement), {
            yPercent: -110,
            autoAlpha: 0,
            pointerEvents: "none",
            stagger: -0.035,
          }, 0)
          .to(menuBtn, { autoAlpha: 1, duration: 0.45 }, 0.2);
      };

      const setCompact = (scroll: number) => {
        const on = scroll > 80;
        if (on === compact && header?.classList.contains("is-scrolled") === on) return;
        compact = on;
        header?.classList.toggle("is-scrolled", on);
        if (!headTl) return;
        if (on) headTl.play();
        else headTl.reverse();
      };

      const readScroll = (scroll: number) => {
        const limit = document.documentElement.scrollHeight - window.innerHeight;
        runtime.scroll = limit > 0 ? scroll / limit : 0;
        setCompact(scroll);
      };

      layoutHead();

      let tick: ((time: number) => void) | null = null;
      const onNativeScroll = () => readScroll(window.scrollY);

      let onRevealDone: (() => void) | null = null;
      if (lenis) {
        if (document.documentElement.classList.contains("is-pixel-reveal")) {
          lenis.stop();
          onRevealDone = () => {
            if (!menuOpenRef.current) lenis.start();
          };
          window.addEventListener("pixel-reveal-done", onRevealDone, { once: true });
        }
        lenis.on("scroll", (instance) => {
          runtime.scroll = instance.progress;
          setCompact(instance.scroll);
          ScrollTrigger.update();
        });
        tick = (time: number) => {
          lenis.raf(time * 1000);
        };
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
      }
      window.addEventListener("scroll", onNativeScroll, { passive: true });

      const onDesktopChange = () => {
        layoutHead();
        readScroll(window.scrollY);
      };
      desktopQuery.addEventListener("change", onDesktopChange);
      readScroll(lenis ? lenis.scroll : window.scrollY);

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
        const anchor = event.currentTarget as HTMLAnchorElement;
        if (anchor.closest(".menu-overlay")) return;
        const href = anchor.getAttribute("href");
        if (!href || href === "#") return;
        const target = href === "#top" ? 0 : document.querySelector(href);
        if (target === null) return;
        if (typeof target !== "number" && !(target instanceof HTMLElement)) return;
        event.preventDefault();
        scrollTo(target);
      };
      links.forEach((link) => link.addEventListener("click", onClick));

      const overlay = overlayRef.current;
      const sheet = sheetRef.current;
      const menuTrack = trackRef.current;
      const closeBtn = overlay?.querySelector<HTMLButtonElement>(".menu-close");
      const motion = { offset: 0 };
      let menuTarget = 0;
      let menuCurrent = 0;
      let menuMax = 1;
      let menuTl: gsap.core.Timeline | null = null;
      let menuTicking = false;
      let press: { y: number; moved: boolean } | null = null;
      let restoreFocus: HTMLElement | null = null;
      const ySet = menuTrack ? gsap.quickSetter(menuTrack, "y", "px") : null;

      const measureMenu = () => {
        menuMax = Math.max((menuTrack?.offsetHeight ?? 0) / 2, 1);
      };

      const paintMenu = () => {
        if (!menuTrack || !ySet || menuMax <= 0) return;
        const ease = reduce ? 1 : 0.14;
        menuCurrent += (menuTarget - menuCurrent) * ease;
        if (Math.abs(menuTarget - menuCurrent) < 0.2) menuCurrent = menuTarget;
        ySet(-gsap.utils.wrap(0, menuMax, menuCurrent - motion.offset));
        const mid = window.innerHeight * 0.5;
        const rows = [...menuTrack.querySelectorAll<HTMLElement>(".menu-row")];
        let nearest: HTMLElement | null = null;
        let nearestDist = Infinity;
        const measured = rows.map((row) => {
          const box = row.getBoundingClientRect();
          const dist = Math.abs(box.top + box.height * 0.5 - mid);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearest = row;
          }
          return { row, dist, height: box.height };
        });
        measured.forEach(({ row, dist, height }) => {
          const steps = dist / Math.max(height, 1);
          const focused = row === nearest || row.matches(":hover");
          const opacity = focused ? 1 : Math.max(0.16, 1 - steps * 0.62);
          row.style.opacity = opacity.toFixed(3);
        });
      };

      const onMenuWheel = (event: WheelEvent) => {
        event.preventDefault();
        const line = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
        menuTarget += event.deltaY * line;
      };

      const onMenuPointerDown = (event: PointerEvent) => {
        if (event.button !== 0) return;
        const target = event.target;
        if (target instanceof Element && target.closest("button, fieldset, label, input")) return;
        press = { y: event.clientY, moved: false };
      };

      const onMenuPointerMove = (event: PointerEvent) => {
        if (!press) return;
        const delta = press.y - event.clientY;
        if (!press.moved && Math.abs(delta) < 5) return;
        press.moved = true;
        menuTarget += delta;
        press.y = event.clientY;
      };

      const onMenuPointerUp = () => {
        if (press?.moved) menuDrag.current = true;
        press = null;
      };

      const onMenuKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          closeMenu();
          return;
        }
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault();
        const row = menuTrack?.querySelector<HTMLElement>(".menu-row");
        const step = row?.offsetHeight ?? 140;
        menuTarget += event.key === "ArrowDown" ? step : -step;
      };

      const unbindMenu = () => {
        window.removeEventListener("keydown", onMenuKey);
        sheet?.removeEventListener("wheel", onMenuWheel);
        sheet?.removeEventListener("pointerdown", onMenuPointerDown);
        window.removeEventListener("pointermove", onMenuPointerMove);
        window.removeEventListener("pointerup", onMenuPointerUp);
        window.removeEventListener("resize", measureMenu);
        if (menuTicking) gsap.ticker.remove(paintMenu);
        menuTicking = false;
        press = null;
      };

      const closeMenu = (href?: string | null) => {
        if (!menuOpenRef.current || !overlay || !sheet) return;
        menuOpenRef.current = false;
        setMenuOpen(false);
        unbindMenu();
        document.documentElement.classList.remove("is-menu-open");
        if (!document.documentElement.classList.contains("is-pixel-reveal")) lenis?.start();
        menuTl?.kill();
        menuTl = gsap.timeline({
          defaults: { duration: reduce ? 0.01 : 0.8, ease: "power3.inOut" },
          onComplete: () => {
            gsap.set(overlay, { autoAlpha: 0 });
            overlay.inert = true;
            if (restoreFocus && restoreFocus.getClientRects().length > 0) restoreFocus.focus();
          },
        });
        if (reduce) {
          menuTl.set(overlay, { autoAlpha: 0, yPercent: -100 }).set(sheet, { yPercent: 100 });
        } else {
          menuTl.to(overlay, { yPercent: -100 }, 0).to(sheet, { yPercent: 100 }, 0);
        }
        if (!href) return;
        const destination = href === "#top" ? 0 : document.querySelector(href);
        if (destination === null) return;
        if (typeof destination !== "number" && !(destination instanceof HTMLElement)) return;
        scrollTo(destination);
      };

      const openMenu = () => {
        if (menuOpenRef.current || !overlay || !sheet || !menuTrack) return;
        menuOpenRef.current = true;
        setMenuOpen(true);
        restoreFocus = document.activeElement instanceof HTMLElement ? document.activeElement : menuBtn ?? null;
        document.documentElement.classList.add("is-menu-open");
        lenis?.stop();
        measureMenu();
        menuTarget = 0;
        menuCurrent = 0;
        motion.offset = reduce ? 0 : window.innerHeight;
        overlay.inert = false;
        menuTl?.kill();
        menuTl = gsap.timeline({ defaults: { duration: reduce ? 0.01 : 0.9, ease: "power4.out" } });
        if (reduce) {
          menuTl.set(overlay, { autoAlpha: 1, yPercent: 0 }).set(sheet, { yPercent: 0 });
        } else {
          menuTl
            .set(overlay, { autoAlpha: 1 })
            .fromTo(overlay, { yPercent: -100 }, { yPercent: 0 }, 0)
            .fromTo(sheet, { yPercent: 100 }, { yPercent: 0 }, 0)
            .to(motion, { offset: 0, duration: 1.4, ease: "expo.out" }, 0);
        }
        if (!menuTicking) {
          menuTicking = true;
          gsap.ticker.add(paintMenu);
        }
        window.addEventListener("keydown", onMenuKey);
        sheet.addEventListener("wheel", onMenuWheel, { passive: false });
        sheet.addEventListener("pointerdown", onMenuPointerDown);
        window.addEventListener("pointermove", onMenuPointerMove);
        window.addEventListener("pointerup", onMenuPointerUp);
        window.addEventListener("resize", measureMenu);
        requestAnimationFrame(() => closeBtn?.focus());
      };

      menuActions.current = { open: openMenu, close: closeMenu };
      if (overlay && sheet) {
        gsap.set(overlay, { autoAlpha: 0, yPercent: -100 });
        gsap.set(sheet, { yPercent: 100 });
      }

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
        desktopQuery.removeEventListener("change", onDesktopChange);
        unbindMenu();
        menuTl?.kill();
        document.documentElement.classList.remove("is-menu-open");
        menuActions.current = { open: () => {}, close: () => {} };
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
      const list = root.current?.querySelector<HTMLElement>(".work-list");
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
      <div className="page" inert={menuOpen}>
        <header className="header">
          <div className="header-inner gutter">
            <div className="header-start">
              <button
                className="menu-toggle uline"
                type="button"
                aria-expanded={menuOpen}
                aria-controls="site-menu"
                onClick={() => menuActions.current.open()}
              >
                Menu
              </button>
              <div className="brand-clip">
                <a className="brand" href="#top">
                  {site.name}
                </a>
              </div>
            </div>
            <nav className="nav" aria-label="Sections">
              {sections.map((section) => (
                <span className="nav-clip" key={section.href}>
                  <a href={section.href}>{section.label}</a>
                </span>
              ))}
            </nav>
            <div className="header-end">
              <div className="toggle-clip">
                <ModeToggle
                  mode={mode}
                  idPrefix="mode"
                  fieldRef={toggleRef}
                  onPointer={(point) => {
                    pointer.current = point;
                  }}
                  onChoose={choose}
                />
              </div>
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

          <section
            ref={contactRef}
            className="contact gutter"
            id="contact"
            aria-labelledby="contact-title"
          >
            <canvas className="contact-trail" ref={contactTrailRef} aria-hidden="true" />
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

      <aside
        ref={overlayRef}
        className="menu-overlay"
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-hidden={!menuOpen}
        aria-label="Menu"
        inert={!menuOpen}
        data-lenis-prevent
      >
        <div className="menu-sheet" ref={sheetRef}>
          <div className="menu-bar gutter">
            <a
              className="brand"
              href="#top"
              onClick={(event) => {
                event.preventDefault();
                menuActions.current.close("#top");
              }}
            >
              {site.name}
            </a>
            <button className="menu-close uline" type="button" onClick={() => menuActions.current.close()}>
              Close
            </button>
          </div>
          <p className="sr-only">Section links. Scroll or use the arrow keys to move through them.</p>
          <div className="menu-viewport">
          <nav
            className="menu-track"
            ref={trackRef}
            aria-label="Sections"
            onClick={(event) => {
              if (menuDrag.current) {
                menuDrag.current = false;
                event.preventDefault();
                return;
              }
              const link = (event.target as HTMLElement).closest("a");
              if (!link) return;
              event.preventDefault();
              menuActions.current.close(link.getAttribute("href"));
            }}
          >
            {[0, 1].map((copy) => (
              <ul key={copy} aria-hidden={copy === 1}>
                {menuHalf.map((section, index) => (
                  <li className="menu-row" key={`${copy}-${section.href}-${index}`}>
                    <a href={section.href} tabIndex={copy === 1 ? -1 : undefined}>
                      <span className="menu-index">({section.index})</span>
                      <span>{section.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ))}
          </nav>
          </div>
          <div className="menu-foot gutter">
            <ModeToggle
              mode={mode}
              idPrefix="menu-mode"
              onPointer={(point) => {
                pointer.current = point;
              }}
              onChoose={choose}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
