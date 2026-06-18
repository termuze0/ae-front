import React from 'react';
import DOMPurify from 'dompurify';

interface SafeHtmlProps {
  html: string | null | undefined;
  className?: string;
}

const SafeHtml: React.FC<SafeHtmlProps> = ({ html, className }) => {
  const safe = React.useMemo(() => {
    if (!html) return '';
    return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  }, [html]);

  return <div className={className} dangerouslySetInnerHTML={{ __html: safe }} />;
};

export default SafeHtml;
