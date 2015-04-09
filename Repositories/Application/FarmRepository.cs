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
    public class FarmRepository : RepositoryBase<Farm>
    {
        public override System.Linq.IQueryable<Farm> EntityCollection
        {
            get
            {
                return DbContext.Farms.AsQueryable();
            }
        }

        protected override Farm DeleteRecord(Farm entity)
        {
            throw new System.NotImplementedException();
        }

        protected override Farm InsertRecord(Farm entity)
        {
            DbContext.Farms.Add(entity);
            DbContext.SaveChanges();
            return entity;
        }

        protected override Farm UpdateRecord(Farm entity)
        {
            DbContext.SaveChanges();
            return entity;
        }


        public override List<Farm> GetByPredicate(string predicate)
        {
            var iq = DbContext.Farms.AsQueryable();
            return predicate.Length > 0 ? iq.Where(predicate, null).Take(50).ToList() : iq.Take(50).ToList();
        }

        public List<Farm> GetFarms()
        {

            return DbContext.Farms
            .OrderBy(x => x.FarmName).ToList();
        }


        public override Farm GetById(int id)
        {
            return DbContext.Farms.Where(x => x.FarmId == id).SingleOrDefault();
        }


    }


}
