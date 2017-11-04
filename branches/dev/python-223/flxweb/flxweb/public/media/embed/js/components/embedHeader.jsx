define( (require, exports, module) => {
    'use strict';

    var React = require('react');

    class EmbedHeader extends React.Component {
        constructor(props) {
            super(props);
            this.headerStyles = {
                'height': '51px',
                'backgroundColor': '#FFFFFF'
            };
        }

        render () {
            return (
                <header className="header embedded" style={this.headerStyles}>
                    <nav className="top-bar row top-nav">
                        <a id="embed_nav_logo" href="/">
                            <img className="logo-img" src="/media/common/images/logo_ck12_medium.png" />
                        </a>
                        <div className="right">
                            <a title="View on www.ck12.org" target="_blank" id="lnk_ext" href="/algebra/order-of-operations/">
                                <span>View this on CK12.org</span>
                                <i className="icon-open_new_window"></i>
                            </a>
                        </div>
                    </nav>
                </header>
            )
        }
    }
    module.exports = EmbedHeader;
});
