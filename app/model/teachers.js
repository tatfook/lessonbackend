
const consts = require("../core/consts.js");
const { 
	TEACHER_PRIVILEGE_TEACH,
} = consts;

module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		DATE,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("teachers", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		userId: {
			type: BIGINT,
			allowNull: false,
		},

		key: {
			type: STRING(64),
			allowNull: false,
		},

		privilege: {
			type: INTEGER,
			defaultValue: 0,
		},

		school: {
			type: STRING(128),
		},

		extra: {     // 额外数据
			type: JSON,
			defaultValue:{},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});
	
	model.isAllowTeach = async function(userId) {
		let user = await app.model.Teachers.findOne({where: {userId}});
		if (!user) return false;

		user = user.get({plain:true});

		const privilege = user.privilege;

		return privilege & TEACHER_PRIVILEGE_TEACH;
	}
	
	return model;
}
