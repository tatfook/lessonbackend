
const _ = require("lodash");
const {
	TRADE_TYPE_BEAN,
	TRADE_TYPE_COIN,
} = require("../core/consts.js");

module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		DATE,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("lessonRewards", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		userId: {
			type: BIGINT,
			allowNull: false,
		},

		packageId: {
			type: BIGINT,
			allowNull: false,
		},

		lessonId: {
			type: BIGINT,
			allowNull: false,
		},

		coin: {        // 奖励知识币数量
			type: INTEGER,
			defaultValue: 0,
		},

		bean: {        // 奖励知识豆数量
			type: INTEGER,
			defaultValue:0,
		},

		extra: {
			type: JSON,
			defaultValue: {},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',

		indexes: [
		{
			unique: true,
			fields: ["userId", "packageId", "lessonId"],
		},
		],

	});

	//model.sync({force:true});

	model.rewards = async function(userId, packageId, lessonId) {
		const where = {userId, packageId, lessonId};
		let user = await app.model.Users.getById(userId);
		if (!user) return;

		// 是否学习完成
		let data = await app.model.UserLearnRecords.findOne({where});
		if (!data) return;

		// 是否已领取
		let lessonReward = await app.model.LessonRewards.findOne({where});
		lessonReward = lessonReward ? lessonReward.get({plain:true}) : {userId, packageId, lessonId, coin:0, bean:0};

		let beanCount = lessonReward.bean ? 0 : 10; // 已奖励则不再奖励
		let coinCount = (user.lockCoin < 10 || lessonReward.coin) ? 0 : _.random(10, user.lockCoin > 15 ? 15 : user.lockCoin);

		user.lockCoin = user.lockCoin - coinCount;
		user.coin = user.coin + coinCount;
		user.bean = user.bean + beanCount;
		lessonReward.coin = lessonReward.coin + coinCount;
		lessonReward.bean = lessonReward.bean + beanCount;

		// 创建返还记录
		await app.model.LessonRewards.upsert(lessonReward);

		// 扣除用户可返还余额
		await app.model.Users.update(user, {fields:["lockCoin", "coin", "bean"], where: {id:userId}});

		if (beanCount) {
			const lesson = await app.model.Lessons.getById(lessonId);
			const decription = "课程" + lesson.lessonName + "学习完成";
			await app.model.Trades.create({userId,type: TRADE_TYPE_BEAN, amount: beanCount, description });
		}

		return {coin:coinCount, bean: beanCount};
	}

	return model;
}
