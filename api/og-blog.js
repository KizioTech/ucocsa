export default async function handler(req, res) {
  const { slug } = req.query;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;

  try {
    // 1. Fetch the base index.html from the root of our app
    const appUrl = `${proto}://${host}/`;
    const response = await fetch(appUrl);
    let html = await response.text();

    // 2. If no slug, just return standard HTML
    if (!slug) {
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    }

    // 3. Fetch blog post data from Supabase REST API
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (supabaseUrl && supabaseKey) {
      const postRes = await fetch(
        `${supabaseUrl}/rest/v1/blog_posts?slug=eq.${slug}&select=title,excerpt,content,cover_image_url`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`
          }
        }
      );

      const posts = await postRes.json();
      if (posts && posts.length > 0) {
        const post = posts[0];

        const title = post.title || 'UCOCSA Blog';
        const description = (post.excerpt || post.content || '')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 160);
        // Make sure the image is always an absolute URL (Facebook/WhatsApp reject relative paths)
        const image = post.cover_image_url
          ? (post.cover_image_url.startsWith('http')
              ? post.cover_image_url
              : `${appUrl}${post.cover_image_url.replace(/^\//, '')}`)
          : `${appUrl}og-image.jpg`;
        const postUrl = `${appUrl}blog/${slug}`;

        const cleanTitle = title.replace(/"/g, '&quot;');
        const cleanDesc = description.replace(/"/g, '&quot;');
        const fullTitle = `${cleanTitle} | UCOCSA`;

        // --- STRIP every tag we're about to replace, so nothing duplicates ---
        html = html
          .replace(/<title>[\s\S]*?<\/title>/i, '')
          .replace(/<meta\s+name=["']description["'][^>]*>/gi, '')
          .replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '')
          .replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '');

        // --- Build ONE clean, complete set of tags ---
        const newTags = `
    <title>${fullTitle}</title>
    <meta name="description" content="${cleanDesc}" />

    <meta property="og:title" content="${cleanTitle}" />
    <meta property="og:description" content="${cleanDesc}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${postUrl}" />
    <meta property="og:site_name" content="UCOCSA" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${cleanTitle}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${cleanTitle}" />
    <meta name="twitter:description" content="${cleanDesc}" />
    <meta name="twitter:image" content="${image}" />
        `;

        html = html.replace('</head>', `${newTags}\n</head>`);
      }
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).send(html);
  } catch (error) {
    console.error('SEO dynamic route error:', error);
    return res.redirect(302, `/`);
  }
}