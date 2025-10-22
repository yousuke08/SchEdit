# SchEdit

電子回路図エディタ - Electron + React + Vite

## ダウンロード

[Releases](https://github.com/yousuke08/SchEdit/releases)から最新版をダウンロードしてください。

### インストール方法

#### Mac
1. `SchEdit-mac.zip` をダウンロード
2. zipファイルを解凍
3. `SchEdit.app` をアプリケーションフォルダにコピー
4. 初回起動時に「開発元を確認できません」と表示された場合：
   - アプリを右クリック → 「開く」を選択
   - または、システム環境設定 → セキュリティとプライバシー → 「このまま開く」

#### Windows
1. `SchEdit-win.zip` をダウンロード
2. zipファイルを右クリック → プロパティ → 「ブロックの解除」にチェック → OK
3. zipファイルを解凍
4. `SchEdit.exe` を実行
5. Windows Defenderの警告が表示された場合：
   - 「詳細情報」→「実行」をクリック

## 開発

### 必要要件
- Node.js 20以上
- npm

### セットアップ
```bash
npm install
```

### 開発サーバー起動
```bash
npm run dev
```
ブラウザで http://localhost:5173 を開いてください。

### ビルド

#### Mac用
```bash
npm run electron:build:mac
```

#### Windows用
```bash
npm run electron:build:win
```

ビルド成果物は `dist-electron/` フォルダに生成されます。

## 機能

- 回路図の作成・編集
- 部品ライブラリ（抵抗、コンデンサ、トランジスタ、MOSFETなど）
- 配線の描画（複数のスタイル対応）
- SVG/PNG形式でのエクスポート
- JSON形式でのプロジェクト保存/読込
- コピー＆ペースト
- グリッド表示
- ズーム・パン機能

## ライセンス

MIT
