using System.ComponentModel.DataAnnotations;
using SGApp.Utility;

namespace SGApp.Models.Validation
{
    class FarmYield_Metadata
    {
        [Required]
        [Key]
        public int YieldID { get; set; }
        public System.DateTime YieldDate { get; set; }
        public int PondID { get; set; }
        public decimal PoundsYielded { get; set; }



    }
}
