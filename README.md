# BooTauri

TauriベースのBOOプロトコルクライアント（メディアプレーヤー）です。
Androidに向けては、BOOプロトコル対応の高機能メディアプレーヤーとして、BooDroidを公開していますが、
WindowsやMacにも対応するために、Tauriを使ってクロスプラットフォーム化しました (iOSは端末を持っていないので未対応です)。

BOOプロトコルに対応するメディアサーバーには、次のようなものがあります。

- [BooTube](https://github.com/toyota-m2k/ytplayer)<br>
YouTu?e から動画ファイルをダウンロードしてローカルに保存、管理するアプリです。
ダウンロードした動画を分類・絞り込みができ、BOOプロトコルによってLAN内のクライアント（BooTauri, BooDroid）にストリーム配信します。
尚、これ自身も高機能なメディアプレーヤーで、動画への手動・自動チャプター設定が可能で、チャプター毎に動画を分割するなどの編集も可能です。
.NET/WPF で開発しており、Windows専用です。

- [BooServer](https://github.com/toyota-m2k/dxx-browser)<br>
ローカル保存している mp4 や mp3 などのファイルを列挙して、LAN内のクライアントにストリーミング配信するサーバーです。
node.js で動作します。

- [SecureArchive](https://github.com/toyota-m2k/winui-secure-archive)<br>
Android用 [SecureCamera](https://github.com/toyota-m2k/android-camera) で撮影した動画や写真を安全にPC上に保存するストレージアプリです。
ストックした動画や写真を認証付きで、LAN内のクライアントにストリーミング配信することができます。
WinUI3 で開発しており、Windows専用です。

## ビルド

```shell
npm install
npm run tauri build
```
Windows版は Windows PCで、Mac版は、Macで、それぞれビルドします。Linux版も作れるらしいですが、試したことはありません。

- Windows
  - BooTauri/src-tauri/target/release/bundle/msi<br>インストーラ *.msi が生成されます。
  - BooTauri/src-tauri/target/release/bundle/nsis<br>インストーラー *-setup.exe が生成されます。
- Mac
  - BooTauri/src-tauri/target/release/bundle/dmg<br>インストーラー *.dmg が生成されます。

## Key Map
### command/control + ]
デバッグログの画面内表示（トグル）
### ESC
アプリ終了（tauri実行中のみ）
### F11（Win）
最大化（トグル）
### command/control + Shift + F
最大化（トグル）
### NumPad Enter
緊急停止
