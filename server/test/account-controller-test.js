var AccountController = require('../controllers/account.js'),
    mongoose = require('mongoose'),
    should = require('should'),
    uuid = require('node-uuid'),
    crypto = require('crypto'),
    User = require('../models/user.js'),
    UserMock = require('./user-mock.js'),
    MailerMock = require('./mailer-mock.js'),
    ApiMessages = require('../models/api-messages.js');
	
describe('AccountController', function () {
var controller,
    seedUsersCount = 10,
    testUser,
    userModelMock,
    session = {},
    mailMock;
	
	beforeEach(function (done) {
    userModelMock = new UserMock();
    mailerMock = new MailerMock();
    controller = new AccountController(userModelMock, session, mailerMock);
    done();
	});

	afterEach(function (done) {
		userModelMock.setError(false);
		done();
	});
	
	describe('#logon', function () {

        it('Returns db error', function (done) {

            userModelMock.setError(true);
            userModelMock.seedUsers();
            var testUser = userModelMock.getTestUser(),
                testUserPassword = 'Password0';

            controller.logon(testUser.email, testUserPassword, function (err, apiResponse) {

                should(apiResponse.success).equal(false);
                should(apiResponse.extras.msg).equal(ApiMessages.DB_ERROR);
                done();
            });
        });
		
		it('Creates user session', function (done) {

			userModelMock.seedUsers();
			var testUser = userModelMock.getTestUser(),
				testUserPassword = 'Password0';            

			controller.logon(testUser.email, testUserPassword, function (err, apiResponse) {
						
				if (err) return done(err);
				should(apiResponse.success).equal(true);
				should.exist(apiResponse.extras.userProfileModel);
				should.exist(controller.getSession().userProfileModel);
				should(apiResponse.extras.userProfileModel)
		.equal(controller.getSession().userProfileModel);
				done();
			});
		});
		
		it('Email not found', function(done){
			
			userModelMock.seedUsers();
			var testUser = userModelMock.getTestUser(),
				testUserPassword = 'Password0',
				nonExistentEmailAddress = 'test';
			
			controller.logon(nonExistentEmailAddress, testUserPassword, function (err, apiResponse) {
			
				if(err) return done(err);
				should(apiResponse.success).equal(false);
				should(apiResponse.extras.msg).equal(ApiMessages.EMAIL_NOT_FOUND);
				done();
			});
		});
		
		it('Returns "Invalid password"', function(done){ 
			
			userModelMock.seedUsers();
			var testUser = userModelMock.getTestUser(),
				testUserPassword = 'Password';
				
			controller.logon(testUser.email, testUserPassword, function(err,apiResponse) {
				
				if(err) return done(err);
				should(apiResponse.success).equal(false);
				should(apiResponse.extras.msg).equal(ApiMessages.INVALID_PWD);
				done();
			
			});
		});
		
		it('Logon Succesful', function(done){ 
			
			userModelMock.seedUsers();
			var testUser = userModelMock.getTestUser(),
				testUserPassword = 'Password0';
				
			controller.logon(testUser.email, testUserPassword, function(err,apiResponse) {
				
				if(err) return done(err);
				/*should(apiResponse.success).equal(true);*/
				should.exist(controller.getSession().userProfileModel);
				done();
			
			});
		});
	});
	
	describe('#logoff', function () {

        it('Destroys user session', function (done) {
			controller.logoff();
			should.not.exist(controller.getSession().userProfileModel);
			done();
		});
	});
	
	describe('#register', function () {
	
		it('Returns db error', function(done) {
			
			userModelMock.setError(true);
			userModelMock.seedUsers();
			var testUser = userModelMock.getTestUser();
			controller.register(testUser, function (err, apiResponse) {

				should(apiResponse.success).equal(false);
				should(apiResponse.extras.msg).equal(ApiMessages.DB_ERROR);
				done();
			});
			
		});
		
		it('Returns "Email already exists"', function (done) {
                        
			userModelMock.seedUsers();
			var testUser = userModelMock.getTestUser();
			controller.register(testUser, function (err, apiResponse) {

				should(apiResponse.success).equal(false);
				should(apiResponse.extras.msg).equal(ApiMessages.EMAIL_ALREADY_EXISTS);
				done();
			});
		});
	});
});