
const consts = require("../core/consts.js");
const {
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
	
	model.getByUserId = async function(userId) {
		const list = await app.model.Subscribes.findAll({where:{userId}});
		const packages = [];

		for (let i = 0; i < list.length; i++) {
			let data = await app.model.Packages.findOne({where:{id:list[i].packageId}});
			if (!data)continue;
			packages.push(data.get({plain:true}));
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
		if (user.coin <= _package.cost) return {id:400, message:"知识币不足"};

		user.coin = user.coin - _package.cost;
		await app.model.Users.update({coin:user.coin}, {where:{id:userId}});
		const result = await app.model.Subscribes.create({
			userId,
			packageId: _package.id,
			state: PACKAGE_SUBSCRIBE_STATE_BUY,
		});
		
		return {id:0, data: result.get({plain:true})};
	}

	return model;
}
