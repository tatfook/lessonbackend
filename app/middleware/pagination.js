
const _ = require("lodash");

module.exports = (options, app) => {
	return async function(ctx, next) {
		const headers = ctx.request.headers;
		const query = ctx.query || {};

		//_.merge(query, ctx.request.body);

		const perPage = parseInt(headers["x-per-page"] || query["x-per-page"] || 200);
		const page = parseInt(headers["x-page"] || query["x-page"] || 1);
		const order = headers["x-order"] || query["x-order"] || "id-asc";
		const orders = [];
		const arrs = order.split("-");
		for (let i = 0; i < arrs.length; i+=2) {
			orders.push([arrs[i], arrs[i+1]]);
		}

		delete query["x-per-page"];
		delete query["x-page"];
		delete query["x-order"];

		ctx.state.queryOptions = {
			offset: (page - 1) * perPage,
			limit: perPage,
			order: orders,
		}

		await next();

		const respHeaders = ctx.response.headers;
		const total = parseInt(respHeaders["X-Total"] || ctx.state.queryOptions.total || -1);

		if (total < 0) return;

		ctx.response.set({
			"X-Per-Page": perPage,
			"X-Page": page,
			"X-Total": total,
		});
	}
}

