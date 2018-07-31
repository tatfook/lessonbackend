
exports.keys = "lesson";

exports.self = {
	apiUrlPrefix: "/api/v0/",
	keepworkBaseURL: "",
}

exports.sequelize = {
	dialect: "mysql",
	database: "lesson-dev",
	host: '10.28.18.16',
	port: "32000",
	username: "root",
	password: "root",
}

exports.cors = {
	origin: "*",
}

exports.middleware = ['authenticated'];

exports.security = {
	xframe: {
		enable: false,
	},
	csrf: {
		enable: false,
	},
}
