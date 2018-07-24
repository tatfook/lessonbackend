
const _ = require("lodash");
const Controller = require("../core/baseController.js");

class PackagesController extends Controller {
	// get
	async index() {
		const {ctx} = this;
	}
	async create() {
		const {ctx} = this;
	}
	async update() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		const params = ctx.request.body;
		if (!id) ctx.throw(400, "id invalid");

		const result = await ctx.model.Packages.update(params, {
			where: {
				id:id,
			}
		});

		ctx.status = 200;
		ctx.body = result;
	}
	async destroy() {

	}
}

module.exports = PackagesController;
