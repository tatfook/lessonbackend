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

		await queryInterface.createTable('packageLessons', {
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

		await queryInterface.addIndex('packageLessons', {fields: ["packageId", "lessonId"]})
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('packageLessons');
	}
};
