document.addEventListener('DOMContentLoaded', function () {
    // モデル情報を取得するためのAPI呼び出し
    fetch('/location')  // モデル情報を取得するエンドポイント
        .then(response => {
            if (!response.ok) {
                throw new Error('ネットワークエラー: ' + response.status);
            }
            return response.json();  // JSONレスポンスを取得
        })
        .then(data => {
            const location = document.querySelector('.location ul');  // モデル情報を表示する要素を選択

            // 取得したモデル情報をリストに表示
            data.forEach(model => {
                const listItem = document.createElement('li');

                // モデル情報をリスト項目に挿入
                listItem.textContent = ` ${model.locationname} `;
                listItem.innerHTML = `
                <a href="locationdetail.html?locationid=${model.locationid}&locationname=${model.locationname}&address=${model.address}" class="locationid">
                    ${model.locationname}
                </a>
                
            `;

                location.appendChild(listItem); // リストに追加
            });
            // 編集ボタンのイベントリスナー追加
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const locationid = this.dataset.locationid;
                    window.location.href = `/AR_admin/AR_location/locationedit.html?locationid=${encodeURIComponent(locationid)}`;
                });
            });

            // 削除ボタンのイベントリスナー追加
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const locationid = this.dataset.locationid;
                    window.location.href = `/AR_admin/AR_location/locationdel.html?locationid=${encodeURIComponent(locationid)}`;
                });
            });

        })
        .catch(error => {
            console.error('モデル情報の取得中にエラーが発生しました:', error);
            alert('モデル情報の取得に失敗しました。');
        });
});
