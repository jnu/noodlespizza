import fetch from 'isomorphic-fetch';


function buildInstaAccessTokenUrl(clientId, redirectUri) {
    return `https://api.instagram.com/oauth/authorize/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
}

export class InstagramStreamClient {
    constructor(clientId, clientSecret, callbackHost, callbackUrl, accessToken) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.callbackHost = callbackHost;
        this.callbackUrl = callbackUrl;
        if (!accessToken) {
            throw new Error('Access token is invalid');
        }
        this.accessToken = accessToken;
        // this.authTimeout = 5000; // ms
        // this._tokenCallbacks = [];
        // this._accessTokenPromise = null;
    }

    // TODO(jn) build out auto access token generation.
    // _getAccessToken() {
    //     return new Promise((resolve, reject) => {
    //         console.log('Fetching instagram access token ...');
    //         const tokenUrl = buildInstaAccessTokenUrl(this.clientId, `${this.callbackHost}${this.callbackUrl}`);
    //         const timer = setTimeout(() => {
    //             reject('timeout');
    //         }, this.authTimeout);
    //         this._tokenCallbacks.push({
    //             resolve: (...args) => {
    //                 clearTimeout(timer);
    //                 resolve(...args);
    //             },
    //             reject: (...args) => {
    //                 clearTimeout(timer);
    //                 reject(...args);
    //             },
    //         });
    //         console.log(tokenUrl);
    //         fetch(tokenUrl)
    //             .then(resp => { console.log('insta', resp); return resp.text() })
    //             .then(txt => console.log(txt))
    //             .catch(err => {
    //                 clearTimeout(timer);
    //                 reject(err);
    //             });
    //     });
    // }

    // _ensureAccessToken() {
    //     if (!this._accessTokenPromise) {
    //         this._accessTokenPromise = this._getAccessToken();
    //     }
    //     return this._accessTokenPromise;
    // }

    _ensureAccessToken() {
        return Promise.resolve(this.accessToken);
    }

    configureApp(app) {
        app.get(this.callbackUrl, (req, res) => {
            console.log("RESPONSE FOR INSTA", req, res)
            const code = req.query.code;
            const result = code ? code : req.query;
            const method = code ? 'resolve' : 'reject';
            let cb;
            while (cb = this._tokenCallbacks.pop()) {
                cb[method](result);
            }
            res.send({ ok: true });
        });

        app.get('/api/insta/feed', (req, res) => {
            return this._ensureAccessToken()
                .then(token => fetch(`https://api.instagram.com/v1/users/self/media/recent/?access_token=${token}`))
                .then(response => response.json())
                .then(json => res.send(json))
                .catch(err => {
                    console.error("INSTA ERROR", err);
                });
        });
    }

    key() {
        return `insta.stream.${this.clientId}`;
    }
}
