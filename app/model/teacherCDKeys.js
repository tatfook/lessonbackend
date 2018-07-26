
module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		DATE,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("teacherCDKeys", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		teacherId: {
			type: BIGINT,
		},

		key: {
			type: STRING(64),
			allowNull: false,
		},

		state: {
			type: INTEGER,
			defaultValue: 0, // 0 --未使用 1 -- 已使用
		},
		
		extra: {
			type: JSON,
			defaultValue:{},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});

	return model;
}
