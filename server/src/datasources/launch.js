const { RESTDataSource } = require('apollo-datasource-rest');

class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.spacexdata.com/v2/';
  }

  async getAllLaunches() {
    const response = await this.get('launches');
    return Array.isArray(response) ?
      response.map(launch => this.launchReducer(launch)) :
      [];
  }

  async getLaunchById({ launchId }) {
    const response = await this.get('launches', { flight_number: launchId });
    return this.launchReducer(response[0]);
  }

  getLaunchesByIds({ launchIds }) {
    return Promise.all(
      launchIds.map(launchId => this.getLaunchById({ launchId }))
    );
  }

  launchReducer(launch) {
    const {launch_site, links, rocket} = launch;
    return {
      id: launch.flight_number || 0,
      cursor: `${launch.launch_date_unix}`,
      site: launch_site && launch_site.site_name,
      mission: {
        name: launch.mission_name,
        missionPatchSmall: links.mission_patch_small,
        missionPatchLarge: links.mission_patch,
      },
      rocket: {
        id: rocket.rocket_id,
        name: rocket.rocket_name,
        type: rocket.rocket_type,
      },
    };
  }
}

module.exports = LaunchAPI;

/**
 * An Apollo data source is a class that encapsulates all of the data
 * fetching logic, as well as caching and deduplication, for a particular
 * service. By using Apollo data sources to hook up your services to your
 * graph API, you're also following best practices for organizing your code.
 *
 * The Apollo RESTDataSource also sets up an in-memory cache that caches
 * responses from our REST resources with no additional setup. We call this
 * partial query caching. What's great about this cache is that you can
 * reuse existing caching logic that your REST API exposes.
 */