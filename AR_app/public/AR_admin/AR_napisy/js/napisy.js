document.addEventListener('DOMContentLoaded', function () {
    // モデル情報を取得するためのAPI呼び出し
    fetch('/napisy')  // モデル情報を取得するエンドポイント
        .then(response => response.json())  // JSONレスポンスを取得
        .then(data => {
            const napisy = document.querySelector('.napisy ul');  // モデル情報を表示する要素を選択

            // 取得したモデル情報をリストに表示
            data.forEach(model => {
                const listItem = document.createElement('li');

                // モデルIDにリンクを追加
                listItem.innerHTML = `
                    <a href="napisylist.html?mdlid=${model.mdlid}">
                        モデルID: ${model.mdlid}
                    </a>
                `;

                napisy.appendChild(listItem);  // リストに追加
            });
        })
        .catch(error => {
            console.error('モデル情報の取得中にエラーが発生しました:', error);
            alert('モデル情報の取得に失敗しました。');
        });
});
