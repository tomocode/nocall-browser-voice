import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: NextRequest) {
  const twiml = new twilio.twiml.VoiceResponse();
  
  try {
    const formData = await request.formData();
    const to = formData.get('To') as string;
    
    console.log('Voice webhook called with To:', to);
    console.log('Using callerId:', process.env.TWILIO_PHONE_NUMBER);
    
    if (to) {
      // 発信先電話番号へダイヤル
      const dial = twiml.dial({
        callerId: process.env.TWILIO_PHONE_NUMBER,
        timeout: 30,
        answerOnBridge: true,
      });
      dial.number(to);
    } else {
      twiml.say('No phone number provided');
    }
  } catch (error) {
    console.error('Voice webhook error:', error);
    twiml.say('An error occurred');
  }

  console.log('TwiML Response:', twiml.toString());

  return new NextResponse(twiml.toString(), {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}