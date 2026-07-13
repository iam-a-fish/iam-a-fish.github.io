// === メインサイトへの切り替え用 ===
const iriguchi = document.getElementById('Enter');
const honpen = document.getElementById('Main');
const botan = document.getElementById('Button');

function gachan() {
    iriguchi.style.display = 'none';  
    honpen.style.display = 'block';   
}

botan.addEventListener('click', function() { gachan(); });
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') { gachan(); }
});


// === 【ここから新しく書き換え】すべてのページ切り替え処理 ===

// 1. メニューのボタン（aタグ）をバケツに登録
const btnTop = document.getElementById('Menu-Top');
const btnProfile = document.getElementById('Menu-Profile');
const btnWorks = document.getElementById('Menu-Works');
const btnContact = document.getElementById('Menu-Contact');

// 2. 表示を切り替える画面の箱（divタグ）をバケツに登録
const screenTop = document.getElementById('Top');
const screenProfile = document.getElementById('Profile');
const screenWorks = document.getElementById('Works');
const screenContact = document.getElementById('Contact');

// 3. すべての画面をいったん全部非表示（none）にする共通の命令（関数）
function allHide() {
    screenTop.style.display = 'none';
    screenProfile.style.display = 'none';
    screenWorks.style.display = 'none';
    screenContact.style.display = 'none';
}

function stopYouTubeVideo() {
    const video = document.getElementById('yt-video'); // HTML側でiframeに id="yt-video" をつけておいてください
    if (video) {
        // YouTubeに「一時停止して！」という命令を送る
        video.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
    }
}

// 4. 各メニューがクリックされたときの動き
btnTop.addEventListener('click', function(e) {
    e.preventDefault(); 
    allHide();          
    screenTop.style.display = 'block'; 
});

btnProfile.addEventListener('click', function(e) {
    e.preventDefault();
    stopYouTubeVideo(); // ★他の画面に行く前に動画を止める
    allHide();
    screenProfile.style.display = 'block'; 
});

btnWorks.addEventListener('click', function(e) {
    e.preventDefault();
    stopYouTubeVideo(); // ★他の画面に行く前に動画を止める
    allHide();
    screenWorks.style.display = 'block'; 
});

btnContact.addEventListener('click', function(e) {
    e.preventDefault();
    stopYouTubeVideo(); // ★他の画面に行く前に動画を止める
    allHide();
    screenContact.style.display = 'block'; 
});

