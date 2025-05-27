"use client";

import { useState, useEffect } from "react";
import { Layout } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BookOutlined,
  CreditCardOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, User, LogOut, Settings, Group, Notebook } from "lucide-react";

const { Content, Footer } = Layout;

const DashboardLayout = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.background = "#E1E1E1";
  }, []);

  const handleNotificationClick = () => {
    // Placeholder
    console.log("Notifications clicked");
  };

  const menuItems = [
    { key: "home", icon: <HomeOutlined />, label: "Home", href: "/admin" },
    {
      key: "students",
      icon: <TeamOutlined />,
      label: "Students",
      href: "/admin/students",
    },
    {
      key: "unapproved",
      icon: <ExclamationCircleOutlined />,
      label: "Unapproved Students",
      href: "/admin/unapproved",
    },
    {
      key: "parents",
      icon: <UserOutlined />,
      label: "Parents",
      href: "/admin/parents",
    },
    {
      key: "teachers",
      icon: <TeamOutlined />,
      label: "Teachers",
      href: "/admin/teachers",
    },
    {
      key: "archive",
      icon: <TeamOutlined />,
      label: "Archive",
      href: "/admin/archive",
    },
    {
      key: "groups",
      icon: <Group />,
      label: "Groups",
      href: "/admin/groups",
    },
    {
      key: "modules",
      icon: <BookOutlined />,
      label: "Modules",
      href: "/admin/modules",
    },
    {
      key: "schedule manager",
      icon: <CalendarOutlined />,
      label: "Schedule",
      href: "/admin/schedule",
    },
    {
      key: "payments",
      icon: <CreditCardOutlined />,
      label: "Payments",
      href: "/admin/payments",
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      label: "Profile",
      icon: <User className="w-4 h-4" />,
      action: () => router.push("/admin/me"),
    },
    
    {
      key: "logout",
      label: "Logout",
      icon: <LogOut className="w-4 h-4" />,
      action: () => router.push("/"),
    },
  ];

  const staticNotifications = [
    { id: 1, text: "3 new students pending approval" },
    { id: 2, text: "Payment failed for Parent13" },
    { id: 3, text: "Term 3 schedule is not finalized" },
  ];

  const getSelectedKey = () => {
    if (pathname === "/admin") return "home";
    return pathname.split("/").pop() || "home";
  };

  return (
    <Layout className="min-h-screen font-serif">
      {/* Sidebar */}
      <aside
        className={`bg-primary text-text-inverted transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        } fixed h-full z-10 shadow-xl flex flex-col`}
      >
        {/* Header / Branding */}
        <div className="relative flex items-center justify-between p-6   text-white backdrop-blur-md">
          <a
            href="/admin"
            className="text-2xl cursor-pointer font-bold font-baskerville italic text-center text-white border-b-4 border-accent inline-block"
          >
            <p className="text-white ">{collapsed ? "D" : "Dirassati"}</p>
          </a>

          {/* Sidebar Toggle Button - Better Placement */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-4 bg-accent text-white rounded-full p-2 shadow-lg hover:bg-accent-light transition z-30"
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2  ">
          {menuItems.map((item) => (
            <Link key={item.key} href={item.href}>
              <Button
                variant={getSelectedKey() === item.key ? "default" : "ghost"}
                className={`w-full justify-start text-white gap-3 text-left rounded-xl font-medium ${
                  getSelectedKey() === item.key
                    ? "bg-primary-light text-white shadow hover:bg-primary-light/80"
                    : "hover:bg-primary-light hover:text-white"
                } ${collapsed ? "px-3 py-2" : "px-4 py-3"}`}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Footer/Optional Section */}
        {!collapsed && (
          <div className="p-4 text-xs text-text-muted  bg-primary-dark/70">
            &copy; {new Date().getFullYear()} Dirassati
          </div>
        )}
      </aside>

      {/* Main layout */}
      <Layout
        className={`${
          collapsed ? "ml-16" : "ml-64"
        } transition-all duration-300 bg-background`}
      >
        {/* Header */}
        <header className="sticky top-0 z-20 bg-primary shadow-card animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="text-lg font-semibold italic text-white">
              Admin Dashboard
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-text-inverted hover:bg-accent hover:text-text-inverted transition-transform duration-300 hover:scale-105"
                    onClick={handleNotificationClick}
                  >
                    <Bell className="w-5 h-5" />
                    <Badge
                      content={staticNotifications.length}
                      className="absolute -top-2 -right-2 bg-accent text-white text-xs font-semibold px-2 py-0.5 rounded-full animate-pulse"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-72 bg-background border border-border text-text animate-slide-down"
                  align="end"
                >
                  <div className="px-3 py-2 text-sm font-semibold border-b border-border">
                    Notifications
                  </div>
                  {staticNotifications.map((notif) => (
                    <DropdownMenuItem
                      key={notif.id}
                      className="text-sm hover:bg-accent hover:text-text-inverted cursor-pointer"
                    >
                      {notif.text}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-text-inverted hover:bg-accent hover:text-text-inverted transition-transform duration-300 hover:scale-105"
                  >
                    <Avatar className="h-8 w-8 bg-accent text-text-inverted">
                      <AvatarImage src="/avatar.png" alt="User" />
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">
                      Admin
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 bg-background border border-border text-text animate-slide-down"
                  align="end"
                >
                  {userMenuItems.map((item) => (
                    <DropdownMenuItem
                      key={item.key}
                      onClick={item.action}
                      className="flex items-center gap-2 hover:bg-accent hover:text-text-inverted focus:bg-accent focus:text-text-inverted transition-colors duration-200"
                    >
                      {item.icon}
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Content */}
        <Content className="m-6 p-6 bg-background-light min-h-[280px] rounded-lg text-text shadow-card">
          {children}
        </Content>

        {/* Footer */}
        <Footer className="text-center bg-background border-t border-border text-text-muted">
          School Dashboard © {new Date().getFullYear()} Created by Your Team
        </Footer>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
  