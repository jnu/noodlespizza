import { InstagramStreamClient } from './insta';

module.exports = function(app, objects, secrets) {
    const insta = new InstagramStreamClient(
        secrets.insta.clientId,
        secrets.insta.clientSecret,
        'http://localhost:3030',
        secrets.insta.callbackPath,
        secrets.insta.accessToken,
    );
    insta.configureApp(app);
}
