"use client";

import { useMemo, useState } from "react";
import { ArrowIcon, PhoneIcon, PinIcon } from "@/components/common/icons";
import { branches } from "@/data/branches";
import { MapCanvas3D } from "@/components/sections/locator/map-canvas-3d";

export function BranchLocatorSection() {
  const [region, setRegion] = useState("All regions");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(branches[0].id);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return branches.filter((branch) => {
      const regionMatch = region === "All regions" || branch.region === region;
      const queryMatch =
        !normalized ||
        `${branch.name} ${branch.city} ${branch.address}`.toLowerCase().includes(normalized);
      return regionMatch && queryMatch;
    });
  }, [query, region]);

  const selected = filtered.find((branch) => branch.id === selectedId) ?? filtered[0] ?? branches[0];
  const filteredIds = useMemo(() => filtered.map((b) => b.id), [filtered]);

  const chooseBranch = (id: string) => {
    setSelectedId(id);
    const branch = branches.find((item) => item.id === id);
    if (branch) setRegion(branch.region);
  };

  return (
    <section className="section section--light locator-section" id="branches">
      <div className="section-heading" data-reveal>
        <p data-reveal-item>Branch locator</p>
        <h2 data-reveal-item>Training closer to home.</h2>
        <span data-reveal-item>Select a pin or search a city to view branch details and directions.</span>
      </div>

      <div className="locator-shell" data-reveal>
        <div className="locator-map locator-map--3d" data-reveal-item>
          <MapCanvas3D
            selectedId={selectedId}
            filteredIds={filteredIds}
            onSelectBranch={chooseBranch}
          />
        </div>

        <div className="locator-panel" data-reveal-item>
          <div className="locator-heading">
            <span>Branch explorer</span>
            <strong>{filtered.length} shown</strong>
          </div>
          <label className="branch-search">
            <span className="sr-only">Search branch, city, or province</span>
            <PinIcon />
            <input
              type="search"
              value={query}
              placeholder="Search city or province"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="region-tabs" role="group" aria-label="Filter branches by region">
            {["All regions", "Region VI", "Region X", "Region XI"].map((item) => (
              <button
                key={item}
                type="button"
                className={region === item ? "is-active" : ""}
                aria-pressed={region === item}
                onClick={() => setRegion(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="branch-list" aria-label="Matching branches">
            {filtered.map((branch) => (
              <button
                key={branch.id}
                type="button"
                className={branch.id === selected.id ? "branch-row is-active" : "branch-row"}
                onClick={() => setSelectedId(branch.id)}
              >
                <span>
                  <b>{branch.name}</b>
                  <small>{branch.city}</small>
                </span>
                <em>{branch.region}</em>
              </button>
            ))}
            {!filtered.length && (
              <p className="no-results">No matching branch in this preview. Try the official directory.</p>
            )}
          </div>

          <article className="branch-detail" aria-live="polite">
            <span>{selected.region}</span>
            <h3>{selected.name}</h3>
            <p>{selected.address}</p>
            <div>
              <a href={`tel:${selected.phone.replace(/\s/g, "")}`}>
                <PhoneIcon /> {selected.phone}
              </a>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address)}`}>
                Directions <ArrowIcon />
              </a>
            </div>
          </article>
          <a className="official-directory" href="https://tlmabuhay.com/#branches">
            View the complete official branch directory <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  );
}
