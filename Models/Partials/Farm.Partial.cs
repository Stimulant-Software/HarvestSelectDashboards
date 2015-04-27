﻿using System.ComponentModel.DataAnnotations;
using SGApp.Models.Validation;
using SGApp.Models.Common;


namespace SGApp.Models.EF
{
    [MetadataType(typeof(Farm_Metadata))]
    public partial class Farm : EntityBase, IValidatableObject
    {

        public override string KeyName()
        {
            return "FarmId";
        }

        public override System.Type GetDataType(string fieldName)
        {
            return GetType().GetProperty(fieldName).PropertyType;
        }


        #region IValidatableObject Members

        public System.Collections.Generic.IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (CompanyId <= 0)
            {
                yield return new ValidationResult(
                    "CompanyId is required.",
                    new[] { "CompanyId" }
                );

            }

        }

        #endregion


    }
}
