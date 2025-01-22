document.addEventListener('DOMContentLoaded', function () {
    // マーカー情報を取得するためのAPI呼び出し
    fetch('/api/markerinfo2')
        .then(response => response.json()) // JSONレスポンスを取得
        .then(data => {
            const markerList = document.querySelector('.markerinfo ul');

            // 取得したマーカー情報をリストに表示
            data.forEach(marker => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <p>ID: ${marker.mkid.trim()}</p>
                    <p>名前: ${marker.mkname}</p>
                    <p>patt: ${marker.patt}</p>
                    <p>image: <img src="/path/to/images/${marker.mkimage}" alt="Image"></p>
                    <button class="delete-btn" data-mkid="${marker.mkid}" type="button">削除</button>
                    <button class="edit-btn" data-mkid="${marker.mkid}" type="button">編集</button>
                `;
                markerList.appendChild(listItem);
            });

            // 削除ボタンのイベントリスナーを登録
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const mkidToDelete = this.getAttribute('data-mkid');
                    if (confirm(`マーカーID: ${mkidToDelete} を削除しますか？`)) {
                        deleteMarker(mkidToDelete);
                    }
                });
            });

            // 編集ボタンのイベントリスナーを登録
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const mkidToEdit = this.getAttribute('data-mkid');
                    window.location.href = `/editmarker.html?mkid=${mkidToEdit}`;
                });
            });

        })
        .catch(error => {
            console.error('エラー:', error);
            alert('マーカー情報の取得に失敗しました。');
        });
});


function deleteMarker(mkid) {
    fetch(`/api/marker/${mkid}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            alert('マーカーが削除されました');
            const listItem = document.querySelector(`[data-mkid="${mkid}"]`);
            if (listItem) {
                listItem.closest('li').remove();
            }
        } else {
            alert('削除に失敗しました');
        }
    })
    .catch(error => {
        console.error('削除中にエラーが発生しました:', error);
        alert('削除中にエラーが発生しました');
    });
}
