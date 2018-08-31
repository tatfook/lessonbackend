
const _ = require("lodash");

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

		amount: {  // 返还金额
			type: INTEGER,
			defaultValue: 0,
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

		// 是否已领取
		let data = await app.model.LessonRewards.findOne({where});
		if (data) return 0;

		// 是否学习完成
		data = await app.model.UserLearnRecords.findOne({where});
		if (!data) return 0;

		let user = await app.model.Users.getById(userId);
		const amount = _.random(10, 15);
		if (user.lockCoin < amount) return 0;
		
		const lockCoin = user.lockCoin - amount;

		// 创建返还记录
		await app.model.LessonRewards.create({userId, packageId, lessonId, amount});

		// 扣除用户可返还余额
		await app.model.Users.update({lockCoin}, {where: {id:userId}});

		return amount;
	}

	return model;
}
