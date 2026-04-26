const keywordInput = document.getElementById('keyword');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');

searchBtn.addEventListener('click', search);
keywordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        search();
    }
});

async function search() {
    const keyword = keywordInput.value.trim();

    if (!keyword) {
        showError('キーワードを入力してください');
        return;
    }

    clearMessages();
    showLoading();

    try {
        const response = await fetch(
            `/api/search?keyword=${encodeURIComponent(keyword)}`
        );

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

    const html = data.libraries.map(library => {
        const systemName = library.systemname || '情報なし';
        const pref = library.pref || '';
        const address = library.address || '情報なし';

        return `
            <div class="library-item">
                <div class="library-name">${escapeHtml(library.name)}</div>
                <div class="library-info">
                    <span class="library-info-label">図書館システム:</span> ${escapeHtml(systemName)}
                </div>
                ${pref ? `<div class="library-info">
                    <span class="library-info-label">都道府県:</span> ${escapeHtml(pref)}
                </div>` : ''}
                <div class="library-info">
                    <span class="library-info-label">住所:</span> ${escapeHtml(address)}
                </div>
            </div>
        `;
    }).join('');

    resultsDiv.innerHTML = html;
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
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
