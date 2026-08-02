import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@lab/database";
import { encryptToken } from "@/features/media/google-drive";
import { getMediaContext } from "@/features/media/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookieStore = await cookies();
  if (!url.searchParams.get("code") || url.searchParams.get("state") !== cookieStore.get("lab_drive_oauth_state")?.value) return NextResponse.redirect(new URL("/media?drive=error", url.origin));
  const redirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI ?? `${url.origin}/api/media/google/callback`;
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code: url.searchParams.get("code")!, client_id: process.env.GOOGLE_DRIVE_CLIENT_ID ?? "", client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET ?? "", redirect_uri: redirectUri, grant_type: "authorization_code" }) });
  const tokens = await response.json() as { access_token?: string; refresh_token?: string; expires_in?: number };
  if (!response.ok || !tokens.access_token) return NextResponse.redirect(new URL("/media?drive=error", url.origin));
  const { workspace } = await getMediaContext(["OWNER", "ADMIN"]);
  await db.storageConnection.upsert({ where: { workspaceId_provider: { workspaceId: workspace.id, provider: "GOOGLE_DRIVE" } }, create: { workspaceId: workspace.id, provider: "GOOGLE_DRIVE", status: "CONNECTED", accountLabel: "Google Drive", encryptedAccessToken: encryptToken(tokens.access_token), encryptedRefreshToken: tokens.refresh_token ? encryptToken(tokens.refresh_token) : null, accessTokenExpiresAt: new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000) }, update: { status: "CONNECTED", encryptedAccessToken: encryptToken(tokens.access_token), ...(tokens.refresh_token ? { encryptedRefreshToken: encryptToken(tokens.refresh_token) } : {}), accessTokenExpiresAt: new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000) } });
  const redirect = NextResponse.redirect(new URL("/media?drive=connected", url.origin));
  redirect.cookies.delete("lab_drive_oauth_state");
  return redirect;
}
