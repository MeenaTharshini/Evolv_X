import { useEffect, useState } from "react";

import {
  BookOpen,
  LayoutDashboard,
  Map,
  ChartNoAxesColumnIncreasing,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../lib/supabaseClient";
import { getUserProfile } from "../lib/userService";
import "../styles/navbar.css";

const navigationItems = [
  {
    label: "Home",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Study Map",
    path: "/study/python",
    icon: Map,
  },
  {
    label: "My Progress",
    path: "/progress",
    icon: ChartNoAxesColumnIncreasing,
  },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [displayName, setDisplayName] = useState("Learner");

  const location = useLocation();
  const navigate = useNavigate();

  // --------------------------------------------------
  // LOAD AUTHENTICATED USER PROFILE
  // --------------------------------------------------

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const profile = await getUserProfile();

        if (!active) return;

        const name =
          profile?.full_name?.trim() ||
          profile?.email?.split("@")[0] ||
          "Learner";

        setDisplayName(name);
      } catch (error) {
        if (!active) return;

        console.error("Unable to load EVOLV profile:", error);
        setDisplayName("Learner");
      }
    }

    loadProfile();

    // Refresh the displayed name when authentication changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;

      if (event === "SIGNED_OUT") {
        setDisplayName("Learner");
        return;
      }

      if (
        event === "SIGNED_IN" ||
        event === "USER_UPDATED" ||
        event === "TOKEN_REFRESHED"
      ) {
        // Defer Supabase queries to avoid performing another
        // Supabase operation inside the auth callback itself.
        setTimeout(() => {
          if (active) {
            loadProfile();
          }
        }, 0);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const initial =
    displayName.trim().charAt(0).toUpperCase() || "L";

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------

  function closeMenu() {
    setMenuOpen(false);
  }

  function isActive(path) {
    if (path === "/study/python") {
      return location.pathname.startsWith("/study/python");
    }

    return location.pathname === path;
  }

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");
    closeMenu();

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // Clear obsolete custom-backend authentication values.
      // Do not clear XP, lesson progress, or app preferences.
      try {
        localStorage.removeItem("evolv_token");
        localStorage.removeItem("evolv_user");

        sessionStorage.removeItem("evolv_token");
        sessionStorage.removeItem("evolv_user");
      } catch (storageError) {
        console.warn(
          "Unable to clear legacy session values:",
          storageError
        );
      }

      setDisplayName("Learner");

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("EVOLV logout failed:", error);

      setLogoutError(
        error?.message || "Unable to log out. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <>
      {/* Mobile backdrop */}
      {menuOpen && (
        <button
          type="button"
          className="ev-nav-backdrop"
          aria-label="Close navigation"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`ev-navbar ${
          menuOpen ? "ev-navbar-open" : ""
        }`}
        aria-label="EVOLV sidebar"
      >
        {/* Brand */}
        <div className="ev-nav-brand-row">
          <Link
            to="/dashboard"
            className="ev-nav-brand"
            onClick={closeMenu}
            aria-label="EVOLV Home"
          >
            <span className="ev-nav-brand-icon">
              <BookOpen size={24} strokeWidth={2.5} />
            </span>

            <span className="ev-nav-brand-text">
              EVOLV<span>.</span>
            </span>
          </Link>

          <button
            type="button"
            className="ev-nav-close"
            onClick={closeMenu}
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        {/* Authenticated profile */}
        <div className="ev-nav-profile">
          <span className="ev-nav-avatar">
            {initial}
          </span>

          <span className="ev-nav-profile-copy">
            <strong title={displayName}>
              {displayName}
            </strong>

            <small>Your learning journey</small>
          </span>
        </div>

        {/* Navigation */}
        <div className="ev-nav-section-label">
          WORKSPACE
        </div>

        <nav
          className="ev-nav-links"
          aria-label="Main navigation"
        >
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={closeMenu}
                className={`ev-nav-link ${
                  active ? "ev-nav-link-active" : ""
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={19} strokeWidth={2} />

                <span>{item.label}</span>

                {active && (
                  <ChevronRight
                    className="ev-nav-link-arrow"
                    size={16}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="ev-nav-bottom">
          <div className="ev-nav-encouragement">
            <span className="ev-nav-encouragement-icon">
              ✦
            </span>

            <strong>Keep growing!</strong>

            <p>
              Small steps lead to big achievements.
            </p>
          </div>

          {/* Logout */}
          <button
            type="button"
            className="ev-nav-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={18} />

            <span>
              {loggingOut ? "Signing out..." : "Log out"}
            </span>
          </button>

          {logoutError && (
            <p
              role="alert"
              style={{
                color: "#b42318",
                fontSize: "0.8rem",
                margin: "8px 0",
                overflowWrap: "anywhere",
              }}
            >
              {logoutError}
            </p>
          )}

          <div className="ev-nav-footer">
            <span>EVOLV</span>
            <span>Learn. Practice. Grow.</span>
          </div>
        </div>
      </aside>

      {/* Mobile menu toggle */}
      <button
        type="button"
        className="ev-nav-mobile-toggle"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={
          menuOpen ? "Close navigation" : "Open navigation"
        }
        aria-expanded={menuOpen}
        aria-controls="ev-navbar"
      >
        {menuOpen ? (
          <X size={22} />
        ) : (
          <Menu size={22} />
        )}
      </button>
    </>
  );
}