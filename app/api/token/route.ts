import { NextResponse } from "next/server";
import twilio from "twilio";
import { logger } from "../../lib/logger";

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

    const identity = 'browser-client';

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: applicationSid,
      incomingAllow: true,
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
    logger.error({ error }, "Error generating token");
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
