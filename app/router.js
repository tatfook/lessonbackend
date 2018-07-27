
module.exports = app => {
	const {router, config, controller} = app;
	const prefix = config.apiUrlPrefix;

	router.resources("index", config.apiUrlPrefix + "index", controller.index);

	const users = controller.users;
	router.resources("users", prefix + "users", users);
	router.post(prefix + "users/:id/teacher", users.teacher);
	router.get(prefix + "users/:id/packages", users.packages);

	const packages = controller.packages;
	router.resources("packages", prefix + "packages", packages);
	router.post(prefix + "packages/:id/lessons", packages.addLesson);
	router.delete(prefix + "packages/:id/lessons", packages.deleteLesson);
	router.get(prefix + "packages/:id/lessons", packages.lessons);
	router.post(prefix + "packages/:id/applyAudit", packages.applyAudit);
	router.post(prefix + "packages/:id/subscribe", packages.subscribe);

	const lessons = controller.lessons;
	router.resources("lessons", prefix + "lessons", lessons);
	router.post(prefix + "packages/:id/skills", lessons.addSkill);
	router.delete(prefix + "packages/:id/skills", lessons.deleteSkill);
	router.post(prefix + "packages/:id/learn", lessons.learn);
	router.post(prefix + "packages/:id/learnRecords", lessons.learnRecords);

	const subjects = controller.subjects;
	router.resources("subjects", prefix + "subjects", subjects);

	const skills = controller.skills;
	router.resources("skills", prefix + "skills", skills);

	const teacherCDKeys = controller.teacherCDKeys;
	router.get(prefix + "teacherCDKeys/generate", teacherCDKeys.generate);
	router.resources("teacherCDKeys", prefix + "teacherCDKeys", teacherCDKeys);

	const classrooms = controller.classrooms;
	router.resources("classrooms", prefix + "classrooms", classrooms);
	router.post(prefix + "classrooms/:id/join", classrooms.join);
	router.post(prefix + "classrooms/:id/report", classrooms.report);
}
