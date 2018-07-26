
module.exports = app => {
	const {router, config, controller} = app;
	const prefix = config.apiUrlPrefix;

	router.resources("index", config.apiUrlPrefix + "index", controller.index);

	const users = controller.users;
	router.resources("users", prefix + "users", users);

	const packages = controller.packages;
	router.resources("packages", prefix + "packages", packages);
	router.post(prefix + "packages/:id/lessons", packages.addLesson);
	router.delete(prefix + "packages/:id/lessons", packages.deleteLesson);
	router.get(prefix + "packages/:id/lessons", packages.lessons);
	router.post(prefix + "packages/:id/applyAudit", packages.applyAudit);

	const lessons = controller.lessons;
	router.resources("lessons", prefix + "lessons", lessons);
	router.post(prefix + "packages/:id/skills", lessons.addSkill);
	router.delete(prefix + "packages/:id/skills", lessons.deleteSkill);

	const subjects = controller.subjects;
	router.resources("subjects", prefix + "subjects", subjects);

	const skills = controller.skills;
	router.resources("skills", prefix + "skills", skills);
}
