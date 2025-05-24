import DashboardLayout from "../admin_test/components/DashboardLayout";


export default async function AdminLayout({ children, params }) {
  // params is a Promise, but we don’t need it
  // No await needed since we’re not using it
  console.log("Layout params:", params); // Still logs Promise for debugging
  return <DashboardLayout>{children}</DashboardLayout>;
}
