
const _ = require("lodash");
const Controller = require("../core/baseController.js");

class IndexController extends Controller {
	// get
	async index() {
		this.success("hello world");
	}

	show() {
		this.ctx.throw(400);
	}

	async create() {
	}

	async update() {
	}

	async destroy() {

	}

	async config() {
		const params = this.ctx.request.body;

		this.ensureAdmin();

		_.merge(this.app.config.self, params);

		return this.success("OK");
	}
}

module.exports = IndexController;
