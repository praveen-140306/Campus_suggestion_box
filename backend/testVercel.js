const https = require('https');

const req = https.request('https://campus-suggestion-box-backend.vercel.app/api/suggestions/public', { method: 'GET' }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Status Code:', res.statusCode));
});
req.on('error', console.error);
req.end();
