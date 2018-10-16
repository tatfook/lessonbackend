
const _ = require("lodash");
const consts = require("../core/consts.js");
const Controller = require("../core/baseController.js");

const { 
	CLASSROOM_STATE_UNUSED,
	CLASSROOM_STATE_USING,
	CLASSROOM_STATE_USED,

	LEARN_RECORD_STATE_START,
	LEARN_RECORD_STATE_FINISH,
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

		const list = await ctx.model.Classrooms.findAndCount({where:query});

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

		const packageLesson = await ctx.model.PackageLessons.findOne({where:{
			packageId: params.packageId,
			lessonId: params.lessonId,
		}});
		if (!packageLesson) ctx.throw(400);

		const ok = await ctx.model.Teachers.isAllowTeach(userId);
		if (!ok) ctx.throw(400, "no privilege");

		const _package = await ctx.model.Packages.getById(params.packageId);
		const lesson = await ctx.model.Lessons.getById(params.lessonId);
		if (!_package || !lesson) ctx.throw(400, "args error");
		
		params.userId = userId;
		params.state = CLASSROOM_STATE_USING;
		params.extra = params.extra || {};
		params.extra.packageName = _package.packageName;
		params.extra.lessonName = lesson.lessonName;
		params.extra.lessonGoals = lesson.goals;
		params.extra.coverUrl = (lesson.extra || {}).coverUrl;
		params.extra.lessonNo = packageLesson.extra.lessonNo;

		const data = await ctx.model.Classrooms.createClassroom(params);

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

	async valid() {
		const {key} = this.validate({key:"string"});
		
		let data = await this.model.Classrooms.findOne({where:{key}});
		if (!data) return this.success(false);
		data = data.get({plain:true});

		return this.success(data.state & CLASSROOM_STATE_USING ? true : false);
	}

	async join() {
		const {ctx} = this;
		const params = ctx.request.body;

		ctx.validate({
			key:"string",
		}, params);

		const userId = this.getUser().userId || 0;
		
		const data = await ctx.model.Classrooms.join(userId, params.key);
		if (!data) ctx.throw(400, "key invalid");
		
		if (!userId) data.token = this.app.util.jwt_encode({userId:0, username:"匿名用户"}, this.app.config.self.secret, 3600 * 24);

		return this.success(data);
	}

	async quit() {
		const {userId} = this.enauthenticated();
		
		await this.model.Classrooms.quit(userId);

		return this.success("OK");
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

		const learnRecord = await ctx.model.LearnRecords.findOne({where:{classroomId: classroom.id, userId}});
		if (learnRecord) {
			classroom.learnRecordId = learnRecord.get({plain:true}).id;
		}
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
	async createLearnRecords() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");
		const params = ctx.request.body;

		await this.ensureTeacher();
		const userId = this.getUser().userId;

		const classroom = await ctx.model.Classrooms.getById(id, userId);
		if (!classroom) ctx.throw(400, "args error");
		
		params.classroomId = id;
		params.packageId = classroom.packageId;
		params.lessonId = classroom.lessonId;
		if (!params.userId) ctx.throw(400, "args error");
		const lr = await ctx.model.LearnRecords.createLearnRecord(params);
		
		return this.success(lr);
	}

	// 更新课堂学习记录
	async updateLearnRecords() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");
		const params = ctx.request.body;

		await this.ensureTeacher();
		const userId = this.getUser().userId;

		const classroom = await ctx.model.Classrooms.getById(id, userId);
		if (!classroom) ctx.throw(400, "args error");
		
		const learnRecords = _.isArray(params) ? params : [params];
		for (let i = 0; i < learnRecords.length; i++) {
			let record = learnRecords[i];
			if (!record.id || !record.userId) continue;
			record.classroomId = id;
			await ctx.model.LearnRecords.updateLearnRecord(record);
		}
		
		return this.success("OK");
	}

	// 下课
	async dismiss() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");
		const params = ctx.request.body;

		await this.ensureTeacher();
		const userId = this.getUser().userId;

		const result = await ctx.model.Classrooms.dismiss(userId, id);
		return this.success(result);
	}
}

module.exports = ClassroomsController;
