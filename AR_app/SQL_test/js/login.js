// static/login.js
document.getElementById('login-form').addEventListener('submit', function (event) {
    event.preventDefault(); // デフォルトのフォーム送信を防ぐ

    // フォームデータを取得
    const adminname = document.getElementById('login-name').value;
    const password = document.getElementById('login-pass').value;

    // AJAXリクエストの作成
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/login', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    // レスポンスの処理
    xhr.onload = function () {
        if (xhr.status === 200) {
            // レスポンスが成功した場合
            document.body.innerHTML = xhr.responseText; // ログイン成功メッセージを表示
        } else {
            // エラーメッセージを表示
            alert('ログイン失敗: ユーザー名またはパスワードが間違っています');
        }
    };

    // リクエストを送信
    xhr.send(`adminname=${encodeURIComponent(adminname)}&password=${encodeURIComponent(password)}`);
});
