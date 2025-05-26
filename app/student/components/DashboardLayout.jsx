"use client";

import { useState, useEffect, useCallback } from "react";
import { Layout } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
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
import { Input } from "@/components/ui/input";
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  Group,
  Notebook,
} from "lucide-react";
import { debounce } from "lodash";
const { Content, Footer } = Layout;

const DashboardLayout = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 768);
      setIsSearchOpen(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.background = "#E1E1E1";
  }, []);

  const handleSearch = useCallback(
    debounce((value) => {
      console.log("Searching:", value);
    }, 500),
    []
  );

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    if (!isSearchOpen) setSearchQuery("");
  };

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const menuItems = [
    { key: "home", icon: <HomeOutlined />, label: "Home", href: "/student" },
   
   
   
    {
      key: "schedule",
      icon: <CalendarOutlined />,
      label: "schedule",
      href: "/student/schedule",
    },
    {
      key: "profile",
      icon: <User />,
      label: "Profile",
      href: "/student/profile",
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      label: "Profile",
      icon: <User className="w-4 h-4" />,
      action: () => console.log("Profile clicked"),
    },
    {
      key: "settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
      action: () => console.log("Settings clicked"),
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogOut className="w-4 h-4" />,
      action: () => { localStorage.clear(); router.push("/")},
    },
  ];

  const getSelectedKey = () => {
    if (pathname === "/student") return "home";
    return pathname.split("/").pop() || "home";
  };

  return (
    <Layout className="min-h-screen font-inter">
      <aside
        className={`bg-sidebar-bg text-text-inverted transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        } fixed h-full z-10 shadow-md`}
      >
        <div className="p-4 flex items-center justify-between">
          {!collapsed && (
            <div className="text-xl font-bold font-serif text-text-inverted">
              Dirassati
            </div>
          )}
          {collapsed && (
            <div className="text-xl font-bold font-serif text-text-inverted">
              D
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-text-inverted hover:bg-primary hover:text-text-inverted"
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
        </div>
        <nav className="flex flex-col gap-2 p-2">
          {menuItems.map((item) => (
            <Link key={item.key} href={item.href}>
              <Button
                variant={getSelectedKey() === item.key ? "default" : "ghost"}
                className={`w-full justify-start gap-2 text-left text-text-inverted ${
                  getSelectedKey() === item.key
                    ? "bg-primary-light hover:bg-primary-light"
                    : "hover:bg-primary hover:text-text-inverted"
                } ${collapsed ? "px-2" : "px-4"}`}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          ))}
        </nav>
      </aside>

      <Layout
        className={`${
          collapsed ? "ml-16" : "ml-64"
        } transition-all duration-300 bg-background`}
      >
        <header className="sticky top-0 z-20 bg-header-bg shadow-card animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isSearchOpen ? (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    placeholder="Search students, groups..."
                    className="pl-10 w-48 sm:w-64 border-border bg-background-light text-text focus:ring-primary focus:border-primary transition-all duration-300 rounded-md"
                  />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSearch}
                  className="text-text hover:bg-accent hover:text-text-inverted transition-transform duration-300 hover:scale-105"
                >
                  <Search className="w-5 h-5" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNotificationClick}
                className="relative text-text-inverted hover:bg-accent hover:text-text-inverted transition-transform duration-300 hover:scale-105"
              >
                <Bell className="w-5 h-5" />
                <Badge
                  content="5"
                  className="absolute -top-2 -right-2 bg-accent text-text-inverted text-xs font-semibold px-2 py-0.5 rounded-full animate-pulse"
                />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-text-inverted hover:bg-secondary hover:text-text-inverted transition-transform duration-300 hover:scale-105"
                  >
                    <Avatar className="h-8 w-8 bg-secondary text-text-inverted">
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
        <Content className="m-6 p-6 bg-background-light min-h-[280px] rounded-lg text-text shadow-card">
          {children}
        </Content>
        <Footer className="text-center bg-background border-t border-border text-text-muted">
          School Dashboard © {new Date().getFullYear()} Created by Your Team
        </Footer>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
