
module.exports = app => {
	const users = app.model.users;
	const tutors = app.model.tutors;

	users.hasOne(tutors, {
		as: "student",
		foreignKey:"userId",
		constraints: false,
	});

	tutors.belongsTo(users, {
		as: "student",
		foreignKey:"userId",
		targetKey: "id",
		constraints: false,
	});

	users.hasOne(tutors, {
		as:"tutor",
		foreignKey:"tutorId",
		constraints: false,
	});

	tutors.belongsTo(users, {
		as:"tutor",
		foreignKey: "tutorId",
		targetKey: "id",
		constraints: false,
	});
}
