
const _ = require("lodash");
const uuidv1 = require("uuid/v1");
const consts = require("../core/consts.js");
const Controller = require("../core/baseController.js");

class TeacherCDKeysController extends Controller {
	async index() {
		const {ctx} = this;

		const list = await ctx.model.TeacherCDKeys.findAll();

		return this.success(list);
	}

	async generate() {
		this.ensureAdmin();
		const {ctx} = this;
		const params = ctx.query || {};

		const count = _.toNumber(params.count) || 1;
		const list = [];

		for (let i = 0; i < count; i++) {
			let key = uuidv1();
			let data = await ctx.model.TeacherCDKeys.create({key});
			list.push(data);
		}

		return this.success(list); 
	}

	async update() {
		this.ensureAdmin();
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");
		const params = ctx.request.body;
	
		delete params.key;
		delete params.teacherId;
		const result = await ctx.model.TeacherCDKeys.update(params, {where:{id}});

		return this.success(result);
	}

	async destroy() {
		this.ensureAdmin();
		const {ctx} = this; 
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		const result = await ctx.model.TeacherCDKeys.destroy({where:{id}});

		return this.success(result);
	}
}

module.exports = TeacherCDKeysController;
