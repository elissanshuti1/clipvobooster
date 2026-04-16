export interface LemmyPost {
  title: string;
  content: string;
  author: string;
  community: string;
  url: string;
  publishedAt: string;
  instance: string;
  subreddit: string;
  source: "lemmy";
}

const LEMMY_INSTANCES = [
  "https://lemmy.world",
  "https://programming.dev",
  "https://beehaw.org",
];

const LEMMY_COMMUNITIES = [
  "programming",
  "technology",
  "startups",
  "opensource",
  "webdev",
  "linux",
  "Business",
  "Entrepreneur",
  "SmallBusiness",
  "marketing",
  "SEO",
  "ecommerce",
  "SaaS",
  "DevOps",
  "apple",
  "android",
  "gamedev",
];

interface FetchResult {
  posts: LemmyPost[];
  source: string;
  success: boolean;
}

async function fetchFromInstance(
  instance: string,
  community: string,
  limit: number = 20
): Promise<LemmyPost[]> {
  try {
    const url = `${instance}/api/v3/post/list?community_name=${community}&sort=New&limit=${limit}&auth=`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "ClipVoBooster/1.0 (contact support@clipvo.site)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const posts = data.posts || [];

    return posts.map((post: any) => {
      let publishedAt = new Date().toISOString();
      try {
        const published = post.post?.published;
        if (published) {
          if (typeof published === 'number') {
            publishedAt = new Date(published * 1000).toISOString();
          } else if (typeof published === 'string') {
            publishedAt = new Date(published).toISOString();
          }
        }
      } catch (e) {
        publishedAt = new Date().toISOString();
      }
      
      return {
        title: post.post?.name || post.post?.title || "",
        content: post.post?.body || post.post?.content || "",
        author: post.creator?.name || post.creator?.username || "Anonymous",
        community: community,
        url: post.post?.ap_id || `${instance}/post/${post.post?.id}` || `${instance}/post/${post.post?.id}`,
        publishedAt,
        instance: instance.replace("https://", ""),
        subreddit: community,
        source: "lemmy" as const,
      };
    });
  } catch (error) {
    console.warn(`Lemmy fetch failed for ${instance}/c/${community}:`, error);
    return [];
  }
}

export async function fetchFromLemmy(
  subreddits: string[],
  keywords: string[] = []
): Promise<FetchResult> {
  console.log("📡 Starting Lemmy fetch...");

  const allPosts: LemmyPost[] = [];
  const communitiesToFetch: string[] = [];
  const targetCommunities = subreddits.map((s) => s.toLowerCase().replace(/^r\//, ""));

  for (const community of targetCommunities) {
    if (!communitiesToFetch.includes(community)) {
      communitiesToFetch.push(community);
    }
  }

  for (const keyword of keywords.slice(0, 5)) {
    const matchingCommunities = LEMMY_COMMUNITIES.filter((c) =>
      c.toLowerCase().includes(keyword.toLowerCase())
    );
    for (const c of matchingCommunities) {
      if (!communitiesToFetch.includes(c)) {
        communitiesToFetch.push(c);
      }
    }
  }

  communitiesToFetch.push(...LEMMY_COMMUNITIES.slice(0, 3));

  const uniqueCommunities = [...new Set(communitiesToFetch)].slice(0, 10);

  for (const community of uniqueCommunities) {
    for (const instance of LEMMY_INSTANCES) {
      if (allPosts.length >= 30) break;

      const posts = await fetchFromInstance(instance, community, 15);
      allPosts.push(...posts);

      if (posts.length > 0) {
        console.log(`✅ Lemmy: Found ${posts.length} posts from ${community}@${instance}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  const uniquePosts = allPosts.filter(
    (post, index, self) =>
      index === self.findIndex((p) => p.title === post.title && p.url === post.url)
  );

  console.log(`📊 Lemmy total posts: ${uniquePosts.length}`);

  return {
    posts: uniquePosts.slice(0, 30),
    source: "lemmy",
    success: uniquePosts.length > 0,
  };
}

export { LEMMY_INSTANCES, LEMMY_COMMUNITIES };
