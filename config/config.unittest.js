
exports.self = {
	debug: true,
	apiUrlPrefix: "/api/v0/",
	keepworkBaseURL: "http://10.28.18.2:8900/api/wiki/models/",
}

exports.cluster = {
	listen: {
		port: 7001,
		hostname: "0.0.0.0",
	}
}
