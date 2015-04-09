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
    public class FarmController : BaseApiController
    {




        [HttpPut]
        public HttpResponseMessage FarmAddOrEdit([FromBody] FarmDTO uDto)
        {
            string key;
            var ur = new AppUserRepository();
            var FarmId = 0;
            var userId = ur.ValidateUser(uDto.Key, out key, ref FarmId);

            AppUserRoleRepository aur = new AppUserRoleRepository();


            if (userId > 0 && aur.IsInRole(userId, "SGAdmin"))
            {
                var Farm = new Farm();
                var errors = ValidateDtoData(uDto, Farm);
                if (errors.Any())
                {
                    return ProcessValidationErrors(Request, errors, key);
                }
                var NEUserId = 0;
                if (int.TryParse(uDto.FarmId, out NEUserId))
                {
                    if (NEUserId == -1)
                    {
                        //  creating new User record   
                        return ProcessNewFarmRecord(Request, uDto, key, FarmId, userId);
                    }
                    else
                    {
                        //  editing existing User record  
                        return ProcessExistingFarmRecord(Request, uDto, NEUserId, key, FarmId, userId);
                    }
                }
                //  no idea what this is
                var msg = "invalid data structure submitted";
                return Request.CreateResponse(HttpStatusCode.BadRequest, msg);
            }
            var message = "validation failed";
            return Request.CreateResponse(HttpStatusCode.NotFound, message);
        }

        private HttpResponseMessage ProcessNewFarmRecord(HttpRequestMessage request, FarmDTO uDto, string key, int FarmId, int userId)
        {
            var ur = new FarmRepository();
            var user = new Farm();


            var validationErrors = GetValidationErrors(ur, user, uDto, FarmId, userId);

            if (validationErrors.Any())
            {
                return ProcessValidationErrors(request, validationErrors, key);
            }

            user = ur.Save(user);
            uDto.Key = key;
            uDto.FarmId = user.FarmId.ToString();
            var response = request.CreateResponse(HttpStatusCode.Created, uDto);
            response.Headers.Location = new Uri(Url.Link("Default", new
            {
                id = user.FarmId
            }));
            return response;
        }

        private HttpResponseMessage ProcessExistingFarmRecord(HttpRequestMessage request, FarmDTO cqDto, int contactId, string key, int FarmId, int userId)
        {
            var ur = new FarmRepository();
            var user = new Farm();
            user = ur.GetById(contactId);


            var validationErrors = GetValidationErrors(ur, user, cqDto, FarmId, userId);
            if (validationErrors.Any())
            {
                return ProcessValidationErrors(request, validationErrors, key);
            }

            ur.Save(user);
            cqDto.Key = key;
            return request.CreateResponse(HttpStatusCode.Accepted, cqDto);

        }
        private List<DbValidationError> GetValidationErrors(FarmRepository pr, Farm contact, FarmDTO cqDto, int FarmId, int userId)
        {
            contact.ProcessRecord(cqDto);
            return pr.Validate(contact);
        }

        internal HttpResponseMessage Farms(HttpRequestMessage request, FarmDTO cqDTO)
        {
            string key;
            var aur = new AppUserRepository();
            var companyId = 0;
            var userId = aur.ValidateUser(cqDTO.Key, out key, ref companyId);
            if (userId > 0)
            {
                var ur = new FarmRepository();
                var u = new Farm();
                cqDTO.CompanyId = companyId.ToString();
                var predicate = ur.GetPredicate(cqDTO, u, companyId);
                var data = ur.GetByPredicate(predicate);
                var col = new Collection<Dictionary<string, string>>();

                foreach (var item in data)
                {

                    var dic = new Dictionary<string, string>();

                    dic.Add("FarmId", item.FarmId.ToString());
                    dic.Add("FarmName", item.FarmName);
                    dic.Add("StatusId", item.StatusId.ToString());
                    col.Add(dic);
                    var ufdic = new Dictionary<string, string>();


                }

                var retVal = new GenericDTO
                {
                    Key = key,
                    ReturnData = col
                };
                return Request.CreateResponse(HttpStatusCode.OK, retVal);
            }
            var message = "validation failed";
            return request.CreateResponse(HttpStatusCode.NotFound, message);

        }

       


        [HttpPost]
        public HttpResponseMessage Farms([FromBody] FarmDTO cqDTO)
        {
            return Farms(Request, cqDTO);
        }
        [HttpPost]
        public HttpResponseMessage FarmList([FromBody] FarmDTO cqDTO)
        {
            return Farms(Request, cqDTO);
        }

    }

}