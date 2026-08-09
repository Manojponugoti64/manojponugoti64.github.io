"use client";

import { useCallback, useEffect, useState } from "react";
import PostCard from "./PostCard";

type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
};

type Tab = "about" | "writing" | "art";

const tabs: { id: Tab; label: string }[] = [
  { id: "about", label: "About" },
  { id: "writing", label: "Writing" },
  { id: "art", label: "Art" },
];

export default function HomeTabs({ posts }: { posts: Post[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("about");

  const switchTab = useCallback((tabId: Tab) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${tabId}`);
    }
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "").toLowerCase() as Tab;
    if (hash && tabs.some((t) => t.id === hash)) {
      setActiveTab(hash);
    }

    const onHashChange = () => {
      const newHash = window.location.hash.replace("#", "").toLowerCase() as Tab;
      if (newHash && tabs.some((t) => t.id === newHash)) {
        setActiveTab(newHash);
      }
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <>
      <div className="homepage-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`home-tab-btn${activeTab === tab.id ? " active" : ""}`}
            onClick={() => switchTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id="tabPanelAbout"
        className={`tab-panel${activeTab === "about" ? " active" : ""}`}
      >
        <div className="about-bio-container">
          <h1>Manoj Ponugoti</h1>
          <p>
            i wish i could do more - i wish i had a thousand hands and a
            thousand eyes and a thousand years and army of angels and a thousand
            stars that lit the sky so bright that the night would never come and
            that our sleepless dreams would fill this world
          </p>
          <p>- by DavidSHolz</p>
        </div>
      </div>

      <div
        id="tabPanelWriting"
        className={`tab-panel${activeTab === "writing" ? " active" : ""}`}
      >
        <section className="posts-grid">
          {posts.map((post) => (
            <PostCard key={post.slug} {...post} />
          ))}
        </section>
      </div>

      <div
        id="tabPanelArt"
        className={`tab-panel${activeTab === "art" ? " active" : ""}`}
      >
        <div className="art-gallery-masonry">
          <div className="art-card">
            <div className="art-card-img-wrapper">
              <img
                src="/gallery/art_lilacs_watercolor.png"
                alt="Lilacs and Lilies by Pierre-Joseph Redouté"
              />
            </div>
            <div className="art-card-info">
              <div className="art-card-title">Lilacs and Lilies</div>
              <div className="art-card-artist">Pierre-Joseph Redouté</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
