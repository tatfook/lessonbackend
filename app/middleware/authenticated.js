
const axios = require("axios");
const memoryCache = require('memory-cache');

module.exports = (options, app) => {
	const config = app.config.self;
	return async function(ctx, next) {
		if (config.debug) {
			ctx.state.user = {userId:1, username:"xiaoyao", roleId:10};
			await next();
			return ;
		}

		const Authorization =  ctx.request.header["authorization"] || ("Bearer " + ctx.cookies.get("token"));
		const headers = {"Authorization": Authorization};
		let user = memoryCache.get(Authorization);
		if (!user) {
			user = await axios.get(config.keepworkBaseURL + "user/tokeninfo", {headers})
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
