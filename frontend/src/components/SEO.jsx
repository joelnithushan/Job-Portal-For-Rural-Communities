import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  type = 'website',
  url,
  image = '/favicon.png' 
}) => {
  const siteName = "NextEra - Job Portal for Rural Communities";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = "NextEra - Connecting skilled rural workers with local and regional opportunities across Sri Lanka. Find jobs in agriculture, construction, manufacturing, and more.";
  
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph tags (Facebook, LinkedIn, etc.) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
