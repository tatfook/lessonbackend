
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe('test/controller/skills.test.js', () => {
	before(async () => {
		const lessons = app.model.Lessons;
		const subjects = app.model.Subjects;
		const skills = app.model.Skills;
		await lessons.truncate();
		await subjects.truncate();
		await skills.truncate();
		await app.model.LessonSkills.truncate();
		await app.model.LearnRecords.truncate();
		await app.model.UserLearnRecords.truncate();
		await app.model.Packages.truncate();
		await app.model.Subscribes.truncate();
		await app.model.LessonRewards.truncate();
		await app.model.PackageLessons.truncate();
		await app.model.LessonContents.truncate();
		await app.model.Teachers.truncate();
		await app.model.TeacherCDKeys.truncate();
		await app.model.Classrooms.truncate();
		await app.model.Users.truncate();

		await app.httpRequest().get("/users").expect(200);

		await subjects.create({
			subjectName: "前端",
		});
		await subjects.create({
			subjectName: "后端",
		});
		await skills.create({
			skillName: "唱歌",
		});
		await skills.create({
			skillName: "跳舞",
		});
		
		let lesson = await app.httpRequest().post("/lessons").send({
			lessonName: "HTML",
			subjectId:1,
			skills: [{id:1, score:10}, {id:2, score:8}],
			goals: "掌握基本的前端编程",
			extra: {
				coverUrl: "http://www.baidu.com",
				vedioUrl: "http://www.baidu.com",
			}
		}).expect(200).then(res => res.body);
		assert.equal(lesson.id,1);

		const package_ = await app.httpRequest().post("/packages").send({
			packageName: "前端",
			lessons: [1],
			subjectId:1,
			minAge:1,
			maxAge:100,
			intro: "前端学习",
			rmb: 20,
			coin: 200,
			extra: {
				coverUrl: "http://www.baidu.com",
			},
		}).expect(200).then(res => res.body);

	});

	it("POST|GET|PUT /classrooms", async ()=> {
		let data = await app.httpRequest().get("/teacherCDKeys/generate?count=20").expect(200).then(res => res.body);
		assert(data.length, 20);
		const key = data[0].key;
		await app.httpRequest().post("/users/1/teacher").send({key}).expect(200);

		// 创建课堂
		let classroom = await app.httpRequest().post("/classrooms").send({packageId:1, lessonId:1}).expect(200).then(res => res.body);
		assert.equal(classroom.id,1);

		// 获取课堂
		classroom = await app.httpRequest().get("/classrooms/1").expect(200).then(res => res.body);
		assert.equal(classroom.id,1);
		assert.equal(classroom.state, 1);

		// 当前课堂
		classroom = await app.httpRequest().get("/classrooms/current").expect(200).then(res => res.body);
		assert.equal(classroom.id,1);

		// 关闭课堂
		await app.httpRequest().put("/classrooms/1/dismiss").expect(200);
		classroom = await app.httpRequest().get("/classrooms/1").expect(200).then(res => res.body);
		assert.equal(classroom.state, 2);
	});

	it ("POST|PUT|GET /classrooms/1/learnRecords", async ()=>{
		const url = "/classrooms/1/learnRecords";
		let lr = await app.httpRequest().post(url).send({userId:1}).expect(200).then(res => res.body);
		assert.equal(lr.id, 1);

		await app.httpRequest().put(url).send({id:1, userId:1, extra:{key:1}}).expect(200);

		const list = await app.httpRequest().get(url).expect(200).then(res => res.body);
		assert.equal(list[0].extra.key, 1);
	});
});













