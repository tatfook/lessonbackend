
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

		const t = await ctx.model.LearnRecords.findAll({where:{userId}});
		console.log(t);
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

		this.enauthenticated();
		const userId = this.getUser().userId;

		params.userId = userId;

		ctx.validate({
			packageId: "int",
			lessonId: "int",
			classroomId: {type:"int"},
			state: {type: 'int'},
		}, params);

		let learnRecord = await ctx.model.LearnRecords.create(params);

		if (params.state == LEARN_RECORD_STATE_FINISH) {
			await ctx.model.Subscribes.addLearnedLesson(userId, params.packageId, params.lessonId);
		}

		return this.success(learnRecord);
	}

	async update() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		const params = ctx.request.body || {};
		if (!id) ctx.throw(400, "id invalid");

		this.enauthenticated();
		const userId = this.getUser().userId;

		const lr = await ctx.model.LearnRecords.getById(id, userId);
		if (!lr) ctx.throw(400, "args error");

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
}

module.exports = LearnRecordsController;
