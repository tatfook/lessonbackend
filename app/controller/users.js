
const _ = require("lodash");
const jwt = require("jwt-simple");
const consts = require("../core/consts.js");
const Controller = require("../core/baseController.js");

const {
	USER_IDENTIFY_DEFAULT,
	USER_IDENTIFY_STUDENT,
	USER_IDENTIFY_TEACHER,
	USER_IDENTIFY_APPLY_TEACHER,

	PACKAGE_SUBSCRIBE_STATE_UNBUY,
	PACKAGE_SUBSCRIBE_STATE_BUY,

	TEACHER_PRIVILEGE_TEACH,
} = consts;

class UsersController extends Controller {

	token() {
		const env = this.app.config.env;
		this.enauthenticated();
		const user = this.getUser();
		user.exp = Date.now() / 1000 + (env == "prod" ? 3600 * 24 * 1000 : 3600 * 24);
		const token = jwt.encode(user, this.app.config.self.secret);

		return this.success(token);
	}

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

		delete params.lockCoin;
		delete params.coin;
		delete params.bean;
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
		const {id, key, school} = this.validate({
			id: "int",
			key: "string",
			school: "string_optional"
		});
		
		const user = await this.model.Users.getById(id);
		if (!user) this.throw(400, "arg error");
		if (user.identify & USER_IDENTIFY_TEACHER) this.throw(400, "已经是老师");

		let isOk = await this.model.TeacherCDKeys.useKey(key, id);
		if (!isOk) this.throw(400, "key invalid");

		user.identify = (user.identify | USER_IDENTIFY_TEACHER) & (~USER_IDENTIFY_APPLY_TEACHER);
		await this.model.Teachers.create({
			userId:id,
			key:key,
			privilege: TEACHER_PRIVILEGE_TEACH,
			school,
		});

		const result = await this.model.Users.update(user, {where:{id}});

		return this.success(result);
	}

	// 是否允许教课
	async isTeach() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		const ok = await ctx.model.Teachers.isAllowTeach(id);

		return this.success(ok);
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
		
		return this.success("OK");
	}

	// 获取知识币变更列表
	async coins() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");
		
		this.enauthenticated();
		const userId = this.getUser().userId;
		if (id != userId) ctx.throw(400, "args error");
	
		const list = await ctx.model.Coins.findAll({where:{userId}});
		return this.success(list);
	}

	// 获取用户已学习的技能列表
	async skills() {
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);
		if (!id) ctx.throw(400, "id invalid");

		const list = await ctx.model.UserLearnRecords.getSkills(id);

		this.success(list);
	}

	// 用户花费知识币和知识豆
	async expense() {
		const {userId} = this.enauthenticated();
		const {coin, bean} = this.validate({coin:"int_optional", bean:"int_optional"});
		
		const user = await this.model.Users.getById(userId);
		if (!user) this.throw(400);
		if (user.bean && bean && user.bean >= bean) user.bean = user.bean - bean;
		if (user.coin && coin && user.coin >= coin) user.coin = user.coin - coin;

		await this.model.Users.update(User, {fields:["coin", "bean"], where:{id:userId}});

		return this.success("OK");
	}
}

module.exports = UsersController;
