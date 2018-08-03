
const consts = require("../core/consts.js");
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

		packageId: {   // 所属课程包ID
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
			defaultValue: {},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});

	model.getById = async function(classroomId, userId) {
		let data = await app.model.Classrooms.findOne({
			where: {
				userId,
				id: classroomId,
			}
		});

		if (data) data = data.get({plain:true});

		return data;
	}

	model.isTeached = async function(userId, packageId, lessonId) {
		const data = await app.model.Classrooms.findOne({
			where:{
				userId,
				packageId,
				lessonId
			}
		});

		if (data) return true;

		return false;
	}

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
				packageId: data.packageId,
				lessonId: data.lessonId,
				userId: studentId,
			});
		}

		learnRecord = learnRecord.get({plain:true});

		return learnRecord;
	}

	model.dismiss = async function(userId, classroomId) {
		let data = await app.model.Classrooms.getById(classroomId, userId);
		if (!data) app.throw(400, "args error");
		data = data.get({plain:true});
	
		// 更新课堂状态
		await app.model.Classrooms.update({
			state: CLASSROOM_STATE_USED,
		}, {
			where: {
				userId, 
				id: data.id,
			}
		}),

		// 更新订阅包信息
		await app.model.Subscribes.addTeachedLesson(userId, data.packageId, data.lessonId);

		const list = await app.LearnRecords.findAll({where:{classroomId}});
		for (let i = 0; i < list.length; i++) {
			let lr = list[i].get({plain:true});
			await app.model.Subscribes.addLearnedLesson(lr.userId, data.packageId, data.lessonId);
		}
		
		return;
	}
	return model;
}
