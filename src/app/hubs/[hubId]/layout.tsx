import '../../global.css';

export default function HubsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="relative min-h-screen">{children}</div>;
}
