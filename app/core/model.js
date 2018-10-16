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
		const tableName = model.getTableName();
		const modelName = models[tableName];

		if (!modelName) return [];

		const list = await app.model[modelName].findAll({where});

		_.each(list, (o, i) => list[i] = o.get ? o.get({plain:true}) : o);

		return list;
	}

	app.model.afterCreate(async (inst) => {
		const cls = inst.constructor;
		const tableName = cls.getTableName();
		
		inst = inst.get({plain:true});
		await app.api[tableName + "Upsert"](inst);
	});

	app.model.afterBulkUpdate(async (options) => {
		const {model} = options;
		const tableName = model.getTableName();
		const list = await getList(options);

		for (let i = 0; i < list.length; i++) {
			await app.api[tableName + "Upsert"](list[i]);
		}
	});

	app.model.beforeBulkDestroy(async (options) => {
		const {model} = options;
		const tableName = model.getTableName();
		const list = await getList(options);
		for (let i = 0; i < list.length; i++) {
			await app.api[tableName + "Destroy"](list[i]);
		}
	});

}
