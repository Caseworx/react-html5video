import Inferno from 'inferno';
import Component from 'inferno-component'
import ProgressBar from './../../progressbar/ProgressBar';

class Seek extends Component {
    /**
     * As controls receive all props for extensibility, we do a quick
     * check and make sure only the props we care about have changed.
     * @param  {object} nextProps The next props from parent
     * @return {boolean}          Whether we re-render or not
     */
    componentWillMount() {
        this.setState({
            focused: false
        })
    }

    shouldComponentUpdate(nextProps) {
        return this.props.seek !== nextProps.seek ||
               this.props.percentageBuffered !== nextProps.percentageBuffered ||
               this.props.percentagePlayed !== nextProps.percentagePlayed ||
               this.props.duration !== nextProps.duration;
    }

    /**
     * Calculates the seek time based on change of input.
     * @param  {object} e Event object
     * @return {undefined}
     */
    seek = (e) => {
        this.props.seek(e.target.value * this.props.duration / 100, true);
    };

    onFocus = () => {
        this.setState({
            focused: true
        });
    };

    onBlur = () => {
        this.setState({
            focused: false
        });
    };

    render() {
        return (
            <div
                className={'video-seek video__control' + (this.state.focused
                    ? ' video__control--focused' : '')}
                aria-label={this.props.copyKeys.seek}>
                <div className="video-seek__container">
                    <div style={{
                        width: this.props.percentageBuffered + '%'
                    }} className="video-seek__buffer-bar">
                    </div>
                    <ProgressBar
                        onBlur={this.onBlur}
                        onFocus={this.onFocus}
                        onChange={this.seek}
                        progress={this.props.percentagePlayed} />
                </div>
            </div>
        );
    }
};

export default Seek;
