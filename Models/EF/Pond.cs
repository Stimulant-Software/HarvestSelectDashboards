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
    
    public partial class Pond
    {
        public Pond()
        {
            this.FarmYields = new HashSet<FarmYield>();
        }
    
        public int PondId { get; set; }
        public int FarmId { get; set; }
        public string PondName { get; set; }
        public int StatusId { get; set; }
        public decimal Size { get; set; }
        public int SortOrder { get; set; }
    
        public virtual Farm Farm { get; set; }
        public virtual Status Status { get; set; }
        public virtual ICollection<FarmYield> FarmYields { get; set; }
    }
}
