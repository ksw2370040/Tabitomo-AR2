document.addEventListener('DOMContentLoaded', function () {
    // フォームのsubmitイベントリスナー
    const markerForm = document.querySelector('#markerForm'); // フォームのIDを指定
    markerForm.addEventListener('submit', function (event) {
        event.preventDefault(); // フォームのデフォルト送信を防止

        const formData = new FormData(markerForm);

        fetch('/submit_marker', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                alert('マーカーが登録されました');
                markerForm.reset();
                // マーカー管理ページにリダイレクト
                window.location.href = '/AR_admin/AR_marker/marker.html'; // ここで marker.html にリダイレクト
            } else {
                alert('マーカーの登録に失敗しました');
            }
        })
        .catch(error => {
            console.error('登録中にエラーが発生しました:', error);
            alert('登録中にエラーが発生しました');
        });
    });
});
