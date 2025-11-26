# Timezone Compare

複数のタイムゾーンを視覚的に比較できるWebツール。[Every Time Zone](https://everytimezone.com/)にインスパイアされたクライアントサイドSPA。

## 機能

- 横並びの24時間タイムラインで複数タイムゾーンを同時表示
- センターラインをドラッグして時刻を調整（15分スナップ）
- 同じ瞬間が縦に揃って表示される
- 勤務時間（9-17時）と夜間（22-6時）を色分け表示
- ローカルタイムゾーンは常に最上部に固定
- ドラッグ&ドロップでタイムゾーンの順序変更
- タイムゾーンごとにカスタムラベルを設定可能
- チェックボックスで選択したタイムゾーンの時刻をコピー
- DSTに対応（luxonライブラリ使用）
- LocalStorageで設定を永続化

## 技術スタック

- Vite
- React
- TypeScript
- luxon（タイムゾーン/DST処理）

## セットアップ

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## ライセンス

MIT
