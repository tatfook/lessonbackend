'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const {
			BIGINT,
			STRING,
			INTEGER,
			TEXT,
			DATE,
			JSON,
		} = Sequelize;

		await queryInterface.createTable('classrooms', {
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

			classId: {
				type: BIGINT,
				defaultValue: 0,
			},

			organizationId: {
				type: BIGINT,
				defaultValue: 0,
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
		// add missing index

		await queryInterface.addIndex('classrooms', {fields: ['userId']});
		await queryInterface.addIndex('classrooms', {fields: ['packageId', 'lessonId']});
		await queryInterface.addIndex('classrooms', {fields: ['classId']});
		await queryInterface.addIndex('classrooms', {fields: ['organizationId']});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('classrooms');
	}
};
