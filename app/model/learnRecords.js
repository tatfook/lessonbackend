
const consts = require("../core/consts.js");
const { 
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

		state: { // 0 -- 开始学习  1 -- 学习完成
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
	
	model.getById = async function(id, userId) {
		const where = {id};
		if (userId) where.userId = userId;
		const data = await app.model.LearnRecords.findOne({where});
		
		return data && data.get({plain:true});
	}

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

	model.updateLearnRecord = async function(params) {
		const where = {};
		if (!params.id) return;
		where.id = params.id;
		if (params.userId) where.userId = params.userId;
		if (params.classroomId) where.classroomId = params.classroomId;

		delete params.packageId;
		delete params.lessonId;

		let lr = await app.model.LearnRecords.findOne({where});
		if (!lr) return;
		lr = lr.get({plain:true});
	
		await app.model.LearnRecords.update(params, {where});

		if (params.state == LEARN_RECORD_STATE_FINISH) {
			await app.model.Subscribes.addLearnedLesson(lr.userId, lr.packageId, lr.lessonId);
		}

		return;
	}
	

	return model;
}


