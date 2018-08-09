
exports.self = {
	debug: true,
	apiUrlPrefix: "/",
	keepworkBaseURL: "http://10.28.18.2:8900/api/wiki/models/",
}

exports.cluster = {
	listen: {
		port: 7000,
		hostname: "0.0.0.0",
	}
}

exports.sequelize = {
	dialect: "mysql",
	database: "lesson-test",
	host: '10.28.18.16',
	port: "32000",
	username: "root",
	password: "root",
}
