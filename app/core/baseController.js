
const _ = require("lodash");
const Controller = require("egg").Controller;

class BaseController extends Controller {
	async index() {
		const {ctx} = this;
		const query = ctx.query;

		this.enauthenticated();
		const userId = this.getUser().userId;

		query.userId = userId;

		const model = this.model[this.modelName];
		const result = await model.findAndCount(params);

		this.success(result);
	}

	async create() {
		const {ctx} = this;
		const params = ctx.request.body;

		this.enauthenticated();
		const userId = this.getUser().userId;

		params.userId = userId;

		const model = this.model[this.modelName];
		const result = await model.create(params);

		this.success(result);
	}

	async show() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);

		this.enauthenticated();

		if (!id) ctx.throw(400, "id invalid");
		const userId = this.getUser().userId;

		const model = this.model[this.modelName];
		const result = await model.findOne({where:{id, userId}});

		this.success(result);
	}

	async update() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		const params = ctx.request.body;

		this.enauthenticated();

		if (!id) ctx.throw(400, "id invalid");

		const userId = this.getUser().userId;

		const model = this.model[this.modelName];
		const result = await model.update(params, {where:{id, userId}});

		this.success(result);
	}

	async destroy() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		const params = ctx.request.body;

		this.enauthenticated();

		if (!id) ctx.throw(400, "id invalid");

		const userId = this.getUser().userId;

		const model = this.model[this.modelName];
		const result = await model.destroy({where:{id, userId}});

		this.success(result);
	}

	async postExtra() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		const params = ctx.request.body || {};

		this.enauthenticated();
		if (!id) ctx.throw(400, "id invalid");
		const {userId} = this.getUser();

		const model = this.model[this.modelName];
		const result = await model.update({extra:params}, {where:{id, userId}});
		
		this.success(result);
	}

	async putExtra() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		const params = ctx.request.body || {};

		this.enauthenticated();
		if (!id) ctx.throw(400, "id invalid");
		const {userId} = this.getUser();

		const where = {id, userId};
		const model = this.model[this.modelName];
		let data = await model.findOne({where});
		if (!data) this.throw(404);
		data = data.get({plain:true});

		const extra = data.extra || {};
		_.merge(extra, params);

		const result = await model.update({extra}, {where});
		
		this.success(result);
	}

	async getExtra() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		const params = ctx.request.body || {};

		this.enauthenticated();
		if (!id) ctx.throw(400, "id invalid");
		const {userId} = this.getUser();

		const where = {id, userId};
		const model = this.model[this.modelName];
		let data = await model.findOne({where});
		if (!data) this.throw(404);
		data = data.get({plain:true});

		this.success(data.extra || {});
	}

	async deleteExtra() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);

		this.enauthenticated();
		if (!id) ctx.throw(400, "id invalid");
		const {userId} = this.getUser();

		const model = this.model[this.modelName];
		const result = await model.update({extra:{}}, {where:{id, userId}});
		
		this.success(result);
	}

	getUser() {
		return this.ctx.state.user || {};
	}

	// 确保认证
	enauthenticated() {
		if (!this.isAuthenticated()) this.ctx.throw(401, "unauthenticated");
	}

	ensureAdmin() {
		this.enauthenticated();
		const roleId = this.getUser().roleId;

		if (roleId != 10) this.ctx.throw(403, "not admin");
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

	failed(status, msg) {
		this.ctx.status = status || 400;
		this.ctx.body = msg;
	}
}

module.exports = BaseController;
