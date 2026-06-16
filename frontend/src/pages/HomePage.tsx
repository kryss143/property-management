// HomePage.tsx
// Matches LoginPage.tsx design tokens:
//   Brand:      emerald-700 / emerald-600 / emerald-50
//   Background: #f6f7fb
//   Cards:      white + shadow-soft
//   Text:       gray-900 / gray-700 / gray-500
//   Accent:     emerald-600 for CTAs, gray-900 for secondary

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Key,
  BarChart3,
  Wrench,
  Shield,
  Users,
  ArrowRight,
  Star,
  Menu,
  X,
} from "lucide-react";

// ─── Animated Building Grid ───────────────────────────────────────────────────
// Signature element: a live 7×5 unit grid that simulates occupancy changes,
// making the page feel like the product is already running.

type UnitStatus = "occupied" | "available" | "maintenance" | "selected";

const FLOORS = 7;
const UNITS_PER_FLOOR = 5;

function randomStatus(): UnitStatus {
  const r = Math.random();
  if (r < 0.72) return "occupied";
  if (r < 0.88) return "available";
  return "maintenance";
}

function initGrid(): UnitStatus[][] {
  return Array.from({ length: FLOORS }, () =>
    Array.from({ length: UNITS_PER_FLOOR }, randomStatus),
  );
}

