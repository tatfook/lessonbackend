
module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		DATE,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("packageSorts", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		packageId: {
			type: BIGINT,
			unique: true,
			allowNull: false,
		},

		hotNo: {              // 热门课程包
			type: INTEGER,
			defaultValue: 0,  // 0 -- 不存在此分类
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});
	
	model.getHots = async function() {
		const sql = `select packages.* 
			from packageSorts, packages 
			where packageSorts.packageId = packages.id 
			order by packageSorts.hotNo desc`;

		const list = app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
		});

		return list;
	}

	return model;
}
