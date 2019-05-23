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

		await queryInterface.createTable('lessons', {
			id: {
				type: BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},

			userId: {
				type: BIGINT,
				allowNull: false,
			},

			lessonName: {
				type: STRING,
				allowNull: false,
			},

			subjectId: {
				type: BIGINT,
			},

			url: {
				type: STRING,
				unique: true,
				//allowNull: false,
			},

			goals: {
				type: TEXT,
			},

			extra: {
				type: JSON,
				defaultValue: {
					coverUrl: "",
					vedioUrl: "",
				},
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

		await queryInterface.addIndex('lessons', {fields: ['userId']});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('lessons');
	}
};
