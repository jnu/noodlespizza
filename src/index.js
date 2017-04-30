import Routes from './Routes';
import views from './views';
import auth from './auth';


export default (dreija, env) => {
        dreija
            .title(`Noodles' Pizza`)
            .routes(Routes)
            .views(views)
            .auth(auth)
            .dbname('noodlespizza')
            .dbhost(env.DBHOST)
            .redishost(env.REDISHOST);
};
