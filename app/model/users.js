
module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		DATE,
		JSON,
	} = app.Sequelize;

	const users = app.model.define("mod_lessons_users", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		username: {
			type: STRING(64),
		},

		nickname: {
			type: STRING(64),
		},
		
		coin: {
			type: INTEGER,
		},

		identify: {
			type: INTEGER,  // 0 = 默认 1 - 学生  2 - 教师
		},

		extra: {
			type: JSON,
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//users.sync({force:true});

	return users;
}
