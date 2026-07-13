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


// === すべてのページ切り替え処理 ===

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

// 自作プレイヤーの要素もバケツに登録
const myAudio = document.getElementById('my-audio');
const playBtn = document.getElementById('play-btn');

// 3. すべての画面をいったん全部非表示（none）にする共通の命令（関数）
function allHide() {
    screenTop.style.display = 'none';
    screenProfile.style.display = 'none';
    screenWorks.style.display = 'none';
    screenContact.style.display = 'none';
}

// すべてのメディア（動画・音楽）を止める共通の命令
function stopAllMedia() {
    // ① YouTubeの動画を止める
    const video = document.getElementById('yt-video'); 
    if (video) {
        video.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
    }

    // ② 自作プレイヤーの音楽を止めてボタン表記を元に戻す
    if (myAudio) {
        myAudio.pause();
        playBtn.textContent = '▶ 再生';
    }
}

// 4. 各メニューがクリックされたときの動き
btnTop.addEventListener('click', function(e) {
    e.preventDefault(); 
    stopAllMedia(); // 画面を離れるので音を止める
    allHide();          
    screenTop.style.display = 'block'; 
});

btnProfile.addEventListener('click', function(e) {
    e.preventDefault();
    stopAllMedia(); // 画面を離れるので音を止める
    allHide();
    screenProfile.style.display = 'block'; 
});

btnWorks.addEventListener('click', function(e) {
    e.preventDefault();
    stopAllMedia(); // 画面を離れるので音を止める
    allHide();
    screenWorks.style.display = 'block'; 
});

btnContact.addEventListener('click', function(e) {
    e.preventDefault();
    stopAllMedia(); // 画面を離れるので音を止める
    allHide();
    screenContact.style.display = 'block'; 
});


// === 5. JSONデータの読み込み・自動生成・ソート・期間指定（完全版） ===

function parseJsonc(text) {
    const cleaned = text.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
    return JSON.parse(cleaned);
}

function stopAllMedia() {
    const video = document.getElementById('yt-video'); 
    if (video) {
        video.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
    }
    document.querySelectorAll('.custom-audio').forEach(audio => audio.pause());
    document.querySelectorAll('.custom-play-btn').forEach(btn => btn.textContent = '▶ 再生');
}

// 楽曲プレイヤー単体の再生ロジックを割り当てる関数
function setupAudioPlayer(player) {
    const audio = player.querySelector('.custom-audio');
    const playBtn = player.querySelector('.custom-play-btn');
    const seekBar = player.querySelector('.seek-bar');
    const currentTimeEl = player.querySelector('.current-time');
    const durationTimeEl = player.querySelector('.duration-time');

    if (!audio || !playBtn) return;

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ":" + (secs < 10 ? "0" : "") + secs;
    }

    playBtn.addEventListener('click', function() {
        if (!audio.src || audio.error || audio.readyState === 0) {
            alert('申し訳ありません。音楽データが見つからないか、読み込めません。');
            audio.pause();
            playBtn.textContent = '▶ 再生';
            return;
        }

        if (audio.paused) {
            document.querySelectorAll('.custom-audio').forEach(a => a.pause());
            document.querySelectorAll('.custom-play-btn').forEach(b => b.textContent = '▶ 再生');
            audio.play().catch(error => {
                alert('音楽の再生に失敗しました（データ未接続）');
                playBtn.textContent = '▶ 再生';
            });
            playBtn.textContent = '⏸ 一時停止';
        } else {
            audio.pause();
            playBtn.textContent = '▶ 再生';
        }
    });

    audio.addEventListener('loadedmetadata', function() {
        if(durationTimeEl) durationTimeEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', function() {
        if (seekBar && !isNaN(audio.duration)) {
            const progress = (audio.currentTime / audio.duration) * 100;
            seekBar.value = progress;
            if(currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    });

    if (seekBar) {
        seekBar.addEventListener('input', function() {
            if (!isNaN(audio.duration)) {
                const newTime = (seekBar.value / 100) * audio.duration;
                audio.currentTime = newTime;
            }
        });
    }

    audio.addEventListener('ended', function() {
        playBtn.textContent = '▶ 再生';
        if(seekBar) seekBar.value = 0;
        if(currentTimeEl) currentTimeEl.textContent = "0:00";
    });
}

// グローバル変数で現在の状態と全データを保持する
let worksData = [];
let currentFilterTag = 'all';

// タグ検索ボタンを自動生成する関数
function createTagFilterButtons(allUniqueTags) {
    const filterContainer = document.getElementById('tag-filter-container');
    if (!filterContainer) return;

    let buttonsHtml = `<button class="filter-btn active" data-target="all">すべて</button>`;
    allUniqueTags.forEach(tag => {
        buttonsHtml += `<button class="filter-btn" data-target="${tag}">#${tag}</button>`;
    });
    filterContainer.innerHTML = buttonsHtml;

    const filterButtons = filterContainer.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilterTag = this.getAttribute('data-target');
            
            // タグが切り替わったら音を止めて再描画
            stopAllMedia();
            updateWorksDisplay();
        });
    });
}

