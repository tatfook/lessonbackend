
const _ = require("lodash");
const consts = require("../core/consts.js");
const Controller = require("../core/baseController.js");

const { 
	CLASSROOM_STATE_UNUSED,
	CLASSROOM_STATE_USING,
	CLASSROOM_STATE_USED,
} = consts;

class ClassroomsController extends Controller {
	index() {
		const {ctx} = this;
		const query = ctx.query || {};

		this.enauthenticated();
		const userId = this.getUser().userId;

		query.userId = userId;

		const list = await ctx.model.Classrooms.findAll(query);

		return this.success(list);
	}

	show() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		const data = await ctx.model.Classrooms.findOne({where:{id}});

		return this.success(data);
	}

	create() {
		const {ctx} = this;
		const params = ctx.request.body;

		ctx.validate({
			lessonId:"int",
		});

		this.enauthenticated();
		const userId = this.getUser().userId;

		params.userId = userId;
		params.state = CLASSROOM_STATE_UNUSED;

		const data = await ctx.model.Classrooms.create(params);

		return this.success(data);
	}

	update() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");
		const params = ctx.request.body;

		this.enauthenticated();
		const userId = this.getUser().userId;
		params.userId = userId;

		const data = await ctx.model.Classrooms.update(params, {where:{id, userId}});

		return this.success(data);
	}

	join() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		this.enauthenticated();
		const userId = this.getUser().userId;
		
		const result = await ctx.model.Classrooms.join(id, userId);
		if (!result) ctx.throw(400, "classroomId invalid");
		
		return this.success(result);
	}

	report() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		this.enauthenticated();
		const userId = this.getUser().userId;
		
		const list = await ctx.model.LearnRecords.findAll({where:{classroomId:id}});
		
		return this.success(list);
	}
}

module.exports = ClassroomsController;
