﻿using SGApp.BusinessLogic.Application;
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
    public class FarmYieldController : BaseApiController
    {




        [HttpPut]
        public HttpResponseMessage FarmYieldAddOrEdit([FromBody] FarmYieldDTO uDto)
        {
            string key;
            var ur = new AppUserRepository();
            var FarmYieldId = 0;
            var userId = ur.ValidateUser(uDto.Key, out key, ref FarmYieldId);

            AppUserRoleRepository aur = new AppUserRoleRepository();


            if (userId > 0 && aur.IsInRole(userId, "SGAdmin"))
            {
                var FarmYield = new FarmYield();
                var errors = ValidateDtoData(uDto, FarmYield);
                if (errors.Any())
                {
                    return ProcessValidationErrors(Request, errors, key);
                }
                var NEUserId = 0;
                if (int.TryParse(uDto.YieldID, out NEUserId))
                {
                    if (NEUserId == -1)
                    {
                        //  creating new User record   
                        return ProcessNewFarmYieldRecord(Request, uDto, key, FarmYieldId, userId);
                    }
                    else
                    {
                        //  editing existing User record  
                        return ProcessExistingFarmYieldRecord(Request, uDto, NEUserId, key, FarmYieldId, userId);
                    }
                }
                //  no idea what this is
                var msg = "invalid data structure submitted";
                return Request.CreateResponse(HttpStatusCode.BadRequest, msg);
            }
            var message = "validation failed";
            return Request.CreateResponse(HttpStatusCode.NotFound, message);
        }

        private HttpResponseMessage ProcessNewFarmYieldRecord(HttpRequestMessage request, FarmYieldDTO uDto, string key, int FarmYieldId, int userId)
        {
            var ur = new FarmYieldRepository();
            var user = new FarmYield();


            var validationErrors = GetValidationErrors(ur, user, uDto, FarmYieldId, userId);

            if (validationErrors.Any())
            {
                return ProcessValidationErrors(request, validationErrors, key);
            }

            user = ur.Save(user);
            uDto.Key = key;
            uDto.YieldID = user.YieldID.ToString();
            var response = request.CreateResponse(HttpStatusCode.Created, uDto);
            response.Headers.Location = new Uri(Url.Link("Default", new
            {
                id = user.YieldID
            }));
            return response;
        }

        private HttpResponseMessage ProcessExistingFarmYieldRecord(HttpRequestMessage request, FarmYieldDTO cqDto, int contactId, string key, int FarmYieldId, int userId)
        {
            var ur = new FarmYieldRepository();
            var user = new FarmYield();
            user = ur.GetById(contactId);


            var validationErrors = GetValidationErrors(ur, user, cqDto, FarmYieldId, userId);
            if (validationErrors.Any())
            {
                return ProcessValidationErrors(request, validationErrors, key);
            }

            ur.Save(user);
            cqDto.Key = key;
            return request.CreateResponse(HttpStatusCode.Accepted, cqDto);

        }
        private List<DbValidationError> GetValidationErrors(FarmYieldRepository pr, FarmYield contact, FarmYieldDTO cqDto, int YieldID, int userId)
        {
            contact.ProcessRecord(cqDto);
            return pr.Validate(contact);
        }
    }

}