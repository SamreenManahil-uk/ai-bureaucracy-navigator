import {
  useState,
  type ReactNode,
} from "react";

import {
  Bot,
  FileText,
  LayoutDashboard,
  History,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  UserRound,
  Workflow,
  X,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  ThemeSwitcher,
} from "../ui/ThemeSwitcher";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({
  children,
}: AppShellProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const logout = () => {
    signOut();
    navigate("/login");
  };

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/documents",
      label: "Documents",
      icon: FileText,
    },
    {
      to: "/workflows",
      label: "Workflows",
      icon: Workflow,
    },
    {
      to: "/assistant",
      label: "AI Assistant",
      icon: Bot,
    },
    {
      to: "/history",
      label: "History",
      icon: History,
    },
  ];

  if (user?.role === "ADMIN") {
    navItems.push({
      to: "/admin",
      label: "Admin",
      icon: ShieldCheck,
    });
  }

  const SidebarContent = () => (
    <>
      <div className="shell-brand">
        <div className="shell-brand-icon">
          <Bot size={22} />
        </div>

        <div>
          <strong>Navigator AI</strong>
          <span>Action intelligence</span>
        </div>
      </div>

      <div className="shell-nav-label">
        WORKSPACE
      </div>

      <nav className="shell-nav">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() =>
                setMobileOpen(false)
              }
              className={({ isActive }) =>
                isActive
                  ? "shell-nav-item active"
                  : "shell-nav-item"
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>

              <span className="shell-nav-glow" />
            </NavLink>
          );
        })}
      </nav>

      <div className="shell-ai-card">
        <div className="shell-ai-card-icon">
          <Sparkles size={18} />
        </div>

        <strong>
          AI Workspace
        </strong>

        <span>
          RAG, agents and workflow
          intelligence are active.
        </span>
      </div>

      <button
        className="shell-logout"
        onClick={logout}
      >
        <LogOut size={17} />
        <span>Sign out</span>
      </button>
    </>
  );

  return (
    <div className="app-shell">
      <aside className="shell-sidebar">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="mobile-nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setMobileOpen(false)
              }
            />

            <motion.aside
              className="mobile-sidebar"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 30,
              }}
            >
              <button
                className="mobile-close"
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                <X size={20} />
              </button>

              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <section className="shell-content">
        <header className="shell-topbar">
          <div className="shell-topbar-left">
            <button
              className="mobile-menu-button"
              onClick={() =>
                setMobileOpen(true)
              }
            >
              <Menu size={21} />
            </button>

            <div className="shell-status">
              <span />
              System online
            </div>
          </div>

          <div className="shell-topbar-right">
            <ThemeSwitcher />

            <div className="profile-wrapper">
              <button
                className="profile-button"
                onClick={() =>
                  setProfileOpen(
                    (current) => !current
                  )
                }
              >
                <div className="profile-avatar">
                  <UserRound size={17} />
                </div>

                <div className="profile-copy">
                  <strong>
                    {user?.name || "User"}
                  </strong>

                  <span>
                    {user?.role || "USER"}
                  </span>
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    className="profile-menu"
                    initial={{
                      opacity: 0,
                      y: -8,
                      scale: 0.98,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                      scale: 0.98,
                    }}
                  >
                    <div className="profile-menu-user">
                      <strong>
                        {user?.name}
                      </strong>

                      <span>
                        {user?.email}
                      </span>
                    </div>

                    <button
                      onClick={logout}
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="shell-page-content">
          {children}
        </div>
      </section>
    </div>
  );
}
