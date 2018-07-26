
module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		TEXT,
		DATE,
		JSON,
	} = app.Sequelize;
	
	const model = app.model.define("lessonContents", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		lessonId: {
			type: BIGINT,
			allowNull: false,
		},

		version: {
			type: INTEGER,
			allowNull: false,
			defaultValue: 0,
		},

		content: {
			type: TEXT,
			defaultValue:"",
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

	model.release = async function(lessonId, content) {
		const count = await app.model.LessonContents.count({
			where: {
				lessonId,
			}
		});

		count = count + 1;

		const data = await app.model.LessonContents.create({
			version: count,
			lessonId,
			content,
		});

		return data;
	}

	model.content = async function(lessonId, version) {
		const where = {lessonId};
		if (version) where.version = version;

		const list = await app.model.LessonContents.findAll({
			where,
			limit: 1,
			order: [["version", "DESC"]],
		});

		if (list.length > 0) return list[0].get({plain:true}).content;

		return "";
	}

	//model.sync({force:true});

	return model;
}
