const promise = require('bluebird');
const Joi = require('joi');
class Validator {
  async sendOtpValidation(body) {
    try {
      const joiSchema = Joi.object({
        mobilenumber: Joi.string().length(10).required().messages({
          'string.length': `mobilenumber must be 10 digit `,
        })
      });
      return await joiSchema.validateAsync(body);
    } catch (err) {
      //let error = { message: e.details ? e.details[0].message : e.message, code: 400 };
      let error = { message: err.message, code: 400 };
      return promise.reject(error);
    }
  }
  async loginValidation(body) {
    try {
      const joiSchema = Joi.object({
        mobilenumber: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({
          'string.length': `mobilenumber must 10 digit`,
          'string.pattern': `mobilenumber must be digit`
        }),
        otp: Joi.required()
      });
      return await joiSchema.validateAsync(body);
    } catch (err) {
      //let error = { message: e.details ? e.details[0].message : e.message, code: 400 };
      let error = { message: err.message, code: 400 };
      return promise.reject(error);
    }
  }
  async updateValidation(body) {
    try {
      const joiSchema = Joi.object({
        email: Joi.string().min(7).email().required(),
        firstname: Joi.string().required(),
        lastname: Joi.string().required()
          .messages({
            'string.email': `please enter correct email`,
          })
      })
      return await joiSchema.validateAsync(body);
    } catch (err) {
      let error = { message: err.message, code: 400 };
      return promise.reject(error);
    }

  }
  async resendotpValidation(body) {
    try {
      const joiSchema = Joi.object({
        mobilenumber: Joi.string().required()
      }).messages({
        'string.mobilenumber': 'mobilenumber must be required',
      })
      return await joiSchema.validateAsync(body);
    } catch (err) {
      let error = { message: err.message, code: 400 };
      return promise.reject(error);
    }
  }

  async productValidation(body) {
    try {
      const JoiSchema = Joi.object({
        subcategory_id: Joi.string().required()
      }).messages({
        'string.subcategory_id': "subcategory_id must be required"
      })
      return await JoiSchema.validateAsync(body);
    } catch (err) {
      let error = { message: err.message, code: 400 };
      return promise.reject(error);
    }
  }

  async searchValidation(body) {
    try {
      const JoiSchema = Joi.object({
        search: Joi.required(),
        // filter: Joi.required()
      }).messages({
        'string.search': "search must be required",
      })
      return await JoiSchema.validateAsync(body);
    } catch (err) {
      let error = { message: err.message, code: 400 };
      return promise.reject(error);
    }
  }

  async wishlistValidation(body) {
    try {
      const JoiSchema = Joi.object({
        product_id: Joi.required()
      })
      return await JoiSchema.validateAsync(body);
    } catch (err) {
      let error = { message: err.message, code: 400 };
      return promise.reject(error);
    }
  }
  async brandsearchValidation(body) {
    try {
      const JoiSchema = Joi.object({
        search: Joi.required()
      }).messages({
        'string.search': "search must be required"
      })
      return await JoiSchema.validateAsync(body);
    } catch (err) {
      let error = { message: err.message, code: 400 };
      return promise.reject(error);
    }
  }
  async addtocartValidation(body) {
    try {
      const JoiSchema = Joi.object({
        product_id: Joi.string().required(),
        quantity:Joi.string().required()
      }).messages({
        'string.product_id': "id must be required"
      })
      return await JoiSchema.validateAsync(body);
    } catch (err) {
      let error = { message: err.message, code: 400 };
      return promise.reject(error);
    }
  }

  async cartlistValidation(body){
    try{
      const JoiSchema = Joi.object({
        product_id: Joi.string().required(),
        quantity:Joi.string().required(),
        coupan_id:Joi.string().required()
      }).messages({
        'string.product_id': "id must be required",
        'string.quantity':"quantity must be required",
        'string.coupan_id':"coupan id must be required"
      })
      return await JoiSchema.validateAsync(body);
    }catch (err){
      let error = {message:err.message,code:400}
      return promise.reject(error)
    }
  }
  async deleteValidation(body) {
    try {
      const JoiSchema = Joi.object({
        product_id: Joi.string().required()
      }).messages({
        'string.product_id': "id must be required"
      })
      return await JoiSchema.validateAsync(body);
    } catch (err) {
      let error = { message: err.message, code: 400 };
      return promise.reject(error);
    }
  }

  async addressvalidation(body) {
    try {
      const JoiSchema = Joi.object({
        type: Joi.string().required(),
        home_details: Joi.string().required(),
        landmark: Joi.string().required(),
        recipient_name: Joi.string().required()
      }).messages({
        'string.type': "type must be required",
        'string.home_details': "details must be required",
        'string.landmark': "landmark must be required",
        'string.recipient_name': "recipient_name must be required"
      })
      return await JoiSchema.validateAsync(body)
    } catch (err) {
      let error = { message: err.message, code: 400 };
      return promise.reject(error)
    }
  }
  async deleteaddressValidation(body) {
    try {
      const JoiSchema = Joi.object({
        address_id: Joi.string().required()
      }).messages({
        'string.address_id': "id  must be required"
      })
      return await JoiSchema.validateAsync(body);
    } catch (err) {
      let error = { message: err.message, code: 400 };
      return promise.reject(error);
    }
  }


}
module.exports = new Validator();