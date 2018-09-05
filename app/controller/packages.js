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

		const data = await ctx.model.Packages.findAndCount({where:query});
		const list = data.rows;
		for (let i = 0; i < list.length; i++) {
			let pack = list[i].get ? list[i].get({plain:true}) : list[i];
			pack.lessons = await ctx.model.Packages.lessons(pack.id);
			list[i] = pack;
		}

		return this.success(data);
	}
	
	// get
	async index() {
		const {ctx} = this;
		const query = ctx.query || {};

		this.enauthenticated();
		const userId = this.getUser().userId;
		query.userId = userId;

		const result = await ctx.model.Packages.findAndCount({where:query});

		return this.success(result);
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
		const userId = this.getUser().userId;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		let data = await ctx.model.Packages.getById(id);
		if (!data) ctx.throw(400, "args errors");

		data.lessons = await ctx.model.Packages.lessons(id);
		data.learnedLessons = [];
		data.teachedLessons = [];
		if (!userId) return this.success(data);

		for (let i = 0; i < data.lessons.length; i++) {
			let lesson = data.lessons[i];
			let isLearned = await ctx.model.LearnRecords.isLearned(userId, id, lesson.id);
			if (isLearned) data.learnedLessons.push(lesson.id);
			let isTeached = await ctx.model.Classrooms.isTeached(userId, id, lesson.id);
			if (isTeached) data.teachedLessons.push(lesson.id);
		}

		data.isSubscribe = await ctx.model.Subscribes.isSubscribePackage(userId, id);

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
		params.coin = (params.rmb || 0) * 10;

		//console.log(params);
		let pack = await ctx.model.Packages.create(params);
		if (!pack) ctx.throw("500", "DB failed");

		pack = pack.get({plain:true});

		if (!lessons || !_.isArray(lessons)) return this.success(pack);

		for (let i = 0; i < lessons.length; i++) {
			let lessonId = lessons[i];
			let lesson = await ctx.model.Lessons.findOne({where:{id: lessonId}});
			if (!lesson) continue;
			
			//console.log(pack.id, lessonId);

			await ctx.model.PackageLessons.create({
				userId,
				packageId: pack.id,
				lessonId: lessonId,
				extra: {
					lessonNo: i + 1,
				}
			});
		}

		this.success(pack);
	}
	
	async update() {
		const {ctx} = this;
		const params = ctx.request.body;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		this.enauthenticated();
		const userId = this.getUser().userId;
		
		delete params.state;

		const result = await ctx.model.Packages.update(params, {where:{id}});
		const lessons = params.lessons;
		if (!lessons || !_.isArray(lessons)) return this.success(result);

		const records = [];
		for (let i = 0; i < lessons.length; i++) {
			let lessonId = lessons[i];
			records.push({userId, packageId: id, lessonId: lessonId, extra: {lessonNo: i + 1}});
		}
		if (records.length > 0){
			await ctx.model.PackageLessons.destroy({where:{packageId:id}});
			await ctx.model.PackageLessons.bulkCreate(records);
		}

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

		const data = await ctx.model.Packages.getById(id);
		if (!data) ctx.throw(400, "not found");

		data.state = PACKAGE_STATE_AUDITING;

		const result = await ctx.model.Packages.update(data, {where:{id}});

		return this.success(result);
	}

	async audit() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");
		const params = ctx.request.body;

		ctx.validate({
			state: [PACKAGE_STATE_UNAUDIT, PACKAGE_STATE_AUDITING],
		}, params);

		this.enauthenticated();

		const data = ctx.model.Packages.getById(id);
		if (!data) ctx.throw(400, "not found");

		const result = await ctx.model.Packages.update({state:params.state}, {where:{id}});

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
		const packageId = id;

		const result = await ctx.model.Subscribes.subscribePackage(userId, packageId);

		if (result.id != 0) ctx.throw(400, result.message);
		
		return this.success(result.data);
	}

	async isSubscribe() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");
		this.enauthenticated();
		const userId = this.getUser().userId;

		const result = await ctx.model.Subscribes.isSubscribePackage(userId, id);

		return this.success(result);
	}

	async hots() {
		const {ctx} = this;

		const list = await ctx.model.PackageSorts.getHots();
		for (let i = 0; i < list.length; i++) {
			let pack = list[i].get ? list[i].get({plain:true}) : list[i];
			pack.lessons = await ctx.model.Packages.lessons(pack.id);
			list[i] = pack;
		}

		return this.success(list);
	}

	async teach() {
		const {ctx} = this;
		const {userId} = this.enauthenticated();
		// 获取自己创建的课程包
		let packages = await ctx.model.Packages.findAll({where:{userId}});
		// 获取购买的课程包
		const subscribes = await ctx.model.Subscribes.getPackagesByUserId(userId);
		
		packages = packages.concat(subscribes);

		console.log(packages.length);
		for (let i = 0; i < packages.length; i++) {
			let pack = packages[i];
			let obj = await ctx.model.Classrooms.getLastTeach(userId, pack.id);
			//console.log(obj);
			pack = pack.get ? pack.get({plain:true}) : pack;
			pack.lastTeachDate = obj ? obj.createdAt : "";
		}

		packages = _.sortBy(packages, ["lastTeachDate", "createdAt"], ["desc", "desc"]);

		return this.success(packages);
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
		ctx.validate({
			lessonId: "int",
		});

		this.enauthenticated();
		const userId = this.getUser().userId;

		const result = await this.ctx.model.Packages.addLesson(userId, id, params.lessonId, params.lessonNo);
		return this.success(result);
	}

	async putLesson() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		const params = ctx.request.body;
		ctx.validate({
			lessonId: "int",
		});

		this.enauthenticated();
		const userId = this.getUser().userId;

		const result = await this.ctx.model.Packages.putLesson(userId, id, params.lessonId, params.lessonNo);
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

}

module.exports = PackagesController;
