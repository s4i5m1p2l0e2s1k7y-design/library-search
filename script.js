const prefSelect = document.getElementById('pref');
const cityInput = document.getElementById('city');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');

searchBtn.addEventListener('click', search);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        search();
    }
});

async function search() {
    const pref = prefSelect.value;
    const city = cityInput.value.trim();

    if (!pref) {
        showError('都道府県を選択してください');
        return;
    }

    clearMessages();
    showLoading();

    try {
        let url = `/api/search?pref=${encodeURIComponent(pref)}`;
        if (city) {
            url += `&city=${encodeURIComponent(city)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'APIリクエストに失敗しました');
        }

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        showError('検索に失敗しました: ' + error.message);
    } finally {
        hideLoading();
    }
}

function displayResults(data) {
    if (!data || !data.libraries || data.libraries.length === 0) {
        resultsDiv.innerHTML = '<div class="no-results">検索結果がありません</div>';
        return;
    }

    const count = data.libraries.length;
    const headerHtml = `<div class="result-count">${count}件の図書館が見つかりました</div>`;

    const html = data.libraries.map(library => {
        const name = library.formal || library.short || '名称不明';
        const systemName = library.systemname || '情報なし';
        const address = library.address || '情報なし';
        const tel = library.tel || '';
        const url = library.url_pc || '';

        return `
            <div class="library-item">
                <div class="library-name">${escapeHtml(name)}</div>
                <div class="library-info">
                    <span class="library-info-label">図書館システム:</span> ${escapeHtml(systemName)}
                </div>
                <div class="library-info">
                    <span class="library-info-label">住所:</span> ${escapeHtml(address)}
                </div>
                ${tel ? `<div class="library-info">
                    <span class="library-info-label">電話:</span> ${escapeHtml(tel)}
                </div>` : ''}
                ${url ? `<div class="library-info">
                    <a href="${escapeHtml(url)}" target="_blank" rel="noopener">公式サイト →</a>
                </div>` : ''}
            </div>
        `;
    }).join('');

    resultsDiv.innerHTML = headerHtml + html;
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function showLoading() {
    loadingDiv.style.display = 'block';
}

function hideLoading() {
    loadingDiv.style.display = 'none';
}

function clearMessages() {
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
}

function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
