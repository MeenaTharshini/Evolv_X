
import { useState } from "react";
import {
  BookOpen,
  LayoutDashboard,
  Map,
  ChartNoAxesColumnIncreasing,
  LogOut,
  Menu,
  X,
  UserRound,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
    path: "/dashboard#progress",
    icon: ChartNoAxesColumnIncreasing,
  },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  let savedUser = {};

  try {
    savedUser = JSON.parse(
      localStorage.getItem("evolv_user") ||
        sessionStorage.getItem("evolv_user") ||
        "{}"
    );
  } catch {
    savedUser = {};
  }

  const displayName =
    savedUser.name ||
    savedUser.fullName ||
    savedUser.username ||
    "Learner";

  const initial = displayName.trim().charAt(0).toUpperCase() || "L";

  const isActive = (path) => {
    if (path === "/dashboard#progress") {
      return (
        location.pathname === "/dashboard" &&
        location.hash === "#progress"
      );
    }

    return (
      location.pathname === path ||
      (path === "/study/python" &&
        location.pathname.startsWith("/study/python/"))
    );
  };

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();

    [
      "evolv_token",
      "evolv_user",
    ].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    navigate("/login", { replace: true });
  };

  return (
    <>
      {menuOpen && (
        <button
          type="button"
          className="ev-nav-backdrop"
          aria-label="Close navigation"
          onClick={closeMenu}
        />
      )}

      <aside
        className={`ev-navbar ${menuOpen ? "ev-navbar-open" : ""}`}
        aria-label="EVOLV sidebar"
      >
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

        <div className="ev-nav-profile">
          <span className="ev-nav-avatar">{initial}</span>

          <span className="ev-nav-profile-copy">
            <strong>{displayName}</strong>
            <small>Your learning journey</small>
          </span>
        </div>

        <div className="ev-nav-section-label">WORKSPACE</div>

        <nav className="ev-nav-links" aria-label="Main navigation">
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

        <div className="ev-nav-bottom">
          <div className="ev-nav-encouragement">
            <span className="ev-nav-encouragement-icon">✦</span>
            <strong>Keep growing!</strong>
            <p>Small steps lead to big achievements.</p>
          </div>

          <button
            type="button"
            className="ev-nav-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Log out</span>
          </button>

          <div className="ev-nav-footer">
            <span>EVOLV</span>
            <span>Learn. Practice. Grow.</span>
          </div>
        </div>
      </aside>

      <button
        type="button"
        className="ev-nav-mobile-toggle"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
    </>
  );
}
