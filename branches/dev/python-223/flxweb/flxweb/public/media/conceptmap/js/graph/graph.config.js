define(['jquery'], function($){
    'use strict';

    var browsePageHeader = $('.browseheader--conceptmap'),
        browsePageHeight = browsePageHeader.length && browsePageHeader.is(':visible') ? browsePageHeader.height() + 30 /* Add 30 here for modality popup */ : 0;

    var heightOffset = $('header').height() + $('#conceptmap-nav').height() + browsePageHeight;

    var winHeight  = $(window).height(),
        height     = winHeight - heightOffset,
        width      = $(window).width();

    var SVG_RESOLUTION_WIDTHS = {
        99999: {
            fontSize: 16,
            svgScale: 1.2
        },
        1920: {
            fontSize: 16,
            svgScale: 1.2
        },
        1440: {
            fontSize: 18,
            svgScale: 1.33
        },
        1024: {
            fontSize: 20,
            svgScale: 1.5
        },
        800: {
            fontSize: 22,
            svgScale: 1.7
        },
        640: {
            fontSize: 24,
            svgScale: 2
        }
    };

    var SVG_RESOLUTION_HEIGHTS = {
        800: {
            fontSize: 22,
            svgScale: 2
        },
        640: {
            fontSize: 24,
            svgScale: 2.5
        }
    };

    var resolution;

    var resolutionWidthKeys = Object.keys( SVG_RESOLUTION_WIDTHS ),
        resolutionHeightKeys = Object.keys( SVG_RESOLUTION_HEIGHTS );

    var WIDTH_BREAKPOINTS = resolutionWidthKeys.map(function(res){
            return parseInt(res);
        }),
        widthBreakpoints = WIDTH_BREAKPOINTS.filter(function(res){
            return width <= res;
        }),
        resolutionWidth  = SVG_RESOLUTION_WIDTHS[ Math.min.apply(null, widthBreakpoints) ];


    var HEIGHT_BREAKPOINTS = resolutionHeightKeys.map(function(res){
            return parseInt(res);
        }),
        heightBreakpoints = HEIGHT_BREAKPOINTS.filter(function(res){
            return winHeight <= res;
        }),
        resolutionHeight = SVG_RESOLUTION_HEIGHTS[ Math.min.apply(null, heightBreakpoints) ];


    // If we have a screen with a lower height and it's not a touch device
    // We need to get whichever scale/fontsize is highest between it's width and height
    if(resolutionHeight && !('touchmove' in window)){
        resolution = {
            svgScale: Math.max(resolutionHeight.svgScale, resolutionWidth.svgScale),
            fontSize: Math.max(resolutionHeight.fontSize, resolutionWidth.fontSize)
        };
    } else {
        resolution = resolutionWidth;
    }

    // Max sizes of nuclei in pixels
    // with highest being most relevant
    var nodeSizes = [18, 38, 60, 70, 80],
        nodeNucleusSize = nodeSizes[1],
        nodeSizeMin = Math.min.apply(null, nodeSizes),
        nodeSizeMax = Math.max.apply(null, nodeSizes);

    // Color names from http://chir.ag/projects/name-that-color/
    var colors = {
        white:          '#FFFFFF',
        harp:           '#E2F0E9',
        westar:         '#E0DDD5',

        persianGreen:   '#00aba4',
        mountainMeadow: '#15A69B',
        robinsEgg:      '#00d1c9',

        fuscousGray:    '#54544D'
    };

    return {
        width: width,
        height: height,
        heightOffset: heightOffset,
        svgScale: resolution.svgScale,
        duration: 700,
        quick: 100,
        fontSize: resolution.fontSize,
        fontRatio: resolution.fontSize / 16,
        lineHeight: {
            concept: 1.1, // 1.1em
            subject: 1.5  // 1.5em
        },

        svgResWidths: SVG_RESOLUTION_WIDTHS,
        svgResHeights: SVG_RESOLUTION_HEIGHTS,
        widthBreakpoints: WIDTH_BREAKPOINTS,
        heightBreakpoints: HEIGHT_BREAKPOINTS,

        // Zoom out to 2x SVG size
        // Zoom in to default size
        zoomLimits: [0.5, 1],

        colors: colors,

        nodes: {
            maxNodes: 10,
            maxPrereq: 5,
            linkLength: 300,

            size: nodeSizes,
            sizeNucleus: nodeNucleusSize,
            sizeMin: nodeSizeMin,
            sizeMax: nodeSizeMax,

            maxScale: 2, // Determines the max scale for nodes when zoomed out

            colors: {
                'Science': [
                    '#8EE000', // nucleus
                    '#8EE000', // node 1 ---> Smallest
                    '#BCEA6E', // node 2
                    '#A6E445', // node 3
                    '#8EE000', // node 4
                    '#89D328'  // node 5 ---> Largest
                ],
                'Math': [
                    '#28B5F5', // nucleus
                    '#29b6f6', // node 1 ---> Smallest
                    '#80D3F9', // node 2
                    '#4EC2F6', // node 3
                    '#28B5F5', // node 4
                    '#1CA1E5'  // node 5 ---> Largest
                ]
            },

            text: {
                detail: {
                    open: 'Explore',
                    close: 'Collapse'
                },
                popup: {
                    open: 'Details',
                    close: 'Close'
                }
            },

            inactive: {
                opacity: {
                    link: 0.2,
                    circle: 0.2,
                    shadow: 0.5,
                    text: 0.4,
                    image: 0
                }
            },

            active: {
                colorLighten: 0.3,
                opacity: {
                    shadow: 0.25
                }
            }
        },
        // Modality
        modality: {
            host: location.protocol + '//' + location.host,
            referrer: '?referrer=new_concept_map',
            maxTitleChars : 69
        },


        // Zero State / Trending config
        trending: {
            numNodes: 7,
            defaultOpacity: 1,
            defaults: [
                'SCI.PHY.526',
                'SCI.ESC.861',
                'SCI.PSC.231.3',
                'SCI.PHY.355',
                'MAT.ALG.471',
                'MAT.GEO.938',
                'MAT.CAL.912'
            ]
        },

        urlParams: null
    };
});

