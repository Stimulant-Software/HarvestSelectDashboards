using System.ComponentModel.DataAnnotations;
using SGApp.Utility;

namespace SGApp.Models.Validation
{
    class LiveFishSampling_Metadata
    {
        [Required]
        [Key]
        public int SamplingID { get; set; }
        public System.DateTime SamplingDate { get; set; }
        public decimal Pct0_125 { get; set; }
        public decimal Avg0_125 { get; set; }
        public decimal Pct125_225 { get; set; }
        public decimal Avg125_225 { get; set; }
        public decimal Pct225_3 { get; set; }
        public decimal Avg225_3 { get; set; }
        public decimal Pct3_5 { get; set; }
        public decimal Avg3_5 { get; set; }
        public decimal Pct5_Up { get; set; }
        public decimal Avg5_Up { get; set; }



    }
}
