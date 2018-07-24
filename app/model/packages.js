
module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		DATE,
		JSON,
	} = app.Sequelize;

	const packages = app.model.define("mod_lessons_packages", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		userId: {
			type: BIGINT,
			allowNull: false,
		},

		title: {
			type: STRING,
		},

		cover: {
			type: STRING(512),
		},

		skills: {
			type: STRING(512),
		},
		
		extra: {
			type: JSON,
		},
	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//packages.sync({force:true});

	return packages;
}
