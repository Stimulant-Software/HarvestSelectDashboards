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
    public class PondRepository : RepositoryBase<Pond>
    {
        public override System.Linq.IQueryable<Pond> EntityCollection
        {
            get
            {
                return DbContext.Ponds.AsQueryable();
            }
        }

        protected override Pond DeleteRecord(Pond entity)
        {
            throw new System.NotImplementedException();
        }

        protected override Pond InsertRecord(Pond entity)
        {
            DbContext.Ponds.Add(entity);
            DbContext.SaveChanges();
            return entity;
        }

        protected override Pond UpdateRecord(Pond entity)
        {
            DbContext.SaveChanges();
            return entity;
        }


        public override List<Pond> GetByPredicate(string predicate)
        {
            var iq = DbContext.Ponds.AsQueryable();
            return predicate.Length > 0 ? iq.Where(predicate, null).Take(50).ToList() : iq.Take(50).ToList();
        }

        public List<Pond> GetPonds()
        {

            return DbContext.Ponds
            .OrderBy(x => x.PondName).ToList();
        }


        public override Pond GetById(int id)
        {
            return DbContext.Ponds.Where(x => x.PondId == id).SingleOrDefault();
        }


    }


}
