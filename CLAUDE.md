# ブラウザ音声通話アプリケーション要件定義書

## 概要

Twilioを使用してブラウザから直接電話をかけることができるWebアプリケーション。日本の電話番号に特化した設計。

## 仕組みの全体像

### アーキテクチャ

1. **ユーザー（オペレーター）はブラウザを使用する**

2. **Next.js API Routes**
   - `/api/token`: Twilio Access Token（JWT）を発行
   - `/api/voice`: TwiML Applicationのwebhookエンドポイント

3. **Twilio Programmable Voice**
   - 受け取ったトークンでブラウザを **WebRTC SIP エンドポイント** として登録
   - SDK から `device.connect({ To: '+8190XXXX...' })` が呼ばれると TwiML で PSTN へ発信

> こうして **ブラウザ↔Twilio↔相手電話番号** のメディアパスが確立します

## 技術スタック

- **フレームワーク**: Next.js 15.3.3 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **通話SDK**: @twilio/voice-sdk
- **サーバーSDK**: twilio

## 機能要件

### 1. 発信フロー

1. オペレーターが電話番号を入力
2. 「発信」ボタンをクリック
3. フロントエンドは `/api/token` から Access Token を取得
4. `Twilio.Device` を初期化し `device.connect()` を呼び出す
5. Twilioが TwiML Application の Voice URL (`/api/voice`) を呼び出し
6. TwiML `<Dial>` で PSTN へ発信

### 2. 電話番号フォーマット

日本の電話番号に対応した自動フォーマット機能：

- `09012345678` → `+819012345678` に自動変換
- `0312345678` → `+81312345678` に自動変換
- `+819012345678` → そのまま使用
- 表示時は逆変換（`+81` → `0`）

### 3. UI コンポーネント

#### ダイヤルパッド
- 数字ボタン（0-9）
- 特殊文字ボタン（*, #）
- 文字表示（2:ABC, 3:DEF など）
- バックスペース・クリア機能

#### ステータス表示
- **発信準備完了** (idle): 初期状態
- **接続中...** (dialing): 発信開始
- **呼び出し中...** (ringing): 相手を呼び出し中
- **通話中** (in-call): 通話中、経過時間表示
- **通話終了** (ended): 通話終了

#### 操作ボタン
- **発信/通話中**: 状態により自動切り替え
- **ミュート/ミュート解除**: 通話中のみ表示
- **通話終了**: 通話中のみ表示
- 発信元番号の表示

### 4. エラー処理

- トースト通知でエラー表示（5秒後に自動消去）
- ConnectionError (31005) は正常な通話終了として処理
- 最大3回までのリトライ機能
- デバイス初期化エラーの適切なハンドリング

## 非機能要件

### セキュリティ
- 環境変数で機密情報を管理
- Access Tokenは都度生成
- NEXT_PUBLIC プレフィックスで公開情報を明示

### パフォーマンス
- Twilio Deviceの適切な初期化と破棄
- メモリリークを防ぐクリーンアップ処理

### 保守性
- TypeScriptによる型安全性
- コンポーネントの責務分離
- カスタムフックによるロジックの分離

## 環境変数

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_APPLICATION_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_TWILIO_PHONE_NUMBER=+81xxxxxxxxxx
```

## セットアップ要件

1. Twilioアカウントの作成
2. 日本の電話番号（+81）の購入
3. API Key/Secretの生成
4. TwiML Applicationの設定（Voice URL: https://your-domain/api/voice）
5. 開発時はVSCodeのポートフォワード機能でローカル環境を公開 