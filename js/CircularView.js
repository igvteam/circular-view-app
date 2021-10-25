import {getChrColor} from "./chrColor.js";

class CircularView {

    static isInstalled() {
        return window["JBrowseReactCircularGenomeView"] !== undefined && window["React"] !== undefined && window["ReactDOM"] !== undefined;
    }

    constructor(div, config) {

        if (CircularView.isInstalled()) {

            const {createElement} = React
            const {render} = ReactDOM
            const {
                createViewState,
                JBrowseCircularGenomeView,
            } = JBrowseReactCircularGenomeView


            const regions = [];
            const colors = [];
            for (let chr of config.chromosomes) {
                colors.push(getChrColor(chr.name));
                regions.push(
                    {
                        refName: chr.name,
                        uniqueId: chr.name,
                        start: 0,
                        end: chr.bpLength
                    }
                )
            }

            this.viewState = createViewState({
                assembly: {
                    name: 'forIGV',
                    sequence: {
                        trackId: 'refSeqTrack',
                        type: 'ReferenceSequenceTrack',
                        adapter: {
                            type: 'FromConfigSequenceAdapter',
                            features: regions,
                        },
                    },
                    refNameColors: colors
                },
                tracks: [
                    {
                        trackId: 'firstTrack',
                        assemblyNames: ['forIGV'],
                        type: 'VariantTrack',
                        adapter: {
                            type: 'FromConfigAdapter',
                            features: [],
                        },
                    },
                ],
            })

            this.viewState.config.tracks[0].displays[0].renderer.strokeColor.set("jexl:get(feature, 'color') || 'black'")
            //  this.viewState.config.tracks[0].displays[0].renderer.strokeColorSelected.set(
            //      "jexl:get(feature, 'highlightColor') || 'red'"
            //  )
            this.viewState.config.tracks[0].displays[0].renderer.strokeColorSelected.set('orange')

            // Harcode chord click action for now
            this.onChordClick(defaultOnChordClick.bind(this))

            this.setSize(div.clientWidth)

            const element = createElement(JBrowseCircularGenomeView, {viewState: this.viewState})
            render(element, div);
        } else {
            console.error("JBrowse circular view is not installed");
        }
    }

    setSize(size) {

        const view = this.viewState.session.view;
        view.setWidth(size);
        view.setHeight(size /* this is the height of the area inside the border in pixels */);

        if (!this.origSize) {
            this.origSize = size;
            this.bpPerPx = view.bpPerPx;
        } else {
            const r = size / this.origSize;
            const bpPerPx = r * this.bpPerPx;
            view.setBpPerPx(bpPerPx);
        }

    }

    clearChords() {
        this.viewState.config.tracks[0].adapter.features.set([])
        this.viewState.session.view.showTrack(this.viewState.config.tracks[0].trackId)
    }

    addChords(newChords) {

        const chords = [...this.viewState.config.tracks[0].adapter.features.value];
        for (let c of newChords) {
                chords.push(c)
        }
        this.viewState.config.tracks[0].adapter.features.set(chords)
        this.viewState.session.view.showTrack(this.viewState.config.tracks[0].trackId)
    }

    clearSelection() {
        //this.viewState.pluginManager.rootModel.session.clearSelection()
        const chords = [...this.viewState.config.tracks[0].adapter.features.value];
        for (let f of chords) {
            f.color = f.baseColor;
        }
        this.viewState.config.tracks[0].adapter.features.set(chords)
        this.viewState.session.view.showTrack(this.viewState.config.tracks[0].trackId)
    }

    getFeature(featureId) {

        // TODO -- broken
        // const display = this.viewState.pluginManager.rootModel.session.view.tracks[0].displays[0]
        // const feature = display.data.features.get(featureId)
        // return feature;

        const features = [...this.viewState.config.tracks[0].adapter.features.value];
        for (let f of features) {
            if (featureId === f.uniqueId) {
                return f;
            }
        }
    }

    onChordClick(callback) {
        this.viewState.pluginManager.jexl.addFunction('onChordClick', callback)
        this.viewState.config.tracks[0].displays[0].onChordClick.set(
            'jexl:onChordClick(feature, track, pluginManager)'
        )
    }

}


// Default chord click callback.  Will be bound to a CircularView instance
function defaultOnChordClick(feature, chordTrack, pluginManager) {

    console.log(JSON.stringify(feature, ""));

}


export default CircularView;