// ★最重要：現在のフィルター・ソート・期間の全条件を組み合わせて画面を更新する関数
function updateWorksDisplay() {
    const container = document.getElementById('works-container');
    if (!container) return;

    // 表示する前に一度中身を空っぽにする
    container.innerHTML = "";

    // コントロールパネルの入力値を取得
    const sortOrder = document.getElementById('sort-select').value;
    const startDateVal = document.getElementById('date-start').value;
    const endDateVal = document.getElementById('date-end').value;

    // 1. データのコピーを作って条件で絞り込む(filter)
    let filteredData = worksData.filter(item => {
        // ① タグでの絞り込み
        if (currentFilterTag !== 'all' && !item.tags.includes(currentFilterTag)) {
            return false;
        }

        // ② 期間指定での絞り込み
        const itemDate = new Date(item.date);
        if (startDateVal) {
            const startLimit = new Date(startDateVal);
            if (itemDate < startLimit) return false;
        }
        if (endDateVal) {
            const endLimit = new Date(endDateVal);
            // 終了日の23:59:59まで含めるため、日付の判定を調整
            endLimit.setHours(23, 59, 59, 999);
            if (itemDate > endLimit) return false;
        }

        return true;
    });

    // 2. 絞り込んだデータを並び替える(sort)
    filteredData.sort((a, b) => {
        if (sortOrder === 'newest') {
            return new Date(b.date) - new Date(a.date); // 新しい順
        } else {
            return new Date(a.date) - new Date(b.date); // 古い順
        }
    });

    // 3. 確定したデータをHTMLとして画面に出力する
    filteredData.forEach(item => {
        const tagsAttr = item.tags.join(' ');
        const tagsHtml = item.tags.map(t => `<span>#${t}</span>`).join(' ');
        const dateHtml = `<p class="player-date">${item.date.replace(/-/g, '/')}</p>`;

        const playerDiv = document.createElement('div');
        playerDiv.className = 'audio-player';
        playerDiv.setAttribute('data-tags', tagsAttr);

        let innerContent = `
            <a href="${item.image}" target="_blank" class="img-popup-link">
                <img src="${item.image}" alt="${item.title}" class="player-img">
            </a>
            <div class="player-info">
                ${dateHtml}
                <p class="track-title">${item.title}</p>
                <p class="artist-name"><a href="${item.artistUrl}" target="_blank">${item.artist}</a></p>
                <p class="player-tags">${tagsHtml}</p>
            </div>
        `;

        if (item.audio && item.audio !== "") {
            innerContent += `
                <div class="seek-container">
                    <span class="current-time">0:00</span>
                    <input type="range" class="seek-bar" value="0" min="0" max="100">
                    <span class="duration-time">0:00</span>
                </div>
                <div class="player-controls">
                    <button class="custom-play-btn">▶ 再生</button>
            `;

            if (item.download) {
                const fileName = item.audio.split('/').pop();
                innerContent += `<a href="${item.audio}" download="${fileName}" class="download-link">⬇ DL</a>`;
            }

            innerContent += `
                </div>
                <audio class="custom-audio" src="${item.audio}" preload="metadata"></audio>
            `;
        }

        playerDiv.innerHTML = innerContent;
        container.appendChild(playerDiv);

        setupAudioPlayer(playerDiv);
    });
}

// 初期化用の各種イベントリスナーを設定する関数
function initializeControls() {
    // 新しい順・古い順のセレクトボックスが変更されたとき
    document.getElementById('sort-select').addEventListener('change', () => {
        updateWorksDisplay();
    });

    // 期間指定（開始日・終了日）が変更されたとき
    document.getElementById('date-start').addEventListener('change', () => {
        updateWorksDisplay();
    });
    document.getElementById('date-end').addEventListener('change', () => {
        updateWorksDisplay();
    });

    // クリアボタンが押されたとき
    document.getElementById('clear-date-btn').addEventListener('click', () => {
        document.getElementById('date-start').value = "";
        document.getElementById('date-end').value = "";
        updateWorksDisplay();
    });
}

// 実際に works.json を読み込んで画面を作るメイン処理（画像クリック切り替え対応版）
fetch('works.json')
    .then(response => response.text())
    .then(text => {
        worksData = parseJsonc(text); // グローバルバケツに保存

        // タグボタン用のセットを作成
        const tagSet = new Set();
        worksData.forEach(item => {
            if (item.tags && Array.isArray(item.tags)) {
                item.tags.forEach(tag => tagSet.add(tag));
            }
        });

        // コントロールパネルの監視を開始
        initializeControls();

        // タグ検索ボタンを自動生成
        createTagFilterButtons(tagSet);

        // 最初の画面表示
        updateWorksDisplay();
    })
    .catch(error => {
        console.error('JSONの読み込みに失敗しました:', error);
    });

