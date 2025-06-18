import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(request: NextRequest) {
  const twiml = new twilio.twiml.VoiceResponse();

  try {
    const formData = await request.formData();
    const to = formData.get("To") as string;
    const from = formData.get("From") as string;
    const direction = formData.get("Direction") as string;

    console.log('Voice webhook called:', { to, from, direction });

    // ブラウザクライアントからの発信の場合
    if (from === 'client:browser-client' && to) {
      console.log('Outgoing call from browser client to:', to);
      const dial = twiml.dial({
        callerId: process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER,
        timeout: 30,
        answerOnBridge: true,
      });
      dial.number(to);
    }
    // 外部からTwilio番号への着信の場合
    else if (direction === 'inbound' && from !== 'client:browser-client') {
      console.log('Incoming call from external number - routing to browser client');
      const dial = twiml.dial({
        timeout: 30,
        answerOnBridge: true,
      });
      dial.client('browser-client');
    } else {
      console.log('Invalid call configuration:', { from, to, direction });
      twiml.say('Invalid call configuration');
    }
  } catch (error) {
    console.error("Voice webhook error:", error);
    twiml.say("An error occurred");
  }

  console.log('TwiML Response:', twiml.toString());

  return new NextResponse(twiml.toString(), {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
