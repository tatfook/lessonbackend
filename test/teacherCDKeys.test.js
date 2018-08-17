
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe('test/controller/teacherCDKeys.test.js', () => {
	before(async () => {
		const teacherCDKeys = app.model.TeacherCDKeys;
		const result = await teacherCDKeys.truncate();
	});

	it('POST /teacherCDKeys/generate', async ()=> {
		let data = await app.httpRequest().get("/teacherCDKeys/generate?count=20").expect(200).then(res => res.body);
		assert(data.length, 20);
	});

	it('GET /teacherCDKeys', async () => {
		const data = await app.httpRequest().get("/teacherCDKeys").expect(200).then(res => res.body);
		assert.equal(data.count, 20);
	});
})
