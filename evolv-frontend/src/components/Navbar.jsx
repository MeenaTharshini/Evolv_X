
import {
  BookOpen,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    closeMenu();

    // Clear authentication and saved user data
    localStorage.removeItem("evolv_token");
    sessionStorage.removeItem("evolv_token");
    localStorage.removeItem("evolv_user");
    sessionStorage.removeItem("evolv_user");

    // Navigate to the login route
    navigate("/login", { replace: true });
  };

  const scrollToSection = (sectionId) => {
    closeMenu();

    // These links navigate to sections on the dashboard
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <header className="navbar">
      {/* Brand */}
      <button
        type="button"
        className="brand"
        onClick={() => scrollToSection("home")}
        aria-label="EVOLV home"
      >
        <span className="brand-icon">
          <BookOpen size={21} strokeWidth={2.4} />
        </span>

        <span className="brand-name">
          EVOLV<span className="brand-dot">.</span>
        </span>
      </button>

      {/* Mobile menu toggle */}
      <button
        type="button"
        className="mobile-menu"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        aria-controls="evolv-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Navigation links */}
      <nav
        id="evolv-navigation"
        className={`nav-links ${menuOpen ? "nav-open" : ""}`}
        aria-label="Main navigation"
      >
        <button
          type="button"
          className="nav-link nav-active"
          onClick={() => scrollToSection("home")}
        >
          <LayoutDashboard size={17} />
          <span>Home</span>
        </button>

        <button
          type="button"
          className="nav-link"
          onClick={() => scrollToSection("python-course")}
        >
          <BookOpen size={17} />
          <span>Learn</span>
        </button>

        <button
          type="button"
          className="nav-link"
          onClick={() => scrollToSection("progress")}
        >
          <span>My progress</span>
        </button>
      </nav>

      {/* Profile and logout actions */}
      <div className="nav-actions">
        <button
          type="button"
          className="nav-profile"
          onClick={() => scrollToSection("progress")}
          aria-label="View your learning progress"
        >
          <span className="profile-avatar" aria-hidden="true">
            L
          </span>

          <span className="profile-label">My learning</span>
        </button>

        <button
          type="button"
          className="nav-logout"
          onClick={handleLogout}
          aria-label="Log out of EVOLV"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>

      {/* Mobile menu backdrop */}
      {menuOpen && (
        <button
          type="button"
          className="nav-overlay"
          aria-label="Close navigation menu"
          onClick={closeMenu}
        />
      )}
    </header>
  );
}