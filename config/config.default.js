
exports.keys = "lesson";

exports.self = {
	apiUrlPrefix: "/api/v0/",
	keepworkBaseURL: "",
	trustIps: [
		"127.0.0.1",
		"120.132.120.183",
	    "120.132.120.161",
	    "121.14.117.252",
	    "121.14.117.251",
	]
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
