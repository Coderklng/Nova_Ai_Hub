import type { MetadataRoute } from "next";

const BASE_URL = "https://nova-ai-hub-ehhx.netlify.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes = [
    "",
    "/about",
    "/blog",
    "/carrers",
    "/changelog",
    "/community",
    "/contact",
    "/dashboard",
    "/docs",
    "/enterprise",
    "/models",
    "/offline",
    "/pricing",
    "/privacy",
    "/Product/agent",
    "/Product/code",
    "/Product/deep",
    "/Product/multimodel",
    "/resources/community",
    "/resources/docs",
    "/resources/template",
    "/solutions/developer",
    "/solutions/startup",
    "/solutions/teams",
    "/solutions/workflows",
    "/terms",
  ];

  return routes.map((route, index) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: index === 0 ? "daily" : "weekly",
    priority: index === 0 ? 1.0 : 0.7,
  }));
}