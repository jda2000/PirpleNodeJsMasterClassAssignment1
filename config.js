/*
 * Create and export the configuration variables object
 *
 *
 */

 // Container for all environments

 var environments = {};

 // Statging (default) environment

 environments.staging = {
   'httpPort'  : 3000,
   'httpsPort' : 3001,
   'envName'   : 'staging',
   'debugLevel': 1
 };

 // Statging (default) environment

 environments.production = {
   'httpPort'  : 5000,
   'httpsPort' : 5001,
   'envName'   : 'production',
   'debugLevel': 0
 };

 // Select the configuration object based on the NODE_ENV environment variables

 var currentEnvironment = typeof(process.env.NODE_ENV) == 'string'
                        ? process.env.NODE_ENV.toLowerCase()
                        : '';

var exportedEnvironment = typeof(environments[currentEnvironment]) == 'object'
                        ? environments[currentEnvironment]
                        : environments.staging;

module.exports = exportedEnvironment;
