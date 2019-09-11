

const { app, mock, assert  } = require('egg-mock/bootstrap');

describe('lesson content test', () => {
	before(async () => {
		await app.model.LessonContents.sync({force:true});
	});

	it("001", async () => {
		await app.model.LessonContents.release(1, 100, "content", "courseware");
		
		await app.model.LessonContents.release(1, 100, "new content", "");

		await app.model.LessonContents.release(1, 100, "", "new courseware");
	});
});













