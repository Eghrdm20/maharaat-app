export function getAdminUids(): string[] {
  return (process.env.ADMIN_PI_UIDS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isAdminUid(uid?: string | null): boolean {
  if (!uid) return false;
  return getAdminUids().includes(uid.trim());
}
