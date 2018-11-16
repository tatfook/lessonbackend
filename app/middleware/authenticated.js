
const axios = require("axios");
const memoryCache = require('memory-cache');
//const jwt = require("jwt-simple");
const jwt = require("../core/jwt.js");

module.exports = (options, app) => {
	const config = app.config.self;
	return async function(ctx, next) {
		if (config.debug) {
			ctx.state.user = {userId:137, username:"wxaxiaoyao", roleId:10};
			await next();
			return ;
		}

		const Authorization =  ctx.request.header["authorization"] || ("Bearer " + ctx.cookies.get("token"));
		const token = Authorization.split(" ")[1] || "";
		const headers = {"Authorization": Authorization};
		let user = undefined;

		try {
			user = jwt.decode(token, config.secret);
		} catch(e) {
			user = memoryCache.get(Authorization);
		}

		if (!user) {
			user = await axios.get(config.tokenUrl, {headers})
				.then(res => res.data)
				.catch(e => {console.log(e); return undefined;});
			if (user && user.userId) {
				memoryCache.put(Authorization, user, 1000 * 60 * 60);
			}
		}

		ctx.state.user = user || {};
		console.log(ctx.state.user);

		await next();
	}
}
