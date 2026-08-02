import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireSession } from "@/server/auth/session";

export async function GET(request: Request) {
  await requireSession(["OWNER", "ADMIN"]);
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: "Configure GOOGLE_DRIVE_CLIENT_ID primeiro." }, { status: 503 });
  const state = randomBytes(24).toString("base64url");
  const redirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI ?? `${new URL(request.url).origin}/api/media/google/callback`;
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: "code", access_type: "offline", prompt: "consent", state, scope: "https://www.googleapis.com/auth/drive.file" }).toString();
  const response = NextResponse.redirect(url);
  response.cookies.set("lab_drive_oauth_state", state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 600, path: "/" });
  return response;
}
