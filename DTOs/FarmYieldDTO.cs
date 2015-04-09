using SGApp.Models.Common;
using System.Collections.Generic;

namespace SGApp.DTOs
{
    public class FarmYieldDTO : IKey
    {
        public string Key { get; set; }
        public string YieldID { get; set; }
        public string YieldDate { get; set; }
        public string PondID { get; set; }
        public string PoundsYielded { get; set; }
    }
}