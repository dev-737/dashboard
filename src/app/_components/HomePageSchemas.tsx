import {
  FAQSchema,
  OrganizationSchema,
  SoftwareAppSchema,
  WebsiteSchema,
} from '@/app/_components/SchemaOrg';

export function HomePageSchemas() {
  return (
    <>
      <WebsiteSchema
        name="InterChat"
        url="https://interchat.dev"
        description="InterChat bridges your Discord servers, creating cross-server communication while maintaining complete moderation control."
      />
      <SoftwareAppSchema
        name="InterChat Discord Bot"
        description="Connect Discord servers with cross-server chat, community hubs, and advanced moderation tools."
        ratingValue="4.8"
        ratingCount="256"
      />
      <OrganizationSchema />
      <FAQSchema
        faqs={[
          {
            question: 'What is InterChat?',
            answer:
              'InterChat is a Discord bot that makes multi-server messaging possible. It allows you to link a channel in your server to a hub (or group chat) where you can chat with other servers that have also linked their channels.',
          },
          {
            question: 'Is InterChat free to use?',
            answer:
              'Yes, InterChat is completely free to use with all core features available to everyone. We offer premium features for those who want to support the project.',
          },
          {
            question: 'How do I add InterChat to my server?',
            answer:
              "You can add InterChat to your Discord server by visiting our website and clicking the 'Add to Discord' button, or by using our direct invite link.",
          },
        ]}
      />
    </>
  );
}
