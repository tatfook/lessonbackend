
const _ = require("lodash");
const consts = require("../core/consts.js");
const Controller = require("../core/baseController.js");

const {
	PACKAGE_SUBSCRIBE_STATE_UNBUY,
	PACKAGE_SUBSCRIBE_STATE_BUY,
} = consts;

class PayController extends Controller {
	// 前端跳转至 https://stage.keepwork.com/wiki/pay?username=xioayao&app_name=lessons&app_goods_id=1&price=1&additional=%7B%22packageId%22%3A1%7D
	async callback() {
		console.log("------------");
		const {ctx, app} = this;
		const query = ctx.query;
		const username = query.username;
		const packageId = _.toNumber(query.packageId);
		const price = _.toNumber(query.price);
		const config = app.config.self;
		const ip = ctx.ip;

		//console.log(ctx.ip);
		//console.log(config);
		//console.log(ctx.path);
		//console.log(ctx.query);

		if (_.indexOf(config.trustIps, ip) < 0) ctx.throw(400, "不可信任请求");

		if (!username || !price || !packageId) ctx.throw(400, "params invalid");


		let user = await ctx.model.Users.findOne({where: {username}});
		if (!user) ctx.throw(400, "user not exist");
		user = user.get({plain:true});

		let package_ = await ctx.model.Packages.findOne({where:{id:packageId}});
		if (!package_) ctx.throw(400, "package not exist");
		package_ = package_.get({plain: true});
		if (package_.rmb > price) ctx.throw(400, "金额不对");

		const subscribe = await ctx.model.Subscribes.findOne({where:{userId: user.id, packageId: package_.id}});
		if (subscribe) ctx.throw(400, "package already subscribe");

		// 更新用户待解锁金币数
		const lockCoin = user.lockCoin + package_.coin;
		await ctx.model.Users.update({lockCoin}, {where:{id:user.id}});

		await ctx.model.Subscribes.create({
			userId: user.id,
			packageId: package_.id,
			state: PACKAGE_SUBSCRIBE_STATE_BUY,
		});

		this.success("OK");
	}
}

module.exports = PayController;


