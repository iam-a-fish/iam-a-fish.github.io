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
let openingSharedWork = false;

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

function scrollToPageTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateMenubarScrollState() {
    document.getElementById('Menubar').classList.toggle('is-scrolled', window.scrollY > 48);
}

window.addEventListener('scroll', updateMenubarScrollState, { passive: true });
updateMenubarScrollState();

function setCurrentMenu(currentMenu) {
    [btnTop, btnProfile, btnWorks, btnContact].forEach(menu => {
        if (menu === currentMenu) {
            menu.setAttribute('aria-current', 'page');
        } else {
            menu.removeAttribute('aria-current');
        }
    });
}

function clearSharedWorkHash() {
    if (!openingSharedWork && /^#work-\d+$/.test(window.location.hash)) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
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
    clearSharedWorkHash();
    stopAllMedia(); // 画面を離れるので音を止める
    allHide();          
    screenTop.style.display = 'block'; 
    setCurrentMenu(btnTop);
    scrollToPageTop();
});

btnProfile.addEventListener('click', function(e) {
    e.preventDefault();
    clearSharedWorkHash();
    stopAllMedia(); // 画面を離れるので音を止める
    allHide();
    screenProfile.style.display = 'block'; 
    setCurrentMenu(btnProfile);
    scrollToPageTop();
});

btnWorks.addEventListener('click', function(e) {
    e.preventDefault();
    clearSharedWorkHash();
    stopAllMedia(); // 画面を離れるので音を止める
    allHide();
    screenWorks.style.display = 'block'; 
    setCurrentMenu(btnWorks);
    scrollToPageTop();
});

btnContact.addEventListener('click', function(e) {
    e.preventDefault();
    clearSharedWorkHash();
    stopAllMedia(); // 画面を離れるので音を止める
    allHide();
    screenContact.style.display = 'block'; 
    setCurrentMenu(btnContact);
    scrollToPageTop();
});

// === 5. JSONデータの読み込み・自動生成・ソート・期間指定（完全版） ===

function parseJsonc(text) {
    let cleaned = '';
    let inString = false;
    let escaped = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const next = text[i + 1];

        if (inString) {
            cleaned += char;
            if (escaped) {
                escaped = false;
            } else if (char === '\\') {
                escaped = true;
            } else if (char === '"') {
                inString = false;
            }
        } else if (char === '"') {
            inString = true;
            cleaned += char;
        } else if (char === '/' && next === '/') {
            while (i < text.length && text[i] !== '\n') i++;
            cleaned += '\n';
        } else if (char === '/' && next === '*') {
            i += 2;
            while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++;
            if (i >= text.length) throw new SyntaxError('Unterminated JSONC comment');
            i++;
        } else {
            cleaned += char;
        }
    }

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
            playBtn.textContent = '⏸ 停止';
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
const includedTags = new Set();
let activeWorksTab = 'releases';

const workTagOrder = [
    '曲',
    'ゲーム',
    'インスト',
    'コンピ',
    'REMIX',
    '視聴可能',
    'ダウンロード可能',
    'CC BY 4.0',
    'YouTube',
    'Niconico',
    'Unityroom',
    'Steam',
    'ノベルゲームコレクション'
];

function sortWorkTags(tags) {
    return tags.sort((a, b) => {
        const aIndex = workTagOrder.indexOf(a);
        const bIndex = workTagOrder.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b, 'ja');
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });
}

const gameWorkTags = new Set(['Unityroom', 'Steam', 'ノベルゲームコレクション']);

function isGameWork(item) {
    return Array.isArray(item.tags) && item.tags.some(tag => gameWorkTags.has(tag));
}

function getActiveWorks() {
    return worksData;
}

function getWorkTags(item) {
    const tags = Array.isArray(item.tags) ? [...item.tags] : [];
    if (item.audio && !tags.includes('視聴可能')) {
        tags.push('視聴可能');
    }
    return sortWorkTags(tags);
}

const imageModal = document.createElement('div');
imageModal.className = 'image-modal';
imageModal.hidden = true;
imageModal.setAttribute('role', 'dialog');
imageModal.setAttribute('aria-modal', 'true');
imageModal.setAttribute('aria-label', '作品画像');

