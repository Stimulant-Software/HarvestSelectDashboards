using System.ComponentModel.DataAnnotations;
using SGApp.Utility;

namespace SGApp.Models.Validation
{
    class Farm_Metadata
    {
        [Required]
        [Key]
        public int FarmId { get; set; }
        public int StatusId { get; set; }
        public string FarmName { get; set; }
        public int CompanyId { get; set; }



    }
}
