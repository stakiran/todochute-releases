# todochute
Todo.txt と TaskChute を足して二で割ったようなタスク管理ツール。

![todochute_image.jpg](img/todochute_image.jpg)

## リリース
- 2019/03/14 [v0.2.0](v0.2.0/index.html)
  - まだまだ未完成ですが、コンテキストタグとプロジェクトタグを追加できるようにしました。
  - **v0.1.0以前からバージョンアップする場合、いったん Reset を行わないと動作しません**
    - 詳しくは [こちら](notice_about_verup.md)
- 2019/03/12 [v0.1.0](tool/v0.1.0/index.html)
  - まだまだ未完成ですが、ヘルプテキストと設定画面の拡充を行いました。
- 2019/03/10 [v0.0.1](tool/v0.0.1/index.html)
  - まだまだ未完成ですが、どんな感じなのかは体感していただけると思います。
- [更新履歴](tool/changelog.md)

## ドキュメント
- [todochute 概要](todochute_overview.md)
- 少しずつ充実させていきます...

5行解説:

- ブラウザから使えます
- 一行一タスクです
- 操作はショートカットキーで行います(Alt+A でタスク追加、Alt+C で複製、Alt+S でソート……みたいな使い心地)
- データはローカルストレージに保存されます
- 詳しいショートカットキーや見方はツール画面下部のチートシートをご覧ください

## 動作環境
以下環境で動作確認しています。

- Windows 7 + Firefox v65
- Windows 10 + Firefox v65
- MacOS 10.14(Mojave) + Firefox v65

以下環境では動作しません。

- Internet Explorer 11
- Safari

他の OS やブラウザで動くかどうかはわかりません。

なお、データの保存にはローカルストレージを使用していますので、ブラウザの設定で Cookie を有効にしないと保存されません。

### Firefox で todochute のみ例外的に許可する
普段 Cookie を無効にされている方は、Firefox v65 の場合、例外的に本サイトを許可対象にすることで保存できるようになります。

設定 > プライバシーとセキュリティ > Cookie とサイトデータ > サイトの設定を管理より `https://stakiran.github.io/todochute-releases/` を追加して許可してください。

![howto_enable_localstorage_firefox.jpg](img/howto_enable_localstorage_firefox.jpg)

詳細: [Cookie を有効または無効にする - Firefox ヘルプ](https://support.mozilla.org/ja/kb/enable-and-disable-cookies-website-preferences)

## 作者
[stakiran](https://stakiran.github.io/stakiran/)
