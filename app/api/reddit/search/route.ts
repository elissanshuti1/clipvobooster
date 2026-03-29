import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: ["author", "link"],
  },
});

// Target subreddits for B2B lead generation
const TARGET_SUBREDDITS = [
  "sales",
  "marketing",
  "entrepreneur",
  "smallbusiness",
  "startup",
  "SaaS",
  "B2B",
  "coldemail",
  "digitalmarketing",
  "growthhacking",
];

export async function POST(request: Request) {
  try {
    const { keyword, subreddit, limit = 20 } = await request.json();

    if (!keyword || !keyword.trim()) {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 },
      );
    }

    const targetSubreddit = subreddit || "sales";

    // Build Reddit RSS URL - using correct format
    const rssUrl = `https://www.reddit.com/r/${targetSubreddit}/search.rss?q=${encodeURIComponent(keyword.trim())}&sort=new&limit=${limit}`;

    // Fetch RSS feed manually with proper headers
    const rssResponse = await fetch(rssUrl, {
      headers: {
        "User-Agent": "ClipVoBooster/1.0 (lead generation tool)",
      },
    });

    if (!rssResponse.ok) {
      throw new Error(`Reddit RSS returned ${rssResponse.status}`);
    }

    const rssText = await rssResponse.text();
    const feed = await parser.parseString(rssText);

    // Transform Reddit posts into clean format
    const posts = feed.items.map((item: any) => ({
      title: item.title,
      author: item.author || item["dc:creator"] || "Unknown",
      subreddit: targetSubreddit,
      url: item.link || item.guid,
      content: item.content || item.summary || item.description || "",
      publishedAt: item.pubDate || item.dc_date || new Date().toISOString(),
      id:
        item.guid?.split("/").pop() || Math.random().toString(36).substr(2, 9),
    }));

    return NextResponse.json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error: any) {
    console.error("Reddit RSS Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch Reddit posts", details: error.message },
      { status: 500 },
    );
  }
}

// GET - Search multiple subreddits at once
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("q");
    const subreddits = searchParams.get("subreddits");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword query parameter "q" is required' },
        { status: 400 },
      );
    }

    const subredditList = subreddits
      ? subreddits.split(",")
      : TARGET_SUBREDDITS;

    // Search all subreddits in parallel
    const results = await Promise.all(
      subredditList.map(async (sub) => {
        try {
          const rssUrl = `https://www.reddit.com/r/${sub}/search?q=${encodeURIComponent(keyword)}.rss?sort=new&limit=${Math.ceil(limit / subredditList.length)}`;
          const feed = await parser.parseURL(rssUrl);
          return feed.items.map((item: any) => ({
            title: item.title,
            author: item.author || "Unknown",
            subreddit: sub,
            url: item.link,
            content: item.content || item.summary || "",
            publishedAt: item.pubDate,
            id:
              item.link?.split("/").pop() ||
              Math.random().toString(36).substr(2, 9),
          }));
        } catch (err) {
          console.error(`Failed to fetch r/${sub}:`, err);
          return [];
        }
      }),
    );

    // Combine and sort by date
    const allPosts = results
      .flat()
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      )
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      count: allPosts.length,
      posts: allPosts,
    });
  } catch (error: any) {
    console.error("Reddit multi-search Error:", error.message);
    return NextResponse.json(
      { error: "Failed to search Reddit", details: error.message },
      { status: 500 },
    );
  }
}
