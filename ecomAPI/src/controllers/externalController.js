import fetch from 'node-fetch';

let getExchangeRate = async (req, res) => {
    try {
        const url = 'https://tygia.com/json.php?ran=0&gold=0&bank=VIETCOM&date=now';
        const resp = await fetch(url, { timeout: 10000 });
        const text = await resp.text();
        let data = null;
        try {
            data = JSON.parse(text);
        } catch (err) {
            // If response isn't strict JSON, return raw text as a field
            data = { raw: text };
        }
        return res.status(200).json({ errCode: 0, data: data });
    } catch (error) {
        console.error('externalController.getExchangeRate error', error);
        return res.status(200).json({ errCode: -1, errMessage: 'Failed to fetch exchange rate' });
    }
};

module.exports = {
    getExchangeRate: getExchangeRate,
};
