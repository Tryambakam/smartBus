export const PUBLIC_NOTICES = [
  {
    id: "notice-system-update",
    title: "System Update: New SmartBus Features",
    message: "Welcome to the new interactive Layout! All sidebars now extend to fill natively, and we've added Live Occupancy tracking arrays. Click the Bell icon in the header anytime to view past broadcasts.",
    date: new Date().toISOString(),
    type: "info"
  },
  {
    id: "notice-route-242",
    title: "Route 242 Diversion",
    message: "Due to heavy highway construction outside Sector 17, expect a 10-15 minute delay on Route 242 through Friday.",
    date: new Date(Date.now() - 86400000).toISOString(),
    type: "warning"
  }
];
