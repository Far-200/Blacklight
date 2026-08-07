import type { ProposedFixViewModel } from "@/types/findings";

import { hoursAgo } from "./support";

/**
 * Mock proposed fixes. No fix-generation API exists on the backend and no
 * model call is made from the frontend — these patches were written by hand as
 * fixtures. See frontend/API_GAPS.md.
 */

const fixes: ProposedFixViewModel[] = [
  {
    id: "fix-0001",
    findingId: "f-0001",
    findingTitle: "Database credentials committed to version control",
    severity: "critical",
    filePath: "config/database.yml",
    summary:
      "Read the database password from the environment instead of the tracked config file.",
    rationale:
      "Removing the literal from the file stops the value being redistributed with every clone. It does not revoke the credential — the value is still in git history and must be rotated separately, which no patch can do for you.",
    confidence: 0.82,
    generatedAt: hoursAgo(5),
    reviewed: false,
    hunks: [
      {
        header: "@@ -9,8 +9,8 @@ production:",
        lines: [
          { kind: "context", oldLine: 9, newLine: 9, content: "production:" },
          { kind: "context", oldLine: 10, newLine: 10, content: "  adapter: postgresql" },
          { kind: "context", oldLine: 11, newLine: 11, content: "  host: db.internal" },
          { kind: "removed", oldLine: 12, content: "  username: aurora_app" },
          { kind: "removed", oldLine: 13, content: '  password: "<redacted literal>"' },
          { kind: "added", newLine: 12, content: "  username: <%= ENV.fetch('DATABASE_USER') %>" },
          { kind: "added", newLine: 13, content: "  password: <%= ENV.fetch('DATABASE_PASSWORD') %>" },
          { kind: "context", oldLine: 14, newLine: 14, content: "  pool: 12" },
        ],
      },
    ],
    patch: `--- a/config/database.yml
+++ b/config/database.yml
@@ -9,8 +9,8 @@ production:
 production:
   adapter: postgresql
   host: db.internal
-  username: aurora_app
-  password: "<redacted literal>"
+  username: <%= ENV.fetch('DATABASE_USER') %>
+  password: <%= ENV.fetch('DATABASE_PASSWORD') %>
   pool: 12
`,
  },
  {
    id: "fix-0002",
    findingId: "f-0002",
    findingTitle: "SQL query built by string concatenation in order lookup",
    severity: "high",
    filePath: "app/services/order_lookup.py",
    summary: "Bind the reference value as a query parameter instead of concatenating it.",
    rationale:
      "Parameter binding keeps the value out of the statement text, so it cannot change the query structure regardless of its contents. The surrounding module was not reviewed for the same pattern.",
    confidence: 0.91,
    generatedAt: hoursAgo(5),
    reviewed: false,
    hunks: [
      {
        header: "@@ -42,8 +42,8 @@ def lookup_order(reference: str):",
        lines: [
          { kind: "context", oldLine: 42, newLine: 42, content: "def lookup_order(reference: str):" },
          { kind: "context", oldLine: 43, newLine: 43, content: "    cursor = connection.cursor()" },
          { kind: "removed", oldLine: 44, content: "    query = \"SELECT * FROM orders WHERE reference = '\" + reference + \"'\"" },
          { kind: "removed", oldLine: 45, content: "    cursor.execute(query)" },
          { kind: "added", newLine: 44, content: '    query = "SELECT * FROM orders WHERE reference = %s"' },
          { kind: "added", newLine: 45, content: "    cursor.execute(query, (reference,))" },
          { kind: "context", oldLine: 46, newLine: 46, content: "    return cursor.fetchone()" },
        ],
      },
    ],
    patch: `--- a/app/services/order_lookup.py
+++ b/app/services/order_lookup.py
@@ -42,8 +42,8 @@ def lookup_order(reference: str):
 def lookup_order(reference: str):
     cursor = connection.cursor()
-    query = "SELECT * FROM orders WHERE reference = '" + reference + "'"
-    cursor.execute(query)
+    query = "SELECT * FROM orders WHERE reference = %s"
+    cursor.execute(query, (reference,))
     return cursor.fetchone()
`,
  },
  {
    id: "fix-0003",
    findingId: "f-0003",
    findingTitle: "Session cookie missing Secure and SameSite attributes",
    severity: "high",
    filePath: "app/config/settings.py",
    summary: "Set Secure and SameSite on the session cookie.",
    rationale:
      "SameSite=Lax keeps normal top-level navigation working while dropping the cookie from cross-site subrequests. If any partner flow posts to this app from another origin, Lax will break it — check before merging.",
    confidence: 0.74,
    generatedAt: hoursAgo(5),
    reviewed: true,
    hunks: [
      {
        header: "@@ -31,6 +31,8 @@ SESSION_COOKIE_NAME = \"session\"",
        lines: [
          { kind: "context", oldLine: 31, newLine: 31, content: 'SESSION_COOKIE_NAME = "session"' },
          { kind: "context", oldLine: 32, newLine: 32, content: "SESSION_COOKIE_HTTPONLY = True" },
          { kind: "added", newLine: 33, content: "SESSION_COOKIE_SECURE = True" },
          { kind: "added", newLine: 34, content: 'SESSION_COOKIE_SAMESITE = "Lax"' },
          { kind: "context", oldLine: 33, newLine: 35, content: "SESSION_COOKIE_AGE = 60 * 60 * 8" },
        ],
      },
    ],
    patch: `--- a/app/config/settings.py
+++ b/app/config/settings.py
@@ -31,6 +31,8 @@ SESSION_COOKIE_NAME = "session"
 SESSION_COOKIE_NAME = "session"
 SESSION_COOKIE_HTTPONLY = True
+SESSION_COOKIE_SECURE = True
+SESSION_COOKIE_SAMESITE = "Lax"
 SESSION_COOKIE_AGE = 60 * 60 * 8
`,
  },
];

/** Fixes keyed by the scan they belong to. */
export const mockFixesByScan: Record<string, ProposedFixViewModel[]> = {
  "7c9e1d20-4b6a-4f13-8a55-2b0d9e4f1a01": fixes,
};
