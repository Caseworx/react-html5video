import Inferno from 'inferno';
import Component from 'inferno-component'
import Icon from './../../icon/Icon';
import Spinner from './../../spinner/Spinner';

class Overlay extends Component {
    renderContent() {
        var content;
        if (this.props.error) {
            content = (
                <div className="video-overlay__error">
                    <p className="video-overlay__error-text">{this.props.copyKeys.sourceError}</p>
                </div>
            );
        } else if (this.props.loading) {
            content = (
                <div className="video-overlay__loader">
                    <Spinner />
                </div>
            );
        } else {
            content = (
                <div className="video-overlay__play" onClick={this.props.togglePlay}>
                    {this.props.paused ? <Icon name="play-1" /> : ''}
                </div>
            );
        }
        return content;
    }

    render() {
        return (
            <div className="video-overlay">
                {this.renderContent()}
            </div>
        );
    }

};

export default Overlay;
