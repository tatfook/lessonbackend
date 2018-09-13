
const email = require("./app/core/email.js");

module.exports = async (app) => {
	email(app);

	//console.log("--------构建表-------");
	//app.model.Classrooms.sync({force:true});
	//app.model.Coins.sync({force:true});
	//app.model.LearnRecords.sync({force:true});
	//app.model.LessonContents.sync({force:true});
	//app.model.LessonRewards.sync({force:true});
	//app.model.Lessons.sync({force:true});
	//app.model.LessonSkills.sync({force:true});
	//app.model.Logs.sync({force:true});
	//app.model.PackageLessons.sync({force:true});
	//app.model.Packages.sync({force:true});
	//app.model.PackageSorts.sync({force:true});
	//app.model.Skills.sync({force:true});
	//app.model.Subjects.sync({force:true});
	//app.model.Subscribes.sync({force:true});
	//app.model.TeacherCDKeys.sync({force:true});
	//app.model.Teachers.sync({force:true});
	//app.model.UserLearnRecords.sync({force:true});
	//app.model.Users.sync({force:true});
}
