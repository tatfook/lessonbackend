const _ = require("lodash");
const consts = require("../core/consts.js");
const {
	COIN_TYPE_SUBSCRIBE_PACKAGE,
	COIN_TYPE_PACKAGE_REWARD,

	PACKAGE_SUBSCRIBE_STATE_UNBUY,
	PACKAGE_SUBSCRIBE_STATE_BUY,
} = consts;

module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		DATE,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("subscribes", {
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

		state: {  // 0 - 未购买 1 - 已购买
			type: INTEGER,
			defaultValue: 0
		},

		extra: {     // 额外数据
			type: JSON,
			defaultValue:{},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
		indexes: [
		{
			unique: true,
			fields: ["userId", "packageId"],
		},
		],
	});

	//model.sync({force:true});
	
	model.getPackagesByUserId = async function(userId) {
		const sql = `select packages.*, subscribes.createdAt joinAt, subscribes.state subscribeState 
			from subscribes, packages 
			where subscribes.packageId = packages.id and
			subscribes.userId = :userId`;

		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {userId},
		});

		return list;
	}

	model.getByUserId = async function(userId) {
		const list = await app.model.Subscribes.findAll({where:{userId}});
		const packages = [];

		for (let i = 0; i < list.length; i++) {
			let subscribe = list[i].get ? list[i].get({plain:true}) : list[i];
			let data = await app.model.Packages.findOne({where:{id:subscribe.packageId}});
			//console.log(subscribe);
			if (!data) continue;
			data = data.get({plain: true});

			data.lessons = await app.model.Packages.lessons(data.id);
			data.learnedLessons = subscribe.extra.learnedLessons || [];
			data.teachedLessons = subscribe.extra.teachedLessons || [];
			data.isReward = subscribe.extra.isReward;
			//data.lessons = subscribe.lessons;

			packages.push(data);
		}

		return packages;
	}

	model.isSubscribePackage = async function(userId, packageId) {
		let data = await app.model.Subscribes.findOne({
			where: {
				userId,
				packageId,
				state: PACKAGE_SUBSCRIBE_STATE_BUY,
			}
		});
		if (data) return true;

		return false;
	}

	model.packageReward = async function(userId, packageId) {
		const data = await app.model.Subscribes.findOne({
			where: {
				userId,
				packageId,
				state: PACKAGE_SUBSCRIBE_STATE_BUY,
			}
		});
		if (!data) return;

		const _package = await app.model.Packages.getById(packageId);
		if (!_package) return;

		const user = await app.model.Users.getById(userId);
		if (!user) return;

		await app.model.Users.update({
			coin: user.coin + _package.reward,
		}, {
			where: {id: userId}
		});

		await app.model.Coins.create({
			userId,
			amount: _package.reward,
			type: COIN_TYPE_PACKAGE_REWARD,
		});

		return; 
	}

	model.subscribePackage = async function(userId, packageId) {
		const data = await app.model.Subscribes.findOne({
			where: {
				userId,
				packageId,
				state: PACKAGE_SUBSCRIBE_STATE_BUY,
			}
		});
		if (data) return {id:-1, message:"已订阅"};

		const user = await app.model.Users.getById(userId);
		const _package = await app.model.Packages.getById(packageId);

		if (!user || !_package) return {id:400, message:"args error"};
		if (user.coin < _package.coin) return {id:400, message:"知识币不足"};

		user.coin = user.coin - _package.coin;
		user.lockCoin = user.lockCoin + _package.rmb;
		await app.model.Users.update({coin:user.coin, lockCoin: user.lockCoin}, {where:{id:userId}});

		const result = await app.model.Subscribes.create({
			userId,
			packageId: _package.id,
			state: PACKAGE_SUBSCRIBE_STATE_BUY,
		});
		
		//await app.model.Coins.create({
			//userId,
			//amount: 0 - _package.cost,
			//type: COIN_TYPE_SUBSCRIBE_PACKAGE,
		//});

		return {id:0, data: result.get({plain:true})};
	}

	model.addTeachedLesson = async function(userId, packageId, lessonId) {
		let subscribe = await app.model.Subscribes.findOne({
			where: {
				userId,
				packageId,
			}
		});
		if (!subscribe) return;
		subscribe = subscribe.get({plain:true});
		const extra = subscribe.extra || {};
		extra.teachedLessons = extra.teachedLessons || [];
		const index = _.findIndex(extra.teachedLessons, val => val == lessonId);
		if (index == -1) {
			extra.teachedLessons.push(lessonId);
			await app.model.Subscribes.update({
				extra,
			}, {
				where: {
					id: subscribe.id,
				}
			});
		}
	
		return;
	}

	model.addLearnedLesson = async function(userId, packageId, lessonId) {
		let subscribe = await app.model.Subscribes.findOne({
			where: {
				userId,
				packageId,
			}
		});
		if (!subscribe) return console.log("未购买此课程包");

		subscribe = subscribe.get({plain:true});
		const extra = subscribe.extra || {};
		extra.learnedLessons = extra.learnedLessons || [];
		const index = _.findIndex(extra.learnedLessons, val => val == lessonId);
		if (index == -1) {
			extra.learnedLessons.push(lessonId);
			await app.model.Subscribes.update({
				extra,
			}, {
				where: {
					id: subscribe.id,
				}
			});
		}
	}

	return model;
}
