
const _ = require("lodash");
const consts = require("../core/consts.js");
const { 
	CLASSROOM_STATE_UNUSED,
	CLASSROOM_STATE_USING,
	CLASSROOM_STATE_USED,

	LEARN_RECORD_STATE_START,
	LEARN_RECORD_STATE_FINISH,
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

		key: {
			type: STRING(24),
			unique: true,
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

	model.createClassroom = async function(params) {
		let classroom = await app.model.Classrooms.create(params);
		if (!classroom) return ;
		classroom = classroom.get({plain:true});
		classroom.key = _.padStart(_.toString(classroom.id), 6, "0") + _.random(100, 999);
		await app.model.Classrooms.update(classroom, {where:{id:classroom.id}});
		
		const userId = classroom.userId;
		const user = await app.model.Users.getById(userId);
		const extra = user.extra || {};
		// 下课旧学堂
		if (extra.classroomId) await this.dismiss(userId, extra.classroomId);
		extra.classroomId = classroom.id;

		// 设置用户当前课堂id
		await app.model.Users.update({extra}, {where:{id:userId}});

		return classroom;
	}

	model.getById = async function(classroomId, userId) {
		const where = {id: classroomId};

		if (userId) where.userId = userId;
		let data = await app.model.Classrooms.findOne({where});

		if (data) data = data.get({plain:true});

		return data;
	}

	model.isClassing = async function(classroomId) {
		const classroom = await this.getById(classroomId);
		if (classroom && classroom.state == CLASSROOM_STATE_USING) return true;

		return false;
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

	model.quit = async function(studentId) {
		const user = await app.model.Users.getById(studentId);
		
		const classroomId = user.extra.classroomId;
		if (!classroomId) return;

		const classroom = await app.model.Classrooms.getById(classroomId);
		if (classroom.state != CLASSROOM_STATE_USING) return;

		app.model.LearnRecords.destroy({
			where: {
				classroomId,
				userId: studentId,
			}
		});

		user.extra.classroomId = undefined;
		await app.model.Users.update({extra:user.extra}, {where:{id:user.id}});

		return;
	}

	model.join = async function(studentId, key) {
		let data = await app.model.Classrooms.findOne({where:{key}});

		if (!data) return;

		data = data.get({plain:true});

		const classroomId = data.id;

		// 课程未开始或结束
		if (data.state != CLASSROOM_STATE_USING) return ;

		// 设置用户当前课堂id
		await app.model.Users.updateExtra(studentId, {classroomId});

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
				state: LEARN_RECORD_STATE_START,
			});
		}

		learnRecord = learnRecord.get({plain:true});

		await app.model.Subscribes.upsert({userId:studentId, packageId:data.packageId});

		return learnRecord;
	}

	model.dismiss = async function(userId, classroomId) {
		let data = await app.model.Classrooms.findOne({
			where: {
				id: classroomId,
				userId,
				state: CLASSROOM_STATE_USING,
			}
		});

		if (!data) return false;
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

		return true;
	}

	// 获取最后一次教课记录 
	model.getLastTeach = async function(userId, packageId) {
		const list = await app.model.Classrooms.findAll({	
			order: [["createdAt", "DESC"]],
			limit: 1,
			where: {userId, packageId},
		});

		if (list.length == 1) return list[0];

		return ;
	}

	return model;
}
