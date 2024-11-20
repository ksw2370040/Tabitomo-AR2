document.addEventListener('DOMContentLoaded', function () {
  // URLパラメータからmdlidを取得
  const urlParams = new URLSearchParams(window.location.search);
  const mdlid = urlParams.get('mdlid');

  if (mdlid) {
    // mdlidに基づいてデータを取得するためのAPI呼び出し
    fetch(`/napisy/${mdlid}`)  // 例: モデルIDに基づいてデータを取得するエンドポイント
      .then(response => response.json())  // JSONレスポンスを取得
      .then(data => {
        const napisyDetail = document.querySelector('.napisy-detail');
        napisyDetail.innerHTML = `
                  <h2>モデルID: ${data.mdlid}</h2>
                  <p>${data.description}</p>  <!-- ここでモデルの詳細情報を表示 -->
              `;
      })
      .catch(error => {
        console.error('データ取得中にエラーが発生しました:', error);
        alert('データの取得に失敗しました。');
      });
  } else {
    alert('モデルIDが指定されていません。');
  }
});
