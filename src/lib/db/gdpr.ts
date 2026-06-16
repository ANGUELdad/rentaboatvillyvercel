import { createHash } from "crypto";
import { getGdprSalt } from "@/lib/env";
import { newId } from "@/lib/security/ids";
import { getDb } from "./index";
import type { ConsentRecord, GdprRequest } from "@/types";

export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(ip + getGdprSalt())
    .digest("hex")
    .slice(0, 16);
}

export function hashEmail(email: string): string {
  return createHash("sha256")
    .update(email + getGdprSalt())
    .digest("hex")
    .slice(0, 16);
}

export function hasRecentConsentLog(
  consentId: string,
  analytics: boolean,
  marketing: boolean,
  windowMinutes = 60,
): boolean {
  const db = getDb();
  const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const row = db
    .prepare(
      `SELECT id FROM cookie_consents
       WHERE consent_id = ? AND analytics = ? AND marketing = ? AND created_at > ?
       LIMIT 1`,
    )
    .get(consentId, analytics ? 1 : 0, marketing ? 1 : 0, cutoff);
  return !!row;
}

export function logConsent(data: {
  consentId: string;
  analytics: boolean;
  marketing: boolean;
  policyVersion?: string;
  ip?: string;
  userAgent?: string;
}): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO cookie_consents (id, consent_id, necessary, analytics, marketing, policy_version, ip_hash, user_agent, created_at)
    VALUES (@id, @consent_id, 1, @analytics, @marketing, @policy_version, @ip_hash, @user_agent, @created_at)
  `).run({
    id: newId("consent"),
    consent_id: data.consentId,
    analytics: data.analytics ? 1 : 0,
    marketing: data.marketing ? 1 : 0,
    policy_version: data.policyVersion ?? null,
    ip_hash: data.ip ? hashIp(data.ip) : null,
    user_agent: data.userAgent?.slice(0, 255) ?? null,
    created_at: new Date().toISOString(),
  });
}

export function getConsentLogs(limit = 50): ConsentRecord[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT * FROM cookie_consents ORDER BY created_at DESC LIMIT ?",
    )
    .all(limit);
  return rows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      id: row.id as string,
      consentId: row.consent_id as string,
      necessary: Boolean(row.necessary),
      analytics: Boolean(row.analytics),
      marketing: Boolean(row.marketing),
      policyVersion: (row.policy_version as string | null) ?? null,
      ipHash: row.ip_hash as string | null,
      userAgent: row.user_agent as string | null,
      createdAt: row.created_at as string,
    };
  });
}

export function hasPendingGdprRequest(email: string, hours = 24): boolean {
  const db = getDb();
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const row = db
    .prepare(
      `SELECT id FROM gdpr_requests
       WHERE email = ? AND status = 'pending' AND created_at > ?
       LIMIT 1`,
    )
    .get(email, cutoff);
  return !!row;
}

export function createGdprRequest(data: {
  email: string;
  requestType:
    | "access"
    | "delete"
    | "portability"
    | "rectification"
    | "restriction"
    | "objection"
    | "withdraw_consent";
  message?: string;
}): string {
  const db = getDb();
  const id = newId("gdpr");
  db.prepare(`
    INSERT INTO gdpr_requests (id, email, request_type, status, message, created_at)
    VALUES (@id, @email, @request_type, 'pending', @message, @created_at)
  `).run({
    id,
    email: data.email,
    request_type: data.requestType,
    message: data.message ?? "",
    created_at: new Date().toISOString(),
  });
  return id;
}

export function getGdprRequests(): GdprRequest[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM gdpr_requests ORDER BY created_at DESC")
    .all();
  return rows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      id: row.id as string,
      email: row.email as string,
      requestType: row.request_type as GdprRequest["requestType"],
      status: row.status as GdprRequest["status"],
      message: row.message as string,
      createdAt: row.created_at as string,
    };
  });
}

export function updateGdprRequestStatus(
  id: string,
  status: GdprRequest["status"],
): boolean {
  const db = getDb();
  const result = db
    .prepare("UPDATE gdpr_requests SET status = ? WHERE id = ?")
    .run(status, id);
  return result.changes > 0;
}
