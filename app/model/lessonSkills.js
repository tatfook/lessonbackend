
module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		TEXT,
		DATE,
		JSON,
	} = app.Sequelize;
	
	const model = app.model.define("lessonSkills", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		userId: {
			type: BIGINT,
			allowNull: false,
		},

		lessonId: {
			type: BIGINT,
			allowNull: false,
		},

		skillId: {
			type: BIGINT,
		},

		score: {
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
			fields: ["lessonId", "skillId"],
		},
		],
	});

	//model.sync({force:true});

	return model;
}
