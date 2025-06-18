# Twilio Voice Setup Guide

## 必要な設定

1. **Twilio Phone Numberの購入**

   - Twilio Console → Phone Numbers → Buy a Number
   - 日本の番号（+81）でVoice機能が有効な番号を購入
   - 購入した番号を`.env.local`の`NEXT_PUBLIC_TWILIO_PHONE_NUMBER`に設定

2. **TwiML Applicationの設定**

   - Twilio Console → Voice → TwiML Apps
   - Application SID: `AP4b8550c3d7189a3c890ed594e5385d61` を選択
   - Voice Configuration:
     - Request URL: `https://your-domain.com/api/voice` (または ngrok URL)
     - HTTP Method: POST

3. **環境変数の設定**

   ```
   NEXT_PUBLIC_TWILIO_PHONE_NUMBER=+815017225830  # 購入した番号
   ```

4. **ローカル開発時（ngrok使用）**

   ```bash
   # 別ターミナルで
   ngrok http 3000
   
   # ngrok URLをTwiML ApplicationのVoice URLに設定
   # 例: https://abc123.ngrok.io/api/voice
   ```

## 日本の電話番号の入力

以下の形式で入力可能：

- `09012345678` → 自動的に `+819012345678` に変換
- `0312345678` → 自動的に `+81312345678` に変換
- `+819012345678` → そのまま使用

## エラー対処

- **ConnectionError (31005)**:

  - TwiML ApplicationのVoice URLが正しく設定されていない
  - ngrokが起動していない
  - Voice URLがHTTPSでない

- **AccessTokenInvalid**: API KeyとAPI Secretが正しくない