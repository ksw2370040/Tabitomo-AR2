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

    const passwordnewField = document.getElementById("password");
    if (passwordnewField) {
        passwordnewField.type = passwordnewField.type === "password" ? "text" : "password";
    }
}

// 新規登録フォームの処理
document.getElementById('registration-form')?.addEventListener('submit', function (event) {
    event.preventDefault();

    const adminname = document.getElementById('adminname').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    if (password !== passwordConfirm) {
        alert('パスワードが一致しません');
        return;
    }

    // 確認画面に遷移
    window.location.href = `confirmation.html?adminname=${encodeURIComponent(adminname)}&password=${encodeURIComponent(password)}`;
});

// 確認画面での処理
if (window.location.pathname.includes('confirmation.html')) {
    const params = new URLSearchParams(window.location.search);
    const adminname = params.get('adminname');
    const password = params.get('password');

    document.getElementById('confirm-adminname').textContent = adminname;
    document.getElementById('confirm-password').textContent = password;

    // 登録ボタンがクリックされた時にサーバーに登録を送信
    document.getElementById('confirm-register')?.addEventListener('click', function () {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/newadmin', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.onload = function () {
            if (xhr.status === 200) {
                window.location.href = "success.html";
            } else {
                alert('登録できません');
            }
        };

        // passwordConfirm を送信するように修正
        xhr.send(`adminname=${encodeURIComponent(adminname)}&password=${encodeURIComponent(password)}&passwordConfirm=${encodeURIComponent(password)}`);
    });
}

// ログインフォームの処理
document.getElementById('login-form')?.addEventListener('submit', function (event) {
    event.preventDefault();

    const adminname = document.getElementById('login-name').value;
    const password = document.getElementById('login-pass').value;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/login', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onload = function () {
        if (xhr.status === 200) {
            window.location.href = `/AR_admin/menu.html?adminname=${encodeURIComponent(adminname)}`;
        } else {
            alert('ログイン失敗: 管理者名またはパスワードが間違っています');
        }
    };

    xhr.send(`adminname=${encodeURIComponent(adminname)}&password=${encodeURIComponent(password)}`);
});
