export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="private-layout">
      {/* Add authentication check here later */}
      {children}
    </div>
  );
}
