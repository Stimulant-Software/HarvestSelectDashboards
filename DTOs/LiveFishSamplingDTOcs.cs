using SGApp.Models.Common;
using System.Collections.Generic;

namespace SGApp.DTOs
{
    public class LiveFishSamplingDTO : IKey
    {
        public string Key { get; set; }
        public string SamplingID { get; set; }
        public string SamplingDate { get; set; }
        public string Start_SamplingDate { get; set; }
        public string End_SamplingDate { get; set; }
        public string Pct0_125 { get; set; }
        public string Avg0_125 { get; set; }
        public string Pct125_225 { get; set; }
        public string Avg125_225 { get; set; }
        public string Pct225_3 { get; set; }
        public string Avg225_3 { get; set; }
        public string Pct3_5 { get; set; }
        public string Avg3_5 { get; set; }
        public string Pct5_Up { get; set; }
        public string Avg5_Up { get; set; }
    }
}