const imageModalClose = document.createElement('button');
imageModalClose.type = 'button';
imageModalClose.className = 'image-modal-close';
imageModalClose.setAttribute('aria-label', '画像を閉じる');
imageModalClose.textContent = '×';

const imageModalImage = document.createElement('img');
imageModalImage.className = 'image-modal-image';

imageModal.append(imageModalClose, imageModalImage);
document.body.appendChild(imageModal);

let imageModalTrigger = null;
let previousBodyOverflow = '';

function closeImageModal() {
    if (imageModal.hidden) return;
    imageModal.hidden = true;
    document.body.style.overflow = previousBodyOverflow;
    if (imageModalTrigger) imageModalTrigger.focus();
}

imageModalClose.addEventListener('click', closeImageModal);
imageModal.addEventListener('click', event => {
    if (event.target === imageModal) closeImageModal();
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeImageModal();
});

function openImageModal(image, trigger) {
    imageModalImage.src = image.currentSrc || image.src;
    imageModalImage.alt = image.alt;
    imageModalTrigger = trigger;
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    imageModal.hidden = false;
    imageModalClose.focus();
}

function matchesTagFilter(item) {
    const tags = getWorkTags(item);
    return includedTags.size === 0 || [...includedTags].every(tag => tags.includes(tag));
}

function setWorksTab(tab) {
    activeWorksTab = tab;

    const releasesTab = document.getElementById('works-tab-releases');
    const gamesTab = document.getElementById('works-tab-games');
    const panel = document.getElementById('works-tab-panel');
    const releaseContent = document.getElementById('work-release-content');
    const gameContent = document.getElementById('game-release-content');
    const title = document.getElementById('work-release-title');
    const selectedTab = tab === 'games' ? gamesTab : releasesTab;
    releasesTab.setAttribute('aria-selected', String(tab === 'releases'));
    gamesTab.setAttribute('aria-selected', String(tab === 'games'));
    panel.setAttribute('aria-labelledby', selectedTab.id);
    releaseContent.hidden = tab === 'games';
    gameContent.hidden = tab !== 'games';
    title.textContent = '配信リリース';
}

