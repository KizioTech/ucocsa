import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  name?: string;
  type?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  url?: string;
  keywords?: string;
  schema?: Record<string, any>;
}

export default function SEO({ 
  title = "UCOCSA — University of Malawi Church of Christ Student Association", 
  description = "A Christ-centered community nurturing faith, academic excellence, and lifelong fellowship at the University of Malawi.", 
  name = "UCOCSA", 
  type = "website", 
  image = "https://ucocsa.vercel.app/og-image.png",
  imageWidth = 1200,
  imageHeight = 630,
  url = "https://ucocsa.vercel.app/",
  keywords = "church of christ, Unima church of christ, church of christ malawi, COC, C.O.C., namikango mission, UCOCSA, UNIMA, University of Malawi, Christian, Student Fellowship, Chanco, College Fellowship, Christian Organization",
  schema
}: SEOProps) {
  const fullTitle = title.includes("UCOCSA") ? title : `${title} | UCOCSA`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* OpenGraph tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={String(imageWidth)} />
      <meta property="og:image:height" content={String(imageHeight)} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content={name} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={fullTitle} />
      
      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
