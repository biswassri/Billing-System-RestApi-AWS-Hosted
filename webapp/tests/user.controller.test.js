const userController = require('../app/controllers/user.controller')
const bcrypt = require("bcrypt");
const userService = require('../app/services/user.service')

describe('createUser controller', () => {

  const mockJson = jest.fn();
  const mockResponse = {
    status: jest.fn(() => ({
      json: mockJson,
      end: () => { }
    })),
  }

  it('should return a 400 if the email is not valid', async () => {
    const mockRequest = {
      body: {
        email_address: 'qwertgmail.com',
        password: 'Pass123@'
      }
    }
    await userController.createUser(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(400)
    expect(mockJson).toHaveBeenCalledWith({
      message: "Invalid Email"
    })
  })

  it('should return a 500 when userService.create throws and error ', async () => {
    const mockRequest = {
      body: {
        email_address: "qwert@gmail.com",
        password: 'Pass123@'
      }
    }

    bcrypt.genSaltSync = jest.fn().mockReturnValue('salt')
    bcrypt.hashSync = jest.fn().mockReturnValue('password')
    userService.create = jest.fn().mockRejectedValue(new Error('failure'));

    await userController.createUser(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(500)
    expect(mockJson).toHaveBeenCalledWith({
      message: 'failure'
    })
  })

  xit('should call the user service create method and return 200 when it resolves successfully', async () => {
    const mockRequest = {
      body: {
        email_address: "qwert@gmail.com",
        password: 'Pass123@'
      },
      db: 'dbMock'
    }

    jest.spyOn(userService, 'create')
    bcrypt.genSaltSync = jest.fn().mockReturnValue('salt')
    bcrypt.hashSync = jest.fn().mockReturnValue('password')
    userService.create = jest.fn().mockResolvedValue([[{
      first_name: 'first_name',
      last_name: 'last_name',
      email_address: 'email_address',
      account_created: 'account_created',
      accountUpdated: 'accountUpdated'
    }]]);

    await userController.createUser(mockRequest, mockResponse);
    expect(userService.create).toHaveBeenCalledWith(mockRequest.db, mockRequest.body);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  })

  it('should return a 400 if the password is not valid', async () => {
    const mockRequest = {
      body: {
        email_address: "qwert@gmail.com",
      },
      db: 'dbMock'
    }

    await userController.createUser(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(400)
    expect(mockJson).toHaveBeenCalledWith({
      message: "missing password"
    })
  
  })
})