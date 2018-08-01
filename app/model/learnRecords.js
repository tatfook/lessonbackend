
module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		DATE,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("learnRecords", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		userId: {
			type: BIGINT,
			allowNull: false,
		},

		packageId: {
			type: BIGINT,
			allowNull: false,
		},

		lessonId: {
			type: BIGINT,
			allowNull: false,
		},

		classroomId: {
			type: BIGINT,
			defaultValue: 0,
		},

		state: { // 0 -- 课堂学习  1 -- 自学
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
	});

	//model.sync({force:true});
	
	model.isLearned = async function(userId, packageId, lessonId) {
		const data = await app.model.LearnRecords.findOne({
			where: {
				userId,
				packageId,
				lessonId,
			}
		});

		if (data) return true;

		return false;
	}
	

	return model;
}


