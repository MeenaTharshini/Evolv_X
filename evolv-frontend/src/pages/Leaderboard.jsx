import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Crown,
  Flame,
  Medal,
  RefreshCw,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Rightbar from "../components/Rightbar";
import { supabase } from "../lib/supabaseClient";

import "../styles/leaderboard.css";

const LEADERBOARD_LIMIT = 15;

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(
    Math.max(0, Number(value) || 0)
  );
}

function getInitials(name) {
  const words = String(name || "Learner")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "L";

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function getFallbackName(userId, currentUser = null) {
  // No user is signed in, or the user object is not loaded yet.
  if (!currentUser) {
    return "Learner";
  }

  // Only use the current user's profile information when IDs match.
  if (userId && currentUser.id === userId) {
    const metadata = currentUser.user_metadata ?? {};

    const metadataName =
      metadata.full_name ||
      metadata.name ||
      metadata.display_name;

    if (typeof metadataName === "string" && metadataName.trim()) {
      return metadataName.trim();
    }

    if (typeof currentUser.email === "string" && currentUser.email.trim()) {
      return currentUser.email.split("@")[0];
    }
  }

  // Fallback for other learners whose profile names are unavailable.
  const shortId = String(userId || "")
    .replace(/-/g, "")
    .slice(0, 4)
    .toUpperCase();

  return shortId ? `Learner ${shortId}` : "Learner";
}

function getRankLabel(rank) {
  if (rank === 1) return "Champion";
  if (rank === 2) return "Runner-up";
  if (rank === 3) return "Third place";
  return `Rank #${rank}`;
}

function getRankIcon(rank) {
  if (rank === 1) return Crown;
  if (rank === 2) return Medal;
  if (rank === 3) return Award;
  return Star;
}

function getRankClass(rank) {
  if (rank === 1) return "lb-rank-first";
  if (rank === 2) return "lb-rank-second";
  if (rank === 3) return "lb-rank-third";
  return "lb-rank-standard";
}

function getErrorMessage(error) {
  if (!error) {
    return "Something went wrong while loading the leaderboard.";
  }

  if (
    error.code === "42501" ||
    error.message?.toLowerCase().includes("permission denied")
  ) {
    return (
      "Supabase denied access to the leaderboard. Check the SELECT " +
      "policy on user_stats for authenticated users."
    );
  }

  if (
    error.message?.toLowerCase().includes("does not exist") ||
    error.message?.toLowerCase().includes("schema cache")
  ) {
    return (
      "The leaderboard could not find the expected user_stats table " +
      "or its columns. Check your Supabase table names."
    );
  }

  return error.message || "Unable to load the leaderboard.";
}

function LeaderboardLoading() {
  return (
    <div className="lb-state-card" role="status" aria-live="polite">
      <span className="lb-loading-icon">
        <RefreshCw size={23} />
      </span>

      <strong>Gathering the learning champions...</strong>

      <p>
        We’re fetching the latest XP rankings from the EVOLV community.
      </p>

      <div className="lb-loading-track">
        <span />
      </div>
    </div>
  );
}

function LeaderboardEmpty({ onRefresh }) {
  return (
    <div className="lb-state-card">
      <span className="lb-empty-icon">
        <Trophy size={26} />
      </span>

      <strong>Your leaderboard starts here</strong>

      <p>
        No learner statistics are available yet. Complete lessons,
        earn XP, and be among the first to appear here.
      </p>

      <div className="lb-state-actions">
        <Link to="/study/python" className="lb-button lb-button-primary">
          Start learning
          <ArrowRight size={16} />
        </Link>

        <button
          type="button"
          className="lb-button lb-button-secondary"
          onClick={onRefresh}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [learners, setLearners] = useState([]);
  const [totalLearners, setTotalLearners] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserXp, setCurrentUserXp] = useState(0);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadLeaderboard = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage("");

    try {
      // Get the signed-in user. The leaderboard can still load if
      // the session lookup fails, so the query itself is handled below.
      let signedInUser = null;

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.warn(
            "Could not retrieve the current EVOLV user:",
            authError
          );
        } else {
          signedInUser = user ?? null;
        }
      } catch (authError) {
        console.warn(
          "Current-user lookup failed:",
          authError
        );
      }

      setCurrentUser(signedInUser);

      // Fetch real XP records. The count is the total number of rows
      // visible to the current authenticated user under RLS.
      const {
        data: stats,
        error: statsError,
        count,
      } = await supabase
        .from("user_stats")
        .select("user_id, total_xp", { count: "exact" })
        .order("total_xp", { ascending: false })
        .order("user_id", { ascending: true })
        .limit(LEADERBOARD_LIMIT);

      if (statsError) {
        throw statsError;
      }

      const safeStats = Array.isArray(stats) ? stats : [];
      const userIds = [
        ...new Set(
          safeStats
            .map((item) => item.user_id)
            .filter(Boolean)
        ),
      ];

      // The project userService uses profiles.id and profiles.full_name.
      // Profile lookup is optional: if RLS or a missing profile prevents
      // it, learners still appear with a readable fallback name.
      let profileMap = new Map();

      if (userIds.length > 0) {
        try {
          const {
            data: profiles,
            error: profileError,
          } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds);

          if (profileError) {
            console.warn(
              "Leaderboard profile names could not be loaded:",
              profileError
            );
          } else {
            profileMap = new Map(
              (profiles || []).map((profile) => [
                profile.id,
                profile.full_name,
              ])
            );
          }
        } catch (profileError) {
          console.warn(
            "Leaderboard profile lookup failed:",
            profileError
          );
        }
      }

      const normalizedLearners = safeStats.map((stat, index) => {
        const profileName = profileMap.get(stat.user_id);

        const name =
          typeof profileName === "string" && profileName.trim()
            ? profileName.trim()
            : getFallbackName(stat.user_id, signedInUser);

        const xp = Math.max(0, Number(stat.total_xp) || 0);

        return {
          userId: stat.user_id,
          name,
          xp,
          rank: index + 1,
          initials: getInitials(name),
          isCurrentUser: stat.user_id === signedInUser?.id,
        };
      });

      setLearners(normalizedLearners);
      setTotalLearners(
        Number.isFinite(count) ? count : normalizedLearners.length
      );

      // If the signed-in learner is not in the top 15, try to retrieve
      // their own XP row. This allows the personal summary to remain useful
      // without inserting them into the top-15 list.
      let ownXp = 0;
      let ownRank = null;

      if (signedInUser?.id) {
        const existingOwnRow = safeStats.find(
          (item) => item.user_id === signedInUser.id
        );

        if (existingOwnRow) {
          ownXp = Math.max(
            0,
            Number(existingOwnRow.total_xp) || 0
          );

          ownRank =
            normalizedLearners.find(
              (learner) => learner.userId === signedInUser.id
            )?.rank ?? null;
        } else {
          try {
            const {
              data: ownStats,
              error: ownStatsError,
            } = await supabase
              .from("user_stats")
              .select("total_xp")
              .eq("user_id", signedInUser.id)
              .maybeSingle();

            if (!ownStatsError && ownStats) {
              ownXp = Math.max(
                0,
                Number(ownStats.total_xp) || 0
              );

              const {
                count: learnersAhead,
                error: rankError,
              } = await supabase
                .from("user_stats")
                .select("user_id", {
                  count: "exact",
                  head: true,
                })
                .gt("total_xp", ownXp);

              if (!rankError && Number.isFinite(learnersAhead)) {
                ownRank = learnersAhead + 1;
              }
            }
          } catch (ownStatsError) {
            console.warn(
              "Could not calculate the signed-in learner's rank:",
              ownStatsError
            );
          }
        }
      }

      setCurrentUserXp(ownXp);
      setCurrentUserRank(ownRank);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("EVOLV leaderboard loading failed:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadLeaderboard();

    // Refresh when the learner returns to the tab so XP earned in lessons
    // is reflected without requiring a full page reload.
    function handleWindowFocus() {
      void loadLeaderboard({ silent: true });
    }

    function handleLeaderboardUpdated() {
      void loadLeaderboard({ silent: true });
    }

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener(
      "evolv-progress-updated",
      handleLeaderboardUpdated
    );
    window.addEventListener(
      "evolv:progress-updated",
      handleLeaderboardUpdated
    );
    window.addEventListener(
      "evolv-streak-updated",
      handleLeaderboardUpdated
    );
    window.addEventListener(
      "evolv:streak-updated",
      handleLeaderboardUpdated
    );

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener(
        "evolv-progress-updated",
        handleLeaderboardUpdated
      );
      window.removeEventListener(
        "evolv:progress-updated",
        handleLeaderboardUpdated
      );
      window.removeEventListener(
        "evolv-streak-updated",
        handleLeaderboardUpdated
      );
      window.removeEventListener(
        "evolv:streak-updated",
        handleLeaderboardUpdated
      );
    };
  }, [loadLeaderboard]);

  const topThree = useMemo(
    () => learners.filter((learner) => learner.rank <= 3),
    [learners]
  );

  const displayedLearners = useMemo(
    () => learners.slice(0, LEADERBOARD_LIMIT),
    [learners]
  );

  const personalLearner = useMemo(
    () =>
      learners.find((learner) => learner.isCurrentUser) || null,
    [learners]
  );

  const communityXp = useMemo(
    () =>
      learners.reduce(
        (total, learner) => total + learner.xp,
        0
      ),
    [learners]
  );

  const currentName =
    personalLearner?.name ||
    getFallbackName(currentUser?.id, currentUser);

  const currentInitials = getInitials(currentName);

  const visibleLearnerCount = displayedLearners.length;

  return (
    <div className="lb-page">
      <Navbar />

      <main className="lb-main">
        <header className="lb-topbar">
          <div className="lb-breadcrumb">
            <Link to="/dashboard">Home</Link>
            <span aria-hidden="true">/</span>
            <strong>Leaderboard</strong>
          </div>

          <div className="lb-topbar-actions">
            <span>Grow together</span>
            <span className="lb-topbar-avatar" aria-hidden="true">
              🏆
            </span>
          </div>
        </header>

        <div className="lb-content">
          {/* Page heading */}
          <section className="lb-page-heading">
            <Link to="/dashboard" className="lb-back-link">
              <ArrowLeft size={15} />
              Back to Home
            </Link>

            <div className="lb-heading-main">
              <div className="lb-heading-copy">
                <span className="lb-eyebrow">
                  <Sparkles size={14} />
                  THE EVOLV COMMUNITY
                </span>

                <h1>Leaderboard</h1>

              </div>

              <div className="lb-heading-emblem" aria-hidden="true">
                <span>🏆</span>
                <Sparkles className="lb-emblem-spark" size={18} />
                <span className="lb-emblem-star lb-emblem-star-one">
                  ✦
                </span>
                <span className="lb-emblem-star lb-emblem-star-two">
                  ✧
                </span>
              </div>
            </div>
          </section>

          {/* Hero banner */}
          <section className="lb-hero">
            <div className="lb-hero-copy">
              <span className="lb-hero-label">
                <span className="lb-status-dot" />
                YOUR NEXT ACHIEVEMENT
              </span>

              <h2>Learn a little. Level up a lot.</h2>

              <p>
                XP is earned by showing up, practising your skills, and
                completing your learning quests. Keep going—you’re building
                something great.
              </p>

              <div className="lb-hero-meta">
                <span>
                  <Users size={15} />
                  {formatNumber(totalLearners)} learners
                </span>

                <span>
                  <Zap size={15} />
                  XP-powered rankings
                </span>
              </div>

              <Link
                to="/study/python"
                className="lb-hero-button"
              >
                Continue learning
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="lb-hero-art" aria-hidden="true">
              <span className="lb-art-orbit lb-art-orbit-one" />
              <span className="lb-art-orbit lb-art-orbit-two" />

              <span className="lb-art-spark lb-art-spark-one">✦</span>
              <span className="lb-art-spark lb-art-spark-two">✧</span>
              <span className="lb-art-spark lb-art-spark-three">✦</span>

              <div className="lb-art-trophy">
                <Trophy size={56} strokeWidth={1.7} />
              </div>

              <div className="lb-art-pedestal">
                <span />
                <span />
                <span />
              </div>
            </div>
          </section>

          {/* Summary cards */}
          <section className="lb-stat-grid" aria-label="Leaderboard summary">
            <article className="lb-stat-card lb-stat-learners">
              <span className="lb-stat-icon">
                <Users size={19} />
              </span>

              <div>
                <span>Community learners</span>
                <strong>
                  {loading ? "—" : formatNumber(totalLearners)}
                </strong>
                <small>Learning together</small>
              </div>
            </article>

            <article className="lb-stat-card lb-stat-xp">
              <span className="lb-stat-icon">
                <Zap size={19} />
              </span>

              <div>
                <span>Your total XP</span>
                <strong>
                  {loading ? "—" : formatNumber(currentUserXp)}
                </strong>
                <small>Every quest counts</small>
              </div>
            </article>

            <article className="lb-stat-card lb-stat-rank">
              <span className="lb-stat-icon">
                <Trophy size={19} />
              </span>

              <div>
                <span>Your current rank</span>
                <strong>
                  {loading
                    ? "—"
                    : currentUserRank
                      ? `#${formatNumber(currentUserRank)}`
                      : "—"}
                </strong>
                <small>
                  {currentUserRank && currentUserRank <= LEADERBOARD_LIMIT
                    ? "You’re on the board!"
                    : "Keep earning XP"}
                </small>
              </div>
            </article>

            <article className="lb-stat-card lb-stat-community">
              <span className="lb-stat-icon">
                <Flame size={19} />
              </span>

              <div>
                <span>XP in top learners</span>
                <strong>
                  {loading ? "—" : formatNumber(communityXp)}
                </strong>
                <small>
                  Across the {visibleLearnerCount} shown
                </small>
              </div>
            </article>
          </section>

          {/* Personal progress banner */}
          {!loading && !errorMessage && currentUser && (
            <section className="lb-personal-card">
              <div className="lb-personal-avatar">
                {currentInitials}
              </div>

              <div className="lb-personal-copy">
                <span>YOUR EVOLV JOURNEY</span>
                <strong>{currentName}</strong>
                <p>
                  {personalLearner
                    ? "You’re on the leaderboard. Keep learning to climb higher."
                    : "Your progress matters. Keep completing lessons to climb into the top 15."}
                </p>
              </div>

              <div className="lb-personal-xp">
                <span>YOUR XP</span>
                <strong>
                  <Zap size={17} />
                  {formatNumber(currentUserXp)}
                </strong>
              </div>
            </section>
          )}

          {/* Leaderboard section */}
          <section className="lb-ranking-section">
            <div className="lb-section-heading">
              <div>
                <span className="lb-eyebrow">
                  <Trophy size={14} />
                  THE RANKINGS
                </span>

                <h2>Learning champions</h2>

                <p>
                  Rankings are based on the XP saved in your EVOLV account.
                </p>
              </div>

              <button
                type="button"
                className="lb-refresh-button"
                onClick={() => void loadLeaderboard({ silent: true })}
                disabled={loading || refreshing}
                aria-label="Refresh leaderboard"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "lb-spin" : ""}
                />
                <span>{refreshing ? "Refreshing" : "Refresh"}</span>
              </button>
            </div>

            {lastUpdated && !loading && (
              <div className="lb-updated-line">
                <span className="lb-updated-dot" />
                Updated{" "}
                {lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}

            {errorMessage && (
              <div className="lb-error-card" role="alert">
                <span className="lb-error-icon">
                  <BookOpen size={21} />
                </span>

                <div>
                  <strong>We couldn’t load the rankings</strong>
                  <p>{errorMessage}</p>

                  <button
                    type="button"
                    className="lb-button lb-button-secondary"
                    onClick={() => void loadLeaderboard()}
                  >
                    <RefreshCw size={15} />
                    Try again
                  </button>
                </div>
              </div>
            )}

            {loading && !errorMessage && <LeaderboardLoading />}

            {!loading && !errorMessage && learners.length === 0 && (
              <LeaderboardEmpty
                onRefresh={() => void loadLeaderboard()}
              />
            )}

            {!loading && !errorMessage && learners.length > 0 && (
              <>
                {/* Podium */}
                {topThree.length > 0 && (
                  <div className="lb-podium" aria-label="Top three learners">
                    {topThree
                      .slice()
                      .sort((a, b) => {
                        const order = { 2: 0, 1: 1, 3: 2 };
                        return order[a.rank] - order[b.rank];
                      })
                      .map((learner) => {
                        const RankIcon = getRankIcon(learner.rank);

                        return (
                          <article
                            key={learner.userId}
                            className={[
                              "lb-podium-card",
                              getRankClass(learner.rank),
                              learner.isCurrentUser
                                ? "lb-podium-current"
                                : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            <span className="lb-podium-label">
                              {getRankLabel(learner.rank)}
                            </span>

                            <div className="lb-podium-avatar-wrap">
                              <span className="lb-podium-avatar">
                                {learner.initials}
                              </span>

                              <span className="lb-podium-medal">
                                <RankIcon size={17} />
                              </span>
                            </div>

                            <strong
                              className="lb-podium-name"
                              title={learner.name}
                            >
                              {learner.name}
                              {learner.isCurrentUser && (
                                <span className="lb-you-tag">YOU</span>
                              )}
                            </strong>

                            <span className="lb-podium-xp">
                              <Zap size={14} />
                              {formatNumber(learner.xp)} XP
                            </span>

                            <div className="lb-podium-base">
                              <span className="lb-podium-rank">
                                {learner.rank}
                              </span>
                            </div>
                          </article>
                        );
                      })}
                  </div>
                )}

                {/* Full ranking list */}
                <div className="lb-list-card">
                  <div className="lb-list-header">
                    <div>
                      <h3>Top {LEADERBOARD_LIMIT} learners</h3>
                      <p>
                        Showing {visibleLearnerCount} of{" "}
                        {formatNumber(totalLearners)} learners
                      </p>
                    </div>

                    <span className="lb-list-header-icon">
                      <Award size={19} />
                    </span>
                  </div>

                  <div className="lb-table-head" aria-hidden="true">
                    <span>Rank</span>
                    <span>Learner</span>
                    <span>Achievement</span>
                    <span>Total XP</span>
                  </div>

                  <div className="lb-rows">
                    {displayedLearners.map((learner) => {
                      const RankIcon = getRankIcon(learner.rank);

                      return (
                        <article
                          key={learner.userId}
                          className={[
                            "lb-row",
                            getRankClass(learner.rank),
                            learner.isCurrentUser
                              ? "lb-row-current"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <div className="lb-row-rank">
                            {learner.rank <= 3 ? (
                              <span className="lb-row-medal">
                                <RankIcon size={17} />
                              </span>
                            ) : (
                              <span className="lb-rank-number">
                                {String(learner.rank).padStart(2, "0")}
                              </span>
                            )}
                          </div>

                          <div className="lb-row-learner">
                            <span className="lb-row-avatar">
                              {learner.initials}
                            </span>

                            <span className="lb-row-name-wrap">
                              <strong title={learner.name}>
                                {learner.name}
                              </strong>

                              <small>
                                {learner.isCurrentUser
                                  ? "That’s you — keep evolving!"
                                  : `EVOLV learner · ${getRankLabel(
                                      learner.rank
                                    )}`}
                              </small>
                            </span>

                            {learner.isCurrentUser && (
                              <span className="lb-row-you">YOU</span>
                            )}
                          </div>

                          <div className="lb-row-achievement">
                            {learner.rank === 1 ? (
                              <span className="lb-achievement lb-achievement-gold">
                                <Crown size={14} />
                                Champion
                              </span>
                            ) : learner.rank === 2 ? (
                              <span className="lb-achievement lb-achievement-silver">
                                <Medal size={14} />
                                Runner-up
                              </span>
                            ) : learner.rank === 3 ? (
                              <span className="lb-achievement lb-achievement-bronze">
                                <Award size={14} />
                                Top 3
                              </span>
                            ) : (
                              <span className="lb-achievement lb-achievement-standard">
                                <Star size={13} />
                                Climbing
                              </span>
                            )}
                          </div>

                          <div className="lb-row-xp">
                            <strong>{formatNumber(learner.xp)}</strong>
                            <span>XP</span>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="lb-list-footer">
                    <span>
                      <Sparkles size={15} />
                      Consistency is its own superpower.
                    </span>

                    <Link to="/study/python">
                      Earn more XP
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Encouragement banner */}
          <section className="lb-bottom-banner">
            <div className="lb-bottom-icon">
              <Star size={23} />
            </div>

            <div>
              <h3>Your next level is one lesson away.</h3>
              <p>
                Watch. Understand. Apply. Solve. Keep evolving.
              </p>
            </div>

            <Link to="/study/python" className="lb-bottom-button">
              Continue
              <ArrowRight size={15} />
            </Link>
          </section>

          <footer className="lb-footer">
            <Link to="/dashboard" className="lb-footer-brand">
              <span>✦</span> EVOLV<span className="lb-footer-dot">.</span>
            </Link>

            <span>Learn. Practise. Keep evolving.</span>
          </footer>
        </div>
      </main>

      <Rightbar />
    </div>
  );
}