
const _ = require("lodash");
const consts = require("../core/consts.js");
const Controller = require("../core/baseController.js");
//const Controller = require("egg").Controller;

const {
	PACKAGE_STATE_UNAUDIT,
	PACKAGE_STATE_AUDITING,
	PACKAGE_STATE_AUDIT_SUCCESS,
	PACKAGE_STATE_AUDIT_FAILED
} = consts;

class PackagesController extends Controller {
	// get
	async index() {
		const {ctx} = this;
		const query = ctx.query || {};

		this.enauthenticated();
		const userId = this.getUser().userId;

		query.userId = userId;

		const list = await ctx.model.Packages.findAndCount(query);

		return this.success(list);
	}

	async show() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		const data = ctx.model.Packages.getById(id);

		return this.success(data);
	}

	// 创建课程包
	async create() {
		const {ctx} = this;
		const params = ctx.request.body;
		const lessons = params.lessons;

		this.enauthenticated();
		const userId = this.getUser().userId;
		params.userId = userId;

		let pack= await ctx.model.Packages.create(params);
		if (!pack) ctx.throw("500", "DB failed");

		pack = pack.get({plain:true});

		if (!lessons || !_.isArray(lessons)) return this.success(pack);

		for (let i = 0; i < lessons.length; i++) {
			let lessonId = Lessons[i];
			let lesson = await ctx.model.Lessons.findOne({where:{id: lessonId}});
			if (!lesson) continue;

			await ctx.model.PackageLessons.create({
				packageId: pack.id,
				lessonId: lessonId,
			});
		}

		this.success(pack);
	}
	
	async lessons() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");
		
		const list = await ctx.model.Packages.lessons(id);

		return this.success(list);
	}

	async addLesson() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		const params = ctx.request.body;

		this.enauthenticated();
		const userId = this.getUser().userId;

		const result = await this.ctx.model.Packages.addLesson(userId, id, params.lessonId);
		return this.success(result);
	}

	async deleteLesson() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		const params = ctx.query || {};
		const lessonId = params.lessonId && _.toNumber(params.lessonId);
		if (!lessonId) ctx.throw(401, "args error");

		this.enauthenticated();
		const userId = this.getUser().userId;

		const result = await this.ctx.model.Packages.deleteLesson(userId, id, lessonId);
		return this.success(result);

	}

	async update() {
		const {ctx} = this;
		const params = ctx.request.body;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		this.enauthenticated();
		const userId = this.getUser().userId;

		const result = await ctx.model.Packages.update(params, {where:{id}});

		return this.success(result);
	}

	async destroy() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		this.enauthenticated();
		const userId = this.getUser().userId;

		const result = await ctx.model.Packages.destroy({where:{id, userId}});

		await ctx.model.PackageLessons.destroy({where:{packageId:id, userId}});

		return this.success(result);
	}

	async applyAudit() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		this.enauthenticated();

		const data = ctx.model.Packages.getById(id);
		if (!data) ctx.throw(400, "not found");

		data.state = PACKAGE_STATE_AUDITING;

		const result = ctx.model.Packages.update(data, {where:{id}});

		return this.success(result);
	}

	async audit() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");
		const params = ctx.request.body;

		ctx.validate({
			state: 'int',
		}, params);

		this.enauthenticated();

		const data = ctx.model.Packages.getById(id);
		if (!data) ctx.throw(400, "not found");

		data.state = params.state;

		const result = ctx.model.Packages.update(data, {where:{id}});

		return this.success(result);
	}
}

module.exports = PackagesController;
