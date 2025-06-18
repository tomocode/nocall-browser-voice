## 仕組みの全体像

### アーキテクチャ

1. **ユーザー（オペレーター）はブラウザを使用する**

2. **Next.js API Route** (`/api/token`)

   - `@twilio/jwt` で **Access Token**（JWT）を発行し返却 

3. **Twilio Programmable Voice**

   - 受け取ったトークンでブラウザを **WebRTC SIP エンドポイント** として登録し、

   - SDK から `device.connect({ To: '+8190XXXX...' })` が呼ばれると **REST API** が `<Dial>` で PSTN へ発信 

> こうして **ブラウザ↔Twilio↔相手電話番号** のメディアパスが確立します。ブラウザ側はマイク／スピーカーだけで通話をハンドリングできます 

## 機能要件

### 発信フロー

1. オペレーターが番号を入力し 「Call」 をクリック

2. フロントエンドは **Access Token（JWT）** を `Authorization` ヘッダーまたは Cookie から取得

3. `Twilio.Device` を初期化し `device.connect({ To: <number> })` を呼び出す

4. Twilio が `<Dial><Number>` で PSTN 発呼し、WebRTC メディアをブリッジ 

### UI コンポーネント

- **ダイヤルパッド**（0-9, \*, #）

- **ステータス表示**：Idle / Dialing / Ringing / In-Call / Ended

- **操作ボタン**：Mute／Un-mute、Hang up、Retry

### 3.3 エラー処理

- `device.on('error')` でコード別にトースト表示

- 再接続は最大 3 回リトライ

### 