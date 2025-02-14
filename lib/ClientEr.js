const httpClient = require('./httpClient');

var buildErCqlFilter = require('./buildErCqlFilter');

/**
 * @classdesc
 * WFS access client for the geoportal
 * @constructor
 */
var ClientEr = function (options) {
    // should be removed to allow user/password?
    if (typeof options.apiKey === 'undefined') throw new Error('Required param: apiKey');
    this.url = options.url || 'https://wxs.ign.fr/{apiKey}/geoportail/wfs';
    this.apiKey = options.apiKey || null;
    this.headers = options.headers || {};

};

/**
 * Get WFS URL
 */
ClientEr.prototype.getUrl = function () {
    return this.url.replace('{apiKey}', this.apiKey);
};


/**
 * @private
 * @returns {Object}
 */
ClientEr.prototype.getDefaultParams = function () {
    return {
        service: 'WFS',
        version: '2.0.0'
    };
};

/**
 * @private
 * @returns {Object}
 */
ClientEr.prototype.getDefaultHeaders = function () {
    return this.headers;
};

/**
 * Get features for a given type
 *
 * @param {string} typeName - name of type
 * @param {object} params - define cumulative filters (bbox, geom) and to manage the pagination
 * @param {number} [params._start=0] index of the first result (STARTINDEX on the WFS)
 * @param {number} [params._limit] maximum number of result (COUNT on the WFS)
 * @param {array}  [params._propertyNames] restrict a GetFeature request by properties
 * @param {object} [params.geom] search geometry intersecting the resulting features.
 * @param {object} [params.bbox] search bbox intersecting the resulting features.
 * @param {string} [defaultGeomFieldName="the_geom"] name of the geometry column by default
 * @param {string} [defaultCRS="urn:ogc:def:crs:EPSG::4326"] default data CRS (required in cql_filter)
 *
 * @return {Promise}
 */
ClientEr.prototype.getFeatures = function (typeName, params) {
    params = params || {};

    var headers = this.getDefaultHeaders();
    headers['Accept'] = 'application/json';

    /*
     * GetFeature params
     */
    var queryParams = this.getDefaultParams();
    queryParams['request'] = 'GetFeature';
    queryParams['typename'] = typeName;
    queryParams['outputFormat'] = 'application/json';
    queryParams['srsName'] = 'CRS:84';
    if (typeof params._limit !== 'undefined') {
        queryParams['count'] = params._limit;
    }
    if (typeof params._start !== 'undefined') {
        queryParams['startIndex'] = params._start;
    }
  
    if (typeof params._propertyNames !== 'undefined') {
        queryParams['propertyName'] = params._propertyNames.join();
    }
    /*
     * bbox and attribute filter as POST parameter
     */
    var cql_filter = buildErCqlFilter(params);
    var body = (cql_filter !== null) ? 'cql_filter=' + encodeURI(cql_filter) : '';
    return httpClient.post(this.getUrl(), body, {
        params: queryParams,
        headers: headers,
        responseType: 'text',
        transformResponse: function (body) {
            try {
                return JSON.parse(body);
            } catch (err) {
                // forward xml errors
                throw {
                    'type': 'error',
                    'message': body
                };
            }
        }
    }).then(function (response) {
        return response.data;
    });
};

module.exports = ClientEr;
