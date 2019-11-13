var dust = require('dust')();
var serand = require('serand');
var Vehicles = require('vehicles').service;

require('gallery');

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
                        var titleHtml = '<span class="text-light">' + vehicle._.make.title + ' ' + vehicle._.model.title + '</span>';
                        titleHtml += '<span class="text-warning">';
                        titleHtml += vehicle.edition ? (' ' + vehicle.edition) : '';
                        titleHtml += ' ' + moment(vehicle.year).year();
                        titleHtml += '</span>';
                        var images = vehicle._.images || [];
                        images = images.splice(0, 1);
                        images.forEach(function (image) {
                            o.push({
                                href: image.url,
                                titleHtml: titleHtml,
                                url: '/vehicles/' + vehicle.id
                            });
                        });
                    });
                    var gallery = blueimp.Gallery(o, {
                        container: $('.blueimp-gallery-carousel', sandbox),
                        carousel: true,
                        stretchImages: true,
                        titleElement: 'a',
                        onslide: function (index, slide) {
                            var entry = o[index];
                            $('.blueimp-gallery-carousel .title', sandbox).attr('href', entry.url).html(entry.titleHtml);
                        }
                    });
                    $('.slides', sandbox).on('click', function () {
                        var index = gallery.getIndex();
                        var entry = o[index];
                        window.open(entry.url, '_blank');
                        return true;
                    });
                }
            });
        });
    });
};
