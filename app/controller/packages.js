
const _ = require("lodash");
const consts = require("../core/consts.js");
const Controller = require("../core/baseController.js");
//const Controller = require("egg").Controller;

const {
	PACKAGE_STATE_UNAUDIT,
	PACKAGE_STATE_AUDITING,
	PACKAGE_STATE_AUDIT_SUCCESS,
	PACKAGE_STATE_AUDIT_FAILED,

	PACKAGE_SUBSCRIBE_STATE_UNBUY,
	PACKAGE_SUBSCRIBE_STATE_BUY,
} = consts;

class PackagesController extends Controller {
	async search() {
		const {ctx} = this;
		const query = ctx.query || {};

		const list = await ctx.model.Packages.findAndCount(query);

		return this.success(list);
	}
	
	// get
	async index() {
		const {ctx} = this;
		const query = ctx.query || {};

		this.enauthenticated();
		const userId = this.getUser().userId;
		query.userId = userId;

		const list = await ctx.model.Packages.findAll(query);

		return this.success(list);
	}

	// 获取单一课程包
	async show() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");
		const data = await ctx.model.Packages.getById(id);

		return this.success(data);
	}

	// 获取课程详情
	async detail() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		let data = await ctx.model.Packages.getById(id);
		if (!data) ctx.throw(400, "args errors");

		data.lessons = await ctx.model.Packages.lessons(id);

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
	
	// 获取课程列表
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

	// 课程包订阅  购买
	async subscribe() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");
		const params = ctx.request.body;

		this.enauthenticated();
		const userId = this.getUser().userId;

		let data = await ctx.model.Packages.findOne({
			userId,
			packageId:id,
			state: PACKAGE_SUBSCRIBE_STATE_BUY,
		});
		if (data) ctx.throw(400, "已订阅");

	
		const user = await ctx.model.Users.getById(userId);
		const _package = await ctx.model.Packages.getById(id);

		if (!user || !_package) ctx.throw(400, "args error");
		
		if (user.coin <= _package.cost) ctx.throw(400, "知识币不足");

		user.coin = user.coin - _package.cost;
		await ctx.model.Users.update({coin:user.coin}, {where:{id:userId}});
		const result = await ctx.model.Subscribes.upsert({
			userId,
			packageId: _package.id,
			state: PACKAGE_SUBSCRIBE_STATE_BUY,
		});
		
		return this.success(result);
	}
}

module.exports = PackagesController;
