
const _ = require("lodash");
const consts = require("../core/consts.js");
const Controller = require("../core/baseController.js");

const {
	USER_IDENTIFY_DEFAULT,
	USER_IDENTIFY_STUDENT,
	USER_IDENTIFY_TEACHER,
	USER_IDENTIFY_APPLY_TEACHER,

	PACKAGE_SUBSCRIBE_STATE_UNBUY,
	PACKAGE_SUBSCRIBE_STATE_BUY,
} = consts;

class UsersController extends Controller {
	// 获取当前用户  不存在则创建
	async index() {
		const {ctx} = this;
		this.enauthenticated();
		const user = this.getUser();

		const data = await ctx.model.Users.getById(user.userId, user.username);

		return this.success(data);
	}

	// 获取用户信息
	async show() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		const data = await ctx.model.Users.getById(id);

		return this.success(data);
	}

	async create() {
		const {ctx} = this;
		this.enauthenticated();
		const user = this.getUser();
		
		const data = await ctx.model.Users.getById(user.userId, user.username);

		return this.success(data);
	}

	async update() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		this.enauthenticated();
		const userId = this.getUser().userId;

		if (id != userId) ctx.throw(400, "args error");

		const params = ctx.request.body;

		delete params.coin;
		delete params.identify;
		delete params.username;

		const result = await ctx.model.Users.update(params, {where:{id}});

		return this.success(result);
	}

	// 申请成老师
	async applyTeacher() {
		// 发送key email  使用memory 防止一个key 给了多个用户
		// 动态生成key
		//
		this.success("未实现, 空接口");
	}

	// 成为老师
	async teacher() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");
		const params = ctx.request.body;

		ctx.validate({
			key: "string",
		}, params);
		
		const user = await ctx.model.Users.getById(id);
		if (!user) ctx.throw(400, "arg error");
		if (user.identify & USER_IDENTIFY_TEACHER) ctx.throw(400, "已经是老师");

		let isOk = await ctx.model.TeacherCDKeys.useKey(params.key, id);
		if (!isOk) ctx.throw(400, "key invalid");

		user.identify = (user.identify | USER_IDENTIFY_TEACHER) & (~USER_IDENTIFY_APPLY_TEACHER);

		const result = await ctx.model.Users.update(user, {where:{id}});

		return this.success(result);
	}

	// 用户课程包
	async getSubscribes() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");
		
		const list = await ctx.model.Subscribes.getByUserId(id);

		return this.success(list);
	}

	async isSubscribe() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		const params = ctx.query;
		if (!id) ctx.throw(400, "id invalid");
		
		this.enauthenticated();
		const userId = this.getUser().userId;
		if (id != userId) ctx.throw(400, "args error");
		const packageId = params.packageId && _.toNumber(params.packageId);
		if (!packageId) ctx.throw(400, "args error");

		const result = await ctx.model.Subscribes.isSubscribePackage(userId, packageId);

		return this.success(result);
	}
	// 用户订阅
	async postSubscribes() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		const params = ctx.request.body;
		if (!id) ctx.throw(400, "id invalid");
		
		this.enauthenticated();
		const userId = this.getUser().userId;
		if (id != userId) ctx.throw(400, "args error");
		
		ctx.validate({
			packageId: 'int',
		}, params);

		const packageId = params.packageId;
		const result = await ctx.model.Subscribes.subscribePackage(userId, packageId);

		if (result.id != 0) ctx.throw(400, result.message);
		
		return this.success(result.data);
	}
}

module.exports = UsersController;
