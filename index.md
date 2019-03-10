# todochute
Todo.txt と TaskChute を足して二で割ったようなタスク管理ツール。

![todochute_image.jpg](img/todochute_image.jpg)

## リリース
- 2019/03/10 [v0.0.1](tool/v0.0.1/index.html)
  - まだまだ未完成ですが、どんな感じなのかは体感していただけると思います。
- [更新履歴](tool/changelog.md)

## ドキュメント
- [todochute 概要](todochute_overview.md)

(v0.0.1 時点) 五行で解説:

- ブラウザから使えます
- 一行一タスクです
- 操作はショートカットキーで行います(Alt+A でタスク追加、Alt+C で複製、Alt+S でソート……みたいな使い心地)
- データはローカルストレージに保存されます
- 詳しいショートカットキーや見方はツール画面下部のチートシートをご覧ください

## 動作環境
Windows + Firefox で動作確認をしています。他の OS やブラウザで動くかどうかはわかりません。

なお、データの保存にはローカルストレージを使用していますので、ブラウザの設定で Cookie を有効にしないと保存されません。

### todochute 設定のみ例外的に許可する
普段 Cookie を無効にされている方は、Firefox v65 の場合、例外的に本サイトを許可対象にすることで保存できるようになります。

設定 > プライバシーとセキュリティ > Cookie とサイトデータ > サイトの設定を管理より `https://stakiran.github.io/todochute-releases/` を追加して許可してください。

![howto_enable_localstorage_firefox.jpg](img/howto_enable_localstorage_firefox.jpg)

詳細: [Cookie を有効または無効にする - Firefox ヘルプ](https://support.mozilla.org/ja/kb/enable-and-disable-cookies-website-preferences)

## 作者
stakiran

- [ウェブサイト](https://stakiran.github.io/stakiran/)
