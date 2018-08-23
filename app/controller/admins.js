
const _ = require("lodash");
const Controller = require("../core/baseController.js");

class AdminsController extends Controller {
	parseParams() {
		const params = this.ctx.params || {};
		const resourceName = params["resources"] || "";

		this.resource = this.ctx.model[_.upperFirst(resourceName)];

		if (!this.resource) this.ctx.throw(400, "args error");

		this.enauthenticated();
		const roleId = this.getUser().roleId;
		
		if (roleId != 10) this.ctx.throw(400, "no privlige");

		return;
	}
	
	async index() {
		this.parseParams();
		const {ctx} = this;

		const query = ctx.query || {};
		const list = await this.resource.findAndCount({...this.queryOptions, where:query});

		this.success(list);
	}

	async show() {
		this.parseParams();
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);

		if (!id) ctx.throw(400, "args error");

		const data = await this.resource.findOne({where:{id}});

		return this.success(data);
	}

	async create() {
		this.parseParams();
		const {ctx} = this;
		const params = ctx.request.body;

		const data = await this.resource.create(params);

		return this.success(data);
	}

	async update() {
		this.parseParams();
		const {ctx} = this;
		const params = ctx.request.body;
		const id = _.toNumber(ctx.params.id);

		if (!id) ctx.throw(400, "args error");

		const data = await this.resource.update(params, {where:{id}});

		return this.success(data);
	}

	async destroy() {
		this.parseParams();
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);

		if (!id) ctx.throw(400, "args error");

		const data = await this.resource.destroy({where:{id}});

		return this.success(data);
	}
}

module.exports = AdminsController;
