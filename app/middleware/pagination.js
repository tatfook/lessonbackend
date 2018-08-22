
const _ = require("lodash");

module.exports = (options, app) => {
	return async function(ctx, next) {
		const headers = ctx.request.headers;
		const query = ctx.query || {};

		const perPage = parseInt(headers["x-per-page"] || query.perPage || 200);
		const page = parseInt(headers["x-page"] || query.page || 1);

		ctx.state.pagination = {
			offset: (page - 1) * perPage,
			limit: perPage
		}

		await next();

		const respHeaders = ctx.response.headers;
		const total = parseInt(respHeaders["X-Total"] || ctx.state.pagination.total || -1);

		if (total < 0) return;

		ctx.response.set({
			"X-Per-Page": perPage,
			"X-Page": page,
			"X-Total": total,
		});
	}
}

