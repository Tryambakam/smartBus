import SidebarNavigation from "./SidebarNavigation";

export default function MainLayout({ children }) {
  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen">
      <SidebarNavigation />
      <div className="flex-1 flex flex-col min-w-0 relative">
        {children}
      </div>
    </div>
  );
}
