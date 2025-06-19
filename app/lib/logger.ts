import pino from "pino";

const level = process.env.NEXT_PUBLIC_LOG_LEVEL || "info";
const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level,
  browser: {
    asObject: false, // ブラウザでは文字列形式で出力
    serialize: true,
  },
  transport:
    typeof window === "undefined" && isDev
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});