// タグ検索ボタンを自動生成する関数
function createTagFilterButtons(allUniqueTags) {
    const filterContainer = document.getElementById('tag-filter-container');
    if (!filterContainer) return;

    filterContainer.innerHTML = '';

    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'filter-clear-btn';
    clearButton.textContent = 'タグ選択をクリア';
    clearButton.addEventListener('click', () => {
        includedTags.clear();
        buttons.querySelectorAll('.filter-btn').forEach(button => {
            updateButton(button, button.dataset.tag);
        });
        stopAllMedia();
        updateWorksDisplay();
    });
    const buttons = document.createElement('div');
    buttons.className = 'tag-filter-buttons';
    filterContainer.appendChild(buttons);
    filterContainer.appendChild(clearButton);

    const updateButton = (button, tag) => {
        const isIncluded = includedTags.has(tag);
        button.classList.toggle('included', isIncluded);
        button.setAttribute('aria-pressed', String(isIncluded));
        button.setAttribute('aria-label', `${isIncluded ? '選択中' : '未選択'}: ${tag}`);
        button.textContent = `#${tag}`;
    };

    sortWorkTags([...allUniqueTags]).forEach(tag => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'filter-btn';
        button.dataset.tag = tag;
        button.title = 'タグで絞り込む';
        updateButton(button, tag);
        button.addEventListener('click', () => {
            if (includedTags.has(tag)) {
                includedTags.delete(tag);
            } else {
                includedTags.add(tag);
            }

            updateButton(button, tag);
            stopAllMedia();
            updateWorksDisplay();
        });
        buttons.appendChild(button);
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
        if (!matchesTagFilter(item)) return false;

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
    const worksTabs = [
        document.getElementById('works-tab-releases'),
        document.getElementById('works-tab-games')
    ];
    worksTabs[0].addEventListener('click', () => {
        if (activeWorksTab !== 'releases') setWorksTab('releases');
    });
    worksTabs[1].addEventListener('click', () => {
        if (activeWorksTab !== 'games') setWorksTab('games');
    });
    worksTabs.forEach((tab, index) => {
        tab.addEventListener('keydown', event => {
            let nextIndex = index;
            if (event.key === 'ArrowRight') nextIndex = (index + 1) % worksTabs.length;
            else if (event.key === 'ArrowLeft') nextIndex = (index + worksTabs.length - 1) % worksTabs.length;
            else if (event.key === 'Home') nextIndex = 0;
            else if (event.key === 'End') nextIndex = worksTabs.length - 1;
            else return;

            event.preventDefault();
            worksTabs[nextIndex].focus();
            worksTabs[nextIndex].click();
        });
    });

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

// 実際に works.json を読み込んで画面を作るメイン処理
fetch('./works.json', { cache: 'no-cache' })
    .then(response => {
        if (!response.ok) throw new Error(`works.json: HTTP ${response.status}`);
        return response.text();
    })
    .then(text => {
        worksData = parseJsonc(text);

        // コントロールパネルの監視を開始
        initializeControls();

        const tagSet = new Set();
        getActiveWorks().forEach(item => {
            getWorkTags(item).forEach(tag => tagSet.add(tag));
        });
        createTagFilterButtons(tagSet);

        // 最初の画面表示
        updateWorksDisplay();
        openSharedWorkFromHash();
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

    let filteredData = getActiveWorks().filter(item => {
        if (!matchesTagFilter(item)) return false;
        
        const hasDateRange = startDateVal || endDateVal;
        const itemDate = item.date ? new Date(item.date) : null;
        if (hasDateRange && (!itemDate || Number.isNaN(itemDate.getTime()))) return false;

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
        const aTime = a.date ? new Date(a.date).getTime() : Number.NaN;
        const bTime = b.date ? new Date(b.date).getTime() : Number.NaN;
        const aHasDate = Number.isFinite(aTime);
        const bHasDate = Number.isFinite(bTime);

        if (!aHasDate || !bHasDate) {
            return aHasDate === bHasDate ? 0 : aHasDate ? -1 : 1;
        }

        return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
    });

    filteredData.forEach(item => {
        const tags = getWorkTags(item);
        const workCard = document.createElement('article');
        workCard.className = 'work-card';
        workCard.dataset.tags = tags.join(' ');
        const workIndex = worksData.indexOf(item);
        workCard.id = `work-${workIndex}`;

        const shareButton = document.createElement('button');
        shareButton.type = 'button';
        shareButton.className = 'work-card-share';
        shareButton.textContent = '共有';
        shareButton.setAttribute('aria-label', `${item.title}の共有リンクをコピー`);
        shareButton.addEventListener('click', () => {
            const shareUrl = new URL(`/share/work-${workIndex}.html`, window.location.origin);

            if (!navigator.clipboard || !navigator.clipboard.writeText) {
                shareButton.textContent = 'コピー不可';
                return;
            }

            navigator.clipboard.writeText(shareUrl.href).then(() => {
                shareButton.textContent = 'コピー済み';
                window.setTimeout(() => {
                    shareButton.textContent = '共有';
                }, 1800);
            }).catch(error => {
                console.error('共有リンクをコピーできませんでした:', error);
                shareButton.textContent = 'コピー失敗';
            });
        });
        workCard.appendChild(shareButton);

        const workMain = document.createElement('div');
        workMain.className = item.image ? 'work-main' : 'work-main work-main-no-image';

        if (item.image) {
            const imageLink = document.createElement('a');
            imageLink.href = item.image;
            imageLink.className = 'work-image-link';
            imageLink.setAttribute('aria-label', `${item.title}の画像を拡大`);
            imageLink.addEventListener('click', event => {
                event.preventDefault();
                openImageModal(image, imageLink);
            });

            const image = document.createElement('img');
            image.alt = item.title;
            image.className = 'work-image';
            image.src = item.image;
            imageLink.appendChild(image);
            workMain.appendChild(imageLink);
        }

        const workInfo = document.createElement('div');
        workInfo.className = 'work-info';

        const date = item.date ? document.createElement('p') : null;
        if (date) {
            date.className = 'work-date';
            date.textContent = item.date.replace(/-/g, '/');
        }

        const title = document.createElement('h2');
        title.className = 'work-title';
        title.textContent = item.title;

        const tagsList = document.createElement('div');
        tagsList.className = 'work-tags';
        tags.forEach(tag => {
            const tagLabel = document.createElement('span');
            tagLabel.textContent = `#${tag}`;
            tagsList.appendChild(tagLabel);
        });

        if (date) workInfo.appendChild(date);
        workInfo.append(title, tagsList);

        if (item.description) {
            const description = document.createElement('p');
            description.className = 'work-description';
            description.textContent = item.description;
            workInfo.appendChild(description);
        }

        const workLinks = document.createElement('div');
        workLinks.className = 'work-links';

        const hasWorkLink = item.imageClickType === 'link' && item.imageClickUrl;
        if (hasWorkLink && (!item.niconicoId || item.youtubeId)) {
            const workLink = document.createElement('a');
            workLink.href = item.imageClickUrl;
            workLink.target = '_blank';
            workLink.rel = 'noopener noreferrer';
            workLink.className = 'work-link';
            workLink.textContent = item.youtubeId
                ? 'YouTubeで見る ↗'
                : item.unityroomUrl
                    ? 'Unityroomで遊ぶ ↗'
                    : '作品を見る ↗';
            workLinks.appendChild(workLink);
        }

        if (item.niconicoId) {
            const niconicoLink = document.createElement('a');
            niconicoLink.href = `https://www.nicovideo.jp/watch/${encodeURIComponent(item.niconicoId)}`;
            niconicoLink.target = '_blank';
            niconicoLink.rel = 'noopener noreferrer';
            niconicoLink.className = 'work-link';
            niconicoLink.textContent = 'ニコニコで見る ↗';
            workLinks.appendChild(niconicoLink);
        }

        if (workLinks.childElementCount) {
            workInfo.appendChild(workLinks);
        }

        workMain.appendChild(workInfo);
        workCard.appendChild(workMain);

        if (item.audio) {
            const audioSection = document.createElement('div');
            audioSection.className = 'work-audio';
            audioSection.innerHTML = `
                <div class="seek-container">
                    <span class="current-time">0:00</span>
                    <input type="range" class="seek-bar" value="0" min="0" max="100" aria-label="再生位置">
                    <span class="duration-time">0:00</span>
                </div>
                <div class="player-controls">
                    <button class="custom-play-btn">▶ 再生</button>
                </div>
                <audio class="custom-audio" src="${item.audio}" preload="metadata"></audio>
            `;

            if (item.download) {
                const downloadLink = document.createElement('a');
                downloadLink.href = item.audio;
                downloadLink.download = item.audio.split('/').pop();
                downloadLink.target = '_blank';
                downloadLink.rel = 'noopener noreferrer';
                downloadLink.className = 'download-link';
                downloadLink.textContent = '⬇ ダウンロード';
                audioSection.querySelector('.player-controls').appendChild(downloadLink);
            }

            workCard.appendChild(audioSection);
            setupAudioPlayer(workCard);
        }

        container.appendChild(workCard);
    });
}

function openSharedWorkFromHash() {
    const workId = window.location.hash.slice(1);
    if (!/^work-\d+$/.test(workId)) return;

    openingSharedWork = true;
    btnWorks.click();
    openingSharedWork = false;
    const sharedItem = worksData[Number(workId.slice('work-'.length))];
    if (sharedItem) {
        setWorksTab(isGameWork(sharedItem) ? 'games' : 'releases');
    }
    includedTags.clear();
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.classList.remove('included');
        button.setAttribute('aria-pressed', 'false');
        button.setAttribute('aria-label', `未選択: ${button.dataset.tag}`);
    });
    document.getElementById('date-start').value = '';
    document.getElementById('date-end').value = '';
    updateWorksDisplay();

    const workCard = document.getElementById(workId);
    if (workCard) {
        workCard.classList.remove('work-card-highlight');
        void workCard.offsetWidth;
        workCard.classList.add('work-card-highlight');
        workCard.addEventListener('animationend', () => {
            workCard.classList.remove('work-card-highlight');
        }, { once: true });
        window.requestAnimationFrame(() => {
            workCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
}

window.addEventListener('hashchange', openSharedWorkFromHash);


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
