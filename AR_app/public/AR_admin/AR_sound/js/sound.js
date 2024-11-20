// C:\Tabitomo-AR\AR_app\public\AR_admin\AR_model\js\modellist.js

document.addEventListener('DOMContentLoaded', function () {
    // モデル情報を取得するためのAPI呼び出し
    fetch('/sound')  // モデル情報を取得するエンドポイント
        .then(response => response.json())  // JSONレスポンスを取得
        .then(data => {
            const sound = document.querySelector('.sound ul');  // モデル情報を表示する要素を選択

            // 取得したモデル情報をリストに表示
            data.forEach(model => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <p>モデルID: ${model.mdlid}</p>
                   
                `;
                sound.appendChild(listItem);  // リストに追加
            });
        })
        .catch(error => {
            console.error('モデル情報の取得中にエラーが発生しました:', error);
            alert('モデル情報の取得に失敗しました。');
        });
});
