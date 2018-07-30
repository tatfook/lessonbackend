
const _ = require("lodash");
const consts = require("../core/consts.js");
const Controller = require("../core/baseController.js");

const { 
	CLASSROOM_STATE_UNUSED,
	CLASSROOM_STATE_USING,
	CLASSROOM_STATE_USED,
} = consts;

class ClassroomsController extends Controller {
	async ensureTeacher() {
		this.enauthenticated();
		const userId = this.getUser().userId;
		const isTeacher = await this.ctx.model.Users.isTeacher(userId);
		if (!isTeacher) this.ctx.throw(400, "非老师");
	}

	async index() {
		const {ctx} = this;
		const query = ctx.query || {};

		this.enauthenticated();
		const userId = this.getUser().userId;

		query.userId = userId;

		const list = await ctx.model.Classrooms.findAll(query);

		return this.success(list);
	}

	async show() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		const data = await ctx.model.Classrooms.findOne({where:{id}});

		return this.success(data);
	}

	async create() {
		const {ctx} = this;
		const params = ctx.request.body;

		ctx.validate({
			packageId:"int",
			lessonId:"int",
		});

		await this.ensureTeacher();
		const userId = this.getUser().userId;

		params.userId = userId;
		params.state = CLASSROOM_STATE_UNUSED;

		const data = await ctx.model.Classrooms.create(params);

		return this.success(data);
	}

	async update() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");
		const params = ctx.request.body;

		await this.ensureTeacher();
		const userId = this.getUser().userId;
		params.userId = userId;

		const data = await ctx.model.Classrooms.update(params, {where:{id, userId}});

		return this.success(data);
	}

	async join() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		this.enauthenticated();
		const userId = this.getUser().userId;
		
		const result = await ctx.model.Classrooms.join(id, userId);
		if (!result) ctx.throw(400, "classroomId invalid");
		
		return this.success(result);
	}

	async current() {
		const {ctx} = this;

		this.enauthenticated();
		const userId = this.getUser().userId;

		const user = await ctx.model.Users.getById(userId);
		
		const classroomId = user.extra.classroomId;
		if (!classroomId) ctx.throw(404, "not found");

		let classroom = await ctx.model.Classrooms.findOne({where:{id:classroomId}});
		if (!classroom) ctx.throw(404, "not found");

		classroom = classroom.get({plain:true});
		if (classroom.state != CLASSROOM_STATE_USING) ctx.throw(400, "课堂已结束");

		return this.success(classroom);
	}

	async getLearnRecords() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		this.enauthenticated();
		const userId = this.getUser().userId;
		
		const list = await ctx.model.LearnRecords.findAll({where:{classroomId:id}});
		
		return this.success(list);
	}

	// 更新课堂学习记录
	async updateLearnRecords() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");
		const params = ctx.request.body;

		await this.ensureTeacher();
		const userId = this.getUser().userId;

		const data = await ctx.model.Classrooms.getById(id, userId);
		if (!data) ctx.throw(400, "args error");
		
		const learnRecords = params.learnRecords;
		for (let i = 0; i < learnRecords.length; i++) {
			let record = learnRecords[i];
			if (!record.id) continue;
			record.classroomId = id;
			await ctx.model.LearnRecords.update(record, {where:{id:record.id}});
		}
		
		return this.success("OK");
	}
}

module.exports = ClassroomsController;
