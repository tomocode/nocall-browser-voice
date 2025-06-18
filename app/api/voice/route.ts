import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(request: NextRequest) {
  const twiml = new twilio.twiml.VoiceResponse();

  try {
    const formData = await request.formData();
    const to = formData.get("To") as string;

    if (to) {
      // 発信先電話番号へダイヤル
      const dial = twiml.dial({
        callerId: process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER,
        timeout: 30,
        answerOnBridge: true,
      });
      dial.number(to);
    } else {
      twiml.say("No phone number provided");
    }
  } catch (error) {
    console.error("Voice webhook error:", error);
    twiml.say("An error occurred");
  }

  return new NextResponse(twiml.toString(), {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
