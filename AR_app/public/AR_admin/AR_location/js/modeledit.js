document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const mdlid = urlParams.get('mdlid');

    if (mdlid) {
        // データを取得してテキストボックスに反映
        fetch(`/locationdetail?mdlid=${mdlid}`)
            .then(response => response.json())
            .then(data => {
                // テキストボックスにデータをセット
                document.getElementById('mdlname').value = data.mdlname || '';
                document.getElementById('mdlid').value = data.mdlid || '';
                document.getElementById('mdlimage').value = data.mdlimage || '';
                document.getElementById('mkname').value = data.mkname || '';
                document.getElementById('patt').value = data.patt || '';
                document.getElementById('mkimage').value = data.mkimage || '';
                document.getElementById('soundfiles').value = data.soundfiles.join('\n') || '';
                document.getElementById('textfiles').value = data.textfiles.join('\n') || '';
            })
            .catch(error => {
                console.error('データの取得中にエラーが発生しました:', error);
                alert('データの取得中にエラーが発生しました。');
            });
    } else {
        alert('モデルIDが指定されていません。');
    }

    // 保存ボタンのイベントリスナー
    document.getElementById('save-btn').addEventListener('click', function () {
        const updatedData = {
            mdlname: document.getElementById('mdlname').value,
            mdlid: document.getElementById('mdlid').value,
            mdlimage: document.getElementById('mdlimage').value,
            mkname: document.getElementById('mkname').value,
            patt: document.getElementById('patt').value,
            mkimage: document.getElementById('mkimage').value,
            soundfiles: document.getElementById('soundfiles').value.split('\n'),
            textfiles: document.getElementById('textfiles').value.split('\n')
        };

        // データをサーバーに送信
        fetch(`/updateModel?mdlid=${updatedData.mdlid}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('モデル情報が保存されました。');
                } else {
                    alert('保存に失敗しました: ' + data.message);
                }
            })
            .catch(error => {
                console.error('保存中にエラーが発生しました:', error);
                alert('保存中にエラーが発生しました。');
            });
    });
});
