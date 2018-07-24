
exports.keys = "lesson";
exports.apiUrlPrefix = "/api/v0/";
exports.keepworkBaseURL = "";

exports.sequelize = {
	dialect: "mysql",
	database: "keepwork-dev",
	host: '10.28.18.16',
	port: "32000",
	username: "root",
	password: "root",
}

exports.cors = {
	origin: "*",
}

//exports.middleware = ['authenticated'];

exports.security = {
	xframe: {
		enable: false,
	},
	csrf: {
		enable: false,
	},
}
