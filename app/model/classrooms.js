
module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		DATE,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("classrooms", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		lessonId: {
			type: BIGINT,
			allowNull: false,
		},

		teacherId: {
			type: BIGINT,
			allowNull: false,
		},
		
		state: {
			type: INTEGER,
			defaultValue: 0,
		},

		extra: {
			type: JSON,
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});

	return model;
}
