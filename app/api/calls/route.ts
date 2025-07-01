import { NextResponse } from "next/server";
import twilio from "twilio";
import { logger } from "../../lib/logger";
import { CallHistoryResponseSchema, CallRecord } from "../../lib/schemas";

function formatPhoneNumber(phoneNumber: string): string {
  // +81から始まる場合は0に変換
  if (phoneNumber.startsWith("+81")) {
    return "0" + phoneNumber.substring(3);
  }
  return phoneNumber;
}

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: "Missing Twilio credentials" },
        { status: 500 }
      );
    }

    const client = twilio(accountSid, authToken);

    // 過去24時間の通話履歴を取得
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // 発信通話を取得
    const outboundCalls = await client.calls.list({
      startTimeAfter: twentyFourHoursAgo,
      from: process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER,
      limit: 25,
    });

    // 着信通話を取得
    const inboundCalls = await client.calls.list({
      startTimeAfter: twentyFourHoursAgo,
      to: process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER,
      limit: 25,
    });

    // 発信と着信を統合
    const calls = [...outboundCalls, ...inboundCalls];

    const callHistory: CallRecord[] = calls.map((call) => ({
      sid: call.sid,
      from: formatPhoneNumber(call.from),
      to: formatPhoneNumber(call.to),
      direction: call.direction,
      status: call.status,
      duration: call.duration ? parseInt(call.duration) : 0,
      startTime: call.startTime ? call.startTime.toISOString() : new Date().toISOString(),
      endTime: call.endTime ? call.endTime.toISOString() : null,
      price: call.price,
      priceUnit: call.priceUnit,
    }));

    // 新しい順にソート
    callHistory.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    // zodでレスポンスを検証
    const response = CallHistoryResponseSchema.parse({ calls: callHistory });
    
    return NextResponse.json(response);
  } catch (error) {
    logger.error({ error }, "Error fetching call logs");
    return NextResponse.json(
      { error: "Failed to fetch call logs" },
      { status: 500 }
    );
  }
}
