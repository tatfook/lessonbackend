
module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		DATE,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("skills", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		skillName: {
			type: STRING(64),
			allowNull: false,
		},

		extra: {
			type: JSON,
			defaultValue: {},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});

	return model;
}
