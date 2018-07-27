
const { 
	CLASSROOM_STATE_UNUSED,
	CLASSROOM_STATE_USING,
	CLASSROOM_STATE_USED,
} = consts;

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

		userId: {
			type: BIGINT,
			allowNull: false,
		},

		lessonId: {
			type: BIGINT,
			allowNull: false,
		},

		state: { // 0 -- 未上课  1 -- 上可中  2 -- 上课结束 
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

	model.join = async function(classroomId, studentId) {
		let data = await app.model.Classrooms.findOne({where:{id:classroomId}});

		if (!data) return;

		data = data.get({plain:true});

		// 课程未开始或结束
		if (data.state != CLASSROOM_STATE_USING) return ;

		let learnRecord = await app.model.LearnRecords.findOne({
			where: {
				classroomId,
				userId: studentId,
			}
		});

		if (!learnRecord) {
			learnRecord = await app.model.LearnRecords.create({
				classroomId,
				lessonId: data.lessonId,
				userId: studentId,
			});
		}

		learnRecord = learnRecord.get({plain:true});

		return learnRecord;
	}

	return model;
}
