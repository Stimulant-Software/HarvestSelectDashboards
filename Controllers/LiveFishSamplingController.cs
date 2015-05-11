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
    public class LiveFishSamplingController : BaseApiController
    {




        [HttpPut]
        public HttpResponseMessage LiveFishSamplingAddOrEdit([FromBody] LiveFishSamplingDTO uDto)
        {
            string key;
            var ur = new AppUserRepository();
            var LiveFishSamplingId = 0;
            var userId = ur.ValidateUser(uDto.Key, out key, ref LiveFishSamplingId);

            AppUserRoleRepository aur = new AppUserRoleRepository();


            if (userId > 0 && aur.IsInRole(userId, "Data Entry"))
            {
                var LiveFishSampling = new LiveFishSampling();
                var errors = ValidateDtoData(uDto, LiveFishSampling);
                if (errors.Any())
                {
                    return ProcessValidationErrors(Request, errors, key);
                }
                var NEUserId = 0;
                if (int.TryParse(uDto.SamplingID, out NEUserId))
                {
                    if (NEUserId == -1)
                    {
                        //  creating new User record   
                        return ProcessNewLiveFishSamplingRecord(Request, uDto, key, LiveFishSamplingId, userId);
                    }
                    else
                    {
                        //  editing existing User record  
                        return ProcessExistingLiveFishSamplingRecord(Request, uDto, NEUserId, key, LiveFishSamplingId, userId);
                    }
                }
                //  no idea what this is
                var msg = "invalid data structure submitted";
                return Request.CreateResponse(HttpStatusCode.BadRequest, msg);
            }
            var message = "validation failed";
            return Request.CreateResponse(HttpStatusCode.NotFound, message);
        }

        private HttpResponseMessage ProcessNewLiveFishSamplingRecord(HttpRequestMessage request, LiveFishSamplingDTO uDto, string key, int LiveFishSamplingId, int userId)
        {
            var ur = new LiveFishSamplingRepository();
            var user = new LiveFishSampling();


            var validationErrors = GetValidationErrors(ur, user, uDto, LiveFishSamplingId, userId);

            if (validationErrors.Any())
            {
                return ProcessValidationErrors(request, validationErrors, key);
            }

            user = ur.Save(user);
            uDto.Key = key;
            uDto.SamplingID = user.SamplingID.ToString();
            var response = request.CreateResponse(HttpStatusCode.Created, uDto);
            response.Headers.Location = new Uri(Url.Link("Default", new
            {
                id = user.SamplingID
            }));
            return response;
        }

        private HttpResponseMessage ProcessExistingLiveFishSamplingRecord(HttpRequestMessage request, LiveFishSamplingDTO cqDto, int contactId, string key, int LiveFishSamplingId, int userId)
        {
            var ur = new LiveFishSamplingRepository();
            var user = new LiveFishSampling();
            user = ur.GetById(contactId);


            var validationErrors = GetValidationErrors(ur, user, cqDto, LiveFishSamplingId, userId);
            if (validationErrors.Any())
            {
                return ProcessValidationErrors(request, validationErrors, key);
            }

                ur.Save(user);
            

            cqDto.Key = key;
            return request.CreateResponse(HttpStatusCode.Accepted, cqDto);

        }
        private List<DbValidationError> GetValidationErrors(LiveFishSamplingRepository pr, LiveFishSampling contact, LiveFishSamplingDTO cqDto, int YieldID, int userId)
        {
            contact.ProcessRecord(cqDto);
            return pr.Validate(contact);
        }

        internal HttpResponseMessage LiveFishSamplings(HttpRequestMessage request, LiveFishSamplingDTO cqDTO)
        {
            string key;
            var aur = new AppUserRepository();
            var companyId = 0;
            var userId = aur.ValidateUser(cqDTO.Key, out key, ref companyId);
            if (userId > 0)
            {
                var ur = new LiveFishSamplingRepository();
                var u = new LiveFishSampling();
                if (cqDTO.SamplingDate != null)
                {
                    cqDTO.Start_SamplingDate = DateTime.Parse(cqDTO.SamplingDate).ToString();
                    cqDTO.End_SamplingDate = DateTime.Parse(cqDTO.SamplingDate).AddDays(1).ToString();
                }
                var predicate = ur.GetPredicate(cqDTO, u, companyId);
                var data = ur.GetByPredicate(predicate);
                var col = new Collection<Dictionary<string, string>>();
                data = data.OrderBy(x => x.SamplingDate).ToList();
                foreach (var item in data)
                {

                    var dic = new Dictionary<string, string>();


                    dic.Add("SamplingID", item.SamplingID.ToString());
        dic.Add("SamplingDate", item.SamplingDate.ToShortDateString());
        dic.Add("Pct0_125", item.Pct0_125.ToString());
        dic.Add("Avg0_125", item.Avg0_125.ToString());
        dic.Add("Pct125_225", item.Pct125_225.ToString());
        dic.Add("Avg125_225", item.Avg125_225.ToString());
        dic.Add("Pct225_3", item.Pct225_3.ToString());
        dic.Add("Avg225_3", item.Avg225_3.ToString());
        dic.Add("Pct3_5", item.Pct3_5.ToString());
        dic.Add("Avg3_5", item.Avg3_5.ToString());
        dic.Add("Pct5_Up", item.Pct5_Up.ToString());
        dic.Add("Avg5_Up", item.Avg5_Up.ToString());
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
        public HttpResponseMessage LiveFishSamplings([FromBody] LiveFishSamplingDTO cqDTO)
        {
            return LiveFishSamplings(Request, cqDTO);
        }
        [HttpPost]
        public HttpResponseMessage LiveFishSamplingList([FromBody] LiveFishSamplingDTO cqDTO)
        {
            return LiveFishSamplings(Request, cqDTO);
        }
    }

}