// 画面更新用のメイン関数（ここを差し替え・上書きしてください）
function updateWorksDisplay() {
    const container = document.getElementById('works-container');
    if (!container) return;

    container.innerHTML = "";

    const sortOrder = document.getElementById('sort-select').value;
    const startDateVal = document.getElementById('date-start').value;
    const endDateVal = document.getElementById('date-end').value;

    let filteredData = worksData.filter(item => {
        if (currentFilterTag !== 'all' && !item.tags.includes(currentFilterTag)) return false;
        
        const itemDate = new Date(item.date);
        if (startDateVal) {
            const startLimit = new Date(startDateVal);
            if (itemDate < startLimit) return false;
        }
        if (endDateVal) {
            const endLimit = new Date(endDateVal);
            endLimit.setHours(23, 59, 59, 999);
            if (itemDate > endLimit) return false;
        }
        return true;
    });

    filteredData.sort((a, b) => {
        return sortOrder === 'newest' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date);
    });

    filteredData.forEach(item => {
        const tagsAttr = item.tags.join(' ');
        const tagsHtml = item.tags.map(t => `<span>#${t}</span>`).join(' ');
        const dateHtml = `<p class="player-date">${item.date.replace(/-/g, '/')}</p>`;

        // ★追加：画像クリック時のリンク先を判定するロジック
        let targetHref = item.image; // デフォルトは原寸画像URL
        if (item.imageClickType === 'link' && item.imageClickUrl) {
            targetHref = item.imageClickUrl; // 設定があれば外部リンクURLに変える
        }

        const playerDiv = document.createElement('div');
        playerDiv.className = 'audio-player';
        playerDiv.setAttribute('data-tags', tagsAttr);

        // hrefの中身を先ほど判定した「targetHref」に差し替え
        let innerContent = `
            <a href="${targetHref}" target="_blank" class="img-popup-link">
                <img src="${item.image}" alt="${item.title}" class="player-img">
            </a>
            <div class="player-info">
                ${dateHtml}
                <p class="track-title">${item.title}</p>
                <p class="artist-name"><a href="${item.artistUrl}" target="_blank">${item.artist}</a></p>
                <p class="player-tags">${tagsHtml}</p>
            </div>
        `;

        if (item.audio && item.audio !== "") {
            innerContent += `
                <div class="seek-container">
                    <span class="current-time">0:00</span>
                    <input type="range" class="seek-bar" value="0" min="0" max="100">
                    <span class="duration-time">0:00</span>
                </div>
                <div class="player-controls">
                    <button class="custom-play-btn">▶ 再生</button>
            `;

            if (item.download) {
                const fileName = item.audio.split('/').pop();
                innerContent += `<a href="${item.audio}" download="${fileName}" class="download-link">⬇ DL</a>`;
            }

            innerContent += `
                </div>
                <audio class="custom-audio" src="${item.audio}" preload="metadata"></audio>
            `;
        }

        playerDiv.innerHTML = innerContent;
        container.appendChild(playerDiv);

        setupAudioPlayer(playerDiv);
    });
}
// （※これ以降の 「6. タグ検索（フィルター）機能の処理」 や 「stopAllMedia()」 は、前回提示したコードをそのまま下に続けて貼り付ければバッチリ動作します！）


// === 6. タグ検索（フィルター）機能の処理 ===
const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        // ボタンの「アクティブ（青色）」の状態を切り替える
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        const targetTag = this.getAttribute('data-target');

        players.forEach(player => {
            // 各プレイヤーに埋め込まれた data-tags の文字列を取得
            const playerTagsString = player.getAttribute('data-tags') || "";
            // 空白で区切って配列にする (例: ["明るい", "ポップ"])
            const playerTagsArray = playerTagsString.split(' ');

            if (targetTag === 'all' || playerTagsArray.includes(targetTag)) {
                // 条件に合う曲は表示する
                player.style.display = 'block';
                player.style.opacity = '1';
                player.style.transform = 'scale(1)';
            } else {
                // 条件に合わない曲は非表示にして、流れている音も念のため止める
                player.style.display = 'none';
                const audio = player.querySelector('.custom-audio');
                const playBtn = player.querySelector('.custom-play-btn');
                if (audio) {
                    audio.pause();
                    if(playBtn) playBtn.textContent = '▶ 再生';
                }
            }
        });
    });
});


// 前のメニュー切り替え時に音を止める「stopAllMedia」関数も、
// 新しいクラス名（.custom-audio）に合わせて少しだけアップデートしておきます
function stopAllMedia() {
    // ① YouTubeの動画を止める
    const video = document.getElementById('yt-video'); 
    if (video) {
        video.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
    }

    // ② すべての自作プレイヤーの音楽を止めてボタン表記を元に戻す
    document.querySelectorAll('.custom-audio').forEach(audio => audio.pause());
    document.querySelectorAll('.custom-play-btn').forEach(btn => btn.textContent = '▶ 再生');
}