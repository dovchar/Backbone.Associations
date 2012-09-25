module.exports = function (grunt) {
    grunt.initConfig({
        pkg: '<json:package.json>',

        meta: {
            banner:
                '/**\n' +
                ' * <%= pkg.title %> v<%= pkg.version %>\n' +
                ' * <%= pkg.homepage %>\n' +
                ' *\n' +
                ' * Copyright © <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
                ' * Released under the <%= pkg.license.type %> license.\n' +
                ' */'
        },

        concat: {
            dist: {
                src: ['<banner:meta.banner>', 'src/**/*.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },

        min: {
            dist: {
                src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },

        qunit: {
            files: ['test/**/*.html']
        },

        lint: {
            src: 'src/**/*.js', test: 'test/**/*.js'
        },

        watch: {
            files: ['<config:lint.src>', '<config:lint.test>'],
            tasks: 'default'
        },

        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true
            },

            src: {
                globals: {
                    $: true, _: true, Backbone: true
                }
            },

            test: {
                globals: {
                    $: true, _: true, Backbone: true,
                    module: true, test: true, ok: true
                }
            }
        },

        uglify: {}
    });

    grunt.registerTask('default', 'lint qunit concat min');
};
