
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

// ==================================================
// SUPABASE CONFIGURATION
// ==================================================

const SUPABASE_URL = process.env.SUPABASE_URL?.trim();

const SUPABASE_KEY = (
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  ""
).trim();

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_ANON_KEY/SUPABASE_PUBLISHABLE_KEY in backend/.env"
  );
}

const supabaseAuthClient = createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

// ==================================================
// AUTHENTICATION MIDDLEWARE
// ==================================================

/**
 * Validates a Supabase access token.
 *
 * Expected request header:
 * Authorization: Bearer <supabase_access_token>
 *
 * On successful validation:
 * req.authUser = authenticated Supabase user
 * req.user = authenticated Supabase user
 *
 * Never trust a user ID supplied by the client.
 */
export async function requireAuth(req, res, next) {
  // --------------------------------------------------
  // 1. Read and validate the Authorization header
  // --------------------------------------------------

  const authorization = req.headers.authorization;

  if (
    typeof authorization !== "string" ||
    !/^Bearer\s+\S+$/i.test(authorization.trim())
  ) {
    return res.status(401).json({
      success: false,
      error: "A valid Bearer authentication token is required.",
    });
  }

  const token = authorization.trim().replace(/^Bearer\s+/i, "");

  // --------------------------------------------------
  // 2. Verify the token with Supabase
  // --------------------------------------------------

  try {
    const { data, error } =
      await supabaseAuthClient.auth.getUser(token);

    if (error || !data?.user?.id) {
      // Diagnostic information only.
      // Never log the access token or any secret key.
      console.error("SUPABASE TOKEN VALIDATION FAILED", {
        supabaseUrl: SUPABASE_URL,
        status: error?.status ?? null,
        code: error?.code ?? null,
        message:
          error?.message ?? "Supabase returned no authenticated user.",
      });

      return res.status(401).json({
        success: false,
        error: "Invalid or expired authentication token.",
        details:
          process.env.NODE_ENV === "production"
            ? undefined
            : error?.message ??
              "Supabase returned no authenticated user.",
      });
    }

    // --------------------------------------------------
    // 3. Attach the verified user to the request
    // --------------------------------------------------

    req.authUser = data.user;
    req.user = data.user;

    return next();
  } catch (error) {
    // Network errors and unexpected Supabase failures.
    console.error("SUPABASE AUTHENTICATION REQUEST FAILED", {
      supabaseUrl: SUPABASE_URL,
      status: error?.status ?? null,
      code: error?.code ?? null,
      message: error?.message ?? "Unknown authentication error.",
    });

    return res.status(503).json({
      success: false,
      error:
        "Unable to verify your session with Supabase. Please try again.",
    });
  }
}

export default requireAuth;