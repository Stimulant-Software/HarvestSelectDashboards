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
    public class LiveFishSamplingRepository : RepositoryBase<LiveFishSampling>
    {
        public override System.Linq.IQueryable<LiveFishSampling> EntityCollection
        {
            get
            {
                return DbContext.LiveFishSamplings.AsQueryable();
            }
        }

        protected override LiveFishSampling DeleteRecord(LiveFishSampling entity)
        {
            DbContext.LiveFishSamplings.Remove(entity);
            DbContext.SaveChanges();
            return entity;
        }

        protected override LiveFishSampling InsertRecord(LiveFishSampling entity)
        {
            DbContext.LiveFishSamplings.Add(entity);
            DbContext.SaveChanges();
            return entity;
        }

        protected override LiveFishSampling UpdateRecord(LiveFishSampling entity)
        {
            DbContext.SaveChanges();
            return entity;
        }


        public override List<LiveFishSampling> GetByPredicate(string predicate)
        {
            var iq = DbContext.LiveFishSamplings.AsQueryable();
            return predicate.Length > 0 ? iq.Where(predicate, null).ToList() : iq.ToList();
        }

        public List<LiveFishSampling> GetLiveFishSamplings()
        {

            return DbContext.LiveFishSamplings
            .OrderBy(x => x.SamplingDate).ToList();
        }


        public override LiveFishSampling GetById(int id)
        {
            return DbContext.LiveFishSamplings.Where(x => x.SamplingID == id).SingleOrDefault();
        }
        public  LiveFishSampling GetByDate(DateTime reportDate)
        {
            DateTime endDate = reportDate.AddDays(1);
            return DbContext.LiveFishSamplings.Where(x => x.SamplingDate > reportDate && x.SamplingDate < endDate).SingleOrDefault();
        }

    }


}
