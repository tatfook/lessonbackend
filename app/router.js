
module.exports = app => {
	const {router, config, controller} = app;

	router.resources("index", config.apiUrlPrefix + "index", controller.index);
}
