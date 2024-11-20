// C:\Tabitomo-AR\AR_app\public\AR_admin\AR_model\js\modellist.js

document.addEventListener('DOMContentLoaded', function () {
    // モデル情報を取得するためのAPI呼び出し
    fetch('/modellist')  // モデル情報を取得するエンドポイント
        .then(response => response.json())  // JSONレスポンスを取得
        .then(data => {
            const modelList = document.querySelector('.modellist ul');  // モデル情報を表示する要素を選択

            // 取得したモデル情報をリストに表示
            data.forEach(model => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <p>モデルID: ${model.mdlid}</p>
                    <p>マーカーID: ${model.mkid}</p>
                    <p>モデル名: ${model.mdlname}</p>
                    <p>3Dモデル: <img src="/path/to/models/${model.mdlimage}" alt="${model.mdlname}" width="100"></p>
                    <p>音声ID: ${model.mdlsound}</p>
                    <p>字幕ID: ${model.mdltext}</p>
                `;
                modelList.appendChild(listItem);  // リストに追加
            });
        })
        .catch(error => {
            console.error('モデル情報の取得中にエラーが発生しました:', error);
            alert('モデル情報の取得に失敗しました。');
        });
});
