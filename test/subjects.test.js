
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe('test/controller/subjects.test.js', () => {
	before(async () => {
		const subjects = app.model.Subjects;
		const result = await subjects.truncate();
	});

	it('POST /subjects', async ()=> {
		await app.httpRequest().post("/subjects").send({
			subjectName: "数学",
		}).expect(200);

		await app.httpRequest().post("/subjects").send({
			subjectName: "英语",
		}).expect(200);
	});

	it('GET /subjects', async () => {
		const list = await app.httpRequest().get("/subjects").expect(200).then(res => res.body);
		assert.equal(list.length, 2);
	});

	it('GET /subjects/1', async () => {
		const subject = await app.httpRequest().get("/subjects/1").expect(200).then(res => res.body);
		assert.ok(subject);
		assert.equal(subject.subjectName, "数学");
	});

	it("DELETE /subjects/1", async () => {
		const subject = await app.httpRequest().delete("/subjects/1").expect(200);
		const list = await app.httpRequest().get("/subjects").expect(200).then(res => res.body);
		assert.equal(list.length, 1);
	});
})
