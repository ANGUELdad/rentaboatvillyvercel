import { GdprAdminPanel } from "@/components/admin/GdprAdminPanel";
import { getConsentLogs, getGdprRequests } from "@/lib/db/gdpr";

export default function AdminGdprPage() {
  const consents = getConsentLogs(100);
  const requests = getGdprRequests();
  return <GdprAdminPanel consents={consents} requests={requests} />;
}
