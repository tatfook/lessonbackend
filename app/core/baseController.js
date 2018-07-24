
const _ = require("lodash");
const Controller = require("egg").Controller;

class BaseController extends Controller {
	// get
	async index() {
		const {ctx} = this;
		const query = ctx.query;

		this.enauthenticated();
		const userId = this.getUser().userId;

		query.userId = userId;

		const result = await ctx.model.findAndCount(params);

		this.success(result);
	}

	async create() {
		const {ctx} = this;
		const params = ctx.request.body;

		this.enauthenticated();
		const userId = this.getUser().userId;

		params.userId = userId;

		const result = await ctx.model.create(params);

		this.success(result);
	}

	async update() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		const params = ctx.request.body;

		this.enauthenticated();

		if (!id) ctx.throw(400, "id invalid");

		const userId = this.getUser().userId;

		const result = await ctx.model.update(params, {where:{id, userId}});

		this.success(result);
	}

	async destroy() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		const params = ctx.request.body;

		this.enauthenticated();

		if (!id) ctx.throw(400, "id invalid");

		const userId = this.getUser().userId;

		const result = await ctx.model.destroy({where:{id, userId}});

		this.success(result);
	}

	getUser() {
		return this.ctx.state.user;
	}
	// 确保认证
	enauthenticated() {
		if (!this.isAuthenticated()) ctx.throw(400, "unauthenticated");
	}

	isAuthenticated() {
		const user = this.ctx.state.user;
		if (user && user.userId) return true;

		return false;
	}

	success(body, status=200) {
		this.ctx.status = status;
		this.ctx.body = body;
	}
}

module.exports = BaseController;
