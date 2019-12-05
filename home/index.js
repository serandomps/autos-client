var dust = require('dust')();
var serand = require('serand');
var Vehicles = require('model-vehicles').service;

require('gallery');

dust.loadSource(dust.compile(require('./details'), 'autos-home-details'));
dust.loadSource(dust.compile(require('./template'), 'autos-home'));

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    Vehicles.find({
        query: {
            sort: {
                updatedAt: -1
            },
            count: 5
        },
        resolution: '800x450'
    }, function (err, vehicles) {
        if (err) return done(err);
        dust.render('autos-home', serand.pack(vehicles, container), function (err, out) {
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
                        var href = images.length ? images[0].url : '';
                        o.push({href: href});
                    });
                    var gallery = blueimp.Gallery(o, {
                        container: $('.blueimp-gallery-carousel', sandbox),
                        carousel: true,
                        stretchImages: true,
                        titleElement: 'a',
                        onslide: function (index, slide) {
                            var vehicle = vehicles[index];
                            var url = '/vehicles/' + vehicle.id;
                            dust.render('autos-home-details', serand.pack(vehicle, container), function (err, out) {
                                if (err) {
                                    return console.error(err);
                                }
                                $('.blueimp-gallery-carousel .title', sandbox).attr('href', url).html(out);
                            });
                        }
                    });
                    $('.slides', sandbox).on('click', function () {
                        var index = gallery.getIndex();
                        var vehicle = vehicles[index];
                        var url = '/vehicles/' + vehicle.id;
                        window.open(url, '_blank');
                        return true;
                    });
                }
            });
        });
    });
};
