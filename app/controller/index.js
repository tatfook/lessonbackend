
const _ = require("lodash");
const Controller = require("../core/baseController.js");

class IndexController extends Controller {
	// get
	async index() {
		const {ctx} = this;
		this.success("hello world");
	}

	async create() {
	}

	async update() {
	}

	async destroy() {

	}
}

module.exports = IndexController;
