
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe('test/controller/skills.test.js', () => {
	before(async () => {
		const skills = app.model.Skills;
		const result = await skills.truncate();
	});

	it('POST /skills', async ()=> {
		let data = await app.httpRequest().post("/skills").send({
			skillName: "唱歌",
		}).expect(200).then(res => res.body);
		assert(data.skillName, "唱歌");

		data = await app.httpRequest().post("/skills").send({
			skillName: "跳舞",
		}).expect(200).then(res => res.body);
		assert(data.skillName, "跳舞");

	});

	it('GET /skills', async () => {
		const list = await app.httpRequest().get("/skills").expect(200).then(res => res.body);
		assert.equal(list.length, 2);
	});

	//it('GET /skills/1', async () => {
		//const skill = await app.httpRequest().get("/skills/1").expect(200).then(res => res.body);
		//assert.ok(skill);
		//assert.equal(skill.skillName, "唱歌");
	//});

	it("DELETE /skills/1", async () => {
		const skill = await app.httpRequest().delete("/skills/1").expect(200);
		const list = await app.httpRequest().get("/skills").expect(200).then(res => res.body);
		assert.equal(list.length, 1);
	});
})
