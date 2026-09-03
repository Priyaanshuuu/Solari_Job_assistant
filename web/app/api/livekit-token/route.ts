/**
 * LiveKit Token Generation API Route
 * Used by the web frontend to get tokens for connecting to LiveKit
 */

import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

async function resolveRegionalUrl(livekitUrl: string, token: string) {
  const settingsUrl = livekitUrl.replace(/^ws/, "http") + "/settings/regions";
  const response = await fetch(settingsUrl, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`LiveKit region lookup failed with status ${response.status}`);
  }

  const settings = (await response.json()) as {
    regions?: Array<{ url?: string }>;
  };
  const regionalUrl = settings.regions?.find((region) => region.url)?.url;
  if (!regionalUrl) throw new Error("LiveKit returned no available regions");

  return regionalUrl.replace(/^http/, "ws");
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json();
    const roomName = typeof body?.roomName === "string" ? body.roomName.trim() : "";
    const participantName = typeof body?.participantName === "string" ? body.participantName.trim() : "";

    if (
      !roomName ||
      !participantName ||
      roomName.length > 128 ||
      participantName.length > 128 ||
      !/^[a-zA-Z0-9._:-]+$/.test(roomName) ||
      !/^[a-zA-Z0-9._:-]+$/.test(participantName)
    ) {
      return NextResponse.json(
        { error: "Invalid room or participant name", requestId },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "LiveKit is not configured", requestId },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
    });

    at.addGrant({
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
      room: roomName,
      roomJoin: true,
    });

    const token = await at.toJwt();
    const serverUrl = await resolveRegionalUrl(
      process.env.LIVEKIT_URL ?? "",
      token,
    );

    return NextResponse.json(
      { token, serverUrl },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("LiveKit token generation failed", {
      requestId,
      error: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json(
      { error: "Token generation failed", requestId },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
