using SGApp.Models.Common;
using System.Collections.Generic;

namespace SGApp.DTOs
{
    public class PondDTO : IKey
    {
        public string Key { get; set; }
        public string PondId { get; set; }
        public string FarmId { get; set; }
        public string PondName { get; set; }
        public string StatusId { get; set; }
        public string Size { get; set; }
        public string SortOrder { get; set; }
    }
}