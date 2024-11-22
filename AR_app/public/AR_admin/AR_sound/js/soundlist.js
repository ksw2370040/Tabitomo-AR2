document.addEventListener('DOMContentLoaded', function () {
    // モデル情報を取得するためのAPI呼び出し
    fetch('/sound')  // モデル情報を取得するエンドポイント
        .then(response => response.json())  // JSONレスポンスを取得
        .then(data => {
            const sound = document.querySelector('.sound ul');  // モデル情報を表示する要素を選択

            // 取得したモデル情報をリストに表示
            const uniqueMdltexts = [...new Set(data.map(model => model.mdlsound))];  // 重複するmdltextを除外

            uniqueMdltexts.forEach(mdlsound => {
                const listItem = document.createElement('li');

                // モデルテキストにリンクを追加
                listItem.innerHTML = `
                    音声テキスト: <a href="soundlist.html?mdlsound=${mdlsound}" class="soundtext">${mdlsound}</a>
                `;

                sound.appendChild(listItem); // リストに追加
            });

        })
        .catch(error => {
            console.error('モデル情報の取得中にエラーが発生しました:', error);
            alert('モデル情報の取得に失敗しました。');
        });
});
