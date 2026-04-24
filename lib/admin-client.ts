export function isAdminClient(uid?: string | null): boolean {
  const raw = process.env.NEXT_PUBLIC_ADMIN_PI_UIDS || "";
  const admins = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return !!uid && admins.includes(uid);
}
