import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { logger } from "../../lib/logger";

export async function POST(request: NextRequest) {
  const twiml = new twilio.twiml.VoiceResponse();

  try {
    const formData = await request.formData();
    const to = formData.get("To") as string;
    const from = formData.get("From") as string;
    const direction = formData.get("Direction") as string;

    logger.info({ to, from, direction }, "Voice webhook called");

    // ブラウザクライアントからの発信の場合
    if (from === "client:browser-client" && to) {
      logger.info({ to }, "Outgoing call from browser client");
      const dial = twiml.dial({
        callerId: process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER,
        timeout: 30,
        answerOnBridge: true,
      });
      dial.number(to);
    }
    // 外部からTwilio番号への着信の場合
    else if (direction === "inbound" && from !== "client:browser-client") {
      logger.info("Incoming call from external number - routing to browser client");
      const dial = twiml.dial({
        timeout: 30,
        answerOnBridge: true,
      });
      dial.client("browser-client");
    } else {
      logger.warn({ from, to, direction }, "Invalid call configuration");
      twiml.say("Invalid call configuration");
    }
  } catch (error) {
    logger.error({ error }, "Voice webhook error");
    twiml.say("An error occurred");
  }

  logger.debug({ twiml: twiml.toString() }, "TwiML Response");

  return new NextResponse(twiml.toString(), {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
