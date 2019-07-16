const { paginateResults } = require('./utils');

/**
 * Apollo GraphQL resolver functions accept four arguments:
 * - parent: An object that contains the result returned from the resolver on the parent type
 * - args: An object that contains the arguments passed to the field
 * - context: An object shared by all resolvers in a GraphQL operation. We use the context to contain
 *   per-request state such as authentication information and access our data sources.
 * - info: Information about the execution state of the operation which should only be used in advanced cases
 */
module.exports = {
  Query: {
    launches: async (parent, { pageSize = 20, after }, { dataSources }, info) => {
      const allLaunches = await dataSources.launchAPI.getAllLaunches();
      // we want these in reverse chronological order
      allLaunches.reverse();
      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches
      });
      return {
        launches,
        cursor: launches.length ? launches[launches.length - 1].cursor : null,
        // if the cursor of the end of the paginated results is the same as the
        // last item in _all_ results, then there are no more results after this
        hasMore: launches.length
          ? launches[launches.length - 1].cursor !==
          allLaunches[allLaunches.length - 1].cursor
          : false
      };
    },
    launch: (parent, { id }, { dataSources }, info) =>
      dataSources.launchAPI.getLaunchById({ launchId: id }),
    me: (parent, args, { dataSources }, info) => dataSources.userAPI.findOrCreateUser()
  }
};