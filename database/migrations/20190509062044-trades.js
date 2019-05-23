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

		return queryInterface.createTable("trades", {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {          // 用户id
        type: BIGINT,
        allowNull: false,
      },

      type: {            // 交易类型 0 -- 知识豆  1 -- 知识币
        type: INTEGER,
        defaultValue: 0,
      },

      amount: {          // 金额
        type: INTEGER,
        defaultValue: 0,
      },

      description: {
        type:STRING,
        defaultValue: "",
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
    return queryInterface.dropTable('trades');
  }
};
