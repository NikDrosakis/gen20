import React from "react";

const systems = [
  {
    name: "GAIA",
    tech: "PHP 8.2",
    desc: "Core platform, application logic and APIs",
    href: "/api/v1",
  },
  {
    name: "GOD",
    tech: "Go · :3008",
    desc: "API gateway and realtime messaging hub",
    href: "/god/v1",
  },
  {
    name: "KRONOS",
    tech: "Python · :3006",
    desc: "AI generation and model services (FastAPI)",
    href: "/apy/v1",
  },
  {
    name: "MARS",
    tech: "C++",
    desc: "Native high-performance operations",
  },
  {
    name: "SOL",
    tech: "Bash",
    desc: "Command-line interface and daemon",
  },
  {
    name: "MOON",
    tech: "React / Vite",
    desc: "Reusable frontend sites and CUBOS",
  },
];

const stores = ["MariaDB", "Redis", "CouchDB"];

export default function App() {
  return (
    <div className="page">
      <div className="eyebrow">GEN20 · local</div>
      <h1>localhost</h1>
      <p className="tagline">
        Local entry point for the GEN20 platform — systems, services and storage.
      </p>

      <div className="grid">
        {systems.map((s) => (
          <div className="card" key={s.name}>
            <h2>{s.name}</h2>
            <span className="tech">{s.tech}</span>
            <p>
              {s.desc}
              {s.href && (
                <>
                  {" · "}
                  <a href={s.href}>{s.href}</a>
                </>
              )}
            </p>
          </div>
        ))}
      </div>

      <p className="tagline" style={{ marginTop: "2rem", fontSize: "0.85rem" }}>
        Storage: {stores.join(" · ")}
      </p>
    </div>
  );
}
