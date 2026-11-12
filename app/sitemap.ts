import type { MetadataRoute } from "next";
import { texasPoliticsStory } from "./stories/texas-politics-story";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.gsrlonestarreport.com";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${baseUrl}${texasPoliticsStory.path}`,
      lastModified: texasPoliticsStory.date,
    },
  ];
}
