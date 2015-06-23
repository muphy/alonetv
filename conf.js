var localConf = {
    port: 8888,
    debug: false,
    redisPort: 6379,
    redisHost: '127.0.0.1',
    dbOptions: {},
	mainroom: 'MainRoom'
};
var devConf = {
    port: 8888,
    debug: false,
    redisPort: 6379,
    redisHost: '128.199.248.88',
    redisOptions: {},
	mainroom: 'MainRoom'
}
module.exports = devConf;
// module.exports = localConf; 