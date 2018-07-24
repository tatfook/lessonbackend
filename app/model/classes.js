
module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		DATE,
		JSON,
	} = app.Sequelize;

	const classes = app.model.define("mod_lessons_classes", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		lessonId: {
			type: BIGINT,
		},

		teacherId: {
			type: BIGINT,
		},
		
		extra: {
			type: JSON,
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//classes.sync({force:true});

	return classes;
}
