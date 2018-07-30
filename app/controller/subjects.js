
const _ = require("lodash");
const Controller = require("../core/baseController.js");

class SubjectsController extends Controller {
	// get
	async index() {
		const {ctx} = this;
		const list = await ctx.model.Subjects.gets();

		return this.success(list);
	}

	async show() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		const subject = await ctx.model.Subjects.getOne(id);
		if (!subject) ctx.throw(404, "not found");

		return this.success(subject);
	}

	async create() {
		const {ctx} = this;
		const params = ctx.request.body;

		const result = await ctx.model.Subjects.create(params);

		return this.success(result);
	}

	async update() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		const params = ctx.request.body;

		const result = await ctx.model.Subjects.update(params, {where:{id}});

		return this.success(result);
	}

	async destroy() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		await ctx.model.Skills.destroy({where:{subjectId:id}}); 

		const result = await ctx.model.Subjects.destroy({
			where: {id},
		});

		return this.success(result);
	}

}

module.exports = SubjectsController;
