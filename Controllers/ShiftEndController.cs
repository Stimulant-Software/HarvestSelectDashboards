using SGApp.BusinessLogic.Application;
using SGApp.Controllers;
using SGApp.Repository.Application;
using SGApp.Utility;
using SGApp.DTOs;
using SGApp.Models.EF;
using SGApp.Models.Common;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;


namespace SGApp.Controllers
{
    public class ShiftEndController : BaseApiController
    {




        [HttpPut]
        public HttpResponseMessage ShiftEndAddOrEdit([FromBody] ShiftEndDTO uDto)
        {
            string key;
            var ur = new AppUserRepository();
            var ShiftEndId = 0;
            var userId = ur.ValidateUser(uDto.Key, out key, ref ShiftEndId);

            AppUserRoleRepository aur = new AppUserRoleRepository();


            if (userId > 0 && aur.IsInRole(userId, "SGAdmin"))
            {
                var ShiftEnd = new ShiftEnd();
                var errors = ValidateDtoData(uDto, ShiftEnd);
                if (errors.Any())
                {
                    return ProcessValidationErrors(Request, errors, key);
                }
                var NEUserId = 0;
                if (int.TryParse(uDto.ShiftEndID, out NEUserId))
                {
                    if (NEUserId == -1)
                    {
                        //  creating new User record   
                        return ProcessNewShiftEndRecord(Request, uDto, key, ShiftEndId, userId);
                    }
                    else
                    {
                        //  editing existing User record  
                        return ProcessExistingShiftEndRecord(Request, uDto, NEUserId, key, ShiftEndId, userId);
                    }
                }
                //  no idea what this is
                var msg = "invalid data structure submitted";
                return Request.CreateResponse(HttpStatusCode.BadRequest, msg);
            }
            var message = "validation failed";
            return Request.CreateResponse(HttpStatusCode.NotFound, message);
        }

        private HttpResponseMessage ProcessNewShiftEndRecord(HttpRequestMessage request, ShiftEndDTO uDto, string key, int ShiftEndId, int userId)
        {
            var ur = new ShiftEndRepository();
            var user = new ShiftEnd();


            var validationErrors = GetValidationErrors(ur, user, uDto, ShiftEndId, userId);

            if (validationErrors.Any())
            {
                return ProcessValidationErrors(request, validationErrors, key);
            }

            user = ur.Save(user);
            uDto.Key = key;
            uDto.ShiftEndID = user.ShiftEndID.ToString();
            var response = request.CreateResponse(HttpStatusCode.Created, uDto);
            response.Headers.Location = new Uri(Url.Link("Default", new
            {
                id = user.ShiftEndID
            }));
            return response;
        }

        private HttpResponseMessage ProcessExistingShiftEndRecord(HttpRequestMessage request, ShiftEndDTO cqDto, int contactId, string key, int ShiftEndId, int userId)
        {
            var ur = new ShiftEndRepository();
            var user = new ShiftEnd();
            user = ur.GetById(contactId);


            var validationErrors = GetValidationErrors(ur, user, cqDto, ShiftEndId, userId);
            if (validationErrors.Any())
            {
                return ProcessValidationErrors(request, validationErrors, key);
            }

            ur.Save(user);
            cqDto.Key = key;
            return request.CreateResponse(HttpStatusCode.Accepted, cqDto);

        }
        private List<DbValidationError> GetValidationErrors(ShiftEndRepository pr, ShiftEnd contact, ShiftEndDTO cqDto, int ShiftEndID, int userId)
        {
            contact.ProcessRecord(cqDto);
            return pr.Validate(contact);
        }
    }

}