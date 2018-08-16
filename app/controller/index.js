
const _ = require("lodash");
const Controller = require("../core/baseController.js");

class IndexController extends Controller {
	// get
	async index() {
		const {ctx} = this;
		console.log("-------------index test-------------");
		this.success("hello world");
	}

	show() {
		ctx.throw(400);
	}

	async create() {
	}

	async update() {
	}

	async destroy() {

	}
}

module.exports = IndexController;
