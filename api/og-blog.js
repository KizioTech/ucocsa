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
        const description = post.excerpt || (post.content ? post.content.substring(0, 160) : '');
        const image = post.cover_image_url || `${appUrl}og-image.jpg`;
        const postUrl = `${appUrl}blog/${slug}`;

        // Replace <title>
        html = html.replace(/<title>(.*?)<\/title>/, `<title>${title} | UCOCSA</title>`);

        // Build new OG tags
        const cleanTitle = title.replace(/"/g, '&quot;');
        const cleanDesc = description.replace(/"/g, '&quot;').replace(/\n/g, ' ');

        const ogTags = `
    <meta property="og:title" content="${cleanTitle}" />
    <meta property="og:description" content="${cleanDesc}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${postUrl}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:title" content="${cleanTitle}" />
    <meta name="twitter:description" content="${cleanDesc}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />
        `;

        // Inject tags before </head> to override defaults
        html = html.replace('</head>', `${ogTags}\n</head>`);
      }
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).send(html);
  } catch (error) {
    console.error('SEO dynamic route error:', error);
    // Fallback to minimal layout or just error out so standard handles it
    // Best approach is a 302 redirect back to the normal static route if we fail
    return res.redirect(302, `/`);
  }
}
