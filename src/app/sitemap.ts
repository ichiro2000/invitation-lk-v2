import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://invitation.lk";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/features`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/templates`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  // Dynamic wedding pages — import Prisma lazily to avoid build issues
  let weddingPages: MetadataRoute.Sitemap = [];
  try {
    const prisma = (await import("@/lib/db")).default;
    const invitations = await prisma.invitation.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });
    weddingPages = invitations.map((inv) => ({
      url: `${baseUrl}/w/${inv.slug}`,
      lastModified: inv.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB not available during build — skip dynamic pages
  }

  return [...staticPages, ...weddingPages];
}
