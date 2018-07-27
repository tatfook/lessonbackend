
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

	return model;
}
