
const { app, mock, assert  } = require('egg-mock/bootstrap');

const url = (path) => {
	const selfConfig = app.config.self;
	return selfConfig.apiUrlPrefix + path;
}

describe('test/controller/subjects.test.js', () => {
	describe("GET index", () => {
		it('should status 200', async ()=> {
			await app.httpRequest().get(url("subjects")).expect(200);
		});
	})
})
