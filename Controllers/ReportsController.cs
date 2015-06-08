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
    public class ReportsController : BaseApiController
    {






        internal HttpResponseMessage DailyReport(HttpRequestMessage request, DailyReportDTO cqDTO)
        {
            string key;
            var aur = new AppUserRepository();
            var companyId = 0;
            var userId = aur.ValidateUser(cqDTO.Key, out key, ref companyId);
            if (userId > 0)
            {
                var fyr = new FarmYieldRepository();
                var ser = new ShiftEndRepository();
                var fyhr = new FarmYieldHeaderRepository();
                var fyh = new FarmYieldHeader();
                var lfsr = new LiveFishSamplingRepository();
                var lfs = new LiveFishSampling();


                var reportDate = new DateTime();
                var se = new ShiftEnd();
                decimal? pondWeight = 0;
                if (cqDTO.ReportDate != null)
                {
                    reportDate = DateTime.Parse(cqDTO.ReportDate).AddDays(-1);
                }
                fyh = fyhr.GetByDate(reportDate);
                pondWeight = fyr.GetPondWeightByDate(reportDate);
                se = ser.GetByDate(reportDate);
                string downtime = "";
                lfs = lfsr.GetByDate(reportDate);
                if (se != null && se.DowntimeMinutes != null)
                {
                    downtime = String.Format((se.DowntimeMinutes / 60).ToString(), "{0, D2}") + ":" + String.Format((se.DowntimeMinutes % 60).ToString(), "{0, D2}");
                }
                else
                {
                    downtime = "";
                }
                    var col = new Collection<Dictionary<string, string>>();
                    var dic = new Dictionary<string, string>();

                    dic.Add("PlantWeight", fyh.PlantWeight.ToString());
                    dic.Add("WeighBacks", fyh.WeighBacks.ToString());
                    dic.Add("TotalPounds", (fyh.PlantWeight - fyh.WeighBacks).ToString());
                    dic.Add("PondWeight", pondWeight.ToString());
                    dic.Add("Variance", (pondWeight - fyh.PlantWeight).ToString());
                    dic.Add("DownTime", downtime);
                    col.Add(dic);
                    var data = fyr.GetByDate(reportDate);
                    var col1 = new Collection<Dictionary<string, string>>();
                    data = data.OrderBy(x => x.YieldDate).ToList();
                    foreach (var item in data)
                    {

                        var dic1 = new Dictionary<string, string>();

                        dic1.Add("YieldId", string.IsNullOrEmpty(item.YieldID.ToString()) ? "" : (item.YieldID.ToString()));

                        dic1.Add("PondID", string.IsNullOrEmpty(item.PondID.ToString()) ? "" : (item.PondID.ToString()));
                        dic1.Add("PondName", item.Pond.PondName);
                        dic1.Add("FarmID", item.Pond.Farm.FarmName.ToString());
                        dic1.Add("YieldDate", item.YieldDate.ToShortDateString());
                        dic1.Add("PoundsYielded", item.PoundsYielded.ToString());
                        dic1.Add("PoundsPlant", item.PoundsPlant.ToString());
                        dic1.Add("PoundsHeaded", item.PoundsHeaded.ToString());
                        dic1.Add("PercentYield", item.PercentYield.ToString());
                        dic1.Add("PercentYield2", item.PercentYield.ToString());
                        col1.Add(dic1);
                        


                    }
                
                    var col2 = new Collection<Dictionary<string, string>>();


                        var dic2 = new Dictionary<string, string>();
                        var col3 = new Collection<Dictionary<string, string>>();


                        var dic3 = new Dictionary<string, string>();
                        var col4 = new Collection<Dictionary<string, string>>();


                        var dic4 = new Dictionary<string, string>();

                        
                        dic4.Add("DayFinishedFreezing", DateTime.Parse(se.DayFinishedFreezing.ToString()).ToString("HH:mm"));
                        dic2.Add("DayShiftFroze", se.DayShiftFroze.ToString());
                        dic3.Add("EmployeesOnVacation", se.EmployeesOnVacation.ToString());
                        dic2.Add("FilletScaleReading", se.FilletScaleReading.ToString());
                        dic4.Add("FinishedFillet", DateTime.Parse(se.FinishedFillet.ToString()).ToString("HH:mm"));
                        dic4.Add("FinishedKill", DateTime.Parse(se.FinishedKill.ToString()).ToString("HH:mm"));
                        dic4.Add("FinishedSkinning", DateTime.Parse(se.FinishedSkinning.ToString()).ToString("HH:mm"));
                        dic3.Add("InmateLeftEarly", se.InmateLeftEarly.ToString());
                        dic3.Add("InLateOut", se.InLateOut.ToString());
                        dic4.Add("NightFinishedFreezing", DateTime.Parse(se.NightFinishedFreezing.ToString()).ToString("HH:mm"));
                        dic2.Add("NightShiftFroze", se.NightShiftFroze.ToString());
                        dic3.Add("RegEmpLate", se.RegEmpLate.ToString());
                        dic3.Add("RegEmpOut", se.RegEmpOut.ToString());
                        dic3.Add("RegEmplLeftEarly", se.RegEmplLeftEarly.ToString());
                        dic3.Add("TempEmpOut", se.TempEmpOut.ToString());
                        col2.Add(dic2);
                        col3.Add(dic3);
                        col4.Add(dic4);


                        var col5 = new Collection<Dictionary<string, string>>();


                        var dic5 = new Dictionary<string, string>();
                        dic5.Add("Pct0_125", lfs.Pct0_125.ToString());
                        dic5.Add("Avg0_125", lfs.Avg0_125.ToString());
                        dic5.Add("Pct125_225", lfs.Pct125_225.ToString());
                        dic5.Add("Avg125_225", lfs.Avg125_225.ToString());
                        dic5.Add("Pct225_3", lfs.Pct225_3.ToString());
                        dic5.Add("Avg225_3", lfs.Avg225_3.ToString());
                        dic5.Add("Pct3_5", lfs.Pct3_5.ToString());
                        dic5.Add("Avg3_5", lfs.Avg3_5.ToString());
                        dic5.Add("Pct5_Up", lfs.Pct5_Up.ToString());
                        dic5.Add("Avg5_Up", lfs.Avg5_Up.ToString());
                        col5.Add(dic5);

                    

                var retVal = new DailyReportDTO
                {
                    Key = key,
                    Header = col,
                    Ponds = col1,
                    Employees = col3,
                    Finish = col4,
                    Freezing = col2,
                    Samplings = col5
                };
                return Request.CreateResponse(HttpStatusCode.OK, retVal);
            }
            var message = "validation failed";
            return request.CreateResponse(HttpStatusCode.NotFound, message);

        }




        [HttpPost]
        public HttpResponseMessage DailyReport([FromBody] DailyReportDTO cqDTO)
        {
            return DailyReport(Request, cqDTO);
        }

    }

}