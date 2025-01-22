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
        });
});

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mdlsound = urlParams.get('mdlsound'); // URL パラメータから mdlsound を取得

    const addButton = document.querySelector('.add-btn');
    if (addButton && mdlsound) {
        // 新規追加ボタンのリンクを修正
        addButton.href = `/AR_admin/AR_sound/soundadd.html?mdlsound=${mdlsound}`;
    }
});

document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const mdlsound = urlParams.get('mdlsound');
    const languageSelect = document.getElementById('language-select');

    if (!mdlsound) {
        alert('音声テキストが指定されていません。');
        return;
    }

    document.getElementById('mdlsound').value = mdlsound;

    // 言語リストを取得して選択肢に追加
    try {
        const response = await fetch(`/soundlist/languages?mdlsound=${mdlsound}`);
        const availableLanguages = await response.json();

        if (!response.ok) throw new Error(availableLanguages.error || '言語情報の取得に失敗しました');

        if (availableLanguages.length === 0) {
            alert('追加可能な言語がありません。前の画面に戻ります。');
            window.location.href = document.referrer || '/sound'; // 前のページに戻る
            return;
        }

        availableLanguages.forEach(language => {
            const option = document.createElement('option');
            option.value = language;
            option.textContent = language;
            languageSelect.appendChild(option);
        });
    } catch (error) {
        console.error(error);
        window.location.href = document.referrer || '/sound';
    }

    // フォーム送信処理
    document.getElementById('sound-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        try {
            const response = await fetch('/soundlist/add', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();

            if (result.success) {
                alert('音声が追加されました！');
                window.location.href = document.referrer; // 前のページにリダイレクト
            } else {
                throw new Error(result.error || 'エラーが発生しました');
            }
        } catch (error) {
            console.error(error);
        }
    });
});
