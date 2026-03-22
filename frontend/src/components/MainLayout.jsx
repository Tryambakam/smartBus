import SidebarNavigation from "./SidebarNavigation";

export default function MainLayout({ children }) {
  return (
    <div className="flex bg-[#f5f5f7] dark:bg-[#000000] min-h-screen text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/30">
      <SidebarNavigation />
      <div className="flex-1 flex flex-col min-w-0 w-full relative">
        {children}
      </div>
    </div>
  );
}
