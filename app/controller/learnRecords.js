
const consts = require("../core/consts.js");
const { 
	LEARN_RECORD_STATE_START,
	LEARN_RECORD_STATE_FINISH,
} = consts;

const _ = require("lodash");
const Controller = require("../core/baseController.js");

class LearnRecordsController extends Controller {
	// get
	async index() {
		const {ctx} = this;
	
		this.enauthenticated();
		const userId = this.getUser().userId;

		const list = await ctx.model.LearnRecords.findAndCount({where: {userId}});

		return this.success(list);
	}

	async show() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		this.enauthenticated();
		const userId = this.getUser().userId;

		const lr = await ctx.model.LearnRecords.findOne({where: {id, userId}});

		if (!lr) ctr.throw(404, "not found");

		this.success(lr);
	}

	async create() {
		const {ctx} = this;
		const params = ctx.request.body;

		const userId = this.getUser().userId || 0;
		params.userId = userId;

		ctx.validate({
			packageId: "int",
			lessonId: "int",
			classroomId: {type:"int", required: false},
			state: 'int',
		}, params);

		const data = await ctx.model.Subscribes.findOne({where:{
			userId,
			packageId: params.packageId,
		}});

		if (!data) this.throw(500, "未购买课程包");

		let learnRecord = await ctx.model.LearnRecords.createLearnRecord(params);

		return this.success(learnRecord);
	}

	async update() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		const params = ctx.request.body || {};
		if (!id) ctx.throw(400, "id invalid");

		if (id) this.enauthenticated();
		const userId = this.getUser().userId || 0;

		const lr = await ctx.model.LearnRecords.getById(id, userId);
		if (!lr) ctx.throw(400, "args error");

		if(lr.classroomId) {
			const isClassing = await ctx.model.Classrooms.isClassing(lr.classroomId);
			if (!isClassing) ctx.throw(400, "已下课");
		}
		params.id = id;
		params.userId = userId;

		delete params.packageId;
		delete params.lessonId;
		delete params.classroomId;

		await ctx.model.LearnRecords.updateLearnRecord(params);

		return this.success("OK");
	}

	async destroy() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		this.enauthenticated();
		const userId = this.getUser().userId;

		const result = await ctx.model.LearnRecords.destroy({
			where: {id, userId},
		});

		return this.success(result);
	}

	async createReward() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");
		this.enauthenticated();
		const userId = this.getUser().userId;

		const lr = await ctx.model.LearnRecords.getById(id, userId);
		const data = await ctx.model.LessonRewards.rewards(userId, lr.packageId, lr.lessonId);
		return this.success(data || {coin:0, bean:0});
	}

	async getReward() {
		const {ctx} = this;
		this.enauthenticated();
		const userId = this.getUser().userId;
		const params = this.validate({"packageId": "int", "lessonId": "int"});

		let data = await this.model.LessonRewards.findOne({
			where: {
				userId,
				packageId: params.packageId,
				lessonId: params.lessonId,
			}
		});
		data = data ? data.get({plain:true}) : {coin:0, bean:0};

		return this.success(data);
	}
}

module.exports = LearnRecordsController;
