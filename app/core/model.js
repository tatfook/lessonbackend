const _ = require("lodash");

module.exports = app => {
	//app.model.afterCreate((instance, options) => {
		//console.log(instance,_modelOptions);
		//instance = instance.get({plain:true});
		//console.log(instance, options);
		//console.log("--------");
	//});
	
	async function getList(options) {
		const models = {"packages": "Packages"};
		const {model, where} = options;
	
		if (!models[model]) return [];

		const list = await app.model[models[model]].findAll({where});

		_.each(list, (o, i) => list[i] = o.get ? o.get({plain:true}) : o);

		return list;
	}

	app.model.afterBulkUpdate(async (options) => {
		const list = await getList(options);

		for (let i = 0; i < list.length; i++) {
			await app.api[model + "Upsert"](inst);
		}
	});

	app.model.beforeBulkDestroy(async (options) => {
		const list = await getList(options);
		for (let i = 0; i < list.length; i++) {
			await app.api[model + "Destroy"](inst);
		}
	});
}
