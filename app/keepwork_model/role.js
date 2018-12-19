
const _ = require("lodash");

const {
	USER_ROLE_ALLIANCE_MEMBER,
	USER_ROLE_TUTOR,
} = require("../core/consts.js");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.keepworkModel.define("roles", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                   // 用户Id
			type: BIGINT,
			allowNull: false,
		},

		roleId: {                   // 角色id 用于区分不同角色
			type: INTEGER,
			defaultValue: 0,
		},

		startTime: {                   // 开始时间
			type: BIGINT,
			defaultValue: 0,
		},

		endTime: {                     // 结束时间
			type: BIGINT,
			defaultValue: 0,
		},

	}, {
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',

		indexes: [
		{
			unique: true,
			fields: ["userId", "roleId"],
		},
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});

	model.getByUserId = async function(userId) {
		return await app.keepworkModel.roles.findAll({where:{userId}}).then(list => _.map(list, o => o && o.toJSON()));
	}

	model.getAllianceMemberByUserId = async function(userId) {
		return await app.keepworkModel.roles.findOne({where:{
			userId,
			type: USER_ROLE_ALLIANCE_MEMBER,
		}}).then(o => o && o.toJSON());
	}

	model.getTutorByUserId = async function(userId) {
		return await app.keepworkModel.roles.findOne({where:{
			userId,
			type: USER_ROLE_TUTOR,
		}}).then(o => o && o.toJSON());
	}

	app.keepworkModel.roles = model;

	return model;
};





