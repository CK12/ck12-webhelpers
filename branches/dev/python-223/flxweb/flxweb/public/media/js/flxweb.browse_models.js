define( 'flxweb.browse_models', ['jquery', 'underscore', 'backbone'],
        function($, _, Backbone) {

    /*
     *  _                 _   __  __         _     _    
     * | |   ___  __ __ _| | |  \/  |___  __| |___| |___
     * | |__/ _ \/ _/ _` | | | |\/| / _ \/ _` / -_) (_-<
     * |____\___/\__\__,_|_| |_|  |_\___/\__,_\___|_/__/
     *                                                  
     */

    var ModalityGroup, ModalityGroupCollection, BrowseTerm,
        BrowseTermCollection, Flexbook, FlexbookCollection;

    ModalityGroup = Backbone.Model.extend({ });

    ModalityGroupCollection = Backbone.Collection.extend({model: ModalityGroup});
    
    BrowseTerm = Backbone.Model.extend({
        initialize: function(attributes, options) {
            var _this = this;
            if (options && options.url) {
                this.url = options.url;
            }

            //FIX 15406: engineering is not a branch
            var handle = this.get('handle');
            if ( handle && handle.toLowerCase() === 'engineering') {
                this.set({'handle':'software-testing'});
            }

            this.set('children', new BrowseTermCollection(_.map(this.get('children'), function(c) {
                c.parent = _this;
                return c;
            })));

            this.set('modality_groups', new ModalityGroupCollection(_.map(this.get('modality_groups'), function(m) {
                m.concept = _this;
                return m;
            })));
        },
        
        getChildFor: function(handle) {
            return this.get('children').find(function(f) { return (f.get('handle') == handle); });
        }
    });

    BrowseTermCollection = Backbone.Collection.extend({
        model: BrowseTerm,
        comparator: function(term) {
            return term.get('encodedID');
        }
    });
    
    
    /*
      #  ___ _         _              _       
      # | __| |_____ _| |__  ___  ___| |__ ___
      # | _|| / -_) \ / '_ \/ _ \/ _ \ / /(_-<
      # |_| |_\___/_\_\_.__/\___/\___/_\_\/__/
      #                       
    */

    Flexbook = Backbone.Model.extend({});

    FlexbookCollection = Backbone.Collection.extend({
        model: Flexbook
    });

    function ck12_browse_business_rules(browse_term) {
        function f(n, depth) {
            if ( ((depth === 3) || (depth === 4)) && 
                ((n.modality_groups) && (n.modality_groups.length !== 0)) ) {
                n.children.unshift(_.extend(_.clone(n), {
                    children: [],
                    level: depth + 1
                }));
            }
            _.each(n.children, function(c) { f(c, depth + 1); });
        }
        f(browse_term, 2);

        function c(term) {
            _.each(term.children, function(ch) { // level 3
                    term.cs_concept_count = (term.cs_concept_count || 0) + (ch.children && ch.children.length || 0);
            });
        }
        _.each(browse_term.children, c);
        return browse_term;
    }

    return {
        ModalityGroup: ModalityGroup,
        ModalityGroupCollection: ModalityGroupCollection,
        BrowseTerm: BrowseTerm,
        BrowseTermCollection: BrowseTermCollection,
        Flexbook: Flexbook,
        FlexbookCollection: FlexbookCollection,
        ck12_browse_business_rules: ck12_browse_business_rules
    };
});
