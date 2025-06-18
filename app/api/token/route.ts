import { NextResponse } from "next/server";
import twilio from "twilio";

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    const applicationSid = process.env.TWILIO_APPLICATION_SID;

    if (!accountSid || !apiKey || !apiSecret || !applicationSid) {
      return NextResponse.json(
        { error: "Missing Twilio configuration" },
        { status: 500 }
      );
    }

    const identity = `user-${Date.now()}`;

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: applicationSid,
      incomingAllow: false,
    });

    const token = new AccessToken(accountSid, apiKey, apiSecret, {
      identity: identity,
    });

    token.addGrant(voiceGrant);

    return NextResponse.json({
      token: token.toJwt(),
      identity: identity,
    });
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
