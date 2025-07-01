import { z } from 'zod';

// 通話記録のスキーマ
export const CallRecordSchema = z.object({
  sid: z.string(),
  from: z.string(),
  to: z.string(),
  direction: z.string(), // Twilioの実際のAPIに合わせて文字列で受け入れ
  status: z.string(), // Twilioの実際のAPIに合わせて文字列で受け入れ
  duration: z.number(),
  startTime: z.string(), // ISO文字列形式で受け入れ
  endTime: z.string().nullable(),
  price: z.string().nullable(),
  priceUnit: z.string().nullable(),
});

// 通話履歴レスポンスのスキーマ
export const CallHistoryResponseSchema = z.object({
  calls: z.array(CallRecordSchema),
});

// トークンレスポンスのスキーマ
export const TokenResponseSchema = z.object({
  token: z.string(),
  identity: z.string(),
});

// エラーレスポンスのスキーマ
export const ErrorResponseSchema = z.object({
  error: z.string(),
});

// 通話ステータスのスキーマ
export const CallStateSchema = z.enum(['idle', 'dialing', 'ringing', 'in-call', 'ended', 'incoming']);

// Twilio Webhookパラメータのスキーマ
export const TwilioWebhookSchema = z.object({
  To: z.string().optional(),
  From: z.string().optional(),
  Direction: z.string().optional(),
  CallSid: z.string().optional(),
  AccountSid: z.string().optional(),
});

// 型をエクスポート
export type CallRecord = z.infer<typeof CallRecordSchema>;
export type CallHistoryResponse = z.infer<typeof CallHistoryResponseSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type CallState = z.infer<typeof CallStateSchema>;
export type TwilioWebhook = z.infer<typeof TwilioWebhookSchema>;