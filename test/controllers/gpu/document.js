/* eslint-env node, mocha */
const request = require('supertest');
const expect = require('expect.js');

const app = require('../../../app');

describe('/api/gpu/document', function() {

    describe('with point at [1.654399,48.112235] (Rennes)', function() {
        it('should reply a FeatureCollection containing a valid Feature', function(done) {
            request(app)
                .get('/api/gpu/document?geom={"type":"Point","coordinates":[1.654399,48.112235]}')
                .expect(200)
                .expect(res => {
                    expect(res.body.features.length).to.eql(1);
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    expect(feature.properties.du_type).to.eql('PLUi');
                    expect(feature.properties.partition).to.eql('DU_200070159');
                })
                .end(done);
            ;
        });
    });
});
