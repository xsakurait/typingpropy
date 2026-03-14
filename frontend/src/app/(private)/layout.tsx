export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="private-layout">
      {}
      {children}
    </div>
  );
}
