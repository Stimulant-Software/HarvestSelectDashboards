//------------------------------------------------------------------------------
// <auto-generated>
//    This code was generated from a template.
//
//    Manual changes to this file may cause unexpected behavior in your application.
//    Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace SGApp.Models.EF
{
    using System;
    using System.Collections.Generic;
    
    public partial class LiveFishSampling
    {
        public int SamplingID { get; set; }
        public System.DateTime SamplingDate { get; set; }
        public Nullable<decimal> Pct0_125 { get; set; }
        public Nullable<decimal> Avg0_125 { get; set; }
        public Nullable<decimal> Pct125_225 { get; set; }
        public Nullable<decimal> Avg125_225 { get; set; }
        public Nullable<decimal> Pct225_3 { get; set; }
        public Nullable<decimal> Avg225_3 { get; set; }
        public Nullable<decimal> Pct3_5 { get; set; }
        public Nullable<decimal> Avg3_5 { get; set; }
        public Nullable<decimal> Pct5_Up { get; set; }
        public Nullable<decimal> Avg5_Up { get; set; }
    }
}
