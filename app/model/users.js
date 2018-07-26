
module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		DATE,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("users", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		username: {  // keepwork username
			type: STRING(64),
			unique: true,
			allowNull: false,
		},

		nickname: {  // lesson昵称或真是姓名
			type: STRING(64),
		},
		
		coin: {      // 知识币
			type: INTEGER,
			defaultValue: 0,
		},

		identify: {  // 身份
			type: INTEGER,  // 0 = 默认 1 - 学生  2 - 教师
			defaultValue: 0,
		},

		extra: {     // 额外数据
			type: JSON,
			defaultValue:{},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});
	
	model.getById = async function(userId, username) {
		let data = await app.model.Users.findOne({where: {id:userId}});

		if (!data) {
			data = await app.model.Users.create({
				id: userId,
				username,
			});
		};

		data = data.get({plain:true});

		return data;
	}

	return model;
}
