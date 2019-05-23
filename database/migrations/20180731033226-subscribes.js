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

		await queryInterface.createTable('subscribes', {
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

			state: {  // 0 - 未购买 1 - 已购买
				type: INTEGER,
				defaultValue: 0
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
		await queryInterface.addIndex('subscribes', {fields: ["userId", "packageId"], unique: true});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('subscribes');
	}
};
