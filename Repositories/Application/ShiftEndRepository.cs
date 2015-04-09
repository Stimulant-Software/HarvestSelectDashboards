using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Validation;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Dynamic;
using System.Security.Cryptography;
using System.Text;
using SGApp.Utility;
using SGApp.Models.EF;

namespace SGApp.Repository.Application
{
    public class ShiftEndRepository : RepositoryBase<ShiftEnd>
    {
        public override System.Linq.IQueryable<ShiftEnd> EntityCollection
        {
            get
            {
                return DbContext.ShiftEnds.AsQueryable();
            }
        }

        protected override ShiftEnd DeleteRecord(ShiftEnd entity)
        {
            throw new System.NotImplementedException();
        }

        protected override ShiftEnd InsertRecord(ShiftEnd entity)
        {
            DbContext.ShiftEnds.Add(entity);
            DbContext.SaveChanges();
            return entity;
        }

        protected override ShiftEnd UpdateRecord(ShiftEnd entity)
        {
            DbContext.SaveChanges();
            return entity;
        }


        public override List<ShiftEnd> GetByPredicate(string predicate)
        {
            var iq = DbContext.ShiftEnds.AsQueryable();
            return predicate.Length > 0 ? iq.Where(predicate, null).Take(50).ToList() : iq.Take(50).ToList();
        }

        public List<ShiftEnd> GetShiftEnds()
        {

            return DbContext.ShiftEnds
            .OrderBy(x => x.ShiftDate).ToList();
        }


        public override ShiftEnd GetById(int id)
        {
            return DbContext.ShiftEnds.Where(x => x.ShiftEndID == id).SingleOrDefault();
        }


    }


}
