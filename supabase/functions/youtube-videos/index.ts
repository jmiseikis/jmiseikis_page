// YouTube channel feed fetcher — returns parsed videos from the public RSS feed.
// No API key required. Cached for 1 hour at the edge.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CHANNEL_ID = 'UC0BzySUmproMEBjeFpFVcFw'; // @JustinasMiseikis

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  publishedAt: string;
  isShort: boolean;
  views: number;
}

function extract(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].trim() : '';
}

function attr(xml: string, tag: string, attribute: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*\\s${attribute}="([^"]+)"`));
  return m ? m[1] : '';
}

function parseFeed(xml: string): Video[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  return entries.map((entry) => {
    const id = extract(entry, 'yt:videoId');
    const title = extract(entry, 'title');
    const link = attr(entry, 'link', 'href');
    const publishedAt = extract(entry, 'published');
    const description = extract(entry, 'media:description');
    const isShort = link.includes('/shorts/') || /#shorts/i.test(title);
    const viewsAttr = entry.match(/views="(\d+)"/);
    return {
      id,
      title: title.replace(/\s*#shorts\s*$/i, '').trim(),
      description,
      url: isShort ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      publishedAt,
      isShort,
      views: viewsAttr ? parseInt(viewsAttr[1], 10) : 0,
    };
  }).filter((v) => v.id);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LovableBot/1.0)' } },
    );

    if (!res.ok) {
      throw new Error(`YouTube feed returned ${res.status}`);
    }

    const xml = await res.text();
    const videos = parseFeed(xml);

    return new Response(
      JSON.stringify({
        channel: 'Justinas Miseikis',
        channelUrl: `https://www.youtube.com/channel/${CHANNEL_ID}`,
        videos,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('youtube-videos error:', message);
    return new Response(
      JSON.stringify({ error: message, videos: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
