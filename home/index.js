var dust = require('dust')();
var Vehicles = require('vehicles').service;

require('gallery');

dust.loadSource(dust.compile(require('./template'), 'autos-home'));

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    Vehicles.find({
        sort: {
            createdAt: -1
        },
        count: 2,
        resolution: '800x450'
    }, function (err, vehicles) {
        if (err) return done(err);
        dust.render('autos-home', vehicles, function (err, out) {
            if (err) {
                return done(err);
            }
            sandbox.append(out);
            done(null, {
                clean: function () {
                    $('.autos-home', sandbox).remove();
                },
                ready: function () {
                    var o = [];
                    vehicles.forEach(function (vehicle) {
                        var images = vehicle._.images || [];
                        images.forEach(function (image) {
                            o.push({
                                href: image.url
                            });
                        });
                    });
                    blueimp.Gallery(o, {
                        container: $('.blueimp-gallery-carousel', sandbox),
                        carousel: true,
                        stretchImages: true
                    });
                }
            });
        });
    });
};
