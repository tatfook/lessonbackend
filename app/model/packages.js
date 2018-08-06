
module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		DATE,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("packages", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		userId: {
			type: BIGINT,
			allowNull: false,
		},

		packageName: {
			type: STRING,
			allowNull: false,
			unique: true,
		},

		subjectId: {
			type: BIGINT,
		},

		minAge: {
			type: INTEGER,
			defaultValue: 0,
		},

		maxAge: {
			type: INTEGER,
			defaultValue: 1000,
		},

		state: { //  0 - 初始状态  1 - 审核中  2 - 审核成功  3 - 审核失败  4 - 异常态(审核成功后被改坏可不用此状态 用0代替)
			type: INTEGER,
			defaultValue: 0,
		},

		intro: {
			type: STRING(512),
		},

		cost: {
			type: INTEGER,
			defaultValue: 0,
		},

		extra: {
			type: JSON,
			defaultValue: {
				coverUrl: "",
			}
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

		const data = await app.model.Packages.findOne({where});

		return data && data.get({plain: true});
	}

	model.addLesson = async function(userId, packageId, lessonId) {
		let data = await app.model.Packages.findOne({where: {userId, id: packageId}});
		if (!data) return false;

		data = await app.model.Lessons.findOne({where: {id:lessonId}});

		if (!data) return false;

		data = await app.model.PackageLessons.create({
			userId,
			packageId,
			lessonId,
		});

		if (data) return true;
		
		return false;
	}

	model.deleteLesson = async function(userId, packageId, lessonId) {
		//let data = await app.model.Packages.findOne({where: {userId, id: packageId}});
		//if (!data) return false;

		return await app.model.PackageLessons.destroy({
			where: {
				userId,
				packageId,
				lessonId,
			}
		});
	}

	model.lessons = async function(packageId) {
		const list = await app.model.PackageLessons.findAll({where:{packageId}});
		const lessons = [];

		for (let i = 0; i < list.length; i++) {
			const lesson = await app.model.Lessons.getById(list[i].lessonId);
			if (!lesson) continue;
			lessons.push(lesson);
		}

		return lessons;
	}

	return model;
}
