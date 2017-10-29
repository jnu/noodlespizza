import Routes from './Routes';
import views from './views';
import auth from './auth';


/**
 * Google analytics tracking code. Include it on every page.
 */
const googleAnalytics = `
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-98374296-1', 'auto');
  ga('send', 'pageview');`;

const globalStyles = `
body {
  margin: 0;
  padding: 0;
  background-color: #212121;
  color: #ffffff;
}
*, *:before, *:after {
  box-sizing: border-box;
}
`


export default (dreija, env) => {
        dreija
            .title(`Noodles' Pizza`)
            .routes(Routes)
            .views(views)
            .auth(auth)
            .dbname('noodlespizza')
            .dbhost(env.DBHOST)
            .redishost(env.REDISHOST)
            .injectScript(googleAnalytics, true);
        dreija
            .inject({
              tag: 'style',
              location: 'head',
              attrs: {
                type: 'text/css',
              },
              content: globalStyles,
            });
};
