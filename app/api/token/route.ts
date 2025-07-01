import { NextResponse } from "next/server";
import twilio from "twilio";
import { logger } from "../../lib/logger";
import { TokenResponseSchema, ErrorResponseSchema } from "../../lib/schemas";

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    const applicationSid = process.env.TWILIO_APPLICATION_SID;

    if (!accountSid || !apiKey || !apiSecret || !applicationSid) {
      const errorResponse = ErrorResponseSchema.parse({
        error: "Missing Twilio configuration"
      });
      return NextResponse.json(errorResponse, { status: 500 });
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

    const response = TokenResponseSchema.parse({
      token: token.toJwt(),
      identity: identity,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error({ error }, "Error generating token");
    const errorResponse = ErrorResponseSchema.parse({
      error: "Failed to generate token"
    });
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
