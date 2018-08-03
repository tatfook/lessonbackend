
module.exports = app => {
	const {router, config, controller} = app;
	const selfConfig = config.self;
	const prefix = selfConfig.apiUrlPrefix;

	console.log(selfConfig);

	router.resources("index", prefix + "index", controller.index);

	const users = controller.users;
	router.resources("users", prefix + "users", users);
	router.post(prefix + "users/:id/applyTeacher", users.applyTeacher);
	router.post(prefix + "users/:id/teacher", users.teacher);
	router.post(prefix + "users/:id/subscribes", users.postSubscribes);
	router.get(prefix + "users/:id/subscribes", users.getSubscribes);
	router.get(prefix + "users/:id/isSubscribe", users.isSubscribe);
	router.get(prefix + "users/:id/coins", users.coins);

	const packages = controller.packages;
	router.get(prefix + "packages/search", packages.search);
	router.resources("packages", prefix + "packages", packages);
	router.post(prefix + "packages/:id/lessons", packages.addLesson);
	router.delete(prefix + "packages/:id/lessons", packages.deleteLesson);
	router.get(prefix + "packages/:id/lessons", packages.lessons);
	router.post(prefix + "packages/:id/applyAudit", packages.applyAudit);
	router.get(prefix + "packages/:id/detail", packages.detail);
	router.post(prefix + "packages/:id/subscribe", packages.subscribe);
	router.get(prefix + "packages/:id/isSubscribe", packages.isSubscribe);

	const lessons = controller.lessons;
	router.resources("lessons", prefix + "lessons", lessons);
	router.post(prefix + "lessons/:id/skills", lessons.addSkill);
	router.delete(prefix + "lessons/:id/skills", lessons.deleteSkill);
	router.get(prefix + "lessons/:id/skills", lessons.getSkills);
	router.post(prefix + "lessons/:id/learnRecords", lessons.createLearnRecords);
	router.put(prefix + "lessons/:id/learnRecords", lessons.updateLearnRecords);
	router.get(prefix + "lessons/:id/learnRecords", lessons.getLearnRecords);
	router.post(prefix + "lessons/:id/release", lessons.release);
	router.get(prefix + "lessons/:id/content", lessons.content);
	router.get(prefix + "lessons/:id/content", lessons.detail);

	const subjects = controller.subjects;
	router.resources("subjects", prefix + "subjects", subjects);

	const skills = controller.skills;
	router.resources("skills", prefix + "skills", skills);

	const teacherCDKeys = controller.teacherCDKeys;
	router.get(prefix + "teacherCDKeys/generate", teacherCDKeys.generate);
	router.resources("teacherCDKeys", prefix + "teacherCDKeys", teacherCDKeys);

	const classrooms = controller.classrooms;
	router.get(prefix + "classrooms/current", classrooms.current);
	router.resources("classrooms", prefix + "classrooms", classrooms);
	router.post(prefix + "classrooms/:id/join", classrooms.join);
	router.get(prefix + "classrooms/:id/learnRecords", classrooms.getLearnRecords);
	router.put(prefix + "classrooms/:id/learnRecords", classrooms.updateLearnRecords);
	router.put(prefix + "classrooms/:id/dismiss", classrooms.dismiss);

	const admins = controller.admins;
	router.resources("admins", prefix + "admins/:resources", admins);
}
