
const _ = require("lodash");
const Controller = require("../core/baseController.js");

class IndexController extends Controller {
	// get
	async index() {
		const {ctx} = this;
	}
	async create() {
		const {ctx} = this;
		ctx.validate({
			id: 'int',
		});

	}
	async update() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");
	}
	async destroy() {

	}
}

module.exports = IndexController;
