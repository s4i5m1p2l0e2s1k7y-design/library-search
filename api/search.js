module.exports = async (req, res) => {
    const { pref, city } = req.query;

    if (!pref) {
        return res.status(400).json({ error: '都道府県を指定してください' });
    }

    const API_KEY = '269d55838a9b1ae0348e4e3742960610';
    const API_URL = 'https://api.calil.jp/library';

    try {
        let url = `${API_URL}?appkey=${API_KEY}&pref=${encodeURIComponent(pref)}&format=json`;
        if (city) {
            url += `&city=${encodeURIComponent(city)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Calil APIへのリクエストに失敗しました' });
        }

        const text = await response.text();
        const jsonText = text.replace(/^callback\(/, '').replace(/\)\s*;?\s*$/, '');
        const libraries = JSON.parse(jsonText);

        return res.status(200).json({ libraries });
    } catch (error) {
        return res.status(500).json({ error: '検索に失敗しました: ' + error.message });
    }
};
