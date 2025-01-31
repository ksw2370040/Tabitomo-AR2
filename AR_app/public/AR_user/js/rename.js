// C:\Tabitomo-AR\AR_app\public\AR_user\js\user.js
// パスワード表示/非表示の切り替え
function togglePassword() {
    const passwordField = document.getElementById("login-pass");
    if (passwordField) {
        passwordField.type = passwordField.type === "password" ? "text" : "password";
    }
 
    const passwordConfirmField = document.getElementById("password-confirm");
    if (passwordConfirmField) {
        passwordConfirmField.type = passwordConfirmField.type === "password" ? "text" : "password";
    }
}
 
// 新規登録フォームの処理
document.getElementById('registration-form')?.addEventListener('submit', function (event) {
    event.preventDefault();
 
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const passwordConfirm = document.getElementById('password-confirm').value.trim();
    const languagename = document.getElementById('languagename').value;
 
    // 入力チェック
    if (password !== passwordConfirm) {
        alert('パスワードが一致しません');
        return;
    }
 
    if (!username || !languagename) {
        alert('すべてのフィールドを正しく入力してください');
        return;
    }
 
    // 確認画面へ遷移
    window.location.href = `confirmation.html?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&languagename=${encodeURIComponent(languagename)}`;
});
 
// 確認画面の処理
if (window.location.pathname.includes('confirmation.html')) {
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');
    const password = params.get('password');
    const languagename = params.get('languagename');
 
    document.getElementById('confirm-username').textContent = username;
    document.getElementById('confirm-password').textContent = '********'; // パスワードは伏せる
    document.getElementById('confirm-languagename').textContent = languagename;
 
    // 登録ボタンの処理
    document.getElementById('confirm-register')?.addEventListener('click', () => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/newUser', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function () {
            if (xhr.status === 200) {
                window.location.href = 'success.html';
            } else {
                alert('登録に失敗しました。再試行してください');
            }
        };
 
        xhr.send(`username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&passwordConfirm=${encodeURIComponent(password)}&languagename=${encodeURIComponent(languagename)}`);
    });
}

// ログインフォームの処理
document.getElementById('login-form')?.addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('login-name').value;
    const password = document.getElementById('login-pass').value;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/userlogin', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onload = function () {
        if (xhr.status === 200) {
            window.location.href = `/AR_user/home.html?username=${encodeURIComponent(username)}`;
        } else {
            alert('ログイン失敗: ユーザー名またはパスワードが間違っています');
        }
    };

    xhr.send(`username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
});

// マイページ: 言語選択ボタンの生成
document.addEventListener("DOMContentLoaded", function () {
    const languages = ["日本語", "英語", "中国語", "フランス語", "韓国語"];
    const container = document.querySelector(".language-select");
    if (container) {
        container.innerHTML = ""; // 初期内容をクリア
 
        languages.forEach(languagename => {
            const button = document.createElement("button");
            button.textContent = languagename;
 
            // 言語変更処理（リンク先の設定）
            button.addEventListener("click", () => {
                const username = localStorage.getItem("username");
                if (!username) {
                    alert("ログインしてください");
                    window.location.href = "login.html";
                    return;
                }
 
                // 言語変更リクエストを送信
                fetch('/api/updatelanguage', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        language: languagename
                    }),
                })
                    .then(response => {
                        if (response.ok) {
                            window.location.href = `language_success.html?languagename=${encodeURIComponent(languagename)}`;
                        } else {
                            alert("言語変更に失敗しました");
                        }
                    })
                    .catch(error => {
                        console.error("エラーが発生しました:", error);
                        alert("サーバーエラーが発生しました");
                    });
            });
 
            container.appendChild(button);
        });
    }
    xhr.send(`languagename=${encodeURIComponent(languagename)}`);
 
});
 
// ユーザー名の取得・表示
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get('username');
 
    // usernameがURLパラメータにある場合、ローカルストレージに保存
    if (username) {
        localStorage.setItem('username', username);
    } else {
        // ローカルストレージから取得
        username = localStorage.getItem('username');
    }

// ユーザー名が存在する場合、ヘッダーと現在の名前に表示
if (username) {
    document.getElementById('username-display').textContent = `name: ${username}`;
    document.getElementById('current-name').textContent = username;
}}
);

document.getElementById("change-name").addEventListener("click", function() {
    const newName = document.getElementById('new-name').value;
    const currentName = document.getElementById('current-name').textContent;
 
    if (!newName.trim()) {
        alert("新しい名前を入力してください。");
        return;
    }
 
    if (newName && newName !== currentName) {
        // サーバーに名前変更リクエストを送信
        fetch('/api/updateusername', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: currentName,
                newusername: newName
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    localStorage.setItem('username', newName); // ローカルストレージに新しい名前を保存
                    window.location.href = 'renamesuccess.html'; // 名前変更成功ページへ遷移
                } else {
                    alert('名前の変更に失敗しました。再試行してください。');
                }
            })
            .catch(error => {
                console.error('エラーが発生しました:', error);
                alert('サーバーエラーが発生しました');
            });
    } else {
        alert("新しい名前を現在の名前と異なるものにしてください。");
    }
});


//デバッグ用０１２６
app.post('/api/userlogin', (req, res) => {
    console.log('Received login request:', req.body);  // リクエスト内容を確認
    const { username, password } = req.body;
    const user = findUserInDatabase(username);

    if (user && user.password === password) {
        res.status(200).send('ログイン成功');
    } else {
        res.status(401).send('ユーザー名またはパスワードが間違っています');
    }
});