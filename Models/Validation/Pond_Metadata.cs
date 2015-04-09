using System.ComponentModel.DataAnnotations;
using SGApp.Utility;

namespace SGApp.Models.Validation
{
    class Pond_Metadata
    {
        [Required]
        [Key]
        public int PondId { get; set; }
        public int FarmId { get; set; }
        public string PondName { get; set; }
        public int StatusId { get; set; }
        public decimal Size { get; set; }
        public int SortOrder { get; set; }



    }
}
