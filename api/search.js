module.exports = async (req, res) => {
    const { keyword } = req.query;

    if (!keyword) {
        return res.status(400).json({ error: 'キーワードが指定されていません' });
    }

    const API_KEY = '269d55838a9b1ae0348e4e3742960610';
    const API_URL = 'https://api.calil.jp/library/search.php';

    try {
        const response = await fetch(
            `${API_URL}?appkey=${API_KEY}&keyword=${encodeURIComponent(keyword)}&format=json`
        );

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Calil APIへのリクエストに失敗しました' });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: '検索に失敗しました: ' + error.message });
    }
};