function BuildingGrid() {
  const [grid, setGrid] = useState<UnitStatus[][]>(initGrid);
  const [highlighted, setHighlighted] = useState<[number, number] | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Every 1.8s, flip one random unit between available and occupied
    intervalRef.current = setInterval(() => {
      setGrid((prev) => {
        const next = prev.map((row) => [...row]) as UnitStatus[][];
        const f = Math.floor(Math.random() * FLOORS);
        const u = Math.floor(Math.random() * UNITS_PER_FLOOR);
        if (next[f][u] === "maintenance") return next;
        next[f][u] = next[f][u] === "occupied" ? "available" : "occupied";
        setHighlighted([f, u]);
        setTimeout(() => setHighlighted(null), 600);
        return next;
      });
    }, 1800);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const occupied = grid.flat().filter((s) => s === "occupied").length;
  const total = FLOORS * UNITS_PER_FLOOR;

  const unitColor: Record<UnitStatus, string> = {
    occupied: "bg-emerald-500",
    available: "bg-gray-200",
    maintenance: "bg-amber-400",
    selected: "bg-emerald-300",
  };

  return (
    <div className="relative select-none rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
      {/* Building label */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-emerald-600" />
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Aurelia Heights
          </span>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          Live
        </span>
      </div>

      {/* Grid */}
      <div className="flex flex-col-reverse gap-1.5">
        {grid.map((row, f) => (
          <div key={f} className="flex items-center gap-1.5">
            <span className="w-5 shrink-0 text-right text-[10px] font-medium text-gray-300">
              {f + 1}
            </span>
            {row.map((status, u) => {
              const isLit =
                highlighted && highlighted[0] === f && highlighted[1] === u;
              return (
                <div
                  key={u}
                  className={[
                    "h-8 flex-1 rounded transition-all duration-500",
                    unitColor[status],
                    isLit
                      ? "scale-110 ring-2 ring-emerald-400 ring-offset-1"
                      : "",
                  ].join(" ")}
                  title={status}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4 text-center text-xs">
        <div>
          <p className="font-bold text-gray-900">{occupied}</p>
          <p className="text-gray-400">Occupied</p>
        </div>
        <div>
          <p className="font-bold text-gray-900">{total - occupied}</p>
          <p className="text-gray-400">Available</p>
        </div>
        <div>
          <p className="font-bold text-emerald-600">
            {Math.round((occupied / total) * 100)}%
          </p>
          <p className="text-gray-400">Occupancy</p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-gray-400">
        {[
          ["bg-emerald-500", "Occupied"],
          ["bg-gray-200", "Available"],
          ["bg-amber-400", "Maintenance"],
        ].map(([cls, label]) => (
          <span key={label} className="flex items-center gap-1">
            <span className={`inline-block h-2 w-2 rounded-sm ${cls}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Counter ─────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let frame = 0;
    let t0: number | null = null;
    const animate = (ts: number) => {
      t0 ??= ts;
      const progress = Math.min((ts - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, start]);
  return value;
}

function StatNumber({
  target,
  suffix = "",
  start,
}: {
  target: number;
  suffix?: string;
  start: boolean;
}) {
  const value = useCountUp(target, 1400, start);
  return (
    <span>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function Nav() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 focus:outline-none"
        >
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-600 text-white">
            <Building2 size={19} />
          </div>
          <span className="text-base font-semibold text-gray-900">KeyNest</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
          {["Features", "How it works", "Pricing", "Testimonials"].map(
            (item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="transition hover:text-emerald-700"
              >
                {item}
              </a>
            ),
          )}
        </nav>

        {/* CTA group */}
        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={() => navigate("/login")}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Sign in
          </button>
          <button
            onClick={() => {
              document
                .getElementById("pricing")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Get started free
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium text-gray-700">
            {["Features", "How it works", "Pricing", "Testimonials"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                  onClick={() => setMobileOpen(false)}
                  className="py-1 transition hover:text-emerald-700"
                >
                  {item}
                </a>
              ),
            )}
            <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
              <button
                onClick={() => navigate("/login")}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate("/login")}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Get started free
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

// ─── Features data ────────────────────────────────────────────────────────────

const features = [
  {
    Icon: Building2,
    title: "Property & unit management",
    description:
      "Organise your entire portfolio in one place. Track unit availability, occupancy status, and property health at a glance.",
  },
  {
    Icon: Users,
    title: "Tenant lifecycle",
    description:
      "From onboarding to move-out, manage tenant records, contacts, and communication history without switching tools.",
  },
  {
    Icon: CreditCard,
    title: "Rent collection & payments",
    description:
      "Send statements, record payments, and flag overdue rent automatically. Every peso tracked and dated.",
  },
  {
    Icon: Key,
    title: "Lease management",
    description:
      "Create, store, and renew leases. Get notified before expiry windows open so renewals never slip.",
  },
  {
    Icon: Wrench,
    title: "Maintenance workflows",
    description:
      "Tenants submit tickets; you assign, track, and close them. A full repair trail on every unit.",
  },
  {
    Icon: BarChart3,
    title: "Owner-ready reports",
    description:
      "Revenue performance, occupancy trends, and expense ratios — formatted for landlords, not accountants.",
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

const testimonials = [
  {
    quote:
      "Before KeyNest, rent collection was three spreadsheets and a group chat. Now I can see every tenant's status in thirty seconds.",
    name: "Ricardo Dela Cruz",
    role: "Landlord · 3 properties · Makati",
    initials: "RD",
  },
  {
    quote:
      "Managing 54 units across two buildings used to take my whole Monday. KeyNest cut that to an hour, and the maintenance log alone saved us from a major dispute.",
    name: "Maria Santos",
    role: "Property Manager · Metro Manila",
    initials: "MS",
  },
  {
    quote:
      "I travel for work and still know what's happening at home. The lease countdown and the payment calendar are exactly what I needed as a tenant.",
    name: "Andrea Reyes",
    role: "Tenant · Aurelia Heights",
    initials: "AR",
  },
];

// ─── Pricing ─────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For individual landlords managing up to 5 units.",
    cta: "Get started free",
    featured: false,
    perks: [
      "Up to 5 units",
      "Tenant & lease records",
      "Rent tracking",
      "Basic maintenance log",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: "₱1,490",
    period: "/mo",
    description: "For property managers handling multiple properties.",
    cta: "Start 14-day trial",
    featured: true,
    perks: [
      "Unlimited units",
      "All Starter features",
      "Role-based access (manager · landlord · tenant)",
      "Revenue & expense reports",
      "Maintenance photo uploads",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For real estate companies and large portfolios.",
    cta: "Contact us",
    featured: false,
    perks: [
      "Everything in Professional",
      "Custom roles & permissions",
      "Audit log & compliance exports",
      "Dedicated account manager",
      "SLA-backed uptime",
    ],
  },
];

// ─── How it works steps ───────────────────────────────────────────────────────

const steps = [
  {
    label: "Add your properties",
    description:
      "Enter your building or house details, then add units with rent amounts and bedroom counts.",
  },
  {
    label: "Invite your team",
    description:
      "Add managers, landlords, and tenants. Each role sees only what's relevant to them.",
  },
  {
    label: "Go live",
    description:
      "Collect rent, handle maintenance, and generate reports — from day one, no training required.",
  },
];

// ─── HomePage ─────────────────────────────────────────────────────────────────

export function HomePage() {
  const navigate = useNavigate();
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-gray-900">
      <Nav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 md:pt-20">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_420px]">
          {/* Left copy */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Property management, simplified
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-[3.25rem]">
              Every property.
              <br />
              Every tenant.
              <br />
              <span className="text-emerald-600">One workspace.</span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-gray-600">
              KeyNest gives landlords, managers, and tenants a single place to
              handle rent, leases, and maintenance — without the spreadsheets.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Get started free
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300"
              >
                View demo
                <ChevronRight size={16} />
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Free forever on Starter · No credit card required
            </p>
          </div>

          {/* Right — signature building grid */}
          <div>
            <BuildingGrid />
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="border-y border-gray-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-gray-100 px-5 md:grid-cols-4">
          {[
            { target: 12400, suffix: "+", label: "Units managed" },
            { target: 98, suffix: "%", label: "Rent collected on time" },
            { target: 3200, suffix: "+", label: "Tenants active" },
            { target: 4.9, suffix: "★", label: "Average rating" },
          ].map(({ target, suffix, label }) => (
            <div key={label} className="px-6 py-8 text-center">
              <p className="text-3xl font-bold text-gray-900">
                <StatNumber
                  target={target}
                  suffix={suffix}
                  start={statsVisible}
                />
              </p>
              <p className="mt-1 text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
            What's included
          </p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Built for every role in the building
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-500">
            From the landlord checking yield to the tenant submitting a repair
            request — one product, every perspective.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ Icon, title, description }) => (
            <article
              key={title}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                <Icon size={20} />
              </div>
              <h3 className="mb-1.5 font-semibold text-gray-900">{title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="border-y border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
              Getting started
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Up and running in minutes
            </h2>
          </div>

          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Connector line — desktop only */}
            <div className="absolute left-[16.66%] right-[16.66%] top-6 hidden h-px bg-gray-100 md:block" />

            {steps.map(({ label, description }, i) => (
              <div key={label} className="relative text-center">
                <div className="relative mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-md">
                  {i + 1}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{label}</h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLE BADGES ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="overflow-hidden rounded-2xl bg-gray-900 p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                Role-aware access
              </p>
              <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                The right view for every person in the building.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-400">
                Admins see system health. Managers run day-to-day operations.
                Landlords track their portfolio. Tenants see only their unit.
                One login, the right dashboard.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Try all four roles
                <ArrowRight size={15} />
              </button>
            </div>

            <div className="flex flex-wrap items-start gap-3 md:flex-col">
              {[
                {
                  role: "Admin",
                  color: "bg-gray-800 text-gray-100",
                  dot: "bg-gray-400",
                },
                {
                  role: "Manager",
                  color: "bg-sky-900/60 text-sky-200",
                  dot: "bg-sky-400",
                },
                {
                  role: "Landlord",
                  color: "bg-amber-900/50 text-amber-200",
                  dot: "bg-amber-400",
                },
                {
                  role: "Tenant",
                  color: "bg-emerald-900/50 text-emerald-200",
                  dot: "bg-emerald-400",
                },
              ].map(({ role, color, dot }) => (
                <div
                  key={role}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${color}`}
                >
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  {role}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section id="testimonials" className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
              Testimonials
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              What people say
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map(({ quote, name, role, initials }) => (
              <article
                key={name}
                className="flex flex-col rounded-xl border border-gray-100 bg-[#f6f7fb] p-6"
              >
                {/* Stars */}
                <div className="mb-4 flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-gray-700">
                  "{quote}"
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {name}
                    </p>
                    <p className="text-xs text-gray-400">{role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
            Pricing
          </p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Simple, honest pricing
          </h2>
          <p className="mx-auto mt-3 max-w-md text-gray-500">
            Start free. Upgrade when you need more. No hidden fees, no per-unit
            surprises.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map(
            ({ name, price, period, description, cta, featured, perks }) => (
              <article
                key={name}
                className={[
                  "relative rounded-xl p-7 transition",
                  featured
                    ? "border-2 border-emerald-600 bg-white shadow-[0_8px_40px_rgba(5,150,105,0.12)]"
                    : "border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]",
                ].join(" ")}
              >
                {featured && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                    Most popular
                  </span>
                )}

                <p className="text-sm font-semibold text-gray-500">{name}</p>
                <p className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">
                    {price}
                  </span>
                  {period && (
                    <span className="text-sm text-gray-400">{period}</span>
                  )}
                </p>
                <p className="mt-1.5 text-sm text-gray-500">{description}</p>

                <button
                  onClick={() => navigate("/login")}
                  className={[
                    "mt-5 w-full rounded-lg py-2.5 text-sm font-semibold transition",
                    featured
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {cta}
                </button>

                <ul className="mt-6 space-y-3">
                  {perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-start gap-2.5 text-sm text-gray-600"
                    >
                      <CheckCircle2
                        size={16}
                        className={
                          featured
                            ? "mt-0.5 shrink-0 text-emerald-600"
                            : "mt-0.5 shrink-0 text-gray-400"
                        }
                      />
                      {perk}
                    </li>
                  ))}
                </ul>
              </article>
            ),
          )}
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-emerald-700">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to simplify your properties?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-emerald-100">
            Join thousands of landlords and managers who stopped managing with
            spreadsheets.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="rounded-lg bg-white px-7 py-3 text-sm font-semibold text-emerald-700 shadow transition hover:bg-emerald-50"
            >
              Start for free
            </button>
            <button
              onClick={() => navigate("/login")}
              className="rounded-lg border border-white/30 px-7 py-3 text-sm font-semibold text-white transition hover:border-white/60"
            >
              View demo
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-white">
                <Building2 size={16} />
              </div>
              <span className="font-semibold text-gray-900">KeyNest</span>
            </div>

            <nav className="flex flex-wrap gap-5 text-sm text-gray-500">
              {["Privacy", "Terms", "Security", "Contact"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="transition hover:text-emerald-700"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-gray-100 pt-6 text-xs text-gray-400 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} KeyNest. All rights reserved.</p>
            <div className="flex items-center gap-1.5">
              <Shield size={12} className="text-emerald-500" />
              <span>SOC 2 compliant · Data hosted in PH</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
