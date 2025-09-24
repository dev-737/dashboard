'use client';

import Script from 'next/script';
import { useEffect, useId, useState } from 'react';

interface WebsiteSchemaProps {
  url?: string;
  name?: string;
  description?: string;
}

interface SoftwareAppSchemaProps {
  name?: string;
  description?: string;
  ratingValue?: string;
  ratingCount?: string;
}

interface FAQSchemaProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    item: string;
  }>;
}

export function WebsiteSchema({
  url = 'https://interchatdiscord.com',
  name = 'InterChat Discord Bot',
  description = 'Connect Discord servers with cross-server chat, community hubs, and advanced moderation tools.',
}: WebsiteSchemaProps) {
  const [schema, setSchema] = useState('');
  const id = useId();

  useEffect(() => {
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name,
      url,
      description,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${url}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };

    setSchema(JSON.stringify(schemaData));
  }, [url, name, description]);

  return (
    <Script id={id} type="application/ld+json">
      {schema}
    </Script>
  );
}

export function SoftwareAppSchema({
  name = 'InterChat Discord Bot',
  description = 'Connect Discord servers with cross-server chat, community hubs, and advanced moderation tools.',
  ratingValue = '4.8',
  ratingCount = '256',
}: SoftwareAppSchemaProps) {
  const [schema, setSchema] = useState('');
  const id = useId();

  useEffect(() => {
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name,
      applicationCategory: 'CommunicationApplication',
      operatingSystem: 'Discord',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue,
        ratingCount,
        bestRating: '5',
        worstRating: '1',
      },
    };

    setSchema(JSON.stringify(schemaData));
  }, [name, description, ratingValue, ratingCount]);

  return (
    <Script id={id} type="application/ld+json">
      {schema}
    </Script>
  );
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const [schema, setSchema] = useState('');
  const id = useId();

  useEffect(() => {
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    setSchema(JSON.stringify(schemaData));
  }, [faqs]);

  return (
    <Script id={id} type="application/ld+json">
      {schema}
    </Script>
  );
}

export function OrganizationSchema({
  name = 'InterChat',
  url = 'https://interchat.dev',
  logo = 'https://interchatdiscord.com/InterChatLogo.png',
  description = 'Open-source Discord bot platform for connecting communities through cross-server chat.',
}: OrganizationSchemaProps) {
  const [schema, setSchema] = useState('');
  const id = useId();

  useEffect(() => {
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name,
      url,
      logo,
      description,
      sameAs: [
        'https://discord.gg/cgYgC6YZyX',
        'https://github.com/interchatapp/InterChat',
        'https://twitter.com/interchatapp',
      ],
    };

    setSchema(JSON.stringify(schemaData));
  }, [name, url, logo, description]);

  return (
    <Script id={id} type="application/ld+json">
      {schema}
    </Script>
  );
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const [schema, setSchema] = useState('');
  const id = useId();

  useEffect(() => {
    const itemListElement = items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    }));

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement,
    };

    setSchema(JSON.stringify(schemaData));
  }, [items]);

  return (
    <Script id={id} type="application/ld+json">
      {schema}
    </Script>
  );
}
