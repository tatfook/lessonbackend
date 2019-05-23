'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		const {
			BIGINT,
			STRING,
			INTEGER,
			TEXT,
			DATE,
			JSON,
		} = Sequelize;

		return queryInterface.createTable('teachers', {
			id: {
				type: BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},

			userId: {
				type: BIGINT,
				allowNull: false,
				unique: true,
			},

			key: {
				type: STRING(64),
				allowNull: false,
			},

			privilege: {
				type: INTEGER,
				defaultValue: 0,
			},

			school: {                      // 学校信息
				type: STRING(128),
				defaultValue:"",
			},

			startTime: {                   // 有效期开始时间
				type: BIGINT,
				defaultValue:0,
			},

			endTime: {                     // 有效期结束时间
				type: BIGINT,
				defaultValue:0,
			},

			extra: {     // 额外数据
				type: JSON,
				defaultValue:{},
			},

			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},

			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			},

			}, {
				underscored: false,
				charset: "utf8mb4",
				collate: 'utf8mb4_bin',
			});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('teachers');
	}
};
