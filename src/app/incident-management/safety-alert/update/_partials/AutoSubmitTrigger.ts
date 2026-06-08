import { useEffect } from "react";
import { useFormikContext } from "formik";

export const AutoSubmitTrigger = () => {
 const { values, isValid, dirty, submitForm } = useFormikContext();

 useEffect(() => {
   if (isValid && dirty) {
     submitForm();
   }
 }, [values, isValid, dirty, submitForm]);

 return null;
};