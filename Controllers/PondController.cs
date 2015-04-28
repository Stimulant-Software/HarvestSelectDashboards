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
    public class PondController : BaseApiController
    {




        [HttpPut]
        public HttpResponseMessage PondAddOrEdit([FromBody] PondDTO uDto)
        {
            string key;
            var ur = new AppUserRepository();
            var PondId = 0;
            var userId = ur.ValidateUser(uDto.Key, out key, ref PondId);

            AppUserRoleRepository aur = new AppUserRoleRepository();


            if (userId > 0 && aur.IsInRole(userId, "Admin"))
            {
                var Pond = new Pond();
                var errors = ValidateDtoData(uDto, Pond);
                if (errors.Any())
                {
                    return ProcessValidationErrors(Request, errors, key);
                }
                var NEUserId = 0;
                if (int.TryParse(uDto.PondId, out NEUserId))
                {
                    if (NEUserId == -1)
                    {
                        //  creating new User record   
                        return ProcessNewPondRecord(Request, uDto, key, PondId, userId);
                    }
                    else
                    {
                        //  editing existing User record  
                        return ProcessExistingPondRecord(Request, uDto, NEUserId, key, PondId, userId);
                    }
                }
                //  no idea what this is
                var msg = "invalid data structure submitted";
                return Request.CreateResponse(HttpStatusCode.BadRequest, msg);
            }
            var message = "validation failed";
            return Request.CreateResponse(HttpStatusCode.NotFound, message);
        }

        private HttpResponseMessage ProcessNewPondRecord(HttpRequestMessage request, PondDTO uDto, string key, int PondId, int userId)
        {
            var ur = new PondRepository();
            var user = new Pond();


            var validationErrors = GetValidationErrors(ur, user, uDto, PondId, userId);

            if (validationErrors.Any())
            {
                return ProcessValidationErrors(request, validationErrors, key);
            }

            user = ur.Save(user);
            uDto.Key = key;
            uDto.PondId = user.PondId.ToString();
            var response = request.CreateResponse(HttpStatusCode.Created, uDto);
            response.Headers.Location = new Uri(Url.Link("Default", new
            {
                id = user.PondId
            }));
            return response;
        }

        private HttpResponseMessage ProcessExistingPondRecord(HttpRequestMessage request, PondDTO cqDto, int contactId, string key, int PondId, int userId)
        {
            var ur = new PondRepository();
            var user = new Pond();
            user = ur.GetById(contactId);


            var validationErrors = GetValidationErrors(ur, user, cqDto, PondId, userId);
            if (validationErrors.Any())
            {
                return ProcessValidationErrors(request, validationErrors, key);
            }

            ur.Save(user);
            cqDto.Key = key;
            return request.CreateResponse(HttpStatusCode.Accepted, cqDto);

        }
        private List<DbValidationError> GetValidationErrors(PondRepository pr, Pond contact, PondDTO cqDto, int PondId, int userId)
        {
            contact.ProcessRecord(cqDto);
            return pr.Validate(contact);
        }
        internal HttpResponseMessage Ponds(HttpRequestMessage request, PondDTO cqDTO)
        {
            string key;
            var aur = new AppUserRepository();
            var companyId = 0;
            var userId = aur.ValidateUser(cqDTO.Key, out key, ref companyId);
            if (userId > 0)
            {
                var ur = new PondRepository();
                var u = new Pond();
                var predicate = ur.GetPredicate(cqDTO, u, companyId);
                var data = ur.GetByPredicate(predicate);
                var col = new Collection<Dictionary<string, string>>();

                foreach (var item in data)
                {

                    var dic = new Dictionary<string, string>();

                    dic.Add("PondId", item.PondId.ToString());
                    dic.Add("PondName", item.PondName);
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
        public HttpResponseMessage Ponds([FromBody] PondDTO cqDTO)
        {
            return Ponds(Request, cqDTO);
        }
        [HttpPost]
        public HttpResponseMessage PondList([FromBody] PondDTO cqDTO)
        {
            return Ponds(Request, cqDTO);
        }
    }

}