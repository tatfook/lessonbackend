
module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		DATE,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("tutors", {
		id: {                          // 记录id
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		userId: {                      // 用户id
			type: BIGINT,
			allowNull: false,
		},

		tutorId: {                     // 导师id
			type: BIGINT,
			allowNull: false,
		},

		startTime: {                   // 开始时间
			type: BIGINT,
			defaultValue: 0,
		},

		endTime: {                     // 结束时间
			type: BIGINT,
			defaultValue: 0,
		},

		extra: {                       // 额外数据
			type: JSON,
			defaultValue: {},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});
	
	app.model.tutors = model;
	return model;
}
