export default function DashboardGrid({ children }) {
  return (
    <div id="dashboard" className="flex flex-row gap-6">
      {children}
    </div>
  );
}