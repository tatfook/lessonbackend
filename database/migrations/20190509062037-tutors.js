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

		return queryInterface.createTable("tutors", {
      id: {                          // 记录id
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {                      // 用户id
        type: BIGINT,
        allowNull: false,
        unique: true,
      },

      tutorId: {                     // 导师id
        type: BIGINT,
      },

      startTime: {                   // 开始时间
        type: BIGINT,
        defaultValue: 0,
      },

      endTime: {                     // 结束时间
        type: BIGINT,
        defaultValue: 0,
      },

      extra: {                       // 额外数据
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
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('tutors');
  }
};
