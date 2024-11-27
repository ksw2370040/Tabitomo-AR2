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
