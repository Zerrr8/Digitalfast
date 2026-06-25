import restrict from '../../middlewares/restrict.js'
import authorization from '../../middlewares/authorization.js'
import rpm from '../../middlewares/rpm.js'
import error from '../../middlewares/error.js'
import requires from '../../middlewares/requires.js'

/**
 * Generates middleware functions based on route configuration.
 * @param {Object} route - The route object containing middleware rules.
 * @returns {Function[]} - An array of middleware functions.
 */
export default route => {
   const middlewares = []

   /**
    * Restricts access based on allowed IPs.
    * Middleware applied when `route.restrict` is set.
    */
   if (route.restrict) {
      middlewares.push(restrict)
   }

   /**
    * Authorizes user based on JWT.
    * Middleware applied when `route.authorize` is set.
    */
   if (route.login) {
      middlewares.push(authorization(route))
   }

   /**
    * Limits requests per minute based on IP.
    * Middleware applied when `route.rpm` is set.
    */
   if (route.rpm) {
      middlewares.push(rpm)
   }

   /**
    * Handles unavailable features by returning an error response.
    * Middleware applied when `route.error` is set.
    */
   if (route.error) {
      middlewares.push(error)
   }

   /**
    * Validates request parameters.
    * Middleware applied unless `route.requires` is set.
    */
   if (!route.requires) {
      middlewares.push(requires(route))
   } else {
      middlewares.push(route.requires)
   }

   /**
    * Applies additional validation rules if `route.validator` is set.
    */
   if (route.validator) {
      middlewares.push(route.validator)
   }

   return middlewares
}