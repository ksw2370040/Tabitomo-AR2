document.addEventListener('DOMContentLoaded', function () {
    // モデル情報を取得するためのAPI呼び出し
    fetch('/napisy')  // モデル情報を取得するエンドポイント
        .then(response => response.json())  // JSONレスポンスを取得
        .then(data => {
            const napisy = document.querySelector('.napisy ul');  // モデル情報を表示する要素を選択

            // 取得したモデル情報をリストに表示
            const uniqueMdltexts = [...new Set(data.map(model => model.mdltext))];  // 重複するmdltextを除外

            uniqueMdltexts.forEach(mdltext => {
                const listItem = document.createElement('li');

                // モデルテキストにリンクを追加
                listItem.innerHTML = `
                  字幕テキスト: <a href="napisylist.html?mdltext=${mdltext}" class="napisytext">${mdltext}</a>
              `;

                napisy.appendChild(listItem); // リストに追加
            });

        })
        .catch(error => {
            console.error('モデル情報の取得中にエラーが発生しました:', error);
            alert('モデル情報の取得に失敗しました。');
        });
});

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mdltext = urlParams.get('mdltext'); // URL パラメータから mdltext を取得

    const addButton = document.querySelector('.add-btn');
    if (addButton && mdltext) {
        // 新規追加ボタンのリンクを修正
        addButton.href = `/AR_admin/AR_napisy/napisyadd.html?mdltext=${mdltext}`;
    }
});