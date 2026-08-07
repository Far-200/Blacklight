import { Navigate, Route, Routes } from "react-router";

import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { FindingsPage } from "@/features/findings/FindingsPage";
import { FixesPage } from "@/features/fixes/FixesPage";
import { NotFoundPage } from "@/features/notfound/NotFoundPage";
import { ReportPage } from "@/features/reports/ReportPage";
import { ReportsListPage } from "@/features/reports/ReportsListPage";
import { AuthorizationPage } from "@/features/authorization/AuthorizationPage";
import { ScanDetailPage } from "@/features/scans/ScanDetailPage";
import { ScansListPage } from "@/features/scans/ScansListPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { NewTargetPage } from "@/features/targets/NewTargetPage";

/**
 * Route table.
 *
 * `/scans` and `/reports` are not in the original route list but the primary
 * navigation links to both, so they exist as index screens rather than dead
 * ends.
 */
export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/targets/new" element={<NewTargetPage />} />
        <Route path="/targets/:targetId/authorize" element={<AuthorizationPage />} />

        <Route path="/scans" element={<ScansListPage />} />
        <Route path="/scans/:scanId" element={<ScanDetailPage />} />
        <Route path="/scans/:scanId/findings" element={<FindingsPage />} />
        <Route path="/scans/:scanId/report" element={<ReportPage />} />
        <Route path="/scans/:scanId/fixes" element={<FixesPage />} />

        <Route path="/reports" element={<ReportsListPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
