import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useLocation,
  useNavigate,
  type NavigateFunction,
} from "react-router-dom";
import { persistor, type RootState } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slice/authSlice";

import {
  LayoutDashboard,
  Briefcase,
  Users,
  UserPlus,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Plus,
  FolderKanban,
  UserCircle2,
  Search,
} from "lucide-react";
import { clearProfile } from "@/store/slice/profileSlice";
import { useLogoutMutation } from "@/store/api/authApi";

type Role = "hr" | "employee";

interface SubMenuItem {
  label: string;
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
}

interface MenuItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  path: string;
  roles: Role[];
  badge?: string;
  subItems?: SubMenuItem[];
}

interface LibasSidebarProps {
  defaultCollapsed?: boolean;
  // optional override props (fall back to redux values when not provided)
  role?: Role;
  userName?: string;
  userEmail?: string;
  // accept either a simple (path:string)=>void or react-router's NavigateFunction
  onNavigate?: ((path: string) => void) | NavigateFunction;
}

export const LibasSidebar = ({
  defaultCollapsed = false,
  onNavigate,
  role: propRole,
  userName,
  userEmail,
}: LibasSidebarProps) => {
  const dispatch = useDispatch();

  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [isMobileView, setIsMobileView] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const auth = useSelector((state: RootState) => state.auth);
  const roleFromStore = auth.role as Role | undefined;
  const nameFromStore = auth.name;
  const emailFromStore = auth.email;

  const currentRole: Role = (propRole ?? roleFromStore ?? "employee") as Role;
  const displayName = userName ?? nameFromStore ?? "User";
  const displayEmail = userEmail ?? emailFromStore ?? "user@libas.in";

  const navigate = useNavigate();
  const location = useLocation();
  const activeItem = location.pathname;

  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (e) {
      console.error(e);
    }

    dispatch(logout());
    dispatch(clearProfile());
    persistor.purge();

    navigate("/login");
  };
  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);

      if (!mobile) {
        setSidebarVisible(true);
        setCollapsed(defaultCollapsed);
      } else {
        setSidebarVisible(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [defaultCollapsed]);

  // Navigation items configuration
  const navigationItems: MenuItem[] = [
    // Common items
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
      roles: ["hr", "employee"],
    },

    // HR-specific items
    {
      icon: Briefcase,
      label: "Job Management",
      path: "/jobs",
      roles: ["hr"],
      subItems: [
        { label: "Post Job", path: "/jobs/post", icon: Plus },
        { label: "Manage Jobs", path: "/jobs/manage", icon: FolderKanban },
      ],
    },
    {
      icon: Users,
      label: "Candidate Pipeline",
      path: "/candidates",
      roles: ["hr"],
    },
    {
      icon: UserPlus,
      label: "Referrals Management",
      path: "/referrals-manage",
      roles: ["hr"],
    },
    {
      icon: BarChart3,
      label: "Reports & Analytics",
      path: "/reports",
      roles: ["hr"],
    },

    // Employee-specific items
    {
      icon: Search,
      label: "Browse Jobs",
      path: "/browse-jobs",
      roles: ["employee"],
    },

    {
      icon: UserPlus,
      label: "My Referrals",
      path: "/my-referrals",
      roles: ["employee"],
    },

    // Common bottom items
    {
      icon: UserCircle2,
      label: "Profile",
      path: "/profile",
      roles: ["hr", "employee"],
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/settings",
      roles: ["hr", "employee"],
    },
  ];

  const filteredNavItems = navigationItems.filter((item) =>
    item.roles.includes(currentRole as Role),
  );

  const toggleSidebar = () => {
    if (isMobileView) {
      setSidebarVisible(!sidebarVisible);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleItemClick = (path: string, hasSubItems: boolean) => {
    if (hasSubItems) {
      setExpandedItems((prev) =>
        prev.includes(path)
          ? prev.filter((item) => item !== path)
          : [...prev, path],
      );
    } else {
      if (onNavigate) {
        onNavigate(path);
      } else {
        navigate(path); // fallback
      }

      if (isMobileView) {
        setSidebarVisible(false);
      }
    }
  };

  const handleSubItemClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }

    if (isMobileView) {
      setSidebarVisible(false);
    }
  };

  const sidebarWidth = collapsed && !isMobileView ? "w-20" : "w-64";
  const shouldShowSidebar = isMobileView ? sidebarVisible : true;

  return (
    <>
      {/* Sidebar */}
      <AnimatePresence>
        {shouldShowSidebar && (
          <motion.aside
            initial={isMobileView ? { x: -280 } : false}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`
              fixed md:relative z-50 h-screen
              bg-card border-r border-border
              ${sidebarWidth} transition-all duration-300
              flex flex-col
            `}
          >
            {/* Header */}
            <div className="h-16 border-b border-border flex items-center justify-between px-4">
              {(!collapsed || isMobileView) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                    <img
                      src="/logo.jpg"
                      alt="Libas"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground leading-tight">
                      Libas TalentSpark
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {currentRole} Portal
                    </span>
                  </div>
                </motion.div>
              )}

              <button
                onClick={toggleSidebar}
                className="
                  p-2 rounded-lg
                  hover:bg-primary/10 text-muted-foreground hover:text-primary
                  transition-colors
                "
              >
                {collapsed && !isMobileView ? (
                  <Menu size={20} />
                ) : (
                  <X size={20} />
                )}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.path;
                const isExpanded = expandedItems.includes(item.path);
                const hasSubItems = item.subItems && item.subItems.length > 0;

                return (
                  <div key={item.path}>
                    {/* Main item */}
                    <button
                      onClick={() => handleItemClick(item.path, !!hasSubItems)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                        text-sm font-medium transition-all
                        ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        }
                        ${collapsed && !isMobileView ? "justify-center" : ""}
                      `}
                    >
                      <Icon
                        size={20}
                        className={collapsed && !isMobileView ? "" : "shrink-0"}
                      />
                      {(!collapsed || isMobileView) && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {hasSubItems && (
                            <ChevronDown
                              size={16}
                              className={`transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </>
                      )}
                    </button>

                    {/* Sub items */}
                    <AnimatePresence>
                      {(!collapsed || isMobileView) &&
                        hasSubItems &&
                        isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden ml-3 mt-1 space-y-1"
                          >
                            {item.subItems?.map((subItem) => {
                              const SubIcon = subItem.icon;
                              const isSubActive = activeItem === subItem.path;

                              return (
                                <button
                                  key={subItem.path}
                                  onClick={() =>
                                    handleSubItemClick(subItem.path)
                                  }
                                  className={`
                                    w-full flex items-center gap-2 px-3 py-2 rounded-lg
                                    text-sm transition-all
                                    ${
                                      isSubActive
                                        ? "text-primary font-medium bg-primary/5"
                                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                    }
                                  `}
                                >
                                  {SubIcon && <SubIcon size={16} />}
                                  <span className="text-left">
                                    {subItem.label}
                                  </span>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* User section */}
            <div className="border-t border-border p-3">
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium text-muted-foreground
                  hover:bg-red-50 hover:text-red-600
                  dark:hover:bg-red-950/20 dark:hover:text-red-400
                  transition-all mb-3
                  ${collapsed && !isMobileView ? "justify-center" : ""}
                `}
              >
                <LogOut size={20} className="shrink-0" />
                {(!collapsed || isMobileView) && <span>Logout</span>}
              </button>

              {/* User info */}
              {(!collapsed || isMobileView) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="
                    flex items-center gap-3 p-3 rounded-lg
                    bg-primary/5 border border-primary/10
                  "
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary uppercase">
                      {displayName?.charAt(0) ?? "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {displayEmail}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary mt-1">
                      {currentRole?.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile toggle button */}
      {isMobileView && !sidebarVisible && (
        <button
          onClick={toggleSidebar}
          className="
            fixed bottom-6 right-6 z-50 md:hidden
            w-14 h-14 rounded-full
            bg-primary text-primary-foreground
            shadow-lg hover:shadow-xl
            flex items-center justify-center
            transition-all
          "
        >
          <Menu size={24} />
        </button>
      )}

      {/* Mobile overlay */}
      {isMobileView && sidebarVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}
    </>
  );
};
